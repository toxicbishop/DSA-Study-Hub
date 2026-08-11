import React, { useRef, useState } from "react";
import {
  Bug,
  Lightbulb,
  Send,
  CheckCircle2,
  User,
  Mail,
  Loader2,
} from "lucide-react";
import { secureFetch } from "../utils/api";

const ReportIssue: React.FC = () => {
  const [type, setType] = useState<"bug" | "suggestion">("bug");
  const [severity, setSeverity] = useState<"minor" | "moderate" | "critical">(
    "minor",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitRef = useRef<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debounce: prevent rapid re-submissions within 3 seconds
    const now = Date.now();
    if (now - lastSubmitRef.current < 3000) return;
    if (isSubmitting) return;

    lastSubmitRef.current = now;
    setIsSubmitting(true);

    try {
      const response = await secureFetch(`/api/proxy/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          severity,
          title,
          description,
          name,
          email,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setName("");
          setEmail("");
          setTitle("");
          setDescription("");
          setSeverity("minor");
          setType("bug");
        }, 3000);
      } else if (response.status === 409) {
        alert(
          "This report was already submitted recently. No need to send it again!",
        );
      } else if (response.status === 429) {
        alert(
          "Too many requests! Please wait a while before submitting again.",
        );
      } else {
        const data: {
          success: boolean;
          message?: string;
          errors?: Array<{ msg: string }>;
        } = await response.json();
        const errorMessage = data.errors
          ? data.errors.map((err: { msg: string }) => err.msg).join("\n")
          : data.message || "Server Error";
        alert(`Submission Failed:\n${errorMessage}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        `Connection Failed! Please check your internet connection and try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in glassmorphism rounded-xl max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-xl bg-cyan-500/20 border border-cyan-500 flex items-center justify-center mb-6 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Thank you!
        </h3>
        <p className="text-slate-400 font-code text-sm">
          Your feedback has been submitted successfully. We'll look into it.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto glass-panel border border-slate-700 p-8 rounded-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          {type === "bug" ? (
            <Bug className="text-red-500" />
          ) : (
            <Lightbulb className="text-cyan-400" />
          )}
          {type === "bug" ? "Report an Issue" : "Submit a Suggestion"}
        </h2>
        <p className="text-slate-400 font-code text-sm">
          Help us improve the DSA Study Hub. Whether it's a bug or a brilliant
          idea, we want to hear it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setType("bug")}
            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 ${
              type === "bug"
                ? "bg-rose-500/20 text-rose-400 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                : "bg-slate-800/50 text-slate-400 border border-slate-700"
            }`}>
            <Bug size={24} />
            <span className="font-semibold">Report Bug</span>
          </button>
          <button
            type="button"
            onClick={() => setType("suggestion")}
            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 ${
              type === "suggestion"
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                : "bg-slate-800/50 text-slate-400 border border-slate-700"
            }`}>
            <Lightbulb size={24} />
            <span className="font-semibold">Suggestion</span>
          </button>
        </div>

        {/* Name & Email Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-400 font-code">
              Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[a-zA-Z\s]*$/.test(val)) {
                    setName(val);
                  }
                }}
                maxLength={50}
                required
                placeholder="Your Name"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white font-code"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-400 font-code">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  // Strict sanitization: Allow only letters, numbers, and common email symbols (@ . _ - +)
                  // This prevents characters like ! # $ % ^ & *
                  const val = e.target.value.replace(/[^a-zA-Z0-9@._+-]/g, "");
                  setEmail(val);
                }}
                onBlur={() => {
                  // Validate on blur
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (email && !emailRegex.test(email)) {
                    alert("Please enter a valid email address.");
                  }
                }}
                required
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white font-code"
              />
            </div>
          </div>
        </div>

        {/* Severity - Only show for Bugs */}
        {type === "bug" && (
          <div className="space-y-2 animate-fade-in">
            <label className="block text-sm font-medium text-slate-400 font-code">
              Severity Level
            </label>
            <div className="flex gap-4">
              {(["minor", "moderate", "critical"] as const).map((level) => (
                <label key={level} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="severity"
                    value={level}
                    checked={severity === level}
                    onChange={(e) =>
                      setSeverity(
                        e.target.value as "minor" | "moderate" | "critical",
                      )
                    }
                    className="sr-only"
                  />
                  <div
                    className={`
                                px-4 py-2 rounded-lg text-center border capitalize transition-all text-sm font-medium
                                ${
                                  severity === level
                                    ? level === "critical"
                                      ? "bg-rose-500/20 text-rose-400 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                                      : level === "moderate"
                                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                        : "bg-teal-500/20 text-teal-400 border-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                                    : "bg-slate-900/50 border-slate-700 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                                }
                            `}>
                    {level}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-slate-400 font-code">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            maxLength={100}
            onChange={(e) => {
              const value = e.target.value;
              // SECURITY: Sanitize Title
              if (value.length <= 100) {
                // Allow letters, numbers, spaces, basic punctuation, and brackets
                const sanitized = value.replace(
                  /[^a-zA-Z0-9\s.,?!\-()[\]{}]/g,
                  "",
                );
                setTitle(sanitized);
              }
            }}
            required
            placeholder="Brief summary of the issue"
            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white font-code"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-400 font-code">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            maxLength={500}
            onChange={(e) => {
              const value = e.target.value;
              // SECURITY: Sanitize Description
              if (value.length <= 500) {
                // Allow letters, numbers, spaces, basic punctuation, and brackets
                const sanitized = value.replace(
                  /[^a-zA-Z0-9\s.,?!\-()[\]{}]/g,
                  "",
                );
                setDescription(sanitized);
              }
            }}
            required
            rows={5}
            placeholder="Please describe what happened..."
            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white font-code resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn-cyber w-full py-4 text-lg font-bold flex items-center justify-center gap-2 ${
            isSubmitting ? "opacity-60 cursor-not-allowed" : ""
          }`}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Submit {type === "bug" ? "Report" : "Suggestion"}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportIssue;
