import React from 'react';
import { Plus, MapPin } from 'lucide-react';

/**
 * Google Calendar-Style Day View
 * Single column with time-spanning event blocks
 */
const CalendarDayView = ({
    selectedDate,
    filteredEvents,
    handleEventClick,
    openCreateEventModal
}) => {
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    // Get events for selected day
    const dayEvents = filteredEvents.filter(e => {
        const eventDate = new Date(e.start);
        return eventDate.toDateString() === selectedDate.toDateString();
    });

    return (
        <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
            {/* Day Header */}
            <div className={`p-6 text-center border-b border-white/10 ${isToday ? 'bg-[#c9a646]/10' : 'bg-black/40'}`}>
                <div className={`text-3xl font-black ${isToday ? 'text-[#c9a646]' : 'text-white'}`}>
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">
                    {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} scheduled
                </div>
            </div>

            {/* Day Grid with Time Slots */}
            <div className="relative overflow-y-auto" style={{ maxHeight: '600px' }}>
                <div className="grid grid-cols-2">
                    {/* Time labels column */}
                    <div className="bg-black/30 border-r border-white/5">
                        {Array.from({ length: 24 }).map((_, hour) => (
                            <div key={hour} className="h-20 border-b border-white/5 p-3 text-right">
                                <span className="text-sm font-bold text-gray-500">
                                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Event column */}
                    <div className={`relative ${isToday ? 'bg-[#c9a646]/5' : 'bg-black/10'}`}>
                        {/* Hour grid */}
                        {Array.from({ length: 24 }).map((_, hour) => (
                            <div
                                key={hour}
                                onClick={() => openCreateEventModal(selectedDate, hour)}
                                className="h-20 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group relative"
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="text-center">
                                        <Plus size={16} className="text-gray-600 mx-auto mb-1" />
                                        <span className="text-[8px] text-gray-600 uppercase font-bold">Add Event</span>
                                    </div>
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

                            // Calculate position and height (80px per hour for day view)
                            const topPosition = (startHour * 80) + (startMinute / 60 * 80);
                            const duration = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
                            const height = duration * 80;

                            // Color based on category
                            const colorClass = event.category === 'Court' ? 'bg-purple-500/90 border-purple-600 text-white' :
                                event.category === 'Consultation' ? 'bg-blue-500/90 border-blue-600 text-white' :
                                    event.category === 'Deadline' ? 'bg-red-500/90 border-red-600 text-white' :
                                        'bg-green-500/90 border-green-600 text-white';

                            return (
                                <div
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                                    className={`absolute left-2 right-2 ${colorClass} border-l-4 rounded-lg px-3 py-2 cursor-pointer hover:opacity-90 transition-all overflow-hidden shadow-xl`}
                                    style={{
                                        top: `${topPosition}px`,
                                        height: `${Math.max(height, 30)}px`,
                                        zIndex: 10
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-black truncate flex-1">{event.title}</span>
                                        <span className="text-[9px] opacity-80 ml-2">
                                            {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                        </span>
                                    </div>
                                    {height > 50 && event.description && (
                                        <div className="text-[10px] opacity-90 line-clamp-2 mb-1">
                                            {event.description}
                                        </div>
                                    )}
                                    {height > 40 && event.location && (
                                        <div className="text-[10px] opacity-80 flex items-center gap-1 truncate">
                                            <MapPin size={10} /> {event.location}
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

export default CalendarDayView;
