const path = require("path");
const os = require("os");
const fs = require("fs");
const fsPromises = fs.promises;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Validate CRITICAL environment variables before anything else
if (!process.env.MONGO_URI) {
  console.error("❌ FATAL ERROR: MONGO_URI is not defined.");
  process.exit(1);
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const lusca = require("lusca");
const Issue = require("./models/Issue");

// Kafka Integration for User Stats & Background Processing
const { connectProducer, produceUserStat } = require("./utils/kafka");
const { startStatsConsumer } = require("./services/statsConsumer");

// Initialize Kafka components
connectProducer();
startStatsConsumer();

const app = express();
const PORT = process.env.PORT || 5001;

// Render/Proxy Support: Trust the first proxy to get real user IP for rate limiting
app.set("trust proxy", 1);

// Security: Set various HTTP headers for security
app.use(helmet());

// Debug Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Global Rate Limiting: Sensible defaults for all public endpoints
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(globalLimiter);

// Specific Rate Limiting for Issue Submission (Stricter)
const issueLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 issue reports per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many reports submitted. Please wait an hour before submitting more feedback.",
  },
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://dsa-study-hub.vercel.app",
          ];
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-XSRF-TOKEN",
      "x-api-key",
      "x-admin-password",
    ],
  }),
);

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';"
  );

  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()"
  );

  res.setHeader(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "X-Frame-Options",
    "DENY"
  );

  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json({ limit: "10kb" })); // Limit body size to prevent DOS
app.use(cookieParser(process.env.COOKIE_SECRET || "fallback_cookie_secret"));
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      process.env.COOKIE_SECRET ||
      "fallback_session_secret",
    resave: false,
    saveUninitialized: true, // Required for CSRF tokens to be initialized for new visitors
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: "native",
      touchAfter: 24 * 3600, // Update session once every 24 hours unless data changes
    }),
    cookie: {
      httpOnly: true,
      secure: true, // Required for SameSite=None
      sameSite: "none", // Required for cross-site cookies
      partitioned: true, // Enable CHIPS for cross-site cookie partitioning
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// Custom CSRF wrapper to allow bypass for certain routes
const csrfMiddleware = lusca.csrf({ angular: true });
app.use((req, res, next) => {
  const bypassRoutes = [
    "/api/csrf-seed",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/google",
    "/api/auth/github",
    "/api/auth/github/",
    "/auth/callback",
    "/api/admin/login",
    "/api/admin/logout",
  ];

  // We need to run csrfMiddleware to generate tokens, but NOT fail if bypass
  const isBypass =
    bypassRoutes.includes(req.path) ||
    req.method === "GET" ||
    req.method === "OPTIONS";

  if (isBypass) {
    // Manually run lusca csrf just for token generation
    csrfMiddleware(req, res, (err) => {
      // Ignore CSRF errors on bypass routes
      next();
    });
  } else {
    // Normal CSRF enforcement
    csrfMiddleware(req, res, next);
  }
});

// Sync CSRF token to cookie for client-side reading
app.use((req, res, next) => {
  const token = res.locals._csrf;
  if (token) {
    res.cookie("XSRF-TOKEN", token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      partitioned: true, // Also partition the CSRF cookie
    });
  }
  next();
});

// Seed endpoint for CSRF token
app.get("/api/csrf-seed", (req, res) => {
  res.json({ success: true, message: "CSRF token seeded" });
});

// CSRF Error Handler
app.use((err, req, res, next) => {
  if (
    err.message === "invalid csrf" ||
    err.code === "EBADCSRFTOKEN" ||
    err.message.includes("CSRF")
  ) {
    console.warn(`[CSRF Failed] ${req.method} ${req.url} - ${err.message}`);
    return res.status(403).json({
      success: false,
      message:
        "Security validation failed (CSRF). Try refreshing or using a different browser.",
      debug: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
  next(err);
});

// Database Connection
const MONGO_URI = process.env.MONGO_URI;

// Admin JWT Auth Middleware — validates httpOnly cookie, never exposes password to client
const validateAdminJWT = (req, res, next) => {
  const token = req.cookies?.admin_session;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    next();
  } catch {
    res.clearCookie("admin_session", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      partitioned: true,
    });
    return res.status(401).json({ success: false, message: "Session expired" });
  }
};

// Rate limiter for admin login (brute-force protection)
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please wait 15 minutes.",
  },
});

// Legacy header-based admin key (kept for backward compat with existing /api/issues routes)
const validateAdminKey = (req, res, next) => {
  // Accept either JWT cookie (new) or header key (legacy)
  const cookieToken = req.cookies?.admin_session;
  if (cookieToken) {
    try {
      jwt.verify(cookieToken, process.env.ADMIN_JWT_SECRET);
      return next();
    } catch {
      /* fall through to header check */
    }
  }
  const adminPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = req.headers["x-admin-password"];
  if (!providedPassword || providedPassword !== adminPassword) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
};

// API Key Validation Middleware (For public submissions)
const validateAPIKey = (req, res, next) => {
  const apiKey = process.env.API_KEY;
  const providedKey = req.headers["x-api-key"];

  if (!providedKey || providedKey !== apiKey) {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: Invalid API Key" });
  }
  next();
};

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes

// API Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DSA Study Hub API is online and secure.",
    health: "/api/health",
    status: "healthy",
  });
});

app.get("/api/", (req, res) => {
  res.send("DSA Study Hub API is running securely");
});

// Enable CORS Pre-Flight for all routes
app.options("/{*path}", cors());

// Mount Auth Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Handle cases where GitHub might redirect to /auth/callback on the API port by mistake
app.get("/auth/callback", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  // Security: Sanitize user input before using it in a redirect URL
  const code =
    typeof req.query.code === "string"
      ? req.query.code.replace(/[^a-zA-Z0-9_-]/g, "")
      : "";
  res.redirect(`${frontendUrl}/auth-callback${code ? `?code=${code}` : ""}`);
});

const execLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    run: { stderr: "Too many execution requests. Please wait a minute." },
  },
});

const EXECUTOR_URL = process.env.EXECUTOR_URL || "http://executor:6000";
const EXECUTOR_PROXY_TIMEOUT_MS = 15000;

app.post("/api/execute", execLimiter, async (req, res) => {
  const { language, files, stdin } = req.body || {};

  produceUserStat({
    type: "CODE_EXECUTION",
    language,
    fileCount: files?.length || 0,
    userId: req.user?.id || "anonymous",
  });

  if (!language || !files || files.length === 0) {
    return res
      .status(400)
      .json({ run: { stderr: "Language and code files are required." } });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    EXECUTOR_PROXY_TIMEOUT_MS,
  );

  try {
    const upstream = await fetch(`${EXECUTOR_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, files, stdin }),
      signal: controller.signal,
    });
    const payload = await upstream.json();
    return res.status(upstream.status).json(payload);
  } catch (err) {
    const msg =
      err.name === "AbortError"
        ? "Executor timeout"
        : "Executor service unreachable";
    return res.status(502).json({ run: { stderr: msg } });
  } finally {
    clearTimeout(timeoutId);
  }
});

// POST: Create a new issue/suggestion
// 1. apply validateAPIKey (Security)
// 2. apply issueLimiter (Rate Limiting)
// 3. apply strict validation (Input Validation & Sanitization)
app.post(
  "/api/issues",
  validateAPIKey,
  issueLimiter,
  [
    body("type")
      .isIn(["bug", "suggestion"])
      .withMessage("Invalid type (must be bug or suggestion)"),
    body("severity")
      .optional()
      .isIn(["minor", "moderate", "critical"])
      .withMessage("Invalid severity level"),
    body("name")
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .escape()
      .withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Invalid email address"),
    body("title")
      .isString()
      .trim()
      .isLength({ min: 5, max: 100 })
      .escape()
      .withMessage("Title must be between 5 and 100 characters"),
    body("description")
      .isString()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .escape()
      .withMessage("Description must be between 10 and 1000 characters"),
    // Reject unexpected fields
    (req, res, next) => {
      const allowedFields = [
        "type",
        "severity",
        "title",
        "description",
        "name",
        "email",
      ];
      const receivedFields = Object.keys(req.body);
      const extraFields = receivedFields.filter(
        (f) => !allowedFields.includes(f),
      );
      if (extraFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Unexpected fields: ${extraFields.join(", ")}`,
        });
      }
      next();
    },
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: true, errors: errors.array() });
    }

    try {
      const { type, severity, title, description, name, email } = req.body;

      // Ensure title and email are simple string values to prevent NoSQL injection
      if (typeof title !== "string" || typeof email !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid input type for title or email.",
        });
      }

      // Duplicate Detection: Reject if same title+email submitted within the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const duplicate = await Issue.findOne({
        title: { $eq: String(title) },
        email: { $eq: String(email) },
        createdAt: { $gte: oneHourAgo },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "A similar report was already submitted recently. Please wait before submitting again.",
        });
      }

      const newIssue = new Issue({
        type,
        severity: type === "bug" ? severity : undefined,
        title,
        description,
        name,
        email,
      });

      const savedIssue = await newIssue.save();
      res.status(201).json({ success: true, data: savedIssue });
    } catch (error) {
      console.error("Error creating issue:", error);
      res.status(500).json({
        success: false,
        message: "A server error occurred. Please try again later.",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },
);

// ─── Admin Routes ────────────────────────────────────────────────────────────
const User = require("./models/User");

// POST /api/admin/login — rate-limited, compares password server-side, issues httpOnly JWT cookie
app.post("/api/admin/login", adminLoginLimiter, async (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!password || !adminPassword || password !== adminPassword) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { role: "admin", iat: Math.floor(Date.now() / 1000) },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "8h" },
  );

  res.cookie("admin_session", token, {
    httpOnly: true, // Not accessible by JS — XSS safe
    secure: true,
    sameSite: "strict",
    partitioned: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });

  res.json({ success: true, message: "Authenticated" });
});

// POST /api/admin/logout — clears the session cookie server-side
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_session", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    partitioned: true,
  });
  res.json({ success: true, message: "Logged out" });
});

// GET /api/admin/stats — returns aggregate dashboard stats
app.get("/api/admin/stats", validateAdminJWT, async (req, res) => {
  try {
    const [userCount, issueCount, openIssueCount, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        Issue.countDocuments(),
        Issue.countDocuments({ status: { $ne: "resolved" } }),
        User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select("name email createdAt picture"),
      ]);
    res.json({
      success: true,
      data: {
        totalUsers: userCount,
        totalIssues: issueCount,
        openIssues: openIssueCount,
        recentUsers,
        serverUptime: Math.floor(process.uptime()),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/admin/users — paginated user list
app.get("/api/admin/users", validateAdminJWT, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password -tokenVersion"),
      User.countDocuments(),
    ]);
    res.json({
      success: true,
      data: users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET: Fetch all issues (admin password required)
app.get("/api/issues", validateAdminKey, async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// DELETE: Delete a specific issue by ID (admin password required)
app.delete("/api/issues/:id", validateAdminKey, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedIssue = await Issue.findByIdAndDelete(id);

    if (!deletedIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.json({
      success: true,
      message: "Issue deleted successfully",
      data: deletedIssue,
    });
  } catch (error) {
    console.error("Error deleting issue:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// The "catchall" handler: for any request that doesn't
// match a specific API route, just return a 404.
app.all("/{*path}", (req, res) => {
  console.warn(`[404] Unhandled Request: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.url,
    method: req.method,
  });
});

// Global Error Handler (Production-ready JSON errors)
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error("[Global Error] %s %s:", req.method, req.url, err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    errorType: err.name,
    path: req.url,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Server running securely on port ${PORT}`);
});
