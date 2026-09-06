import { useState } from "react";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { secureFetch } from "../utils/api";

interface MagicLinkLoginProps {
  onBack: () => void;
}

export const MagicLinkLogin = ({ onBack }: MagicLinkLoginProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await secureFetch(
        `/api/proxy/auth/magic-login`,
        {
          method: "POST",
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
      } else {
        setError("Error sending link. Please check your email and try again.");
      }
    } catch (err) {
      console.error("Magic link send error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-4"
      >
        <ArrowLeft size={16} /> Back to Sign In
      </button>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
        Continue with Email
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        We'll send a magic login link to your inbox. No password needed!
      </p>

      {message && (
        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-lg border border-green-200 dark:border-green-800 text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Send Magic Link"}
        </button>
      </form>
    </div>
  );
};
