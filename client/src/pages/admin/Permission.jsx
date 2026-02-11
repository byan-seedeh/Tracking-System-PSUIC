import React, { useState, useEffect, useCallback } from "react";
import { getPermissions, updatePermissions, resetPermissions } from "../../api/permission";
import useAuthStore from "../../store/auth-store";
import { toast } from "react-toastify";
import { ArrowLeft, Save, RotateCcw, Shield, Ticket, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Permission = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState("it_support");
    const [permissions, setPermissions] = useState({
        viewTickets: false,
        editTickets: false,
        assignIT: false,
        manageUsers: false,
        manageEquipment: false
    });

    const roles = [
        { id: "admin", label: "Admin" },
        { id: "it_support", label: "IT Staff" },
        { id: "user", label: "User" }
    ];

    const loadPermissions = useCallback(async (role) => {
        try {
            const res = await getPermissions(token, role);
            if (res.data) {
                setPermissions({
                    viewTickets: res.data.viewTickets,
                    editTickets: res.data.editTickets,
                    assignIT: res.data.assignIT,
                    manageUsers: res.data.manageUsers,
                    manageEquipment: res.data.manageEquipment
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load permissions");
        }
    }, [token]);

    useEffect(() => {
        loadPermissions(selectedRole);
    }, [selectedRole, loadPermissions]);

    const handleToggle = (key) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        try {
            await updatePermissions(token, selectedRole, permissions);
            toast.success("Permissions updated successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update permissions");
        }
    };

    const handleReset = async () => {
        if (window.confirm("Reset permissions to default?")) {
            try {
                const res = await resetPermissions(token, selectedRole);
                setPermissions({
                    viewTickets: res.data.viewTickets,
                    editTickets: res.data.editTickets,
                    assignIT: res.data.assignIT,
                    manageUsers: res.data.manageUsers,
                    manageEquipment: res.data.manageEquipment
                });
                toast.success("Reset to default");
            } catch (err) {
                console.error(err);
                toast.error("Failed to reset");
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-semibold text-[#193C6C] tracking-tight font-poppins">Permission Management</h1>
                </div>
                <p className="text-gray-500 text-sm font-medium font-poppins ml-14">Manage roles and access control</p>
            </div>

            <div className="space-y-6">

                {/* Role Select Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3 tracking-wide flex items-center gap-2">
                        <Shield size={14} /> Select Role to Configure
                    </label>
                    <div className="bg-gray-50 p-1.5 rounded-xl flex gap-1">
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedRole === role.id
                                    ? "bg-white text-[#193C6C] shadow-md ring-1 ring-black/5"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Ticket Management */}
                    {/* Ticket Management */}
                    <div>
                        <h2 className="text-sm font-bold text-gray-800 uppercase mb-3 tracking-wide pl-1">
                            Ticket Management
                        </h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                            <ToggleItem
                                label="View tickets"
                                desc="Allow access to read ticket details"
                                checked={permissions.viewTickets}
                                onChange={() => handleToggle('viewTickets')}
                            />
                            <ToggleItem
                                label="Edit tickets"
                                desc="Allow editing ticket status and details"
                                checked={permissions.editTickets}
                                onChange={() => handleToggle('editTickets')}
                            />
                            <ToggleItem
                                label="Assign IT personnel"
                                desc="Allow assigning tickets to staff"
                                checked={permissions.assignIT}
                                onChange={() => handleToggle('assignIT')}
                            />
                        </div>
                    </div>

                    {/* System Admin */}
                    <div>
                        <h2 className="text-sm font-bold text-gray-800 uppercase mb-3 tracking-wide pl-1">
                            System Administration
                        </h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                            <ToggleItem
                                label="Manage users"
                                desc="Create, edit, or delete accounts"
                                checked={permissions.manageUsers}
                                onChange={() => handleToggle('manageUsers')}
                            />
                            <ToggleItem
                                label="Manage equipment"
                                desc="Add or edit equipment inventory"
                                checked={permissions.manageEquipment}
                                onChange={() => handleToggle('manageEquipment')}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 space-y-4">
                        <button
                            onClick={handleReset}
                            className="w-full flex items-center justify-between px-6 py-4 bg-white text-red-500 rounded-2xl font-bold text-sm border border-red-100 hover:bg-red-50 transition-colors"
                        >
                            Reset to Default
                            <RotateCcw size={18} />
                        </button>

                        <button
                            onClick={handleSave}
                            className="w-full py-4 bg-[#193C6C] text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-[#15325b] transition-all active:scale-[0.98]"
                        >
                            Save Change
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

const ToggleItem = ({ label, desc, checked, onChange }) => (
    <div className="p-4 flex items-center justify-between">
        <div>
            <h3 className="text-sm font-bold text-gray-900">{label}</h3>
            {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
        </div>
        <button
            onClick={onChange}
            className={`w-12 h-7 rounded-full transition-colors relative ${checked ? "bg-[#193C6C]" : "bg-gray-200"}`}
        >
            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${checked ? "translate-x-5" : ""}`} />
        </button>
    </div>
);

export default Permission;
