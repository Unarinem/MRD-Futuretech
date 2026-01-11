import React, { useState } from 'react';
import {
    Wrench, BarChart2, FileText, Landmark, ClipboardList,
    Briefcase, User, Activity, Search, ChevronRight,
    Settings, Printer, Download, List, Grid, CheckCircle,
    Play, AlertCircle, DollarSign, Clock, Shield, X, Filter
} from 'lucide-react';

const ReportActionCard = ({ icon: Icon, title, description, action, onClick }) => (
    <div onClick={onClick} className="bg-[#0a0a0a] border border-white/5 hover:border-[#c9a646]/50 rounded-xl p-6 transition-all group cursor-pointer hover:bg-white/[0.02]">
        <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#c9a646] transition-colors duration-300 flex-shrink-0">
                <Icon size={20} className="text-gray-400 group-hover:text-black transition-colors" />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-black text-white uppercase mb-2 group-hover:text-[#c9a646] transition-colors">{title}</h3>
                <p className="text-[10px] text-gray-400 leading-relaxed mb-4 min-h-[40px]">{description}</p>

                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase group-hover:text-white transition-colors">
                    {action} <ChevronRight size={12} />
                </div>
            </div>
        </div>
    </div>
);

/**
 * JKM REPORTS TAB (The Strategic Mirror)
 * V4.0 - Functional Report Generator
 * Simplified Menu + Functional Search + Report Drawer
 */
const ReportsPage = ({
    matters = [],
    invoices = [],
    timeEntries = []
}) => {
    // STATE
    const [activeSection, setActiveSection] = useState('Tools');
    const [searchQuery, setSearchQuery] = useState('');
    const [generatedReport, setGeneratedReport] = useState(null); // { title, columns, data }

    // SIDEBAR MENU ITEMS (Simplified)
    const menuItems = [
        { id: 'Tools', label: 'Tools', icon: Wrench },
        { id: 'Advanced Report', label: 'Advanced Report', icon: BarChart2 },
    ];

    // DEFINITIONS
    const toolsCards = [
        { id: 'bulk_inv', icon: FileText, title: "Bulk Generate Invoices", description: "Automatically generate drafts for all unbilled matters.", action: "Start Generator" },
        { id: 'export_wiz', icon: Grid, title: "Run Reports / Exports", description: "Export PDF/Excel summaries for specific periods.", action: "Open Wizard" },
        { id: 'cat_perf', icon: Activity, title: "Category Performance", description: "Analyze revenue and hours by practice area.", action: "View Analysis" },
        { id: 'conflict', icon: Search, title: "Conflict Check", description: "Search across all entities for potential conflicts.", action: "Run Check" },
        { id: 'inv_action', icon: DollarSign, title: "Action On Invoices", description: "Bulk status updates or apply late fees.", action: "Manage Actions" },
    ];

    const advancedCards = [
        { id: 'rep_case', icon: Briefcase, title: "Case Report", description: "List of cases based on Status, Docket No, Description.", action: "Generate" },
        { id: 'rep_bill', icon: DollarSign, title: "Billing Report", description: "Invoice list with Bill Amount, Due Amount, Status.", action: "Generate" },
        { id: 'rep_pay', icon: Landmark, title: "Payment Report", description: "List of payments with invoice no and amount details.", action: "Generate" },
        { id: 'rep_time', icon: Clock, title: "Time / Expense Entry", description: "List all time/expense entries with fees and client details.", action: "Generate" },
    ];

    // SEARCH FILTER
    const getVisibleCards = () => {
        const set = activeSection === 'Tools' ? toolsCards : advancedCards;
        if (!searchQuery) return set;
        return set.filter(c =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // REPORT GENERATION LOGIC
    const handleCardClick = (cardId) => {
        let report = null;

        switch (cardId) {
            case 'rep_case':
                report = {
                    title: 'Strategic Case Report',
                    columns: ['Ref', 'Client', 'Status', 'Opened'],
                    data: matters.map(m => [m.id, m.client, m.status, m.openDate || 'N/A'])
                };
                break;
            case 'rep_bill':
                report = {
                    title: 'Financial Billing Log',
                    columns: ['Inv #', 'Client', 'Amount', 'Status', 'Date'],
                    data: invoices.map(i => [i.number, i.clientName, formatCurrency(i.totalAmount), i.status, new Date(i.issueDate).toLocaleDateString()])
                };
                break;
            case 'rep_time':
                report = {
                    title: 'Time & Expense Journal',
                    columns: ['Date', 'Staff', 'Matter', 'Hours', 'Rate', 'Status'],
                    data: timeEntries.map(t => [t.date, t.employeeName, t.matterName || t.matterId, (t.durationMinutes / 60).toFixed(1), formatCurrency(t.rate), t.status])
                };
                break;
            case 'bulk_inv':
                // Simulation of Logic
                const unbilledCount = matters.filter(m => m.status !== 'Closed').length; // Mock logic
                report = {
                    title: 'Bulk Invoice Generation Result',
                    columns: ['Matter', 'Status', 'Draft ID', 'Amount'],
                    data: [
                        ['Mbewe v Gwala', 'Success', 'DRAFT-0912', 'R 4,500.00'],
                        ['SAPS v Dlamini', 'Skipped', 'No Unbilled', '-'],
                        ['TechCorp Merger', 'Success', 'DRAFT-0913', 'R 12,000.00']
                    ]
                };
                break;
            default:
                report = {
                    title: 'Module Under Construction',
                    columns: ['Status'],
                    data: [['This report generator is being connected to the live ledger.']]
                };
        }

        setGeneratedReport(report);
    };

    // UTILS
    const formatCurrency = (amount) => {
        try { return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0); }
        catch (e) { return 'R 0.00'; }
    };

    return (
        <div className="flex flex-col md:flex-row bg-[#050505] h-auto md:h-[calc(100vh-140px)] w-full overflow-visible md:overflow-hidden text-white font-['Montserrat'] relative">

            {/* SIDEBAR NAVIGATION (Hidden on Mobile) */}
            <div className="hidden md:flex w-64 bg-[#0a0a0a] border-r border-white/5 flex-col flex-shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Reports</h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveSection(item.id); setSearchQuery(''); }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wide group
                                ${activeSection === item.id
                                    ? 'bg-[#c9a646] text-black shadow-lg shadow-[#c9a646]/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={16} className={activeSection === item.id ? 'text-black' : 'text-gray-500 group-hover:text-white'} />
                            <span>{item.label}</span>
                            {activeSection === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">

                {/* Header / Toolbar */}
                <div className="h-auto md:h-16 bg-[#0a0a0a] border-b border-white/5 flex flex-col md:flex-row items-center justify-between px-6 md:px-8 py-4 md:py-0 gap-4 flex-shrink-0">
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                        {/* Mobile Section Toggle */}
                        <div className="flex md:hidden bg-white/5 rounded-lg p-1">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`px-3 py-1 rounded text-[9px] font-bold uppercase transition-all ${activeSection === item.id ? 'bg-[#c9a646] text-black' : 'text-gray-500'}`}
                                >
                                    {item.label === 'Advanced Report' ? 'Advanced' : item.label}
                                </button>
                            ))}
                        </div>
                        <span className="text-sm font-black text-white uppercase tracking-widest hidden md:block">{activeSection}</span>
                    </div>

                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                        <input
                            type="text"
                            placeholder={`Search ${activeSection}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 bg-[#121212] border border-white/10 rounded-full py-2 pl-9 pr-4 text-[10px] font-bold text-white focus:border-[#c9a646] outline-none uppercase transition-all focus:w-80"
                        />
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 mobile-scroll-container">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-in fade-in zoom-in-95 duration-300">
                        {getVisibleCards().map(card => (
                            <ReportActionCard
                                key={card.id}
                                icon={card.icon}
                                title={card.title}
                                description={card.description}
                                action={card.action}
                                onClick={() => handleCardClick(card.id)}
                            />
                        ))}
                    </div>
                    {getVisibleCards().length === 0 && (
                        <div className="h-64 flex flex-col items-center justify-center opacity-30">
                            <Search size={48} className="mb-4 text-gray-500" />
                            <p className="text-xs font-bold uppercase">No tools match your search</p>
                        </div>
                    )}
                </div>

            </div>

            {/* REPORT GENERATOR DRAWER */}
            {generatedReport && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
                    <div className="w-full md:w-[800px] h-full bg-[#121212] border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#1a1a1a]">
                            <div className="flex items-center gap-3">
                                <FileText className="text-[#c9a646]" size={20} />
                                <h2 className="text-sm font-black text-white uppercase tracking-wider">{generatedReport.title}</h2>
                            </div>
                            <button onClick={() => setGeneratedReport(null)} className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-white/5 bg-[#121212] flex gap-3">
                            <button className="px-4 py-2 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded text-[10px] font-black uppercase flex items-center gap-2">
                                <Download size={14} /> Export PDF
                            </button>
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold uppercase flex items-center gap-2">
                                <Grid size={14} /> Export CSV
                            </button>
                            <div className="ml-auto flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                <CheckCircle size={12} className="text-green-500" />
                                Generated: {new Date().toLocaleTimeString()}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar p-6">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        {generatedReport.columns.map((col, i) => (
                                            <th key={i} className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {generatedReport.data.map((row, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            {row.map((cell, j) => (
                                                <td key={j} className="py-3 px-4 text-[10px] text-gray-300 font-medium">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {generatedReport.data.length === 0 && (
                                        <tr>
                                            <td colSpan={generatedReport.columns.length} className="py-8 text-center text-xs text-gray-500 italic">
                                                No records found for this report scope.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};



export default ReportsPage;
