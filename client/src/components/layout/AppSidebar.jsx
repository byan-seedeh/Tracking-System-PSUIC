import React from "react";
import { Link, useLocation } from "react-router-dom";

const AppSidebar = ({
    logo,
    title,
    subtitle,
    items = [],
    className = "",
    headerContent,
    headerClassName,
    logoClassName,
    children
}) => {
    const location = useLocation();
    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <aside className={`hidden lg:flex w-72 flex-col bg-white border-r border-gray-100 z-50 h-full ${className}`}>
            {/* Sidebar Header */}
            <div className={headerClassName || "p-6 pb-2"}>
                {headerContent ? (
                    headerContent
                ) : (
                    <div className="flex items-center gap-3">
                        {logo && (
                            <img
                                src={logo}
                                alt="Logo"
                                className={logoClassName || "h-10 w-auto object-contain"}
                            />
                        )}
                        {(title || subtitle) && (
                            <div>
                                {title && <h1 className="font-bold text-gray-800 text-lg leading-tight">{title}</h1>}
                                {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                {children ? children : items.map((item, index) => {
                    if (item.hidden) return null;

                    const active = isActive(item.path, item.exact);

                    return (
                        <Link
                            key={index}
                            to={item.path}
                            onClick={item.onClick}
                            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group w-full text-left relative overflow-hidden
                ${active
                                    ? "bg-blue-50 text-blue-700 shadow-sm font-bold"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                                } ${item.className || ""}`}
                        >
                            {active && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                            )}

                            <div className={`w-8 h-8 flex items-center justify-center shrink-0 transition-transform duration-300 ${item.iconClassName || ""}`}>
                                {React.isValidElement(item.icon)
                                    ? React.cloneElement(item.icon, {
                                        size: item.icon.props.size || 22,
                                        className: `${item.icon.props.className || ""} ${active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}`
                                    })
                                    : item.icon // For images
                                }
                            </div>

                            <span className="truncate">{item.label}</span>

                            {item.badge && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Footer / User Profile Snippet could go here if design requires, 
          but usually that's in the header or top of sidebar. 
          Leaving empty for now as requested layout keeps it simple. */}
        </aside>
    );
};

export default AppSidebar;
