import React from 'react';
import { Plus } from 'lucide-react';

/**
 * Google Calendar-Style Month View
 * Events shown as colored horizontal bars
 */
const CalendarMonthView = ({
    selectedDate,
    filteredEvents,
    handleEventClick,
    openCreateEventModal,
    DAYS
}) => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    // Calendar grid logic
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start

    // Get color for event based on category
    const getEventBarColor = (event) => {
        if (event.category === 'Court') return 'bg-purple-500 border-purple-600';
        if (event.category === 'Consultation') return 'bg-blue-500 border-blue-600';
        if (event.category === 'Deadline') return 'bg-red-500 border-red-600';
        return 'bg-green-500 border-green-600';
    };

    return (
        <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[800px]">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-px bg-white/5">
                        {DAYS.map(d => (
                            <div key={d} className="bg-black/40 p-3 text-center border-b border-white/10">
                                <span className="text-[10px] font-black text-[#c9a646] uppercase tracking-widest">{d}</span>
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-px bg-white/5">
                        {/* Empty cells before month starts */}
                        {Array.from({ length: startOffset }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-black/10 min-h-[120px] border-r border-b border-white/5"></div>
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNumber = i + 1;
                            const isToday = today.getDate() === dayNumber &&
                                today.getMonth() === currentMonth &&
                                today.getFullYear() === currentYear;

                            const dayDate = new Date(currentYear, currentMonth, dayNumber);
                            const dayEvents = filteredEvents.filter(e => {
                                const eventDate = new Date(e.start);
                                return eventDate.getDate() === dayNumber &&
                                    eventDate.getMonth() === currentMonth &&
                                    eventDate.getFullYear() === currentYear;
                            });

                            return (
                                <div
                                    key={i}
                                    onClick={() => openCreateEventModal(dayDate)}
                                    className={`bg-black/20 min-h-[120px] p-2 border-r border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer relative ${isToday ? 'bg-[#c9a646]/5 border-[#c9a646]/30' : ''}`}
                                >
                                    {/* Day number */}
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-sm font-black ${isToday ? 'text-[#c9a646] bg-[#c9a646]/20 w-7 h-7 rounded-full flex items-center justify-center' : 'text-gray-600'}`}>
                                            {dayNumber}
                                        </span>
                                        {isToday && <span className="bg-[#c9a646] w-1.5 h-1.5 rounded-full" title="Today"></span>}
                                    </div>

                                    {/* Events as colored bars */}
                                    <div className="space-y-1 max-h-[85px] overflow-y-auto custom-scrollbar">
                                        {dayEvents.map((e, idx) => {
                                            const startTime = new Date(e.start);
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={(ev) => { ev.stopPropagation(); handleEventClick(e); }}
                                                    className={`${getEventBarColor(e)} text-white px-2 py-1 rounded text-[9px] font-bold leading-tight cursor-pointer hover:opacity-90 transition-all border-l-2 truncate`}
                                                    title={`${e.title} - ${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[8px] opacity-80">
                                                            {startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                        </span>
                                                        <span className="truncate">{e.title}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Hover indicator for empty days */}
                                    {dayEvents.length === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <Plus size={14} className="text-gray-600" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarMonthView;
