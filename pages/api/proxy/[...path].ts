import type { NextApiRequest, NextApiResponse } from 'next';

// Disable Next.js body parser so we can forward raw streams (vital for FormData/file uploads)
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const pathSegments = Array.isArray(path) ? path : (path ? [path] : []);

  // Prevent path traversal
  for (const segment of pathSegments) {
    if (segment === '..' || segment === '.') {
      return res.status(400).json({ success: false, message: 'Invalid path' });
    }
  }

  const urlPath = pathSegments.join('/');
  
  const backendUrl = process.env.API_URL;
  if (!backendUrl) {
    console.error("CRITICAL: API_URL environment variable is not set!");
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  let targetUrlObj: URL;
  try {
    targetUrlObj = new URL(backendUrl);
    
    // Safely construct the path using encodeURIComponent to neutralize any special URL characters
    const safeEncodedPath = pathSegments.map(seg => encodeURIComponent(seg)).join('/');
    const basePath = targetUrlObj.pathname.endsWith('/') ? targetUrlObj.pathname.slice(0, -1) : targetUrlObj.pathname;
    targetUrlObj.pathname = `${basePath}/api/${safeEncodedPath}`;

    // Safely append query parameters using the URLSearchParams API
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'path' && value) {
        if (Array.isArray(value)) {
          value.forEach(v => targetUrlObj.searchParams.append(key, v));
        } else {
          targetUrlObj.searchParams.append(key, value);
        }
      }
    }
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Invalid target URL' });
  }

  const targetUrl = targetUrlObj.toString();

  try {
    const headers = new Headers();
    
    // Explicitly forward the Cookie header
    if (req.headers.cookie) {
      headers.set('Cookie', req.headers.cookie);
    }
    
    // Forward essential headers
    const headersToForward = [
      'content-type',
      'authorization',
      'user-agent',
      'x-xsrf-token'
    ];
    
    headersToForward.forEach(header => {
      if (req.headers[header]) {
        headers.set(header, req.headers[header] as string);
      }
    });

    // Extract real IP natively or via trusted platform headers (Vercel)
    // Vercel overwrites x-real-ip and x-vercel-forwarded-for, making them safe from client spoofing.
    const clientIp = req.headers['x-vercel-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || '';
    if (clientIp) {
      headers.set('X-Forwarded-For', Array.isArray(clientIp) ? clientIp[0] : clientIp);
    }

    // ONLY inject the API key for the POST issues endpoint (reporting an issue)
    // We MUST NOT inject it for GET/DELETE or we bypass the admin_session check!
    if (urlPath === 'issues' && req.method === 'POST') {
      headers.set('x-api-key', process.env.API_KEY || '');
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    // Forward the raw body buffer if applicable
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      fetchOptions.body = Buffer.concat(chunks);
    }

    const response = await fetch(targetUrl, fetchOptions);

    res.status(response.status);

    // Forward response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        const cookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [value];
        res.setHeader('Set-Cookie', cookies);
      } else if (
        !['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(key.toLowerCase())
      ) {
        res.setHeader(key, value);
      }
    });

    if (response.status === 204) {
      return res.end();
    }
    
    // Handle binary responses safely
    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
    
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(502).json({ success: false, message: 'Bad Gateway - Failed to reach backend' });
  }
}
