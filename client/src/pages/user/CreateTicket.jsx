// client/src/pages/user/CreateTicket.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Camera,
  X,
  ArrowLeft,
  ImagePlus
} from "lucide-react";
import CustomSelect from "../../components/ui/CustomSelect";
import { useLocation, useNavigate } from "react-router-dom";
import { createTicket } from "../../api/ticket";
import { listRooms } from "../../api/room";
import { listCategories } from "../../api/category";
import useAuthStore from "../../store/auth-store";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const CreateTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const prefilledData = location.state;

  const [dbRooms, setDbRooms] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [floors, setFloors] = useState([]);

  // Custom "Appointment" Form State
  const [form, setForm] = useState({
    title: "", // Topic Issue
    equipmentId: prefilledData?.equipmentId || "",
    categoryId: "", // Selected "Equipment" category
    description: "",
    floor: prefilledData?.floorName || "",
    room: prefilledData?.roomNumber || "",
    roomId: prefilledData?.roomId || "",
    urgency: "Low",
    images: [],
  });

  const urgencyLevels = ["Low", "Medium", "High"];

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const catRes = await listCategories(token);
      setDbCategories(Array.isArray(catRes?.data) ? catRes.data : []);

      const roomRes = await listRooms(token);
      setDbRooms(Array.isArray(roomRes?.data) ? roomRes.data : []);

      if (Array.isArray(roomRes?.data)) {
        const uniqueFloors = [
          ...new Set(roomRes.data.map((r) => r.floor)),
        ].sort((a, b) => a - b);
        setFloors(uniqueFloors);
      } else {
        setFloors([]);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load form data");
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      };
    });
  };

  const getAvailableRooms = () => {
    if (!form.floor) return [];
    const floorNum = parseInt(form.floor);
    return dbRooms.filter((r) => r.floor === floorNum);
  };

  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.categoryId ||
      !form.description ||
      !form.roomId
    ) {
      toast.error(
        "Please fill in all required fields (Topic, Equipment, Room, Description)"
      );
      return;
    }

    try {
      const payload = {
        title: form.title,
        description: form.description,
        urgency: form.urgency,
        categoryId: parseInt(form.categoryId),
        roomId: parseInt(form.roomId),
        equipmentId: form.equipmentId ? parseInt(form.equipmentId) : null,
        images: form.images
      };

      console.log("Submitting Payload:", payload);
      const res = await createTicket(token, payload);

      Swal.fire({
        title: 'Created Successfully',
        text: 'Your request has been recorded and is being processed by our IT team.',
        icon: 'success',
        confirmButtonText: 'View Ticket',
        confirmButtonColor: '#193C6C',
        allowOutsideClick: false,
        customClass: {
          popup: 'rounded-3xl p-8',
          title: 'text-2xl font-bold text-[#193C6C] mb-2',
          htmlContainer: 'text-gray-500 mb-6',
          confirmButton: 'w-full py-3 rounded-xl font-bold text-base shadow-lg shadow-blue-200'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/user/ticket/${res.data.id}`);
        }
      });

    } catch (err) {
      console.error("❌ Submit Error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit request";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-white font-poppins text-[#193C6C]">
      {/* Header */}
      <div className="bg-[#193C6C] sticky top-0 z-50 px-6 pt-12 pb-6 shadow-sm rounded-b-3xl relative overflow-hidden transition-all duration-300">
        {/* Decorative BG */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white opacity-[0.04] blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-white p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-[28px] font-semibold tracking-wide text-white leading-tight drop-shadow-sm">Report Issue</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-8 px-6 space-y-8 animate-in fade-in duration-500 relative z-10">

        {/* Form Container */}
        <div className="flex flex-col gap-5">

          {/* Topic Issue */}
          <div className="flex flex-col gap-3">
            <label className="text-[#193C6C] text-[16px] font-semibold flex items-center gap-1 mb-2">
              Topic Issue <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Computer cannot start, Projector dim"
              className="form-control"
            />
          </div>

          {/* Category & Description */}
          <div className="flex flex-col gap-6">

            {/* Equipment Category */}
            <div className="space-y-3">
              <label className="text-[#193C6C] text-[16px] font-semibold block mb-2">
                Equipment Category <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                options={dbCategories}
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                placeholder="Select equipment category"
                className="form-control h-auto flex items-center"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-[#193C6C] text-[16px] font-semibold block mb-2">
                Describe the Issue <span className="text-red-500">*</span>
              </label>
              <textarea
                className="form-control resize-none h-[140px]"
                placeholder="Please describe the issue in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[#193C6C] text-[16px] font-semibold block mb-2">
                Floor <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                options={floors.map((f) => ({ id: f, name: `Floor ${f}` }))}
                value={form.floor}
                onChange={(e) =>
                  setForm({
                    ...form,
                    floor: e.target.value,
                    roomId: "",
                    room: "",
                  })
                }
                placeholder="Select"
                className="form-control h-auto flex items-center"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[#193C6C] text-[16px] font-semibold block mb-2">Room <span className="text-red-500">*</span></label>
              <CustomSelect
                disabled={!form.floor}
                options={getAvailableRooms().map((r) => ({
                  ...r,
                  name: r.roomNumber,
                }))}
                value={form.roomId}
                onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                placeholder="Select"
                className="form-control h-auto flex items-center"
              />
            </div>
          </div>

          {/* Priority & Photo */}
          <div className="flex flex-col gap-6">

            {/* Priority Level */}
            <div className="space-y-3">
              <label className="text-[#193C6C] text-[16px] font-semibold block mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {urgencyLevels.map((level) => {
                  const getPriorityStyle = (lvl, selected) => {
                    if (selected !== lvl) return "bg-white text-gray-500 border-[#E3E8EF] hover:bg-gray-50";
                    switch (lvl) {
                      case "High": return "bg-red-50 text-red-600 border-red-200 shadow-sm";
                      case "Medium": return "bg-orange-50 text-orange-600 border-orange-200 shadow-sm";
                      case "Low": return "bg-green-50 text-green-600 border-green-200 shadow-sm";
                      default: return "bg-[#EAF2FF] text-[#193C6C] border-[#193C6C]";
                    }
                  };

                  return (
                    <button
                      key={level}
                      onClick={() => setForm({ ...form, urgency: level })}
                      className={`h-12 rounded-xl text-sm font-semibold transition-all border ${getPriorityStyle(level, form.urgency)}`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Photo */}
            <div className="space-y-3">
              <label className="text-[#193C6C] text-[16px] font-semibold flex items-center justify-between mb-2">
                Add Photo
                <span className="text-slate-400 text-xs font-normal bg-slate-100 px-2 py-1 rounded-md">Optional</span>
              </label>

              <div className="w-full h-32 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center relative cursor-pointer hover:border-blue-300 hover:bg-blue-50/10 transition-colors group">
                {form.images.length > 0 ? (
                  <div className="flex gap-3 p-3 w-full h-full overflow-x-auto items-center">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                        <img src={img} className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
                          }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <div className="w-24 h-24 flex-shrink-0 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-300 hover:text-blue-400 hover:border-blue-300 hover:bg-white transition-all">
                      <ImagePlus size={24} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                    <div className="p-3 bg-slate-50 rounded-full mb-2 group-hover:bg-blue-50 transition-colors">
                      <Camera size={20} />
                    </div>
                    <p className="text-xs font-medium">Click to attach photo</p>
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="text-xs text-slate-400 text-center">
                You can add a photo to help us fix the issue faster.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 bg-[#193C6C] text-white rounded-xl font-semibold hover:bg-[#132E52] transition-colors shadow-lg shadow-blue-900/10 active:scale-[0.98]"
            >
              Submit Report
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CreateTicket;
