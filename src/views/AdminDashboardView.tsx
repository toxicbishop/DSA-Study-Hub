import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Users,
  AlertTriangle,
  Activity,
  Server,
  Trash2,
  LogOut,
  RefreshCw,
  CheckCircle,
  Clock,
  ShieldCheck,
  Bug,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { secureFetch } from "../utils/api";

const API = "/api/proxy";

interface Stats {
  totalUsers: number;
  totalIssues: number;
  openIssues: number;
  serverUptime: number;
  nodeVersion: string;
  environment: string;
  recentUsers: {
    _id: string;
    name: string;
    email: string;
    picture: string;
    createdAt: string;
  }[];
}

interface Issue {
  _id: string;
  type: "bug" | "suggestion";
  severity?: "minor" | "moderate" | "critical";
  title: string;
  description: string;
  name: string;
  email: string;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  picture: string;
  role: string;
  completedPrograms: string[];
  createdAt: string;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const severityColor: Record<string, string> = {
  minor: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  moderate: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  critical: "bg-red-500/20 text-red-300 border border-red-500/30",
};

export function AdminDashboardView() {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "issues" | "users">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [authError, setAuthError] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/stats`, {
        credentials: "include",
      });
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {
      setAuthError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIssues = useCallback(async () => {
    setIssuesLoading(true);
    try {
      const res = await secureFetch(`${API}/api/issues`, {
        credentials: "include",
      } as RequestInit);
      const data = await res.json();
      if (data.success) setIssues(data.data);
    } finally {
      setIssuesLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/users?page=${page}&limit=10`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setUsersTotalPages(data.pages);
      }
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    if (tab === "issues") fetchIssues();
  }, [tab, fetchIssues]);
  useEffect(() => {
    if (tab === "users") fetchUsers(usersPage);
  }, [tab, usersPage, fetchUsers]);

  // If not authenticated, redirect home
  useEffect(() => {
    if (authError) router.push("/");
  }, [authError, router]);


  const deleteIssue = async (id: string) => {
    if (!confirm("Delete this issue permanently?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/api/issues/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) setIssues((prev) => prev.filter((i) => i._id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API}/api/admin/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Verifying session…</span>
        </div>
      </div>
    );
  }

  const tabBtnClass = (active: boolean) =>
    `px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
              <ShieldCheck className="w-7 h-7 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                DSA Study Hub — Secure Control Panel
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-gray-800 hover:border-red-500/30">
            <LogOut size={15} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-gray-900 rounded-xl w-fit border border-gray-800">
          <button
            className={tabBtnClass(tab === "overview")}
            onClick={() => setTab("overview")}>
            Overview
          </button>
          <button
            className={tabBtnClass(tab === "issues")}
            onClick={() => setTab("issues")}>
            Issues{" "}
            {stats && (
              <span className="ml-1.5 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full">
                {stats.openIssues}
              </span>
            )}
          </button>
          <button
            className={tabBtnClass(tab === "users")}
            onClick={() => setTab("users")}>
            Users{" "}
            {stats && (
              <span className="ml-1.5 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full">
                {stats.totalUsers}
              </span>
            )}
          </button>
        </div>

        {/* ── Overview Tab ── */}
        {tab === "overview" && stats && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Users",
                  value: stats.totalUsers,
                  icon: Users,
                  color: "orange",
                  sub: "Registered accounts",
                },
                {
                  label: "Total Issues",
                  value: stats.totalIssues,
                  icon: AlertTriangle,
                  color: "amber",
                  sub: "All time",
                },
                {
                  label: "Open Issues",
                  value: stats.openIssues,
                  icon: Bug,
                  color: "red",
                  sub: "Pending review",
                },
                {
                  label: "Server Uptime",
                  value: formatUptime(stats.serverUptime),
                  icon: Activity,
                  color: "green",
                  sub: `${stats.environment} • ${stats.nodeVersion}`,
                },
              ].map(({ label, value, icon: Icon, color, sub }) => (
                <div
                  key={label}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                  <div
                    className={`inline-flex p-2.5 rounded-xl mb-3 ${
                      color === "orange"
                        ? "bg-orange-500/10 text-orange-400"
                        : color === "amber"
                          ? "bg-amber-500/10 text-amber-400"
                          : color === "red"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-green-500/10 text-green-400"
                    }`}>
                    <Icon size={18} />
                  </div>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                  <div className="text-xs text-gray-600 mt-1">{sub}</div>
                </div>
              ))}
            </div>

            {/* Server Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4 text-gray-300 font-semibold">
                <Server size={16} className="text-orange-400" />
                Server Info
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {[
                  ["Environment", stats.environment],
                  ["Node.js", stats.nodeVersion],
                  ["Uptime", formatUptime(stats.serverUptime)],
                  ["API", "/api/proxy"],
                  ["Auth", "JWT httpOnly Cookie"],
                  ["DB", "MongoDB Atlas"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                    <div className="text-gray-500 text-xs mb-1">{k}</div>
                    <div className="text-gray-200 font-mono text-xs truncate">
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            {stats.recentUsers.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-gray-300 font-semibold">
                  <Clock size={16} className="text-orange-400" />
                  Recent Signups
                </div>
                <div className="space-y-3">
                  {stats.recentUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/30 hover:bg-gray-800/60 transition-colors">
                      <img
                        src={
                          u.picture ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f97316&color=fff&size=32`
                        }
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f97316&color=fff&size=32`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium truncate">
                          {u.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {u.email}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 whitespace-nowrap">
                        {timeAgo(u.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={() => {
                setLoading(true);
                fetchStats();
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-400 transition-colors">
              <RefreshCw size={14} /> Refresh Stats
            </button>
          </div>
        )}

        {/* ── Issues Tab ── */}
        {tab === "issues" && (
          <div className="space-y-4">
            {issuesLoading ? (
              <div className="text-center py-20 text-gray-500">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading issues…
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-20">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-60" />
                <p className="text-gray-400 font-medium">No issues reported</p>
              </div>
            ) : (
              issues.map((issue) => (
                <div
                  key={issue._id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`mt-0.5 p-1.5 rounded-lg ${issue.type === "bug" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}>
                        {issue.type === "bug" ? (
                          <Bug size={14} />
                        ) : (
                          <Lightbulb size={14} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold text-sm">
                            {issue.title}
                          </h3>
                          {issue.severity && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${severityColor[issue.severity]}`}>
                              {issue.severity}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full capitalize ${issue.type === "bug" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}>
                            {issue.type}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                          <span>{issue.name}</span>
                          <span>•</span>
                          <span>{issue.email}</span>
                          <span>•</span>
                          <span>{timeAgo(issue.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteIssue(issue._id)}
                      disabled={deletingId === issue._id}
                      className="flex-shrink-0 p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete issue">
                      {deletingId === issue._id ? (
                        <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Users Tab ── */}
        {tab === "users" && (
          <div className="space-y-4">
            {usersLoading ? (
              <div className="text-center py-20 text-gray-500">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading users…
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-gray-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-900 border-b border-gray-800">
                        <th className="text-left px-5 py-4 text-gray-500 font-medium">
                          User
                        </th>
                        <th className="text-left px-5 py-4 text-gray-500 font-medium">
                          Role
                        </th>
                        <th className="text-left px-5 py-4 text-gray-500 font-medium hidden md:table-cell">
                          Programs
                        </th>
                        <th className="text-left px-5 py-4 text-gray-500 font-medium hidden md:table-cell">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/70">
                      {users.map((user, i) => (
                        <tr
                          key={user._id}
                          className={`${i % 2 === 0 ? "bg-gray-900" : "bg-gray-900/50"} hover:bg-gray-800/50 transition-colors`}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  user.picture ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff&size=32`
                                }
                                alt={user.name}
                                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff&size=32`;
                                }}
                              />
                              <div>
                                <div className="text-white font-medium">
                                  {user.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full capitalize ${user.role === "admin" ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : "bg-gray-800 text-gray-400"}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className="text-gray-400">
                              {user.completedPrograms?.length ?? 0}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                            {timeAgo(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {usersTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                      disabled={usersPage === 1}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-all">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-500">
                      Page {usersPage} of {usersTotalPages}
                    </span>
                    <button
                      onClick={() =>
                        setUsersPage((p) => Math.min(usersTotalPages, p + 1))
                      }
                      disabled={usersPage === usersTotalPages}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-all">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
