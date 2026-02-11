import React, { useState, useEffect, useCallback } from "react";
import { listQuickFix, readQuickFix } from "../../api/quickFix";
import { Search, ChevronDown, ChevronUp, BookOpen, ArrowLeft, Monitor, Projector, AppWindow, UserCircle, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["ACCOUNT & LOGIN", "COMPUTER", "PROJECTOR", "SOFTWARE", "OTHER"];

const DescriptionFormatter = ({ text }) => {
    if (!text) return null;

    const lines = text.split('\n').filter(line => line.trim() !== "");

    return (
        <div className="space-y-4">
            {lines.map((line, index) => {
                const hasArrow = line.includes("→") || line.includes("->");
                const stepNumber = index + 1;

                if (hasArrow) {
                    const separator = line.includes("→") ? "→" : "->";
                    const [topic, action] = line.split(separator).map(s => s.trim());

                    return (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-sm md:text-base">
                            <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                                {stepNumber}
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-gray-800 block sm:inline mb-1 sm:mb-0">
                                    {topic}
                                </span>
                                <span className="hidden sm:inline mx-2 text-gray-300">|</span>
                                <span className="text-gray-600 leading-relaxed block sm:inline">{action}</span>
                            </div>
                        </div>
                    );
                }

                // Regular line
                return (
                    <div key={index} className="flex items-start gap-3 text-sm md:text-base">
                        <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                            {stepNumber}
                        </div>
                        <span className="text-gray-600 leading-relaxed pt-0.5">{line}</span>
                    </div>
                );
            })}
        </div>
    );
};

const QuickFix = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [openId, setOpenId] = useState(null);
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        try {
            const res = await listQuickFix();
            // Safeguard: Ensure data is array
            setData(Array.isArray(res?.data) ? res.data : []);
            // Initial filter will happen via useEffect
        } catch (err) {
            console.error(err);
            setData([]);
        }
    }, []);

    const filterItems = useCallback(() => {
        let filtered = data;

        // Filter by Search
        if (search) {
            const text = search.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(text) ||
                    item.description.toLowerCase().includes(text)
            );
        }

        // Filter by Category
        if (selectedCategory !== "All") {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        setFilteredData(filtered);
    }, [search, selectedCategory, data]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        filterItems();
    }, [filterItems]);

    const toggleAccordion = async (id) => {
        if (openId === id) {
            setOpenId(null);
        } else {
            setOpenId(id);
            try {
                await readQuickFix(id);
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
            {/* Standard Header */}
            {/* Standard Header */}
            <div className="bg-[#193C6C] sticky top-0 z-50 px-6 pt-12 pb-6 shadow-sm rounded-b-3xl relative overflow-hidden transition-all duration-300">
                {/* Decorative BG */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white opacity-[0.04] blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-[28px] font-semibold tracking-wide text-white leading-tight drop-shadow-sm">
                        Knowledge
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md md:max-w-2xl mx-auto lg:mx-0 mt-8 px-6 relative z-20 space-y-6">

                {/* Search & Filter Section */}
                <div className="flex flex-col gap-3">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search for problems..."
                            className="w-full h-[50px] pl-12 pr-4 rounded-2xl bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all shadow-sm font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    {/* Filter Button */}
                    <div className="relative w-full">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`w-full h-[50px] px-6 rounded-2xl border flex items-center justify-between gap-2 transition-all whitespace-nowrap shadow-sm font-medium ${selectedCategory !== "All"
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            <span>{selectedCategory === "All" ? "Filter Category" : selectedCategory}</span>
                            <ChevronDown size={18} />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => { setSelectedCategory("All"); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 rounded-[6px] text-sm transition-all ${selectedCategory === "All" ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 hover:bg-gray-50"}`}
                                    >
                                        All Categories
                                    </button>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 rounded-[6px] text-sm transition-all ${selectedCategory === cat ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 hover:bg-gray-50"}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {
                    filteredData.length === 0 ? (
                        <div className="bg-white p-8 rounded-[8px] shadow-sm text-center">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No guides found matching "{search}"</p>
                        </div>
                    ) : (
                        filteredData.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                            >
                                <button
                                    onClick={() => toggleAccordion(item.id)}
                                    className="w-full text-left p-5 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Category Icon */}
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#193C6C] shrink-0">
                                            {(() => {
                                                switch (item.category) {
                                                    case "COMPUTER": return <Monitor size={24} />;
                                                    case "PROJECTOR": return <Projector size={24} />;
                                                    case "SOFTWARE": return <AppWindow size={24} />;
                                                    case "ACCOUNT & LOGIN": return <UserCircle size={24} />;
                                                    default: return <HelpCircle size={24} />;
                                                }
                                            })()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {item.category && (
                                                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                                                        {item.category}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-base md:text-lg break-words pr-4">{item.title}</h3>
                                            <p className="text-xs text-gray-400 mt-1">{item.views} views</p>
                                        </div>
                                    </div>
                                    {openId === item.id ? (
                                        <ChevronUp className="text-blue-500 flex-shrink-0 ml-2" />
                                    ) : (
                                        <ChevronDown className="text-gray-400 flex-shrink-0 ml-2" />
                                    )}
                                </button>

                                <div
                                    className={`transition-all duration-300 ease-in-out ${openId === item.id ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                        } overflow-hidden`}
                                >
                                    <div className="p-5 pt-0 border-t border-gray-100/50">
                                        <div className="p-4 bg-[#F6F6F6] rounded-xl text-gray-700 leading-relaxed font-medium">
                                            <DescriptionFormatter text={item.description} />
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))
                    )
                }
            </div >
        </div >
    );
};

export default QuickFix;
