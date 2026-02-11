import React from "react";
import { getStatusConfig } from "../../config/statusConfig";

const TicketCard = ({ ticket, onClick }) => {
    const status = getStatusConfig(ticket.status);

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden transition-all duration-200 active:scale-[0.98] cursor-pointer hover:border-blue-100 hover:shadow-md hover:-translate-y-1
                ${ticket.status === 'completed' ? 'opacity-80' : ''}
            `}
        >
            {/* Context Header: Category | Priority */}
            <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                    {ticket.category?.name || "General"}
                </span>
                <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide border ${status.bg} ${status.color} ${status.border}`}>
                    {status.label}
                </div>
            </div>

            {/* Main Content: Topic Title & Description */}
            <div className="mb-4">
                <h3 className="text-[16px] font-bold text-slate-900 mb-1 leading-tight line-clamp-1 group-hover:text-[#193C6C] transition-colors">
                    {ticket.title || "Untitled Issue"}
                </h3>
                <p className="text-[13px] font-medium text-slate-500 line-clamp-2 leading-relaxed">
                    {ticket.description || "No details provided"}
                </p>
            </div>

            <div className="h-px w-full bg-slate-50 mb-3"></div>

            {/* Footer: Location | Date | User */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Location Pill */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#193C6C]"></div>
                        <span className="text-[11px] font-semibold text-slate-600">
                            {ticket.room ? `Fl. ${ticket.room.floor} - ${ticket.room.roomNumber}` : "N/A"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                    <span className="hidden sm:inline">{new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline"></span>
                    <span>{new Date(ticket.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
