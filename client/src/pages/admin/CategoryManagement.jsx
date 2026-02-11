import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit, Trash2, X, Folder, ArrowLeft } from "lucide-react";
import { listCategories, createCategory, updateCategory, removeCategory } from "../../api/category";
import useAuthStore from "../../store/auth-store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CategoryManagement = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCatId, setCurrentCatId] = useState(null);
    const [formData, setFormData] = useState({
        name: ""
    });

    const loadCategories = useCallback(async () => {
        try {
            const res = await listCategories(token);
            setCategories(res.data);
            setFilteredCategories(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load categories");
        }
    }, [token]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        const filtered = categories.filter(cat =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCategories(filtered);
    }, [searchTerm, categories]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setFormData({ name: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (cat) => {
        setIsEditMode(true);
        setCurrentCatId(cat.id);
        setFormData({
            name: cat.name
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await updateCategory(token, currentCatId, formData);
                toast.success("Category updated successfully");
            } else {
                await createCategory(token, formData);
                toast.success("Category created successfully");
            }
            setIsModalOpen(false);
            loadCategories();
        } catch (err) {
            console.error(err);
            toast.error(isEditMode ? "Failed to update category" : "Failed to create category");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await removeCategory(token, id);
                toast.success("Category deleted successfully");
                loadCategories();
            } catch (err) {
                console.error(err);
                toast.error("Failed to delete category");
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
                    <h1 className="text-3xl font-semibold text-[#193C6C] tracking-tight font-poppins">Category Management</h1>
                </div>
                <p className="text-gray-500 text-sm font-medium font-poppins ml-14">Manage equipment categories</p>
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
                                placeholder="Search category..."
                                className="flex-1 bg-transparent border-none focus:outline-none font-medium text-gray-700 placeholder:text-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={openCreateModal}
                            className="bg-[#193C6C] text-white px-6 py-2.5 rounded-[8px] font-medium flex items-center gap-2 hover:bg-[#15325b] shadow-lg shadow-blue-900/10 whitespace-nowrap transition-all active:scale-95"
                        >
                            <Plus size={18} /> Add Category
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide px-1">
                        Total Categories <span className="text-gray-400 ml-1">({filteredCategories.length})</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCategories.map((cat) => (
                            <div key={cat.id} className="bg-white p-4 rounded-[8px] border border-gray-100 shadow-sm relative group hover:shadow-md transition-all flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-50 rounded-[8px] border border-blue-100 flex items-center justify-center shrink-0 text-blue-500">
                                    <Folder size={24} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-poppins text-[16px] font-medium text-[#193C6C] truncate">{cat.name}</h3>
                                    <p className="font-poppins text-[12px] font-medium text-gray-400 truncate mt-0.5">ID: {cat.id}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => openEditModal(cat)}
                                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#193C6C] hover:bg-blue-50 rounded-[6px] transition-colors"
                                        title="Edit"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-[6px] transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            <p>No categories found.</p>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-[8px] w-full max-w-md p-8 shadow-xl transform transition-all animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {isEditMode ? "Edit Category" : "Add New Category"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[14px] font-medium text-gray-700 mb-1 ml-1">Category Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-[#F6F6F6] rounded-[8px] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all font-medium text-[#193C6C]"
                                        placeholder="e.g. Hardware"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#193C6C] text-white py-3 rounded-[8px] font-bold hover:bg-[#15325b] transition-all shadow-lg shadow-blue-900/10 active:scale-95 mt-2"
                                >
                                    {isEditMode ? "Update Category" : "Create Category"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryManagement;

