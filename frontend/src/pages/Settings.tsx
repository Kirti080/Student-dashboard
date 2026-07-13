import { useEffect, useState } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User, Bell, Shield, Palette, Moon, Sun, Monitor,
  Save, CheckCircle, Mail, Phone, BookOpen, Eye, EyeOff, Sparkles,
  Pencil, X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/context/ThemeContext";
import { changePassword, getProfile, updateProfile, type Profile } from "@/services/profileService";
import getAssetURL from "@/utils/getAssetURL";

const tabs = [
  { id: "profile",      label: "Profile",      icon: User,    color: "text-blue-500" },
  { id: "notifications", label: "Notifications", icon: Bell,   color: "text-purple-500" },
  { id: "security",    label: "Security",      icon: Shield,  color: "text-green-500" },
  { id: "appearance",  label: "Appearance",    icon: Palette, color: "text-orange-500" },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none shadow-inner ${
        enabled ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "bg-slate-200 dark:bg-slate-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { theme, setTheme } = useTheme();
  const [density, setDensity] = useState("comfortable");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [profile, setProfile] = useState<Profile>({
    name: "Kirti Verma",
    email: "kirti.verma@college.edu",
    phone: "+91 98765 43210",
    program: "B.Tech CSE",
    semester: "6th Semester",
    rollNo: "22CS001",
  });
  const [profileDraft, setProfileDraft] = useState(profile);

  const [notifications, setNotifications] = useState({
    assignmentDue: true,
    resultPublished: true,
    attendanceAlert: true,
    examSchedule: false,
    newsletter: false,
  });

  const profileImageURL = getAssetURL(profile.profileImage);
  const profileInitials = profile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError("");

        const data = await getProfile();
        setProfile(data);
        setProfileDraft(data);
      } catch (error) {
        setProfileError(error instanceof Error ? error.message : "Unable to load profile");
      } finally {
        setProfileLoading(false);
      }
    };

    if (localStorage.getItem("token")) {
      loadProfile();
    }
  }, []);

  const handleEditProfile = () => {
    setProfileDraft(profile);
    setIsEditingProfile(true);
    setSaved(false);
    setProfileError("");
  };

  const handleCancelProfile = () => {
    setProfileDraft(profile);
    setIsEditingProfile(false);
    setSaved(false);
    setProfileError("");
  };

  const handleSaveProfile = async () => {
    try {
      setProfileSaving(true);
      setProfileError("");

      const data = await updateProfile(profileDraft);
      setProfile(data.profile);
      setProfileDraft(data.profile);
      setIsEditingProfile(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Unable to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      setPasswordSaving(true);
      const data = await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage(data.message);
    } catch (error) {
      setPasswordError(
        axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || "Unable to change password"
          : "Unable to change password"
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Avatar row */}
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30">
        <div className="relative">
          <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-slate-700 shadow-lg">
            <AvatarImage src={profileImageURL} />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-black dark:bg-blue-900 dark:text-blue-300">{profileInitials}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-400 border-2 border-white dark:border-slate-700 shadow" />
        </div>
        <div className="hidden">
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">
            {isEditingProfile ? profileDraft.name : profile.name}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.program} · {profile.semester}</p>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-blue-600 text-white border-0 text-xs">
              Roll No: {isEditingProfile ? profileDraft.rollNo : profile.rollNo}
            </Badge>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0 text-xs">● Online</Badge>
          </div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-slate-900 dark:text-slate-100">
            {isEditingProfile ? profileDraft.name : profile.name}
          </p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {isEditingProfile ? profileDraft.program : profile.program} - {isEditingProfile ? profileDraft.semester : profile.semester}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className="bg-blue-600 text-white border-0 text-xs">
              Roll No: {isEditingProfile ? profileDraft.rollNo : profile.rollNo}
            </Badge>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0 text-xs">Online</Badge>
          </div>
        </div>
      </div>

      {profileLoading && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
          Loading profile...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Full Name", field: "name", icon: User, type: "text" },
          { label: "Email Address", field: "email", icon: Mail, type: "email" },
          { label: "Phone Number", field: "phone", icon: Phone, type: "tel" },
          { label: "Program", field: "program", icon: BookOpen, type: "text" },
        ].map((f) => (
          <div key={f.field} className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{f.label}</label>
            <div className="relative">
              <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type={f.type}
                value={profileDraft[f.field as keyof typeof profileDraft]}
                onChange={(e) => setProfileDraft((p) => ({ ...p, [f.field]: e.target.value }))}
                disabled={!isEditingProfile}
                className={`pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 transition ${
                  isEditingProfile
                    ? "bg-white dark:bg-slate-900"
                    : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Semester", field: "semester" },
          { label: "Roll Number", field: "rollNo" },
        ].map((f) => (
          <div key={f.label} className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{f.label}</label>
            <Input
              value={profileDraft[f.field as keyof typeof profileDraft]}
              onChange={(e) => setProfileDraft((p) => ({ ...p, [f.field]: e.target.value }))}
              disabled={!isEditingProfile}
              className={`h-11 rounded-xl border-slate-200 dark:border-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 transition ${
                isEditingProfile
                  ? "bg-white dark:bg-slate-900"
                  : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            />
          </div>
        ))}
      </div>

      {profileError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {profileError}
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-3">
      {[
        { key: "assignmentDue",    label: "Assignment Due Alerts",  desc: "Get reminded before assignment deadlines",   color: "bg-orange-500" },
        { key: "resultPublished",  label: "Result Published",       desc: "Notify when semester results are out",       color: "bg-blue-500" },
        { key: "attendanceAlert",  label: "Attendance Warning",     desc: "Alert when attendance drops below 75%",      color: "bg-red-500" },
        { key: "examSchedule",     label: "Exam Schedule",          desc: "Updates on upcoming exam timetables",        color: "bg-purple-500" },
        { key: "newsletter",       label: "College Newsletter",     desc: "Monthly college updates and events",         color: "bg-green-500" },
      ].map((item, i) => (
        <div
          key={item.key}
          className={`animate-fade-slide-up delay-${i * 60} flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group`}
        >
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          </div>
          <Toggle
            enabled={notifications[item.key as keyof typeof notifications]}
            onChange={(val) => setNotifications((n) => ({ ...n, [item.key]: val }))}
          />
        </div>
      ))}
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-green-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Change Password</h3>
        </div>
        <form className="space-y-3" onSubmit={handleChangePassword}>
          {[
            { label: "Current Password", name: "currentPassword" as const },
            { label: "New Password", name: "newPassword" as const },
            { label: "Confirm New Password", name: "confirmPassword" as const },
          ].map(({ label, name }, i) => (
            <div key={name} className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={passwords[name]}
                  onChange={(event) => setPasswords((current) => ({ ...current, [name]: event.target.value }))}
                  required
                  minLength={name === "currentPassword" ? undefined : 8}
                  className="pr-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                {i === 0 && (
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {passwordError && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{passwordError}</p>}
          {passwordMessage && <p className="text-sm font-semibold text-green-600 dark:text-green-400">{passwordMessage}</p>}
          <button
            type="submit"
            disabled={passwordSaving}
            className="mt-1 px-5 py-2.5 rounded-xl grad-blue text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:opacity-90 active:scale-95 transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            {/* <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Two-Factor Authentication</h3>
            </div> */}
            {/* <p className="text-xs text-slate-500 dark:text-slate-400">Add extra security to your account</p> */}
          </div>
          {/* <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0 font-bold">Enabled</Badge> */}
        </div>
        {/* <div className="flex gap-2 mt-4">
          <button className="px-4 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
            Disable 2FA
          </button>
          <button className="px-4 py-2 rounded-xl grad-blue text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:opacity-90 transition-all">
            Manage Devices
          </button>
        </div> */}
      </div>
    </div>
  );

  const themeOptions = [
    { value: "light",  label: "Light",  icon: Sun,     desc: "Clean & bright",   grad: "from-yellow-400 to-orange-400" },
    { value: "dark",   label: "Dark",   icon: Moon,    desc: "Easy on the eyes", grad: "from-slate-700 to-slate-900" },
    { value: "system", label: "System", icon: Monitor, desc: "Follows OS theme",  grad: "from-blue-500 to-indigo-600" },
  ];

  const renderAppearance = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" /> Theme
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {themeOptions.map((t) => {
            const Icon = t.icon;
            const active = theme === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value as "light" | "dark" | "system")}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                  active
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg shadow-blue-500/20 scale-[1.02]"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.01]"
                }`}
              >
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${t.grad} flex items-center justify-center shadow-md`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className={`text-sm font-bold ${active ? "text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-slate-400"}`}>{t.label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t.desc}</p>
                {active && <CheckCircle className="h-4 w-4 text-blue-500" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Display Density</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { id: "compact",     label: "Compact",     desc: "More content" },
            { id: "comfortable", label: "Comfortable", desc: "Balanced" },
            { id: "spacious",    label: "Spacious",    desc: "Easier reading" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDensity(d.id)}
              className={`py-3 px-2 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 ${
                density === d.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/20 scale-[1.02]"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="font-bold capitalize">{d.label}</div>
              <div className="text-xs opacity-60 mt-0.5">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Active theme preview */}
      <div className="p-4 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Currently Active</p>
        <p className="text-sm font-black shimmer-text capitalize">{theme} mode is active ✓</p>
      </div>
    </div>
  );

  const contentMap: Record<string, React.ReactNode> = {
    profile: renderProfile(),
    notifications: renderNotifications(),
    security: renderSecurity(),
    appearance: renderAppearance(),
  };

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/40 to-indigo-100/60 p-3 transition-colors duration-300 sm:p-4 lg:p-6 dark:from-[#0a0f1e] dark:via-[#0f172a] dark:to-[#1a0a2e]">

          <div className="animate-fade-slide-up delay-0">
            <PageHeader title="Settings" subtitle="Manage your account preferences" />
          </div>

          {/* Settings Layout */}
          <div className="animate-fade-slide-up delay-200 space-y-5">
            {/* Settings tabs */}
            <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-white/60 bg-white/70 p-2 shadow-lg shadow-slate-200/40 backdrop-blur-xl sm:grid-cols-4 dark:border-white/5 dark:bg-slate-800/60 dark:shadow-black/10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "grad-blue text-white shadow-lg shadow-blue-500/25"
                        : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <tab.icon className={`h-4 w-4 flex-shrink-0 ${activeTab === tab.id ? "text-white" : tab.color}`} />
                    {tab.label}
                  </button>
                ))}
            </nav>

            {/* Content */}
            <div className="min-w-0">
              <Card className="rounded-3xl border-0 shadow-xl glass dark:bg-slate-800/60 overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-100/50 dark:border-white/5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {(() => {
                        const t = tabs.find((t) => t.id === activeTab)!;
                        const Icon = t.icon;
                        return <><Icon className={`h-5 w-5 ${t.color}`} />{t.label}</>;
                      })()}
                    </CardTitle>
                    {activeTab === "profile" && !isEditingProfile && (
                      <button
                        type="button"
                        onClick={handleEditProfile}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl grad-blue px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:opacity-90 active:scale-95"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  {contentMap[activeTab]}

                  {activeTab === "profile" && isEditingProfile && (
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        onClick={handleSaveProfile}
                        disabled={profileSaving}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                          saved
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                            : "grad-blue text-white shadow-lg shadow-blue-500/30 hover:opacity-90"
                        }`}
                      >
                        {profileSaving ? "Saving..." : saved ? <><CheckCircle className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelProfile}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}

                  {activeTab === "profile" && saved && !isEditingProfile && (
                    <div className="mt-6 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      <CheckCircle className="h-4 w-4" />
                      Profile changes saved
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Settings;
