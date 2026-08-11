import '../src/index.css';

import type { AppProps } from 'next/app';
import { Providers } from '../src/components/Providers';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from '../src/components/Navbar';
import Snowfall from 'react-snowfall';
import Loader from '../src/components/Loader';
import { programsData } from '../src/data/programs';
import { GoogleAuth, GoogleUser } from '../src/components/GoogleAuth';
import { secureFetch } from '../src/utils/api';
import { useRouter } from 'next/router';

import { 
  Code2, 
  Home, 
  User, 
  Map, 
  Server, 
  BarChart3, 
  Package, 
  Mail, 
  Shield, 
  Network,
  Route as RouteIcon 
} from 'lucide-react';


const floatingNodes = [
  { x: "8%",  y: "22%", size: 5, delay: 0,   color: "rgba(6,182,212,0.5)" },
  { x: "90%", y: "15%", size: 8, delay: 1.5, color: "rgba(37,99,235,0.5)" },
  { x: "85%", y: "72%", size: 5, delay: 3,   color: "rgba(6,182,212,0.4)" },
  { x: "5%",  y: "78%", size: 7, delay: 2,   color: "rgba(139,92,246,0.5)" },
  { x: "50%", y: "6%",  size: 4, delay: 4,   color: "rgba(249,115,22,0.4)" },
  { x: "93%", y: "50%", size: 6, delay: 1,   color: "rgba(6,182,212,0.3)" },
  { x: "2%",  y: "50%", size: 4, delay: 3.5, color: "rgba(37,99,235,0.4)" },
];

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("c");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [completedPrograms, setCompletedPrograms] = useState<string[]>([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    const savedCompleted = localStorage.getItem("completedPrograms");
    if (savedCompleted) {
      setCompletedPrograms(JSON.parse(savedCompleted));
    }

    const checkAuth = async () => {
      try {
        const res = await secureFetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          if (data.user.completedPrograms?.length > 0) {
            setCompletedPrograms(data.user.completedPrograms);
            localStorage.setItem("completedPrograms", JSON.stringify(data.user.completedPrograms));
          }
        }
      } catch (error: any) {
        console.warn(`Auth check failed: ${error.message || "Network Error"}`);
      }
    };
    checkAuth();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const isWinter = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    return month === 11 || (month === 0 && now.getDate() <= 15);
  }, []);

  const toggleProgramComplete = async (id: string) => {
    const newCompleted = completedPrograms.includes(id)
      ? completedPrograms.filter((p) => p !== id)
      : [...completedPrograms, id];
    setCompletedPrograms(newCompleted);
    localStorage.setItem("completedPrograms", JSON.stringify(newCompleted));

    if (user) {
      try {
        await secureFetch(`/api/proxy/users/progress`, {
          method: "PUT",
          body: JSON.stringify({ completedPrograms: newCompleted }),
        });
      } catch (error) {
        console.error("Failed to sync progress:", error);
      }
    }
  };

  const handleProgramClick = useCallback((pid: string) => {
    const view = pid.toLowerCase().replace(/\s/g, "");
    router.push(`/program/${view}`);
  }, [router]);

  const navigateTo = (view: string) => {
    if (view.startsWith("program")) {
      router.push(`/program/${view}`);
    } else if (view === "home") {
      router.push("/");
    } else {
      router.push(`/${view}`);
    }
  };

  const resetProgramState = () => {
    setIsProgramsOpen(false);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const s = () => setIsNavbarScrolled(window.scrollY > 20);
    window.addEventListener("scroll", s);
    return () => window.removeEventListener("scroll", s);
  }, []);

  const allSearchableItems = useMemo(() => {
    return [
      ...programsData.map((p) => ({
        id: p.id,
        type: "program",
        title: p.name,
        subtitle: `${p.category} • ${p.difficulty}`,
        content: [p.name, p.category, p.difficulty].join(" ").toLowerCase(),
        action: () => handleProgramClick(p.name),
        icon: Code2,
      })),
      {
        id: "knapsack",
        type: "visualizer",
        title: "Knapsack Visualizer",
        subtitle: "Dynamic Programming Visualization",
        content: "knapsack dynamic programming visualizer dp",
        action: () => router.push("/knapsack"),
        icon: Package,
      },
      // ... more visualizer items similar to App.tsx
      {
        id: "about",
        type: "page",
        title: "About Me",
        subtitle: "Profile and Bio",
        content: "about me profile bio contact pranav arun",
        action: () => router.push("/about"),
        icon: User,
      },
      {
        id: "home",
        type: "page",
        title: "Home",
        subtitle: "Main Page",
        content: "home start learning welcome",
        action: () => router.push("/"),
        icon: Home,
      },
    ];
  }, [handleProgramClick, router]);

  const searchResults = useMemo(() => {
    if (!searchQuery) {
      return allSearchableItems.filter((item) =>
        ["program1", "program10", "knapsack", "about"].includes(item.id),
      );
    }
    return allSearchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, allSearchableItems]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/proxy/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdminModalOpen(false);
        setAdminPassword("");
        router.push("/admin");
      }
    } catch {
      // error
    }
  };


  if (isLoading) return <Loader />;

  return (
    <Providers>

      <div className={`min-h-screen relative z-0 overflow-x-hidden transition-colors duration-300 ${darkMode ? "bg-[#070B14] text-white" : "bg-gray-50 text-gray-900"}`}>
        {isWinter && <Snowfall />}
        
        {darkMode && (
          <div className="fixed inset-0 pointer-events-none z-[-5] overflow-hidden">
            {/* Ambient gradient orbs */}
            <div className="absolute w-[600px] h-[600px] rounded-full blur-[130px] animate-float" style={{ top: "-15%", left: "5%", background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)" }} />
            <div className="absolute w-[500px] h-[500px] rounded-full blur-[110px] animate-float-delayed" style={{ bottom: "-10%", right: "5%", background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)" }} />
            <div className="absolute w-[350px] h-[350px] rounded-full blur-[80px] animate-float-slow" style={{ top: "35%", right: "25%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />
            {/* Floating node dots */}
            {floatingNodes.map((node, i) => (
              <div key={i} className="absolute rounded-full pointer-events-none" style={{ left: node.x, top: node.y, width: node.size, height: node.size, background: node.color, boxShadow: `0 0 ${node.size * 3}px ${node.color}`, animation: `float ${6 + i * 0.5}s ease-in-out ${node.delay}s infinite` }} />
            ))}
            {/* Corner bracket decorations */}
            <div className="absolute top-24 left-6 sm:left-10 w-12 h-12 border-t border-l border-cyan-500/20 pointer-events-none" />
            <div className="absolute top-24 right-6 sm:right-10 w-12 h-12 border-t border-r border-cyan-500/20 pointer-events-none" />
            <div className="absolute bottom-20 left-6 sm:left-10 w-12 h-12 border-b border-l border-cyan-500/12 pointer-events-none" />
            <div className="absolute bottom-20 right-6 sm:right-10 w-12 h-12 border-b border-r border-cyan-500/12 pointer-events-none" />
          </div>
        )}

        <div
          className="absolute inset-0 -z-10"
          style={darkMode ? {
            backgroundImage: "linear-gradient(rgba(6,182,212,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.035) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          } : {
            backgroundImage: "linear-gradient(to right, #8080801a 1px, transparent 1px), linear-gradient(to bottom, #8080801a 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        
        <Navbar
          resetProgramState={resetProgramState}
          toggleAdminModal={() => setIsAdminModalOpen(true)}
          completedPrograms={completedPrograms}
          user={user}
          onLogin={setUser}
          onLogout={() => setUser(null)}
        />

        <main>
          <Component 
            {...pageProps} 
            user={user}
            onLogin={setUser}
            onLogout={() => setUser(null)}
            completedPrograms={completedPrograms}
            toggleProgramComplete={toggleProgramComplete}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            darkMode={darkMode}
            isNotesOpen={isNotesOpen}
            setIsNotesOpen={setIsNotesOpen}
            handleProgramClick={handleProgramClick}
            navigateTo={navigateTo}
          />
        </main>

        <footer
          className={`relative mt-20 overflow-hidden transition-colors duration-300 ${
            darkMode
              ? 'border-t border-cyan-500/10'
              : 'border-t-4 border-black bg-white text-gray-700'
          }`}
          style={darkMode ? { background: 'rgba(6,10,20,0.97)', backdropFilter: 'blur(16px)' } : {}}
        >
          {/* Dark mode: top glow line */}
          {darkMode && (
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          )}

          {/* Dark mode: subtle grid */}
          {darkMode && (
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
          )}

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-14">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  {darkMode ? (
                    <>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ border: '1px solid rgba(6,182,212,0.35)', background: 'rgba(6,182,212,0.1)' }}
                      >
                        <Code2 size={14} className="text-cyan-400" />
                      </div>
                      <span className="font-display text-xs font-bold tracking-[0.15em] text-white">
                        DSA<span className="text-cyan-400">://</span>STUDY HUB
                      </span>
                    </>
                  ) : (
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                      DSA Study <span className="text-orange-500">Hub</span>
                    </h2>
                  )}
                </div>
                <p className={`text-sm leading-relaxed ${
                  darkMode ? 'font-code text-slate-600' : 'text-gray-500'
                }`}>
                  The complete platform to master Data Structures & Algorithms.
                  Interactive visualizations and practice quizzes to help you succeed.
                </p>
              </div>

              {/* Learning */}
              <div>
                <h3 className={`mb-6 tracking-[0.2em] uppercase text-xs font-bold ${
                  darkMode ? 'font-code text-slate-600' : 'font-semibold text-gray-900'
                }`}>Learning</h3>
                <ul className="space-y-3 text-sm">
                  {[
                    { label: 'Topic Roadmap',    icon: Map,     action: () => navigateTo('home') },
                    { label: 'Arrays & Hashing', icon: Code2,   action: () => handleProgramClick('program12') },
                    { label: 'Stack & Queues',   icon: Code2,   action: () => handleProgramClick('program3') },
                    { label: 'Trees & Graphs',   icon: Network, action: () => handleProgramClick('program11') },
                    { label: 'System Design',    icon: Server,  action: () => navigateTo('system-design') },
                  ].map(({ label, icon: Icon, action }) => (
                    <li key={label}>
                      <button
                        onClick={action}
                        className={`flex items-center gap-2 transition-colors ${
                          darkMode
                            ? 'font-code text-[10px] tracking-wider text-slate-600 hover:text-cyan-400'
                            : 'font-medium text-gray-700 hover:text-orange-500'
                        }`}
                      >
                        <Icon size={13} />
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visualizers */}
              <div>
                <h3 className={`mb-6 tracking-[0.2em] uppercase text-xs font-bold ${
                  darkMode ? 'font-code text-slate-600' : 'font-semibold text-gray-900'
                }`}>Visualizers</h3>
                <ul className="space-y-3 text-sm">
                  {[
                    { label: 'Pathfinding',  icon: RouteIcon, action: () => navigateTo('visualizer') },
                    { label: 'Sorting',      icon: BarChart3, action: () => navigateTo('sorting') },
                    { label: 'Trees & Graphs', icon: Network, action: () => navigateTo('tree-graph') },
                    { label: 'Knapsack DP',  icon: Package,   action: () => navigateTo('knapsack') },
                  ].map(({ label, icon: Icon, action }) => (
                    <li key={label}>
                      <button
                        onClick={action}
                        className={`flex items-center gap-2 transition-colors ${
                          darkMode
                            ? 'font-code text-[10px] tracking-wider text-slate-600 hover:text-cyan-400'
                            : 'font-medium text-gray-700 hover:text-orange-500'
                        }`}
                      >
                        <Icon size={13} />
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h3 className={`mb-6 tracking-[0.2em] uppercase text-xs font-bold ${
                  darkMode ? 'font-code text-slate-600' : 'font-semibold text-gray-900'
                }`}>Connect</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <button
                      onClick={() => navigateTo('about')}
                      className={`flex items-center gap-2 transition-colors ${
                        darkMode ? 'font-code text-[10px] tracking-wider text-slate-600 hover:text-cyan-400' : 'font-medium text-gray-700 hover:text-orange-500'
                      }`}
                    >
                      <User size={13} /> About Me
                    </button>
                  </li>
                  <li>
                    <a
                      href="mailto:pranavarun19@gmail.com"
                      className={`flex items-center gap-2 transition-colors ${
                        darkMode ? 'font-code text-[10px] tracking-wider text-slate-600 hover:text-cyan-400' : 'font-medium text-gray-700 hover:text-orange-500'
                      }`}
                    >
                      <Mail size={13} /> Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div
              className={`pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm ${
                darkMode ? 'border-t border-cyan-500/[0.08]' : 'border-t border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {darkMode && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
                )}
                <span className={darkMode ? 'font-code text-[10px] tracking-wider text-slate-700' : 'text-gray-400'}>
                  © 2026 DSA Study Hub. All rights reserved.
                </span>
              </div>
              <div className="flex items-center gap-4">
                {[{ label: 'Terms', view: 'terms' }, { label: 'Privacy', view: 'privacy' }, { label: 'Cookies', view: 'cookies' }].map(({ label, view }) => (
                  <button
                    key={label}
                    onClick={() => navigateTo(view)}
                    className={`transition-colors ${
                      darkMode ? 'font-code text-[10px] tracking-wider text-slate-700 hover:text-cyan-400' : 'text-gray-400 hover:text-orange-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="opacity-20 hover:opacity-60 transition-opacity"
                >
                  <Shield size={13} className={darkMode ? 'text-slate-600' : 'text-gray-400'} />
                </button>
              </div>
            </div>
          </div>
        </footer>

        {isAdminModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setIsAdminModalOpen(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
              style={{
                background: 'rgba(9,14,26,0.97)',
                border: '1px solid rgba(6,182,212,0.18)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.65), 0 0 40px rgba(6,182,212,0.05)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-6">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ border: '1px solid rgba(6,182,212,0.35)', background: 'rgba(6,182,212,0.1)' }}
                >
                  <Shield size={13} className="text-cyan-400" />
                </div>
                <h2 className="font-display text-sm font-bold tracking-[0.15em] text-white">ADMIN ACCESS</h2>
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="input-cyber"
                />
                <button
                  type="submit"
                  className="btn-cyber w-full justify-center"
                >
                  Authenticate
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Providers>
  );
}

export default MyApp;
