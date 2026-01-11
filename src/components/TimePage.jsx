import React, { useState, useEffect } from 'react';
import {
    Clock, Calendar, DollarSign, Lock, AlertCircle,
    Play, Pause, Save, Plus, Filter, FileText,
    CheckCircle, ChevronRight, X, User, Briefcase,
    MoreHorizontal, Shield, StopCircle
} from 'lucide-react';

/**
 * JKM TIME ENTRY TAB (The Financial Anchor)
 * V2.0 - Integrated Global Timer & Money Counter
 */
const TimePage = ({
    timeEntries = [],
    setTimeEntries,
    matters = [],
    employees = [],
    timerActive,
    timerSeconds,
    setTimerActive,
    setTimerSeconds
}) => {
    // STATE
    const [filterQuery, setFilterQuery] = useState('');
    const [periodFilter, setPeriodFilter] = useState('This Week');
    const [statusFilter, setStatusFilter] = useState('All');

    // SELECTION & MODALS
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    // CONSTANTS
    const HOURLY_RATE = 2500; // ZAR

    // DERIVED DATA
    const filteredEntries = timeEntries.filter(entry => {
        const matchesQuery = !filterQuery ||
            entry.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
            entry.matterName.toLowerCase().includes(filterQuery.toLowerCase());

        const matchesStatus = statusFilter === 'All' || entry.status === statusFilter;

        return matchesQuery && matchesStatus;
    });

    const totalHours = filteredEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) / 60;
    const billableAmount = filteredEntries.reduce((acc, curr) => acc + ((curr.durationMinutes / 60) * (curr.rate || HOURLY_RATE)), 0);

    // REAL-TIME MONEY COUNTER
    const currentSessionValue = (timerSeconds / 3600) * HOURLY_RATE;

    // ACTIONS
    const toggleTimer = () => {
        setTimerActive(!timerActive);
    };

    const stopAndLogTimer = () => {
        setTimerActive(false);
        // Open modal with pre-filled duration
        setIsLogModalOpen(true);
        // Note: In a real app we might auto-save to draft
    };

    const handleSaveEntry = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // If coming from timer stop
        const duration = parseInt(formData.get('duration')) || Math.ceil(timerSeconds / 60);

        const matterId = formData.get('matterId');
        const matter = matters.find(m => m.id === matterId);

        if (matter && matter.status === 'Closed') {
            alert("CONSTITUTIONAL VIOLATION: Cannot log time to a Closed matter.");
            return;
        }

        const newEntry = {
            id: `time_${Date.now()}`,
            matterId: matterId,
            matterName: matter ? matter.name : 'Unknown Matter',
            employeeId: formData.get('employeeId'),
            employeeName: employees.find(e => e.id === formData.get('employeeId'))?.full_name || 'Current User',
            description: formData.get('description'),
            date: new Date().toISOString(),
            durationMinutes: duration,
            rate: HOURLY_RATE,
            billable: true,
            status: 'Logged'
        };

        setTimeEntries(prev => [newEntry, ...prev]);
        setIsLogModalOpen(false);

        // Reset timer if it was used for this entry
        if (!timerActive && timerSeconds > 0) {
            setTimerSeconds(0);
        }
    };

    const handleLockToggle = () => {
        if (!selectedEntry) return;
        const newStatus = selectedEntry.status === 'Locked' ? 'Logged' : 'Locked';
        setTimeEntries(prev => prev.map(e => e.id === selectedEntry.id ? { ...e, status: newStatus } : e));
        setSelectedEntry({ ...selectedEntry, status: newStatus });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
    };

    const formatDuration = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const formatTimer = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="flex flex-col md:flex-row bg-[#050505] h-auto md:h-[calc(100vh-140px)] w-full overflow-visible md:overflow-hidden text-white font-['Montserrat'] relative">
            <div className="flex-1 flex flex-col min-w-0 h-auto md:h-full">

                {/* 1. CONTROL ROW (Pane A) - Mobile Optimized */}
                <div className="h-auto md:h-20 border-b border-white/5 bg-[#0a0a0a] flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-6 flex-shrink-0 gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
                        {/* GLOBAL TIMER WIDGET */}
                        <div className={`w-full md:w-auto flex items-center gap-4 border rounded-xl p-2 pr-6 transition-all ${timerActive ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${timerActive ? 'bg-red-500 text-white animate-pulse' : 'bg-[#c9a646] text-black'}`}>
                                <Clock size={20} />
                            </div>

                            <div className="flex-1">
                                <span className={`text-xl font-black font-mono block leading-none mb-1 ${timerActive ? 'text-red-500' : 'text-white'}`}>
                                    {formatTimer(timerSeconds)}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold uppercase text-gray-500 tracking-widest">
                                        {timerActive ? 'Rec' : 'Idle'}
                                    </span>
                                    {timerSeconds > 0 && (
                                        <span className="text-[9px] font-mono text-[#c9a646] bg-[#c9a646]/10 px-1 rounded">
                                            {formatCurrency(currentSessionValue)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="h-8 w-px bg-white/10 mx-2"></div>

                            <div className="flex gap-2">
                                <button
                                    onClick={toggleTimer}
                                    className={`p-2 rounded-lg transition-all ${timerActive ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-white/5 text-white hover:text-[#c9a646]'}`}
                                >
                                    {timerActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                </button>
                                {timerSeconds > 0 && (
                                    <button
                                        onClick={stopAndLogTimer}
                                        className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
                                        title="Stop & Log"
                                    >
                                        <StopCircle size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="flex gap-6 w-full md:w-auto justify-between md:justify-start px-2 md:px-0">
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Value (WTD)</span>
                                <span className="text-lg font-black text-[#c9a646]">{formatCurrency(billableAmount)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase block">Billable Hours</span>
                                <span className="text-lg font-black text-white">{totalHours.toFixed(1)} hrs</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        {/* SEARCH (Separated) */}
                        <div className="relative group w-full md:w-auto">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                            <input
                                type="text"
                                placeholder="Filter logs..."
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                className="w-full md:w-48 bg-[#121212] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-[10px] font-bold text-white focus:border-[#c9a646] outline-none uppercase"
                            />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            {/* FILTER BUTTONS (Visual Separation) */}
                            <div className="flex bg-white/5 rounded-lg p-1 border border-white/5 gap-1 flex-1 md:flex-none justify-center">
                                {['All', 'Logged', 'Locked'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`flex-1 md:flex-none px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${statusFilter === status ? 'bg-[#c9a646] text-black' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setIsLogModalOpen(true)} className="h-full md:h-10 px-4 md:px-6 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-lg flex items-center justify-center gap-2 text-[10px] md:text-xs font-black uppercase transition-all shadow-[0_0_15px_rgba(201,166,70,0.3)] shrink-0">
                                <Plus size={16} /> <span className="hidden md:inline">Log Time</span><span className="md:hidden">Log</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. TIME LOG TABLE */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0 md:p-6 mobile-scroll-container">
                    <div className="border-0 md:border md:border-white/5 md:rounded-lg overflow-hidden bg-transparent md:bg-[#121212]">
                        <table className="w-full text-left border-collapse responsive-table">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest w-32">Date</th>
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest w-48">Staff Member</th>
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest w-64">Matter Ref</th>
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Description</th>
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right w-24">Duration</th>
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right w-32">Value</th>
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center w-24">Status</th>
                                </tr>
                            </thead>
                            <tbody className="block md:table-row-group p-4 md:p-0 space-y-4 md:space-y-0">
                                {filteredEntries.map(entry => (
                                    <tr
                                        key={entry.id}
                                        onClick={() => setSelectedEntry(entry)}
                                        className={`border border-white/10 md:border-b md:border-white/5 rounded-xl md:rounded-none bg-[#121212] md:bg-transparent hover:bg-white/[0.02] cursor-pointer transition-colors group block md:table-row p-4 md:p-0 relative shadow-lg md:shadow-none ${entry.status === 'Locked' ? 'bg-gray-900/50' : ''}`}
                                    >
                                        <td className="py-1 md:py-3 px-0 md:px-4 text-[10px] font-bold text-gray-400 font-mono block md:table-cell" data-label="Date">
                                            {new Date(entry.date).toLocaleDateString()}
                                        </td>
                                        <td className="py-1 md:py-3 px-0 md:px-4 block md:table-cell" data-label="Staff">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a646] to-[#f7d774] p-[1px] shrink-0">
                                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                                        <span className="text-[10px] font-black text-[#c9a646]">
                                                            {entry.employeeName ? entry.employeeName.charAt(0) : 'U'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-300">{entry.employeeName}</span>
                                            </div>
                                        </td>
                                        <td className="py-1 md:py-3 px-0 md:px-4 text-[10px] font-bold text-[#c9a646] block md:table-cell" data-label="Matter">
                                            {entry.matterName}
                                        </td>
                                        <td className="py-1 md:py-3 px-0 md:px-4 text-[10px] text-white block md:table-cell" data-label="Desc">
                                            {entry.description}
                                        </td>
                                        <td className="py-1 md:py-3 px-0 md:px-4 text-left md:text-right text-[10px] font-mono text-gray-300 block md:table-cell" data-label="Duration">
                                            {formatDuration(entry.durationMinutes)}
                                        </td>
                                        <td className="py-1 md:py-3 px-0 md:px-4 text-left md:text-right text-[10px] font-mono text-white font-bold block md:table-cell" data-label="Value">
                                            {formatCurrency((entry.durationMinutes / 60) * (entry.rate || 0))}
                                        </td>
                                        <td className="py-1 md:py-3 px-0 md:px-4 text-left md:text-center block md:table-cell" data-label="Status">
                                            {entry.status === 'Locked' ? (
                                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400 text-[8px] font-black uppercase">
                                                    <Lock size={8} /> Locked
                                                </div>
                                            ) : (
                                                <span className="inline-block px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] font-black uppercase">
                                                    Logged
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredEntries.length === 0 && (
                            <div className="p-12 text-center opacity-20">
                                <Clock size={48} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No financial records found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. ENTRY DRAWER (Pane C) - Inlined Component */}
            {selectedEntry && (
                <div className="w-full md:w-[450px] border-l border-white/5 bg-[#0a0a0a] flex flex-col fixed inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 shadow-2xl animate-in slide-in-from-right duration-300 z-[100]">
                    <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0a] shrink-0">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            {selectedEntry.status === 'Locked' && <Lock size={12} />} Entry Details
                        </span>
                        <button onClick={() => setSelectedEntry(null)} className="text-gray-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Status Banner */}
                        {selectedEntry.status === 'Locked' && (
                            <div className="mb-6 p-3 bg-red-500/5 border border-red-500/10 rounded flex items-start gap-3">
                                <Lock size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-bold text-red-500 mb-1">Record Locked</p>
                                    <p className="text-[9px] text-gray-500 leading-relaxed">
                                        This entry has been processed for billing. It is immutable.
                                        To correct errors, issue a compensating credit entry.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Staff Resource</label>
                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-[#c9a646] flex items-center justify-center text-[8px] text-black font-black">
                                        {selectedEntry.employeeName ? selectedEntry.employeeName.charAt(0) : 'U'}
                                    </div>
                                    {selectedEntry.employeeName}
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Matter Reference</label>
                                <div className="text-sm font-bold text-[#c9a646] flex items-center gap-2">
                                    <Briefcase size={14} /> {selectedEntry.matterName}
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Values</label>
                                <div className="grid grid-cols-2 gap-4 bg-white/5 p-3 rounded border border-white/5">
                                    <div>
                                        <span className="text-[9px] text-gray-500 block mb-0.5">Duration</span>
                                        <span className="text-lg font-black text-white font-mono">{formatDuration(selectedEntry.durationMinutes)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-gray-500 block mb-0.5">Billable Value</span>
                                        <span className="text-lg font-black text-white font-mono">{formatCurrency((selectedEntry.durationMinutes / 60) * selectedEntry.rate)}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Work Description</label>
                                <div className="p-3 bg-white/5 rounded border border-white/5 text-xs text-gray-300 leading-relaxed min-h-[80px]">
                                    {selectedEntry.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-[#0a0a0a]">
                        <button
                            onClick={handleLockToggle}
                            className={`w-full py-3 border rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${selectedEntry.status === 'Locked' ? 'border-gray-700 text-gray-500 hover:bg-white/5' : 'border-[#c9a646] text-[#c9a646] hover:bg-[#c9a646]/10'}`}
                        >
                            {selectedEntry.status === 'Locked' ? <><Lock size={14} /> Unlock Record (Admin)</> : <><Lock size={14} /> Lock & Finalize</>}
                        </button>
                    </div>
                </div>
            )}

            {/* LOG TIME MODAL - MOBILE FULL */}
            {isLogModalOpen && (
                <div className="fixed inset-0 z-[120] bg-black/95 md:bg-black/90 md:backdrop-blur-sm flex items-center justify-center p-0 md:p-4 animate-in zoom-in-95 duration-200">
                    <div className="w-full h-full md:h-auto md:max-w-lg bg-[#121212] border-0 md:border md:border-white/10 rounded-none md:rounded-2xl overflow-y-auto shadow-2xl">
                        <div className="bg-[#1a1a1a] p-6 border-b border-white/5">
                            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                                <Clock size={20} className="text-[#c9a646]" /> Manual Time Entry
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Append to financial ledger</p>
                        </div>

                        <form onSubmit={handleSaveEntry} className="p-6 space-y-5">
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Select Matter **</label>
                                <select name="matterId" required className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none">
                                    <option value="">-- Associate with Matter --</option>
                                    {matters.filter(m => m.status !== 'Closed').map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Staff Member</label>
                                <select name="employeeId" required className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none">
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Duration (Minutes)</label>
                                    <input
                                        name="duration"
                                        type="number"
                                        required
                                        defaultValue={timerSeconds > 0 ? Math.ceil(timerSeconds / 60) : 60}
                                        className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none font-mono"
                                    />
                                    {timerSeconds > 0 && <span className="text-[8px] text-[#c9a646] uppercase font-bold">Auto-filled from timer</span>}
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Date</label>
                                    <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Description of Work</label>
                                <textarea name="description" required className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none min-h-[80px]" placeholder="Detailed description for invoice..."></textarea>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setIsLogModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-lg text-xs font-black uppercase transition-all shadow-lg flex items-center justify-center gap-2">
                                    <Save size={14} /> Commit Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePage;
