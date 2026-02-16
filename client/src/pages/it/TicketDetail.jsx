import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Upload,
    X,
    MapPin,
    User,
    Calendar
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import useAuthStore from "../../store/auth-store";
import { getTicket } from "../../api/ticket";
import { acceptJob, closeJob, rejectJob } from "../../api/it";

/* =======================
   Status Config
======================= */
const STATUS_CONFIG = {
    not_start: {
        label: "Not Started",
        style: "bg-red-50 text-red-700 border-red-300"
    },
    in_progress: {
        label: "In Progress",
        style: "bg-blue-50 text-blue-700 border-blue-300"
    },
    completed: {
        label: "Completed",
        style: "bg-green-50 text-green-700 border-green-300"
    },
    rejected: {
        label: "Rejected",
        style: "bg-gray-100 text-gray-600 border-gray-300"
    }
};

const TicketDetail = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const { id } = useParams();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    const [note, setNote] = useState("");
    const [proofFile, setProofFile] = useState(null);

    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);

    const [previewImage, setPreviewImage] = useState(null);

    /* =======================
       Load Ticket
    ======================= */
    const loadTicket = async () => {
        try {
            setLoading(true);
            const res = await getTicket(token, id);
            setTicket(res.data);
            setNote(res.data.note || "");
        } catch {
            toast.error("Failed to load ticket");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTicket();
    }, [id]);

    /* =======================
       Actions
    ======================= */
    const handleAccept = async () => {
        try {
            await acceptJob(token, id);
            toast.success("Ticket Accepted");
            loadTicket();
        } catch (err) {
            toast.error(err.response?.data?.message || "Action Failed");
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            return toast.warning("Please enter rejection reason");
        }
        try {
            await rejectJob(token, id, rejectReason);
            toast.success("Ticket Rejected");
            setShowRejectModal(false);
            loadTicket();
        } catch (err) {
            toast.error(err.response?.data?.message || "Action Failed");
        }
    };

    const handleComplete = async () => {
        if (!note.trim()) return toast.warning("Please enter diagnosis");

        const confirm = await Swal.fire({
            title: "Confirm Completion",
            text: "Are you sure this ticket is resolved?",
            showCancelButton: true,
            confirmButtonColor: "#193C6C"
        });

        if (!confirm.isConfirmed) return;

        try {
            const formData = new FormData();
            formData.append("note", note);
            if (proofFile) formData.append("images", proofFile);

            await closeJob(token, id, formData);
            toast.success("Ticket Completed");
            loadTicket();
        } catch (err) {
            toast.error(err.response?.data?.message || "Action Failed");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#193C6C]" />
            </div>
        );
    }

    if (!ticket) return null;

    const status =
        STATUS_CONFIG[ticket.status] || STATUS_CONFIG.not_start;

    return (
        <div className="min-h-screen bg-gray-100 px-4 py-6 font-poppins">

            {/* Top Back + Page Title */}
            <div className="max-w-3xl mx-auto mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
                <h1 className="text-xl font-semibold text-slate-800 mt-2">
                    Ticket Details
                </h1>
            </div>

            {/* Unified Card */}
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">

                {/* Header */}
                <div className="bg-[#193C6C] text-white p-6">
                    <h2 className="text-2xl font-semibold mb-2">
                        #{ticket.id}: {ticket.title}
                    </h2>

                    <div className="flex flex-wrap gap-4 text-sm opacity-90">
                        <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            Floor {ticket.room?.floor}, {ticket.room?.roomNumber}
                        </span>
                        <span className="flex items-center gap-1">
                            <User size={14} />
                            {ticket.createdBy?.name}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {dayjs(ticket.createdAt).format("D MMM YYYY, HH:mm")}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Status */}
                    <span
                        className={`inline-block px-4 py-1.5 rounded-full border text-sm font-semibold ${status.style}`}
                    >
                        {status.label}
                    </span>

                    {/* Request Information */}
                    <div>
                        <h3 className="font-semibold mb-2">Request Information</h3>
                        <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700">
                            {ticket.description}
                        </div>
                    </div>

                    {/* Attachments */}
                    {ticket.images?.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                                Attachments
                            </p>
                            <div className="flex gap-3 flex-wrap">
                                {ticket.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img.url}
                                        onClick={() => setPreviewImage(img.url)}
                                        className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:shadow"
                                        alt="Attachment"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {ticket.status === "not_start" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={handleAccept}
                                className="py-3 rounded-xl bg-[#193C6C] text-white font-semibold flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                Accept Ticket
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="py-3 rounded-xl border text-red-600 font-semibold flex items-center justify-center gap-2"
                            >
                                <XCircle size={18} />
                                Reject Ticket
                            </button>
                        </div>
                    )}

                    {ticket.status === "in_progress" && (
                        <div className="space-y-4">
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full border rounded-xl p-4 text-sm"
                                rows={4}
                                placeholder="Diagnosis / Resolution notes"
                            />

                            <label className="border-dashed border-2 rounded-xl p-6 text-center cursor-pointer block">
                                <Upload className="mx-auto mb-2 text-gray-400" />
                                {proofFile ? proofFile.name : "Upload Proof (optional)"}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => setProofFile(e.target.files[0])}
                                />
                            </label>

                            <button
                                onClick={handleComplete}
                                className="w-full py-3 rounded-xl bg-[#193C6C] text-white font-semibold"
                            >
                                Mark as Completed
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative">
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="absolute top-4 right-4"
                        >
                            <X />
                        </button>
                        <h3 className="font-semibold mb-3">Reject Ticket</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full border rounded-xl p-3 mb-4"
                            rows={3}
                            placeholder="Enter reason"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-2 rounded-xl bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 py-2 rounded-xl bg-red-500 text-white"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-6 right-6 text-white"
                    >
                        <X size={28} />
                    </button>
                    <img
                        src={previewImage}
                        className="max-h-[80vh] rounded-xl"
                        alt="Preview"
                    />
                </div>
            )}
        </div>
    );
};

export default TicketDetail;
