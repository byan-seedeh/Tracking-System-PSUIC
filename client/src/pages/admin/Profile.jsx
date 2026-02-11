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
    ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth-store";
import { currentUser } from "../../api/auth";
import { updateProfileImage, updateProfile } from "../../api/user";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const AdminProfile = () => {
    const { token, checkUser } = useAuthStore();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit States
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState("");

    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneInput, setPhoneInput] = useState("");

    const fetchProfile = useCallback(async () => {
        try {
            const res = await currentUser(token);
            setProfile(res.data);
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

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image too large (max 5MB)");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            try {
                const base64Image = reader.result;
                await updateProfileImage(token, base64Image);
                toast.success("Profile picture updated!");
                await checkUser();
                fetchProfile();
            } catch (err) {
                console.error(err);
                toast.error("Failed to update profile picture");
            }
        };
    };

    const handleUpdateField = async (field, value, updateStateFn, closeEditFn) => {
        try {
            const payload = { [field]: value };
            await updateProfile(token, payload);
            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated!`);
            setProfile({ ...profile, ...payload });
            await checkUser();
            closeEditFn(false);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || `Failed to update ${field}`);
        }
    };

    if (loading)
        return (
            <div className="p-10 text-center text-gray-500 animate-pulse">
                Loading Profile...
            </div>
        );
    if (!profile) return null;

    const displayName = profile.name || (profile.email ? profile.email.split('@')[0] : "Admin");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-semibold text-[#193C6C] tracking-tight font-poppins">My Profile</h1>
                </div>
                <p className="text-gray-500 text-sm font-medium font-poppins ml-14">Manage your account settings</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Section 1: Compressed Profile Header */}
                <div className="flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
                    <div className="relative w-24 h-24 mb-4 group">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                            {profile.picture ? (
                                <img
                                    src={profile.picture}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#193C6C] text-white text-3xl font-bold">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <label
                            htmlFor="profile-upload"
                            className="absolute bottom-0 right-0 bg-[#193C6C] text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors border-2 border-white shadow-md transform group-hover:scale-105 active:scale-95"
                        >
                            <Camera size={14} />
                        </label>
                        <input
                            id="profile-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    <h2 className="text-2xl font-bold text-[#193C6C] mb-1 font-poppins">
                        {profile.name || "Admin"}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mb-4">{profile.email}</p>

                    <span className="px-5 py-1.5 bg-[#E3F2FD] text-[#193C6C] rounded-full text-xs font-bold tracking-wider shadow-sm border border-blue-100 uppercase">
                        {profile.role || "ADMIN"}
                    </span>
                </div>

                {/* Section 2: Form Details */}
                <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        {/* PSU ID (Read Only) */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-medium text-gray-700 ml-1 block">PSU ID</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <div className="w-full h-[48px] bg-[#F6F6F6] rounded-[8px] pl-10 pr-4 flex items-center text-gray-500 font-medium cursor-not-allowed border border-transparent">
                                    {profile.username || "-"}
                                </div>
                            </div>
                        </div>

                        {/* Full Name (Editable) */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-medium text-gray-700 ml-1 block">Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={isEditingName ? nameInput : (profile.name || "")}
                                    disabled={!isEditingName}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    placeholder={!profile.name ? "-" : ""}
                                    className={`w-full h-[48px] rounded-[8px] pl-10 pr-12 font-medium transition-all border border-transparent ${isEditingName
                                        ? "bg-white border-blue-500 text-gray-900 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-300"
                                        : "bg-[#F6F6F6] text-[#193C6C]"
                                        }`}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    {isEditingName ? (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleUpdateField('name', nameInput, null, setIsEditingName)}
                                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                                <Check size={16} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={() => setIsEditingName(false)}
                                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                <X size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setNameInput(profile.name || "");
                                                setIsEditingName(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-[#193C6C] transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Email (Read Only) */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-medium text-gray-700 ml-1 block">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <div className="w-full h-[48px] bg-[#F6F6F6] rounded-[8px] pl-10 pr-4 flex items-center text-gray-500 font-medium cursor-not-allowed border border-transparent">
                                    {profile.email}
                                </div>
                            </div>
                        </div>

                        {/* Phone (Editable) */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-medium text-gray-700 ml-1 block">Phone Number</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={isEditingPhone ? phoneInput : (profile.phoneNumber || "")}
                                    disabled={!isEditingPhone}
                                    onChange={(e) => setPhoneInput(e.target.value)}
                                    placeholder={!profile.phoneNumber ? "-" : ""}
                                    className={`w-full h-[48px] rounded-[8px] pl-10 pr-12 font-medium transition-all border border-transparent ${isEditingPhone
                                        ? "bg-white border-blue-500 text-gray-900 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-300"
                                        : "bg-[#F6F6F6] text-[#193C6C]"
                                        }`}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    {isEditingPhone ? (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleUpdateField('phoneNumber', phoneInput, null, setIsEditingPhone)}
                                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                                <Check size={16} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={() => setIsEditingPhone(false)}
                                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                <X size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setPhoneInput(profile.phoneNumber || "");
                                                setIsEditingPhone(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-[#193C6C] transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* User Type (Read Only) */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-medium text-gray-700 ml-1 block">User Type</label>
                            <div className="relative">
                                <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <div className="w-full h-[48px] bg-[#F6F6F6] rounded-[8px] pl-10 pr-4 flex items-center text-gray-500 font-medium cursor-not-allowed border border-transparent uppercase">
                                    {profile.role}
                                </div>
                            </div>
                        </div>

                        {/* Member Since (Read Only) */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-medium text-gray-700 ml-1 block">Member Since</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <div className="w-full h-[48px] bg-[#F6F6F6] rounded-[8px] pl-10 pr-4 flex items-center text-gray-500 font-medium cursor-not-allowed border border-transparent">
                                    {profile.createdAt ? dayjs(profile.createdAt).format("MMMM D, YYYY") : "N/A"}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminProfile;
