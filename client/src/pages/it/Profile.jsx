import React, { useState, useEffect, useCallback } from "react";
import {
    User,
    Mail,
    Shield,
    Calendar,
    Camera,
    Edit2,
    Check,
    X,
    Phone,
    ArrowLeft,
    LogOut,
    Briefcase,
    Bell,
    Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import dayjs from "dayjs";

import useAuthStore from "../../store/auth-store";
import { currentUser } from "../../api/auth";
import { updateProfileImage, updateProfile } from "../../api/user";

const ITProfile = () => {
    const navigate = useNavigate();
    const { token, checkUser, actionLogout } = useAuthStore();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Notification States
    const [myEmailEnabled, setMyEmailEnabled] = useState(true);

    /* ---------------- Fetch Profile ---------------- */
    const fetchProfile = useCallback(async () => {
        try {
            const res = await currentUser(token);
            setProfile(res.data);
            setMyEmailEnabled(res.data.isEmailEnabled !== false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    /* ---------------- Profile Image ---------------- */
    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image too large (max 5MB)");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            try {
                await updateProfileImage(token, reader.result);
                toast.success("Profile picture updated");
                await checkUser();
                fetchProfile();
            } catch (err) {
                console.error(err);
                toast.error("Failed to update profile picture");
            }
        };
    };

    /* ---------------- Update Field ---------------- */
    const updateField = async (field, value, closeEdit) => {
        try {
            await updateProfile(token, { [field]: value });
            setProfile(prev => ({ ...prev, [field]: value }));
            toast.success("Profile updated");
            await checkUser();

            if (closeEdit) closeEdit(false);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    /* ---------------- Update Notifications ---------------- */
    const handleToggleEmail = async () => {
        const newValue = !myEmailEnabled;
        setMyEmailEnabled(newValue); // Optimistic update

        try {
            // If enabling, we ensure notificationEmail is set to current profile email if not already set
            // but mainly we just toggle the flag.
            await updateProfile(token, {
                isEmailEnabled: newValue
            });
            await checkUser();
            toast.success(newValue ? "Notifications enabled" : "Notifications disabled");
        } catch (err) {
            setMyEmailEnabled(!newValue); // Revert on error
            console.error(err);
            toast.error("Failed to update preference");
        }
    }

    const handleLogout = () => {
        Swal.fire({
            title: 'Log out?',
            text: "You will be returned to the login screen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, log out',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: "rounded-3xl p-6",
                title: "text-xl font-semibold text-gray-900 font-poppins",
                htmlContainer: "text-gray-500 font-poppins",
                confirmButton: "bg-[#193C6C] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#122b4d] transition-colors",
                cancelButton: "bg-white text-[#193C6C] border border-[#193C6C] px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors",
                actions: "gap-3"
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                actionLogout();
                navigate("/login");
            }
        });
    };

    if (loading) {
        return (
            <div className="p-10 text-center text-gray-400 animate-pulse">
                Loading profile...
            </div>
        );
    }

    if (!profile) return null;

    const displayName = profile.name || profile.email?.split("@")[0] || "IT Support";

    return (
        <div className="bg-gray-50 font-poppins min-h-screen pb-10">

            {/* ================= Header ================= */}
            <header className="bg-[#193C6C] relative z-40 px-6 pt-10 pb-12 rounded-b-[3rem] shadow-lg overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white p-2 rounded-full hover:bg-white/10 active:scale-90"
                    >
                        <ArrowLeft size={28} />
                    </button>
                    <h1 className="text-3xl font-semibold text-white">
                        My Profile
                    </h1>
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-6 mt-6 space-y-6">

                {/* ================= Profile Summary ================= */}
                <section className="flex flex-col items-center text-center py-4">
                    <div className="relative w-24 h-24 mb-4 group">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-blue-50">
                            {profile.picture ? (
                                <img src={profile.picture} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#193C6C] text-white text-3xl font-bold">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <label
                            htmlFor="profile-upload"
                            className="absolute bottom-0 right-0 bg-[#193C6C] text-white p-2 rounded-full cursor-pointer border-2 border-white shadow-md hover:bg-blue-700"
                        >
                            <Camera size={14} />
                        </label>

                        <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>

                    <EditableName
                        value={displayName}
                        onSave={(v, close) => updateField("name", v, close)}
                    />

                    <p className="text-sm text-gray-500 mt-1">{profile.email}</p>

                    <span className="mt-3 px-5 py-1.5 bg-blue-50 text-[#193C6C] rounded-full text-xs font-semibold uppercase border border-blue-200 shadow-sm">
                        {profile.role || "IT SUPPORT"}
                    </span>
                </section>

                {/* ================= Detail Form ================= */}
                <section className="bg-white rounded-2xl border border-gray-100 p-8 transition-all duration-200 hover:border-blue-100 hover:shadow-md hover:-translate-y-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <User size={20} className="text-[#193C6C]" />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <ReadOnly label="Username" icon={User} value={profile.username || "-"} />
                        <Editable
                            label="Phone Number"
                            icon={Phone}
                            value={profile.phoneNumber}
                            onSave={(v, close) => updateField("phoneNumber", v, close)}
                        />
                        <Editable
                            label="Department"
                            icon={Briefcase}
                            value={profile.department}
                            onSave={(v, close) => updateField("department", v, close)}
                        />
                        <ReadOnly label="Role" icon={Shield} value={profile.role} uppercase />
                        <ReadOnly
                            label="Member Since"
                            icon={Calendar}
                            value={profile.createdAt ? dayjs(profile.createdAt).format("MMMM D, YYYY") : "N/A"}
                        />

                    </div>
                </section>

                {/* ================= Notifications ================= */}
                <section className="bg-white rounded-2xl border border-gray-100 p-8 transition-all duration-200 hover:border-blue-100 hover:shadow-md hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Bell size={20} className="text-[#193C6C]" />
                            Notification Settings
                        </h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <span className="font-semibold text-gray-700 text-sm block">Receive Email Alerts</span>
                                <span className="text-xs text-gray-400">Get notified when new tickets are assigned</span>
                            </div>
                            <button
                                onClick={handleToggleEmail}
                                className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 relative ${myEmailEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${myEmailEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ================= Logout Button ================= */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-white text-gray-400 font-semibold py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-[0.98] mb-4"
                >
                    <LogOut size={20} />
                    Log Out
                </button>

            </main>
        </div>
    );
};

/* ================= Helper Components ================= */

const ReadOnly = ({ label, icon, value, uppercase }) => {
    const Icon = icon;
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1 block">
                {label}
            </label>
            <div className="relative">
                <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <div className={`w-full h-12 bg-gray-50 rounded-lg pl-10 pr-4 flex items-center text-gray-500 font-medium cursor-not-allowed border border-transparent ${uppercase ? "uppercase" : ""}`}>
                    {value || "-"}
                </div>
            </div>
        </div>
    );
};

const Editable = ({ label, icon, value, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value || "");
    const Icon = icon;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1 block">
                {label}
            </label>
            <div className="relative">
                <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={isEditing ? tempValue : (value || "")}
                    disabled={!isEditing}
                    onChange={(e) => setTempValue(e.target.value)}
                    placeholder="-"
                    className={`w-full h-12 rounded-lg pl-10 pr-12 font-medium transition-all border border-transparent outline-none ${isEditing
                        ? "bg-white border-blue-500 text-gray-900 ring-4 ring-blue-500/10 placeholder:text-gray-300"
                        : "bg-gray-50 text-[#193C6C]"
                        }`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {isEditing ? (
                        <div className="flex gap-1">
                            <button
                                onClick={() => onSave(tempValue, setIsEditing)}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Save"
                            >
                                <Check size={16} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Cancel"
                            >
                                <X size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setTempValue(value || "");
                                setIsEditing(true);
                            }}
                            className="p-2 text-gray-400 hover:text-[#193C6C] transition-colors"
                            title="Edit"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const EditableName = ({ value, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value || "");

    if (isEditing) {
        return (
            <div className="flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-200">
                <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="border-b-2 border-blue-500 text-2xl font-semibold text-gray-800 text-center focus:outline-none bg-transparent w-auto min-w-[200px]"
                    autoFocus
                />
                <button
                    onClick={() => onSave(tempValue, setIsEditing)}
                    className="p-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                >
                    <Check size={20} strokeWidth={3} />
                </button>
                <button
                    onClick={() => setIsEditing(false)}
                    className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                >
                    <X size={20} strokeWidth={3} />
                </button>
            </div>
        )
    }

    return (
        <div className="group flex items-center justify-center gap-2">
            <h2 className="text-2xl font-semibold text-[#193C6C]">
                {value}
            </h2>
            <button
                onClick={() => {
                    setTempValue(value);
                    setIsEditing(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            >
                <Edit2 size={16} />
            </button>
        </div>
    )
}

export default ITProfile;
