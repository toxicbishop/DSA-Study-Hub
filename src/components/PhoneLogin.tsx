import { useState } from "react";
import { Phone, Check, Loader2, ArrowLeft } from "lucide-react";
import { secureFetch } from "../utils/api";
import { GoogleUser } from "./GoogleAuth";

interface PhoneLoginProps {
  onLogin: (user: GoogleUser) => void;
  onBack: () => void;
}

export const PhoneLogin = ({ onLogin, onBack }: PhoneLoginProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await secureFetch(
        `/api/proxy/auth/phone-login`,
        {
          method: "POST",
          body: JSON.stringify({ phoneNumber }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setStep("otp");
        setMessage(data.message);
      } else {
        setError("Something went wrong. Please check the number and try again.");
      }
    } catch (err) {
      console.error("Phone login send OTP error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await secureFetch(
        `/api/proxy/auth/verify-otp`,
        {
          method: "POST",
          body: JSON.stringify({ phoneNumber, otp }),
        }
      );
      const data = await res.json();
      if (data.success && data.user) {
        onLogin(data.user);
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch (err) {
      console.error("Phone login verify OTP error:", err);
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
        {step === "phone" ? "Continuw with Phone" : "Verify Phone"}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {step === "phone"
          ? "We'll send you a verification code via SMS."
          : `We've sent a 6-digit code to ${phoneNumber}`}
      </p>

      {message && (
        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-lg border border-green-200 dark:border-red-800 text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800 text-center">
          {error}
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="tel"
              placeholder="Phone Number (e.g. +1234567890)"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Send Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="relative">
            <Check className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-center tracking-[1em] font-bold"
              maxLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify & Continue"}
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-xs text-center text-gray-500 hover:text-orange-500 underline"
          >
            Change Phone Number
          </button>
        </form>
      )}
    </div>
  );
};
