import { useState } from "react";
import { useRouter } from "next/router";
import { Lock, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { secureFetch } from "../../src/utils/api";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const tokenStr = Array.isArray(token) ? token?.[0] : token ? String(token) : "";
    // Allow only URL-safe characters in the token to prevent path manipulation
    const isValidToken = !!tokenStr && /^[A-Za-z0-9_-]+$/.test(tokenStr);
    if (!isValidToken) {
      setError("Invalid or expired reset link.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await secureFetch(
        `/api/proxy/auth/reset-password/${encodeURIComponent(tokenStr)}`,
        {
          method: "POST",
          body: JSON.stringify({ password }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 3000);
      } else {
        setError("Unable to reset password. The link may have expired.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        {success ? (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" strokeWidth={3} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Password Updated!</h2>
            <p className="text-gray-500">Your password has been changed successfully. You'll be redirected shortly.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create New Password</h2>
            <p className="text-gray-500 mb-6 text-sm">Please enter a strong password to secure your account.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 shadow-sm" size={18} />
                <input
                  type="password"
                  placeholder="New Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 shadow-sm" size={18} />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Your Password"}
              </button>
            </form>

            <button
               onClick={() => router.push("/")}
               className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors w-full"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
