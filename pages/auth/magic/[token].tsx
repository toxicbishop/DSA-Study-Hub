import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { secureFetch } from "../../../src/utils/api";
import { GoogleUser } from "../../../src/components/GoogleAuth";

export default function MagicLoginCallback({ onLogin }: { onLogin: (user: GoogleUser) => void }) {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    const tokenStr = Array.isArray(token) ? token[0] : String(token);
    // Allow only URL-safe characters in the token to prevent path manipulation
    const isValidToken = /^[A-Za-z0-9_-]+$/.test(tokenStr);
    if (!isValidToken) {
      setStatus("error");
      setErrorMessage("Invalid magic link.");
      return;
    }

    const verifyMagicLink = async () => {
      try {
        const res = await secureFetch(
          `/api/proxy/auth/magic/${encodeURIComponent(tokenStr)}`
        );
        const data = await res.json();
        if (data.success) {
          setStatus("success");
          onLogin(data.user);
          setTimeout(() => router.push("/profile"), 2000);
        } else {
          setStatus("error");
          setErrorMessage(data.message);
        }
      } catch (err) {
        console.error("Magic link error:", err);
        setStatus("error");
        setErrorMessage("Failed to verify magic link.");
      }
    };
    verifyMagicLink();
  }, [token, router, onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verifying Link...</h2>
            <p className="text-gray-500">Please wait while we log you in securely.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Success!</h2>
            <p className="text-gray-500">You've been logged in. Redirecting to your profile...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invalid Link</h2>
            <p className="text-red-500">{errorMessage}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200"
            >
              Go to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
