
import React, { useState, useEffect } from "react";
import {
    listQuickFix,
    createQuickFix,
    updateQuickFix,
    removeQuickFix,
} from "../../api/quickFix";
import useAuthStore from "../../store/auth-store";
import { Trash2, Edit, Plus, X, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["ACCOUNT & LOGIN", "COMPUTER", "PROJECTOR", "SOFTWARE", "OTHER"];

const QuickFixManagement = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    // Filter State
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isFormCategoryOpen, setIsFormCategoryOpen] = useState(false);


    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedCategory === "All Categories") {
            setFilteredData(data);
        } else {
            setFilteredData(data.filter(item => item.category === selectedCategory));
        }
    }, [selectedCategory, data]);

    const loadData = async () => {
        try {
            const res = await listQuickFix();
            // Safeguard: Ensure res.data is an array
            setData(Array.isArray(res?.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setData([]);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateQuickFix(token, editId, form);
                toast.success("Updated successfully");
            } else {
                await createQuickFix(token, form);
                toast.success("Created successfully");
            }
            setIsModalOpen(false);

            // Reset Form
            setForm({ title: "", description: "", image: "", category: "" });
            setEditId(null);
            loadData();
        } catch (err) {
            console.error(err);
            toast.error("Action failed");
        }
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        setForm({
            title: item.title,
            description: item.description,
            image: item.image || "",
            category: item.category || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1e3a8a",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await removeQuickFix(token, id);
                    toast.success("Deleted successfully");
                    loadData();
                } catch (err) {
                    console.error(err);
                    toast.error("Delete Failed");
                }
            }
        });
    };

    const openNew = () => {
        setEditId(null);
        setForm({ title: "", description: "", image: "", category: "" });
        setIsModalOpen(true);
    }

    // Helper to format description as numbered list if simple text
    const renderSteps = (desc) => {
        // Split by newline and filter empty
        const steps = desc.split('\n').filter(s => s.trim() !== "");
        return (
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 mt-2">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 text-sm text-gray-700">
                        <span className="font-bold text-gray-400 bg-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] border border-gray-100 shadow-sm shrink-0">
                            {idx + 1}
                        </span>
                        <span>{step}</span>
                    </div>
                ))}
            </div>
        )
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-semibold text-[#193C6C] tracking-tight font-poppins">Knowledge Base</h1>
                </div>
                {/* Note: Original code didn't have a subtitle in the prop, but I should add one if needed, or just leave it. 
                    The header in QuickFix didn't have a subtitle, but I can add one for consistency if user wants.
                    User request: "page-level consistency". Dashboard has subtitle. User Mgmt has subtitle.
                    I will add a subtitle "Manage quick fix guides and documentation" to be consistent. 
                */}
                <p className="text-gray-500 text-sm font-medium font-poppins ml-14">Manage quick fix guides and documentation</p>
            </div>

            <div className="space-y-6">

                {/* Controls */}
                <div className="bg-white p-4 rounded-[8px] shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-center text-sm">

                        {/* Filter Dropdown */}
                        <div className="relative w-full md:w-64">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="w-full bg-white border border-gray-200 rounded-[8px] px-4 py-2.5 flex justify-between items-center text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition-all"
                            >
                                <span className="truncate">{selectedCategory}</span>
                                <ChevronDown size={18} className="text-gray-400" />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-[8px] shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-1 flex flex-col gap-0.5 max-h-[280px] overflow-y-auto custom-scrollbar">
                                        <button
                                            onClick={() => { setSelectedCategory("All Categories"); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 rounded-[6px] text-sm transition-all flex items-center justify-between group ${selectedCategory === "All Categories" ? "bg-[#F6F6F6] text-[#193C6C] font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                                        >
                                            <span>All Categories</span>
                                        </button>
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-[6px] text-sm transition-all flex items-center justify-between group ${selectedCategory === cat ? "bg-blue-50 text-[#193C6C] font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                                            >
                                                <span>{cat}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={openNew}
                            className="bg-[#193C6C] hover:bg-[#15325b] text-white px-6 py-2.5 rounded-[8px] flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/10 whitespace-nowrap font-medium active:scale-95"
                        >
                            <Plus size={18} />
                            Add New Guide
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide px-1">
                        Total Guides <span className="text-gray-400 ml-1">({filteredData.length})</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredData.map(item => (
                            <div key={item.id} className="bg-white rounded-[8px] p-5 shadow-sm border border-gray-100 relative group hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    {item.category && (
                                        <span className="bg-blue-50 text-[#193C6C] text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wide border border-blue-100">
                                            {item.category}
                                        </span>
                                    )}
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-1 text-gray-400 hover:text-[#193C6C] hover:bg-blue-50 rounded-[6px] transition-colors">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-[6px] transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-poppins font-semibold text-[#193C6C] text-[16px] mb-2">{item.title}</h3>

                                <div className="text-xs text-gray-600">
                                    {renderSteps(item.description)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredData.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            No guides found in this category.
                        </div>
                    )}
                </div>

            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[8px] w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editId ? "Edit Guide" : "Create New Guide"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full shadow-sm border border-gray-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">

                            {/* Title */}
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Guide Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full bg-[#F6F6F6] rounded-[8px] border-transparent px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all font-medium placeholder:text-gray-400"
                                    placeholder="e.g. Printer paper jam"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Category</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormCategoryOpen(!isFormCategoryOpen)}
                                        className="w-full bg-[#F6F6F6] border-transparent rounded-[8px] px-4 py-2.5 flex justify-between items-center text-left focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all font-medium"
                                    >
                                        <span className={form.category ? "text-gray-900" : "text-gray-400"}>
                                            {form.category || "Select a Category"}
                                        </span>
                                        <ChevronDown size={20} className="text-gray-400" />
                                    </button>

                                    {isFormCategoryOpen && (
                                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-[8px] shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-2 flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                                                {CATEGORIES.map(cat => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => {
                                                            setForm({ ...form, category: cat });
                                                            setIsFormCategoryOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 rounded-[6px] text-sm transition-all flex items-center justify-between group ${form.category === cat ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 hover:bg-gray-50"}`}
                                                    >
                                                        <span>{cat}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description / Steps */}
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Troubleshooting Steps</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full bg-[#F6F6F6] rounded-[8px] border-transparent px-4 py-3 h-32 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all resize-none placeholder:text-gray-400 font-medium"
                                    placeholder="1. Turn off device&#10;2. Wait 30 seconds..."
                                    required
                                ></textarea>
                                <p className="text-xs text-gray-400 mt-1 text-right">Separate steps with new lines</p>
                            </div>

                            {/* Image URL (Optional) */}


                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-[8px] bg-[#193C6C] hover:bg-[#15325b] text-white font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {editId ? "Update Guide" : "Create Guide"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickFixManagement;
