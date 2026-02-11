import React, { useState, useEffect, useCallback } from "react";
import { Search, Calendar, Edit2, UserPlus, Clock, X, CheckCircle, ArrowLeft, Mail, Briefcase, Trash2, Ticket, ChevronDown, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getITStaff } from "../../api/admin"; // removed listAllTickets unused refernece if not needed for this UI
import { updateUser, removeUser, createUser } from "../../api/user"; // Added createUser
import useAuthStore from "../../store/auth-store";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ITManagement = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false); // [NEW] Custom Dropdown

    // Form States
    const [currentMember, setCurrentMember] = useState(null);
    const [inviteForm, setInviteForm] = useState({ email: "", role: "it_support" });
    const [editForm, setEditForm] = useState({ name: "", department: "", phoneNumber: "", status: "Available" });
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const staffRes = await getITStaff(token);
            setStaff(staffRes.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load staff data");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        try {
            await createUser(token, { ...inviteForm, password: "password123" }); // Default password
            toast.success("User invited successfully");
            setIsInviteModalOpen(false);
            setInviteForm({ email: "", role: "it_support" });
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to invite user");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUser(token, currentMember.id, editForm);
            toast.success("Staff updated successfully");
            setIsEditModalOpen(false);
            loadData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update staff");
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Delete Staff",
            text: "Are you sure you want to delete this staff member?",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            customClass: {
                popup: "rounded-3xl p-6 md:p-8",
                title: "text-xl md:text-2xl font-bold text-gray-900 mb-2",
                htmlContainer: "text-gray-500 text-base",
                confirmButton: "bg-red-500 hover:bg-red-600 text-white min-w-[120px] py-3 rounded-xl font-bold text-sm shadow-sm transition-colors",
                cancelButton: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 min-w-[120px] py-3 rounded-xl font-bold text-sm transition-colors",
                actions: "gap-4 w-full px-4 mt-4"
            },
            buttonsStyling: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await removeUser(token, id);
                    toast.success("Staff deleted");
                    loadData();
                } catch (err) {
                    console.error(err);
                    toast.error("Delete failed");
                }
            }
        });
    };

    const openEditModal = (member) => {
        setCurrentMember(member);
        setEditForm({
            name: member.name || "",
            department: member.department || "",
            phoneNumber: member.phoneNumber || "",
            status: member.status || "Available"
        });
        setIsEditModalOpen(true);
    };

    // Filter Logic
    const filteredStaff = staff.filter(member => {
        const matchesSearch = (member.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (member.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

        let matchesTab = true;
        if (activeTab === "Available") matchesTab = member.status === "Available" || member.status === "Busy";
        if (activeTab === "On leave") matchesTab = member.status === "On Leave";

        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-semibold text-[#193C6C] tracking-tight font-poppins">IT Management</h1>
                </div>
                <p className="text-gray-500 text-sm font-medium font-poppins ml-14">Manage IT support staff and schedules</p>
            </div>

            <div className="space-y-6">
                {/* Controls */}
                <div className="bg-white p-4 rounded-[8px] shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-center text-sm">
                        {/* Search */}
                        <div className="flex items-center gap-3 w-full md:w-96 bg-gray-50 px-4 py-2.5 rounded-[8px] border border-gray-100 mt-1">
                            <Search className="text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Searching by name or email..."
                                className="flex-1 bg-transparent border-none focus:outline-none font-medium text-gray-700 placeholder:text-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filter & Invite */}
                        <div className="flex gap-3 w-full md:w-auto items-center">
                            {/* Tabs */}
                            <div className="flex gap-2">
                                {["All", "Available", "On leave"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-2 rounded-[8px] text-sm font-poppins font-medium border transition-all h-[36px] flex items-center justify-center ${activeTab === tab
                                            ? "bg-[#193C6C] text-white border-[#193C6C] shadow-sm"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Invite Button */}
                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="bg-[#193C6C] text-white px-6 h-[42px] rounded-[8px] font-medium flex items-center gap-2 hover:bg-[#15325b] shadow-lg shadow-blue-900/10 whitespace-nowrap transition-all active:scale-95 mt-1"
                            >
                                <UserPlus size={18} /> Invite User
                            </button>
                        </div>
                    </div>
                </div>

                {/* Staff List */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide px-1">
                        Total Users <span className="text-gray-400 ml-1">({filteredStaff.length})</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredStaff.map((member) => (
                            <div key={member.id} className="bg-white p-4 rounded-[8px] border border-gray-100 shadow-sm relative group hover:shadow-md transition-all flex items-center gap-4">

                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 relative">
                                    {member.picture ? (
                                        <img src={member.picture} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={`https://ui-avatars.com/api/?name=${member.name}&background=random`} alt="" className="w-full h-full object-cover" />
                                    )}
                                    {/* Status Indicator Dot */}
                                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${member.status === 'Available' ? "bg-green-500" :
                                        member.status === 'On Leave' ? "bg-amber-500" :
                                            member.status === 'Busy' ? "bg-blue-500" :
                                                "bg-gray-400"
                                        }`}></div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 text-left">
                                    <h3 className="font-poppins text-[16px] font-medium text-[#193C6C] truncate">
                                        {member.name || "No Name"}
                                    </h3>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="font-poppins text-[12px] font-medium text-gray-400 truncate">
                                            {member.department || "IT Support"}
                                        </p>
                                        {member.status === 'Busy' && member.currentTicket && (
                                            <p className="text-[11px] text-blue-500 font-medium truncate">
                                                working on Ticket #{member.currentTicket.id}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => openEditModal(member)}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#193C6C] hover:bg-blue-50 rounded-[8px] transition-colors border border-transparent hover:border-blue-100 group-hover/btn:border-blue-200"
                                        title="Edit Staff"
                                    >
                                        <Edit2 size={16} strokeWidth={1.5} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-[8px] transition-colors border border-transparent hover:border-red-100 group-hover/btn:border-red-200"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredStaff.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-400">
                            <p>No staff found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[8px] p-8 max-w-md w-full shadow-xl font-sans relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#193C6C]">Invite New User</h2>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleInviteSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2.5 bg-[#F6F6F6] rounded-[8px] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all font-medium text-[#193C6C] placeholder:text-gray-400"
                                    placeholder="user@psu.ac.th"
                                    value={inviteForm.email}
                                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Role</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsRoleOpen(!isRoleOpen)}
                                        className="w-full px-4 py-2.5 bg-[#F6F6F6] rounded-[8px] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all font-medium text-left flex justify-between items-center"
                                    >
                                        <span className={inviteForm.role ? "text-gray-700" : "text-gray-400"}>
                                            {inviteForm.role === 'it_support' ? 'IT Support' :
                                                inviteForm.role === 'admin' ? 'Admin' : 'User'}
                                        </span>
                                        <ChevronDown size={16} className="text-gray-400" />
                                    </button>

                                    {isRoleOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[8px] shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            {[
                                                { value: 'user', label: 'User' },
                                                { value: 'it_support', label: 'IT Support' },
                                                { value: 'admin', label: 'Admin' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setInviteForm({ ...inviteForm, role: opt.value });
                                                        setIsRoleOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#F6F6F6] transition-colors"
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-[#193C6C] text-white py-3 rounded-[8px] font-bold hover:bg-[#15325b] flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 active:scale-95 transition-all">
                                <Mail size={18} /> Send Invitation
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[8px] p-8 max-w-md w-full shadow-xl font-sans relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#193C6C]">Edit Staff</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-[#F6F6F6] rounded-[8px] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all font-medium text-[#193C6C]"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            {/* Department Removed as per request */}
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Phone</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-[#F6F6F6] rounded-[8px] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all font-medium text-[#193C6C]"
                                    value={editForm.phoneNumber}
                                    onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                />
                            </div>

                            {/* Status Dropdown */}
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Status</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                                        className="w-full px-4 py-2.5 bg-[#F6F6F6] rounded-[8px] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all font-medium text-[#193C6C] text-left flex justify-between items-center"
                                    >
                                        <span>{editForm.status}</span>
                                        <ChevronDown size={16} className="text-gray-400" />
                                    </button>

                                    {isStatusOpen && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-[8px] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ml-0">
                                            {["Available", "On Leave"].map((status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => {
                                                        setEditForm({ ...editForm, status: status });
                                                        setIsStatusOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 font-medium transition-colors flex items-center justify-between ${editForm.status === status
                                                        ? "bg-[#F6F6F6] text-[#193C6C]"
                                                        : "text-gray-600 hover:bg-[#F6F6F6]"
                                                        }`}
                                                >
                                                    <span>{status}</span>
                                                    {editForm.status === status && <Check size={16} className="text-[#193C6C]" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-[#193C6C] text-white py-3 rounded-[8px] font-bold hover:bg-[#15325b] shadow-lg shadow-blue-900/10 active:scale-95 transition-all">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ITManagement;
