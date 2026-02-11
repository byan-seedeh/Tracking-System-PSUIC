export const statusConfig = {
    not_started: {
        label: "Not Started",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-100"
    },
    in_progress: {
        label: "In Progress",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100"
    },
    completed: {
        label: "Completed",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-100"
    }
};

export const getStatusConfig = (status) => {
    return statusConfig[status] || {
        label: "Unknown",
        color: "text-gray-500",
        bg: "bg-gray-50",
        border: "border-gray-100"
    };
};
