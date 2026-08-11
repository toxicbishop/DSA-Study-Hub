import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Calendar,
  Hash,
  Type,
  Image,
  Save,
  X,
  Edit2,
  Camera,
} from "lucide-react";
import { GoogleUser } from "../components/GoogleAuth";
import { secureFetch } from "../utils/api";

interface ProfileViewProps {
  user: GoogleUser | null;
  onUpdate: (user: GoogleUser) => void;
}

export const ProfileView = ({ user, onUpdate }: ProfileViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    age: user?.age || "",
    bio: user?.bio || "",
    picture: user?.picture || "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setStatus({
        type: "error",
        message:
          "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatus({
        type: "error",
        message: "File too large. Maximum size is 2MB.",
      });
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("avatar", file);

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await secureFetch(
        `/api/proxy/users/upload-avatar`,
        {
          method: "POST",
          body: uploadFormData,
        },
      );
      const data = await res.json();
      if (data.success) {
        onUpdate(data.user);
        setFormData((prev) => ({ ...prev, picture: data.url }));
        setStatus({
          type: "success",
          message: "Avatar updated successfully!",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Upload failed",
        });
      }
    } catch {
      setStatus({ type: "error", message: "A network error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        age:
          user.age !== null && user.age !== undefined ? String(user.age) : "",
        bio: user.bio || "",
        picture: user.picture || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await secureFetch(
        `/api/proxy/users/profile`,
        {
          method: "PUT",
          body: JSON.stringify({
            ...formData,
            age: formData.age === "" ? "" : Number(formData.age),
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        onUpdate(data.user);
        setIsEditing(false);
        setStatus({
          type: "success",
          message: "Profile updated successfully!",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to update profile",
        });
      }
    } catch {
      setStatus({ type: "error", message: "A network error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-32 pb-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Please sign in to view your profile.
        </h2>
      </div>
    );
  }

  return (
    <section className="pt-32 pb-20 px-4 max-w-2xl mx-auto min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header Overlay */}
        <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 relative">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white transition-all shadow-lg flex items-center gap-2 font-medium"
            title={isEditing ? "Cancel" : "Edit Profile"}>
            {isEditing ? (
              <>
                <X size={18} /> Cancel
              </>
            ) : (
              <>
                <Edit2 size={18} /> Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-8 -mt-16 relative">
          <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-6 mb-8">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {formData.picture ? (
                <img
                  src={formData.picture}
                  alt={formData.name}
                  className="w-32 h-32 rounded-3xl border-4 border-white dark:border-gray-800 object-cover shadow-2xl transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        formData.name,
                      )}&background=f97316&color=fff`;
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl border-4 border-white dark:border-gray-800 bg-orange-500 flex items-center justify-center text-white shadow-2xl">
                  <User size={64} />
                </div>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <div className="flex flex-col items-center gap-1">
                    <Camera size={24} />
                    <span className="text-[10px] font-bold uppercase">
                      Change
                    </span>
                  </div>
                </button>
              )}
            </div>
            <div className="text-center sm:text-left mt-4 sm:mb-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {formData.username
                  ? `@${formData.username}`
                  : "No username set"}
              </p>
            </div>
          </div>

          {status.message && (
            <div
              className={`mb-6 p-4 rounded-2xl border text-sm text-center font-medium animate-in fade-in slide-in-from-top-4 ${
                status.type === "success"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
              }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Type size={16} className="text-orange-500" /> Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Hash size={16} className="text-orange-500" /> Username
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                  placeholder="Choose a username"
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar size={16} className="text-orange-500" /> Age
                </label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                  placeholder="Enter your age"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail size={16} className="text-orange-500" /> Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 cursor-not-allowed text-gray-500 font-medium"
                />
              </div>
            </div>

            {/* Profile Picture URL */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Image size={16} className="text-orange-500" /> Profile Picture
                URL
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.picture}
                onChange={(e) =>
                  setFormData({ ...formData, picture: e.target.value })
                }
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                placeholder="Link to an image (https://...)"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Type size={16} className="text-orange-500" /> About You
              </label>
              <textarea
                disabled={!isEditing}
                rows={3}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-900 dark:text-white resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {isEditing && (
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 active:scale-95">
                  {isLoading ? (
                    "Saving Changes..."
                  ) : (
                    <>
                      <Save size={20} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
