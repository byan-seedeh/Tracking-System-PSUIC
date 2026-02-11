// client/src/pages/admin/EquipmentManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, ChevronDown, Monitor, Printer, Wifi, Wind, Box, ArrowLeft, QrCode, Tag, Edit, Trash2, X } from "lucide-react";
import useAuthStore from "../../store/auth-store";
import { toast } from "react-toastify";
import axios from "axios";
import { listCategories, createCategory, updateCategory, removeCategory } from "../../api/category";
import { useNavigate } from "react-router-dom";

const EquipmentManagement = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]); // [NEW] Dynamic Categories
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Categories");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false); // [NEW]
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

  // Form
  const [form, setForm] = useState({
    name: "",
    type: "",
    serialNo: "",
    roomId: "",
  });

  // Category State
  const [categoryForm, setCategoryForm] = useState(""); // [NEW]
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState("");
  const [editingEquipmentId, setEditingEquipmentId] = useState(null); // [NEW] for equipment editing

  // Custom Dropdown States
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isRoomOpen, setIsRoomOpen] = useState(false);

  // Fixed Categories as requested
  const allTypes = [
    "ACCOUNT & LOGIN",
    "COMPUTER",
    "PROJECTOR",
    "SOFTWARE",
    "OTHER",
  ];
  // Remove duplicates using Set just in case (though list is fixed now)
  const equipmentTypes = [...new Set(allTypes)];

  const loadEquipments = useCallback(async () => {
    try {
      const res = await axios.get("/api/equipment", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadRooms = useCallback(async () => {
    try {
      const res = await axios.get("/api/room", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await listCategories(token);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    loadEquipments();
    loadRooms();
    loadCategories();
  }, [loadEquipments, loadRooms, loadCategories]);

  // -- Category Handlers --

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.trim()) return;
    try {
      await createCategory(token, { name: categoryForm });
      toast.success("Category added");
      setCategoryForm("");
      // Keep modal open so user can manage more
      loadCategories(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    }
  };

  const startEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
  };

  const cancelEdit = () => {
    setEditingCatId(null);
    setEditCatName("");
  };

  const handleUpdateCategory = async (id) => {
    if (!editCatName.trim()) return;
    try {
      await updateCategory(token, id, { name: editCatName });
      toast.success("Category updated");
      setEditingCatId(null);
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await removeCategory(token, id);
      toast.success("Category deleted");
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  // Equipment Handlers
  const handleEditEquipment = (equipment) => {
    setEditingEquipmentId(equipment.id);
    setForm({
      name: equipment.name,
      type: equipment.type,
      serialNo: equipment.serialNo || "",
      roomId: equipment.room?.id || "",
    });
    setShowAddModal(true);
  };

  const handleDeleteEquipment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) return;
    try {
      await axios.delete(`/api/equipment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Equipment deleted");
      loadEquipments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete equipment");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEquipmentId) {
        // Update Logic
        await axios.put(`/api/equipment/${editingEquipmentId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Equipment updated successfully");
      } else {
        // Create Logic
        await axios.post("/api/equipment", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Equipment created successfully");
      }

      loadEquipments();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      toast.error(editingEquipmentId ? "Failed to update equipment" : "Failed to create equipment");
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingEquipmentId(null);
    setForm({ name: "", type: "", serialNo: "", roomId: "" });
  };

  const showQR = async (equipmentId) => {
    try {
      const res = await axios.get(`/api/equipment/${equipmentId}/qr`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedQR(res.data);
      setShowQRModal(true);
    } catch {
      toast.error("Failed to generate QR Code");
    }
  };

  const printQR = () => {
    const printWindow = window.open("", "", "width=400,height=600");
    printWindow.document.write(`
              <html>
                  <head>
                      <title>QR Code - ${selectedQR.equipment.name}</title>
                      <style>
                          body { 
                              font-family: Arial, sans-serif; 
                              text-align: center; 
                              padding: 20px;
                          }
                          .container {
                              border: 2px solid #333;
                              padding: 20px;
                              border-radius: 10px;
                              margin: 20px auto;
                              width: 350px;
                          }
                          h2 { color: #333; margin: 10px 0; }
                          .info { 
                              background: #f0f0f0; 
                              padding: 10px; 
                              border-radius: 5px;
                              margin: 10px 0;
                          }
                          .qr-code { margin: 20px 0; }
                          .footer {
                              margin-top: 20px;
                              font-size: 12px;
                              color: #666;
                              margin: 0;
                          }
                      </style>
                  </head>
                  <body>
                      <div class="container">
                          <h2>PSUIC Service</h2>
                          <div class="qr-code">
                              <img src="${selectedQR.qrCodeImage}" style="width: 250px; height: 250px;">
                          </div>
                          <div class="info">
                              <p><strong>อุปกรณ์:</strong> ${selectedQR.equipment.name}</p>
                              <p><strong>ห้อง:</strong> ${selectedQR.equipment.room.roomNumber}</p>
                              <p><strong>Serial:</strong> ${selectedQR.equipment.serialNo || "-"}</p>
                          </div>
                          <div class="footer">
                              สแกน QR Code เพื่อแจ้งปัญหา<br>
                              หรือดูประวัติการซ่อม
                          </div>
                      </div>
                  </body>
              </html>
          `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter Logic
  const filteredEquipments = Array.isArray(equipments) ? equipments.filter(item => {
    if (!item || !item.name) return false;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.id).includes(searchQuery) ||
      (item.serialNo && item.serialNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "All Categories" || (item.type && item.type.toUpperCase() === selectedType);
    return matchesSearch && matchesType;
  }) : [];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Computer': return <Monitor size={24} className="text-gray-500" />;
      case 'Printer': return <Printer size={24} className="text-gray-500" />;
      case 'Network Device': return <Wifi size={24} className="text-gray-500" />;
      case 'Air Conditioner': return <Wind size={24} className="text-gray-500" />;
      default: return <Box size={24} className="text-gray-500" />;
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
          <h1 className="text-3xl font-semibold text-[#193C6C] tracking-tight font-poppins">Equipment Management</h1>
        </div>
        <p className="text-gray-500 text-sm font-medium font-poppins ml-14">Manage items, assets, and service history</p>
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white p-4 rounded-[8px] shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-center text-sm">
            {/* Search */}
            <div className="flex items-center gap-3 w-full md:w-96 bg-[#F6F6F6] px-4 py-2.5 rounded-[8px] border border-gray-100">
              <Search className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search asset ID or Name..."
                className="flex-1 bg-transparent border-none focus:outline-none font-medium text-gray-700 placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter & Add */}
            <div className="flex gap-3 w-full md:w-auto items-center">
              {/* Type Dropdown */}
              <div className="relative w-full md:w-48">
                <button
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-[8px] font-medium flex items-center justify-between gap-2 hover:bg-gray-50 focus:ring-2 focus:ring-[#193C6C]/10 transition-all w-full"
                >
                  <span className="truncate">{selectedType}</span>
                  <ChevronDown size={16} className="text-gray-400 shrink-0" />
                </button>

                {isTypeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[8px] shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={() => { setSelectedType("All Categories"); setIsTypeDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 font-medium hover:bg-gray-50 text-gray-700 transition-colors">All Categories</button>
                    {equipmentTypes.map(type => (
                      <button key={type} onClick={() => { setSelectedType(type); setIsTypeDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 font-medium hover:bg-gray-50 text-gray-700 transition-colors">{type}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Button */}
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setEditingEquipmentId(null);
                  setForm({ name: "", type: "", serialNo: "", roomId: "" });
                }}
                className="bg-[#193C6C] text-white px-6 py-2.5 rounded-[8px] font-medium flex items-center gap-2 hover:bg-[#15325b] shadow-lg shadow-blue-900/10 whitespace-nowrap transition-all active:scale-95"
              >
                <Plus size={18} /> Add Equipment
              </button>
            </div>
          </div>
        </div>

        {/* Equipment List */}
        <div className="space-y-3 mt-2">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide px-1">
            Total Items <span className="text-gray-400 ml-1">({filteredEquipments.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEquipments.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-[8px] border border-gray-100 shadow-sm relative group hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-[8px] border border-gray-100 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-[#193C6C] transition-colors">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-poppins text-[16px] font-medium text-[#193C6C] truncate" title={item.name}>{item.name}</h3>
                  <p className="font-poppins text-[12px] font-medium text-gray-400 truncate">ID #{String(item.id).padStart(4, '0')}</p>

                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-[4px] font-medium truncate max-w-[120px]">
                      {item.room ? `Room ${item.room.roomNumber}` : 'Unassigned'}
                    </span>
                    {item.serialNo && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-[4px] font-medium truncate max-w-[120px]">
                        SN: {item.serialNo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Vertical Actions (optional, sticking to horizontal row if space permits, but UserManagement uses column or row. Let's match UserManagement's flex-col if plenty of actions, or flex row if few. UserManagement has Edit/Delete. Here we have Edit/Delete/QR.) */}
                {/* To keep height uniform, let's put them in a column or compact row. UserManagement used column. Let's use column for consistency with 3 items. */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleEditEquipment(item)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#193C6C] hover:bg-blue-50 rounded-[6px] transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteEquipment(item.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-[6px] transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => showQR(item.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-[6px] transition-colors"
                    title="QR Code"
                  >
                    <QrCode size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredEquipments.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-400">
              <p className="font-medium">No equipment found matching criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[8px] p-8 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 text-[#193C6C]">
              {editingEquipmentId ? "Edit Equipment" : "Add New Equipment"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">
                  Equipment Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#F6F6F6] border-transparent rounded-[8px] px-4 py-2.5 font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. MacBook Pro M1"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">
                  Type
                </label>
                <div className="flex gap-2 relative">
                  {/* Custom Dropdown for Type */}
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTypeOpen(!isTypeOpen);
                        setIsRoomOpen(false);
                      }}
                      className="w-full bg-[#F6F6F6] border-transparent rounded-[8px] px-4 py-2.5 font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all flex justify-between items-center"
                    >
                      <span className={form.type ? "text-gray-800" : "text-gray-400"}>
                        {form.type || "Select Type"}
                      </span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>

                    {isTypeOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[8px] shadow-xl z-20 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                        {equipmentTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, type });
                              setIsTypeOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#F6F6F6] transition-colors"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="bg-blue-50 text-[#193C6C] hover:bg-blue-100 px-3 rounded-[8px] flex items-center justify-center transition-colors"
                    title="Add New Category"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">
                  Serial Number (Optional)
                </label>
                <input
                  type="text"
                  className="w-full bg-[#F6F6F6] border-transparent rounded-[8px] px-4 py-2.5 font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all"
                  value={form.serialNo}
                  onChange={(e) =>
                    setForm({ ...form, serialNo: e.target.value })
                  }
                  placeholder="S/N..."
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">
                  Room
                </label>
                {/* Custom Dropdown for Room */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRoomOpen(!isRoomOpen);
                      setIsTypeOpen(false);
                    }}
                    className="w-full bg-[#F6F6F6] border-transparent rounded-[8px] px-4 py-2.5 font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all flex justify-between items-center"
                  >
                    <span className={form.roomId ? "text-gray-800" : "text-gray-400"}>
                      {rooms.find(r => r.id === parseInt(form.roomId))?.roomNumber
                        ? `${rooms.find(r => r.id === parseInt(form.roomId)).roomNumber} - ${rooms.find(r => r.id === parseInt(form.roomId)).building}`
                        : "Select Room"}
                    </span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>

                  {isRoomOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[8px] shadow-xl z-20 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                      {rooms.map((room) => (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, roomId: room.id });
                            setIsRoomOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#F6F6F6] transition-colors"
                        >
                          {room.roomNumber} - {room.building}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-3 border border-gray-200 rounded-[8px] font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-3 bg-[#193C6C] text-white rounded-[8px] font-bold hover:bg-[#15325b] shadow-lg shadow-blue-900/10 active:scale-95 transition-all"
                >
                  {editingEquipmentId ? "Update" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 border-2 border-blue-100 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Manage Categories</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Add New Section */}
            <form onSubmit={handleCreateCategory} className="mb-6 bg-gray-50 p-4 rounded-xl">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                Add New Category
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-100 outline-none"
                  value={categoryForm}
                  onChange={(e) => setCategoryForm(e.target.value)}
                  placeholder="e.g. Server"
                />
                <button
                  type="submit"
                  className="bg-[#193C6C] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#15325b] transition-colors shadow-sm"
                >
                  Add
                </button>
              </div>
            </form>

            {/* List Section */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Existing Categories</h3>
              <div className="space-y-2">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <div key={cat.id} className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-sm transition-all">
                      {editingCatId === cat.id ? (
                        <div className="flex gap-2 w-full animate-in fade-in duration-200">
                          <input
                            type="text"
                            className="flex-1 bg-gray-50 px-3 py-1.5 rounded-lg text-sm border border-blue-200 outline-none"
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateCategory(cat.id)}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-gray-700 text-sm">{cat.name}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditCategory(cat)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No custom categories yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">QR Code</h2>
            <div className="text-center">
              <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-inner inline-block mb-4">
                <img
                  src={selectedQR.qrCodeImage}
                  alt="QR Code"
                  className="w-56 h-56 object-contain"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
                <p className="font-bold text-gray-900 text-lg">{selectedQR.equipment.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Monitor size={14} /> Room: {selectedQR.equipment.room.roomNumber}
                </p>
                {selectedQR.equipment.serialNo && (
                  <p className="text-xs text-gray-400 font-mono mt-2 bg-white px-2 py-1 rounded border inline-block">
                    SN: {selectedQR.equipment.serialNo}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={printQR}
                className="px-4 py-3 bg-[#193C6C] text-white rounded-xl font-bold hover:bg-[#15325b] flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EquipmentManagement;
