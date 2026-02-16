import React from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarGrid = ({
    currentDate,
    setCurrentDate,
    selectedDate,
    events = [],
    onDateSelect
}) => {
    // Helpers
    const getDaysArray = () => {
        const startOfMonth = currentDate.startOf('month');
        const endOfMonth = currentDate.endOf('month');
        const startDay = startOfMonth.startOf('week');
        const endDay = endOfMonth.endOf('week');

        const days = [];
        let day = startDay;

        while (day.isBefore(endDay)) {
            days.push(day);
            day = day.add(1, 'day');
        }
        return days;
    };

    const getEventDots = (day) => {
        const dateStr = day.format('YYYY-MM-DD');
        // Filter events for this day
        // events expected format: { date: 'YYYY-MM-DD', color: string, type: string }
        const dayEvents = events.filter(e => dayjs(e.date).format('YYYY-MM-DD') === dateStr);
        if (dayEvents.length === 0) return null;

        return (
            <div className="flex gap-0.5 mt-1 justify-center">
                {dayEvents.slice(0, 3).map((e, i) => (
                    <div
                        key={i}
                        className={`w-1 h-1 rounded-full`}
                        style={{ backgroundColor: e.color || '#10B981' }}
                    />
                ))}
            </div>
        );
    };

    const days = getDaysArray();

    return (
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-4 pt-2">
                <button
                    onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-all hover:scale-110 active:scale-95"
                    title="Previous Month"
                >
                    <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
                <span className="font-bold text-gray-800 capitalize text-lg tracking-tight">
                    {currentDate.format('MMMM YYYY')}
                </span>
                <button
                    onClick={() => setCurrentDate(currentDate.add(1, 'month'))}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-all hover:scale-110 active:scale-95"
                    title="Next Month"
                >
                    <ChevronRight size={24} strokeWidth={2.5} />
                </button>
            </div>

            {/* Week Headers */}
            <div className="grid grid-cols-7 mb-1 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                {days.map((day, idx) => {
                    const isSelected = selectedDate && day.isSame(selectedDate, 'day');
                    const isCurrentMonth = day.month() === currentDate.month();
                    const isToday = day.isSame(dayjs(), 'day');

                    return (
                        <button
                            key={idx}
                            onClick={() => {
                                if (onDateSelect) onDateSelect(day);
                            }}
                            className={`
                                w-full aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all relative
                                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                                ${isSelected ? 'bg-blue-600 !text-white shadow-sm' : 'hover:bg-gray-50'}
                                ${isToday && !isSelected ? 'text-blue-600 font-bold' : ''}
                            `}
                        >
                            <span className="z-10">{day.format('D')}</span>
                            {getEventDots(day)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarGrid;
