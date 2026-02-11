import React from "react";

const ServiceButton = ({ icon, title, onClick, colorClass = "text-[#193C6C]" }) => {
    const Icon = icon;
    return (
        <button
            onClick={onClick}
            className="group w-full md:max-w-[190px] flex flex-col items-center gap-3"
        >
            <div className={`w-full h-[84px] aspect-auto md:h-[128px] bg-white rounded-xl flex flex-col items-center justify-center gap-2 md:gap-4 shadow-sm border border-slate-100 transition-all duration-200 active:scale-95 group-hover:border-blue-200 group-hover:shadow-md group-hover:-translate-y-1 md:p-0`}>
                <Icon
                    size={24}
                    className={`${colorClass} md:w-12 md:h-12 group-hover:scale-110 transition-transform duration-300`}
                    strokeWidth={1.5}
                />
                <span className="font-medium text-[10px] md:text-base text-slate-700 text-center leading-tight tracking-tight group-hover:text-[#193C6C] transition-colors line-clamp-2">
                    {title}
                </span>
            </div>
        </button>
    );
};

export default ServiceButton;
