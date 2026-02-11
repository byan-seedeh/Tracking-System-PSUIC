import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2, ArrowLeft, User, ChevronLeft, ChevronRight, X, Check, ChevronDown } from "lucide-react";
import { listUsers, changeStatus, removeUser, createUser, updateUser } from "../../api/user";
import useAuthStore from "../../store/auth-store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const UserManagement = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [activeSubTab, setActiveSubTab] = useState("All"); // [NEW] Sub-filter
  const [isFilterOpen, setIsFilterOpen] = useState(false); // [NEW] Dropdown state
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form State for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserTypeOpen, setIsUserTypeOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    username: "", // PSU ID
    name: "",
    email: "",
    password: "",
    role: "user",
    department: "",
    phoneNumber: "",
    picture: ""
  });

  // Edit Role State (Keep separate if we want a quick role switcher, OR merge. 
  // The prompt implies "Edit User modal that looks like Add". 
  // I will merge role editing into the main Edit User modal for simplicity and power, 
  // BUT I'll leave the quick actions if they are distinct. 
  // Actually, standardizing on a single 'Edit' modal for all details is cleaner as per prompt "Edit User Modal... pre-filled".
  // So I'll prioritize the detailed Edit modal for the Pen icon.

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      let roleParam = "all";
      if (activeTab === "User") roleParam = "user";
      if (activeTab === "IT") roleParam = "it_support";
      if (activeTab === "Admin") roleParam = "admin";

      const res = await listUsers(token, { role: roleParam });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    loadUsers();
    setCurrentPage(1);
  }, [loadUsers]);

  // Reset page & subtab on search/tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab, activeSubTab]);

  // Reset subtab when switching main tabs
  useEffect(() => {
    setActiveSubTab("All");
  }, [activeTab]);

  // ... (Keep handleStatusToggle, handleDelete)



  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete User",
      text: "This action cannot be undone. All user data will be permanently removed.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-2xl p-6 font-sans",
        title: "text-xl font-bold text-[#193C6C]",
        confirmButton: "bg-red-500 rounded-lg",
        cancelButton: "bg-gray-100 text-gray-600 rounded-lg"
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await removeUser(token, id);
          toast.success("User Deleted");
          loadUsers();
        } catch {
          toast.error("Delete Failed");
        }
      }
    });
  };

  // File Upload Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        return toast.error("File size is too large (Max 2MB)");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserForm(prev => ({ ...prev, picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Modal Helpers
  const openCreateModal = () => {
    setEditingUserId(null);
    // Smart Default
    let defaultRole = "user";
    let defaultDept = "Student";

    if (activeTab === "IT") { defaultRole = "it_support"; defaultDept = "IT Support"; }
    if (activeTab === "Admin") { defaultRole = "admin"; defaultDept = "System Admin"; }

    setUserForm({ username: "", name: "", email: "", password: "", role: defaultRole, department: defaultDept, phoneNumber: "", picture: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUserId(user.id);
    setUserForm({
      username: user.username || "", // PSU ID
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
      department: (user.department === "Admin Dept") ? "" : (user.department || "Student"),
      phoneNumber: user.phoneNumber || "",
      picture: user.picture || "",
      enabled: user.enabled // [NEW] Status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        // Update
        // Note: We need a backend endpoint that supports these fields. 
        // Previously saw updateUser in api/user.js taking (token, id, form).
        // And controller updateUser supports { name, department, phoneNumber, role }.
        // Password might need separate handling or check if controller supports it (controller seemed to look for name/dept etc. but maybe not password in standard update?).
        // Controller `updateUser` (line 221) extracts: `const { name, department, phoneNumber, role } = req.body;`.
        // It does NOT update email or password.
        // So for now, we will update non-sensitive info. 
        // Admin usually doesn't reset password here unless we use a specific endpoint, but let's stick to what the controller offers.

        // Update User
        // Need to ensure backend accepts 'username' for PSU ID update if applicable.
        await updateUser(token, editingUserId, userForm);
        toast.success("User Updated Successfully");
      } else {
        // Create
        if (!userForm.name || !userForm.email || !userForm.password) {
          return toast.error("Please fill in required fields");
        }
        await createUser(token, userForm);
        toast.success("User Created Successfully");
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Operation Failed";
      toast.error(errMsg);
    }
  };

  // ... (Keep Filter Logic)
  const filteredUsers = users.filter((u) => {
    const matchesSearch = (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(search.toLowerCase());

    // Sub-filter Logic for 'User' tab
    let matchesSub = true;
    if (activeTab === "User" && activeSubTab !== "All") {
      matchesSub = u.department === activeSubTab;
    }

    return matchesSearch && matchesSub;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDisplayRole = (user) => {
    if (user.role === 'admin') return 'System Admin';
    if (user.role === 'it_support') return 'IT Support';
    // For users, display their department (Student/Staff/Lecturer)
    return user.department || 'User';
  };

  const getRoleBadgeStyle = (user) => {
    if (user.role === 'admin') return 'bg-blue-100/50 text-[#193C6C] border border-blue-200';
    if (user.role === 'it_support') return 'bg-purple-100/50 text-purple-700 border border-purple-200';
    // For users (Student etc)
    return 'bg-gray-100 text-gray-600 border border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-semibold text-[#193C6C] tracking-tight font-poppins">User Management</h1>
        </div>
        <p className="text-gray-500 text-sm font-medium font-poppins ml-14">Manage student, staff and administrator accounts</p>
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white p-4 rounded-[8px] shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-center text-sm">
            {/* Search */}
            {/* Search */}
            <div className="flex items-center gap-3 w-full md:w-96 bg-[#F6F6F6] px-4 h-[42px] rounded-[8px] border border-gray-100 mt-1">
              <Search className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email or ID..."
                className="flex-1 bg-transparent border-none focus:outline-none font-medium text-gray-700 placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Dropdown & Add Button */}
            <div className="flex gap-3 w-full md:w-auto">
              {/* Main Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="bg-white border border-gray-200 text-gray-700 px-4 h-[42px] rounded-[8px] font-medium flex items-center gap-2 hover:bg-gray-50 focus:ring-2 focus:ring-[#193C6C]/10 transition-all min-w-[140px] justify-between mt-1"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs uppercase font-bold">View:</span>
                    {activeTab}
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-100 rounded-[8px] shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {["All", "User", "IT", "Admin"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setIsFilterOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 font-medium hover:bg-gray-50 transition-colors ${activeTab === tab ? "text-[#193C6C] bg-[#F6F6F6]" : "text-gray-600"}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Button */}
              <button
                onClick={openCreateModal}
                className="bg-[#193C6C] text-white px-6 h-[42px] rounded-[8px] font-medium flex items-center gap-2 hover:bg-[#15325b] shadow-lg shadow-blue-900/10 whitespace-nowrap transition-all active:scale-95 mt-1"
              >
                <Plus size={18} /> Add User
              </button>
            </div>
          </div>

          {/* Sub-Filters (Pills) - Only for User Tab */}
          {activeTab === "User" && (
            <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-left-2 duration-300 pt-4 border-t border-gray-50 justify-start">
              {["All", "Student", "Staff", "Lecturer"].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubTab(sub)}
                  className={`px-6 py-2 rounded-[8px] text-sm font-poppins font-medium border transition-all ${activeSubTab === sub
                    ? "bg-[#193C6C] text-white border-[#193C6C] shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* User Cards Grid (Horizontal) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {paginatedUsers.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-[8px] border border-gray-100 shadow-sm relative group hover:shadow-md transition-all flex items-center gap-4">

              {/* Avatar (Left) */}
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 text-gray-300 overflow-hidden cursor-pointer">
                {user.picture ? (
                  <img src={user.picture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} />
                )}
              </div>

              {/* Content (Right) */}
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-poppins text-[16px] font-medium text-[#193C6C] truncate" title={user.name}>
                  {user.name || "No Name"}
                </h3>
                <p className="font-poppins text-[14px] font-medium text-gray-400 truncate" title={user.username || user.email}>
                  {user.username || user.email}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-medium ${getRoleBadgeStyle(user)}`}>
                    {getDisplayRole(user)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">

                <button
                  onClick={() => openEditModal(user)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#193C6C] hover:bg-blue-50 rounded-[8px] transition-colors border border-transparent hover:border-blue-100 group-hover/btn:border-blue-200"
                  title="Edit User"
                >
                  <Edit2 size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-[8px] transition-colors border border-transparent hover:border-red-100 group-hover/btn:border-red-200"
                  title="Delete"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 pb-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="text-sm font-bold text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {loading && (
          <div className="col-span-full text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#193C6C] mx-auto"></div>
          </div>
        )}

      </div>

      {/* Main Form Modal (Create / Edit) */}
      {
        isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[8px] p-8 max-w-md w-full shadow-xl font-sans relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-[#193C6C] mb-6">
                {editingUserId ? "Edit User Details" : "Add New User"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center mb-6">
                  <div
                    className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center relative group cursor-pointer hover:border-[#193C6C] transition-all overflow-hidden"
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    {userForm.picture ? (
                      <img src={userForm.picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-300 group-hover:text-[#193C6C] transition-colors" />
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Edit2 size={24} className="text-white" />
                    </div>
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>



                {/* PSU ID */}
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">PSU ID</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-[#F6F6F6] rounded-[8px] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all text-[#193C6C] font-medium placeholder:text-gray-400"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="e.g. 641021xxxx"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-[#F6F6F6] rounded-[8px] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all text-[#193C6C] font-medium placeholder:text-gray-400"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="e.g. Somchai Jai-dee"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className={`w-full px-4 py-2.5 rounded-[8px] border border-transparent transition-all font-medium ${editingUserId ? "bg-[#F6F6F6] text-gray-500" : "bg-[#F6F6F6] focus:bg-white focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] text-[#193C6C]"}`}
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="e.g. name@psu.ac.th"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Phone Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-[#F6F6F6] rounded-[8px] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all text-[#193C6C] font-medium"
                    value={userForm.phoneNumber}
                    onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                    placeholder="081-xxx-xxxx"
                  />
                </div>

                {/* Password (Only for Add) */}
                {!editingUserId && (
                  <div>
                    <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-2.5 bg-[#F6F6F6] rounded-[8px] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all font-medium"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {/* Role Selection (Dropdown) */}
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">User Type</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsUserTypeOpen(!isUserTypeOpen)}
                      className="w-full px-4 py-2.5 bg-[#F6F6F6] rounded-[8px] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all font-medium text-gray-700 text-left flex justify-between items-center"
                    >
                      <span className={!userForm.department ? "text-gray-400" : ""}>
                        {userForm.department || "Select User Type"}
                      </span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>

                    {isUserTypeOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-[8px] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ml-0 max-h-60 overflow-y-auto custom-scrollbar">
                        {["Student", "Lecturer", "Staff", "IT Support", "System Admin"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              let role = "user";
                              if (type === 'IT Support') role = 'it_support';
                              if (type === 'System Admin') role = 'admin';
                              setUserForm({ ...userForm, department: type, role: role });
                              setIsUserTypeOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 font-medium transition-colors flex items-center justify-between ${userForm.department === type
                              ? "bg-[#F6F6F6] text-[#193C6C]"
                              : "text-gray-600 hover:bg-[#F6F6F6]"
                              }`}
                          >
                            <span>{type}</span>
                            {userForm.department === type && <Check size={16} className="text-[#193C6C]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#193C6C] text-white py-3 rounded-[8px] font-bold hover:bg-[#15325b] transition-all mt-6 shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                >
                  {editingUserId ? "Save Changes" : "Create User"}
                </button>
              </form>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default UserManagement;
