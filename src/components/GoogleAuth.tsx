import { useState } from "react";
import {
  GoogleLogin,
  googleLogout,
  CredentialResponse,
} from "@react-oauth/google";
import { LogOut, User, Mail, Lock, X, ArrowRight, Phone } from "lucide-react";
import { useRouter } from "next/router";
import { secureFetch } from "../utils/api";
import { useEffect } from "react";

export interface GoogleUser {
  id?: string;
  email: string;
  name: string;
  username?: string;
  age?: number;
  bio?: string;
  picture: string;
  role?: string;
  completedPrograms?: string[];
}

import { PhoneLogin } from "./PhoneLogin";
import { MagicLinkLogin } from "./MagicLinkLogin";
import { ForgotPassword } from "./ForgotPassword";

interface GoogleAuthProps {
  user: GoogleUser | null;
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
  externalIsOpen?: boolean;
  setExternalIsOpen?: (open: boolean) => void;
  hideTrigger?: boolean;
  hideModal?: boolean;
}

export const GoogleAuth = ({ 
  user, 
  onLogin, 
  onLogout,
  externalIsOpen,
  setExternalIsOpen,
  hideTrigger = false,
  hideModal = false
}: GoogleAuthProps) => {
  const router = useRouter();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = setExternalIsOpen !== undefined ? setExternalIsOpen : setInternalIsOpen;

  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState<"login" | "phone" | "magic" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorText, setErrorText] = useState("");
  
  useEffect(() => {
    if (isOpen && !hideModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, hideModal]);

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        const res = await secureFetch(
          `/api/proxy/auth/google`,
          {
            method: "POST",
            body: JSON.stringify({ credential: credentialResponse.credential }),
          },
        );
        const data = await res.json();
        if (data.success) {
          onLogin(data.user);
          setIsOpen(false);
        } else {
          setErrorText(data.message);
        }
      } catch {
        setErrorText("Backend auth failed");
      }
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      const clientId = data.githubClientId;
      if (clientId) {
        window.location.assign(
          `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,user:email`,
        );
      }
    } catch (err) {
      console.error("Failed to fetch GitHub client ID", err);
    }
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    // Ensure we have a CSRF token before submitting POST
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="));
    if (!token) {
      console.log("CSRF token missing, seeding...");
      try {
        await secureFetch(`/api/proxy/csrf-seed`);
        // Small delay to ensure browser handles the partitioned cookie
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.error("CSRF seeding failed:", err);
      }
    }

    const endpoint = isRegistering ? "/register" : "/login";
    try {
      const res = await secureFetch(
        `/api/proxy/auth${endpoint}`,
        {
          method: "POST",
          body: JSON.stringify({ email, password, name }),
        },
      );
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        setErrorText("Server error: Unexpected response format.");
        return;
      }

      if (data.success) {
        onLogin(data.user);
        setIsOpen(false);
        setEmail("");
        setPassword("");
        setName("");
      } else {
        setErrorText("An error occurred. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrorText("An unexpected error occurred. Please try again.");
    }
  };

  const handleLogoutClick = async () => {
    try {
      await secureFetch(`/api/proxy/auth/logout`, {
        method: "POST",
      });
    } catch (e) {
      console.error("Logout network error", e);
    }
    googleLogout();
    onLogout();
  };

  if (user) {
    if (hideTrigger) return null;
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 group p-0.5 rounded-full hover:bg-cyan-500/10 transition-all"
            title="View Profile">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 dark:border-gray-600 group-hover:border-cyan-500 transition-colors"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400">
                <User size={14} className="sm:size-[16px]" />
              </div>
            )}
            <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-cyan-400 transition-colors">
              {user.name}
            </span>
          </button>
        </div>
        <button
          onClick={handleLogoutClick}
          className="p-1.5 sm:p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
          title="Logout">
          <LogOut size={16} className="sm:size-[18px]" />
        </button>
      </div>
    );
  }

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-cyber group relative overflow-hidden px-3 py-1.5 sm:px-4 sm:py-2 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5"
        >
          <span>Get Started</span>
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
        </button>
      )}

      {isOpen && !hideModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#070B14]/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-sm overflow-hidden relative border border-cyan-500/30">
            <button
              onClick={() => {
                setIsOpen(false);
                setCurrentView("login");
              }}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-cyan-400 transition-colors">
              <X size={20} />
            </button>
            <div className="p-6">
              {currentView === "login" && (
                <>
                  <h2 className="font-display text-2xl font-bold text-center text-white mb-6 glow-white">
                    {isRegistering ? "Create Account" : "Welcome Back"}
                  </h2>

                  {errorText && (
                    <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg border border-red-500/30 text-center font-code">
                      {errorText}
                    </div>
                  )}

                  <form onSubmit={handleLocalSubmit} className="space-y-4">
                    {isRegistering && (
                      <div className="relative">
                        <User
                          className="absolute left-3 top-3 text-gray-400"
                          size={18}
                        />
                        <input
                          type="text"
                          placeholder="Name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input pl-10"
                        />
                      </div>
                    )}
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                    {!isRegistering && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setCurrentView("forgot")}
                          className="font-code text-[10px] text-cyan-400 hover:text-cyan-300 font-medium tracking-widest uppercase transition-colors">
                          Forgot Password?
                        </button>
                      </div>
                    )}
                    <button
                      type="submit"
                      className="w-full btn-cyber">
                      {isRegistering ? "Register" : "Sign In"}
                    </button>
                  </form>

                  <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-cyan-500/20"></div>
                    <span className="px-3 font-code text-[10px] text-slate-500 uppercase tracking-widest">
                      or
                    </span>
                    <div className="flex-grow border-t border-cyan-500/20"></div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="w-full h-[40px] flex justify-center items-center overflow-hidden rounded-lg">
                      <GoogleLogin
                        onSuccess={handleLoginSuccess}
                        onError={() => {
                          setErrorText("Login Failed");
                        }}
                        shape="rectangular"
                        width="334px"
                        logo_alignment="center"
                        text="continue_with"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleGitHubLogin}
                        className="h-[40px] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-code text-xs font-semibold transition-all border border-white/10">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.003-.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        <span>GitHub</span>
                      </button>
                      <button
                        onClick={() => setCurrentView("phone")}
                        className="h-[40px] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-code text-xs font-semibold transition-all border border-white/10">
                        <Phone size={16} />
                        <span>Phone</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setCurrentView("magic")}
                      className="w-full h-[40px] flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg font-code text-[10px] uppercase tracking-widest font-bold transition-all border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                      <Mail size={16} />
                      <span>Continue with Email</span>
                    </button>
                  </div>

                  <div className="mt-6 text-center font-code text-[10px] uppercase tracking-widest text-slate-500">
                    {isRegistering
                      ? "Already have an account?"
                      : "Don't have an account?"}{" "}
                    <button
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors ml-1">
                      {isRegistering ? "Sign In" : "Register"}
                    </button>
                  </div>
                </>
              )}

              {currentView === "forgot" && (
                <ForgotPassword onBack={() => setCurrentView("login")} />
              )}

              {currentView === "phone" && (
                <PhoneLogin
                  onLogin={(userData) => {
                    onLogin(userData);
                    setIsOpen(false);
                    setCurrentView("login");
                  }}
                  onBack={() => setCurrentView("login")}
                />
              )}

              {currentView === "magic" && (
                <MagicLinkLogin onBack={() => setCurrentView("login")} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
