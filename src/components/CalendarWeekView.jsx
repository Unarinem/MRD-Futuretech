import React from 'react';
import { Plus, MapPin } from 'lucide-react';

/**
 * Google Calendar-Style Week View
 * Events span multiple hours with proper positioning
 */
const CalendarWeekView = ({
    selectedDate,
    filteredEvents,
    handleEventClick,
    openCreateEventModal,
    DAYS
}) => {
    const today = new Date();

    return (
        <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[800px]">
                    {/* Week Header */}
                    <div className="grid grid-cols-8 border-b border-white/10 bg-black/40">
                        <div className="p-2 text-center">
                            <span className="text-[9px] font-black text-gray-600 uppercase">GMT+2</span>
                        </div>
                        {DAYS.map((d, idx) => {
                            const weekStart = new Date(selectedDate);
                            const dayOfWeek = selectedDate.getDay();
                            const diff = idx - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
                            weekStart.setDate(selectedDate.getDate() + diff);
                            const isToday = weekStart.toDateString() === today.toDateString();

                            return (
                                <div key={d} className={`p-3 text-center border-l border-white/5 ${isToday ? 'bg-[#c9a646]/10' : ''}`}>
                                    <div className="text-[9px] font-black text-gray-500 uppercase">{d}</div>
                                    <div className={`text-2xl font-black mt-1 ${isToday ? 'text-[#c9a646]' : 'text-white'}`}>
                                        {weekStart.getDate()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Week Grid with Time Slots */}
                    <div className="relative overflow-y-auto" style={{ maxHeight: '600px' }}>
                        <div className="grid grid-cols-8">
                            {/* Time labels column */}
                            <div className="bg-black/30 border-r border-white/5">
                                {Array.from({ length: 24 }).map((_, hour) => (
                                    <div key={hour} className="h-16 border-b border-white/5 p-2 text-right">
                                        <span className="text-[10px] font-bold text-gray-600">
                                            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Day columns */}
                            {DAYS.map((_, dayIdx) => {
                                const weekStart = new Date(selectedDate);
                                const dayOfWeek = selectedDate.getDay();
                                const diff = dayIdx - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
                                weekStart.setDate(selectedDate.getDate() + diff);
                                weekStart.setHours(0, 0, 0, 0);

                                const isToday = weekStart.toDateString() === today.toDateString();

                                // Get events for this day
                                const dayEvents = filteredEvents.filter(e => {
                                    const eventDate = new Date(e.start);
                                    return eventDate.toDateString() === weekStart.toDateString();
                                });

                                return (
                                    <div key={dayIdx} className={`relative border-l border-white/5 ${isToday ? 'bg-[#c9a646]/5' : 'bg-black/10'}`}>
                                        {/* Hour grid */}
                                        {Array.from({ length: 24 }).map((_, hour) => (
                                            <div
                                                key={hour}
                                                onClick={() => openCreateEventModal(weekStart, hour)}
                                                className="h-16 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group relative"
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus size={12} className="text-gray-600" />
                                                </div>
                                            </div>
                                        ))}

                                        {/* Events overlay - positioned absolutely */}
                                        {dayEvents.map((event, idx) => {
                                            const startDate = new Date(event.start);
                                            const endDate = new Date(event.end);
                                            const startHour = startDate.getHours();
                                            const startMinute = startDate.getMinutes();
                                            const endHour = endDate.getHours();
                                            const endMinute = endDate.getMinutes();

                                            // Calculate position and height
                                            const topPosition = (startHour * 64) + (startMinute / 60 * 64);
                                            const duration = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
                                            const height = duration * 64;

                                            // Color based on category (Google Calendar style)
                                            const colorClass = event.category === 'Court' ? 'bg-purple-500/90 border-purple-600 text-white' :
                                                event.category === 'Consultation' ? 'bg-blue-500/90 border-blue-600 text-white' :
                                                    event.category === 'Deadline' ? 'bg-red-500/90 border-red-600 text-white' :
                                                        'bg-green-500/90 border-green-600 text-white';

                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                                                    className={`absolute left-1 right-1 ${colorClass} border-l-4 rounded px-2 py-1 cursor-pointer hover:opacity-90 transition-all overflow-hidden shadow-lg`}
                                                    style={{
                                                        top: `${topPosition}px`,
                                                        height: `${Math.max(height, 24)}px`,
                                                        zIndex: 10
                                                    }}
                                                >
                                                    <div className="text-[10px] font-black truncate">{event.title}</div>
                                                    <div className="text-[8px] opacity-90">
                                                        {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                    </div>
                                                    {event.location && height > 40 && (
                                                        <div className="text-[8px] opacity-80 truncate mt-0.5 flex items-center gap-1">
                                                            <MapPin size={8} /> {event.location}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarWeekView;
