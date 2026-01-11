import React, { useState, useMemo } from 'react';
import {
    ShieldCheck, Lock, Folder, FileText, DollarSign, MessageCircle,
    ChevronRight, CheckCircle2, Download, ExternalLink, RefreshCw,
    AlertCircle, Eye, CreditCard, Send, Upload, File, Search, Globe,
    LayoutGrid, List, Clock, Bell, User
} from 'lucide-react';

const GlassCard = ({ children, className = "", onClick }) => (
    <div onClick={onClick} className={`glass-card ${className} ${onClick ? 'cursor-pointer hover:border-[#c9a646]/50 transition-colors' : ''}`}>
        {children}
    </div>
);

export default function ClientPortalPage({ clients = [], matters = [], documents = [], invoices = [] }) {
    const [selectedClient, setSelectedClient] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // grid | list

    // SCOPE LOCK: Strictly filter by clientId and isSharedWithClient
    const clientMatters = useMemo(() =>
        selectedClient ? matters.filter(m => m.clientId === selectedClient.id) : []
        , [selectedClient, matters]);

    // RULE #3 ENFORCEMENT: Only show Shared documents
    const clientDocs = useMemo(() =>
        selectedClient ? documents.filter(d =>
            clientMatters.some(m => m.id === d.matterId) && d.isSharedWithClient === true
        ) : []
        , [selectedClient, documents, clientMatters]);

    const clientInvoices = useMemo(() =>
        selectedClient ? invoices.filter(i => clientMatters.some(m => m.id === i.matterId)) : []
        , [selectedClient, invoices, clientMatters]);

    const STAGES = ['Initial Intake', 'Discovery', 'Litigation', 'Trial Prep', 'Mediation', 'Final Judgment', 'Closed'];

    const getStageProgress = (currentStage) => {
        const idx = STAGES.indexOf(currentStage);
        return idx === -1 ? 0 : ((idx + 1) / STAGES.length) * 100;
    };

    // --- UNAUTHENTICATED VIEW (Login Simulation) ---
    if (!selectedClient) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-700 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full bg-[#050505]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c9a646]/5 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c9a646] to-[#b8860b] flex items-center justify-center mb-8 shadow-2xl shadow-[#c9a646]/20 ring-4 ring-black ring-offset-2 ring-offset-[#c9a646]/20">
                        <Lock size={32} className="text-black" />
                    </div>

                    <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2 text-center">JKM Secure Portal</h1>
                    <p className="text-xs font-bold text-[#c9a646] uppercase tracking-[0.3em] mb-12 text-center opacity-80">Encrypted Client Access Gateway</p>

                    <div className="w-full space-y-3 bg-[#0a0a0a] p-2 rounded-2xl border border-white/10 shadow-2xl">
                        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Identity</span>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {clients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 hover:border-[#c9a646]/50 border border-transparent transition-all text-left flex items-center group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center text-[#c9a646] border border-white/10 mr-4 group-hover:scale-110 transition-transform">
                                        <User size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#c9a646] transition-colors">{client.name}</p>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase">{client.email}</p>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="mt-8 text-[9px] text-gray-600 font-mono text-center max-w-xs">
                        This system is monitored. All access attempts are logged.<br />Protocol 7.0 Encryption Active.
                    </p>
                </div>
            </div>
        );
    }

    // --- AUTHENTICATED PORTAL VIEW ---
    return (
        <div className="h-full flex flex-col bg-[#050505] -m-8 p-8 animate-in fade-in zoom-in-95 duration-500">

            {/* BLACK & GOLD HEADER */}
            <div className="flex-shrink-0 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                            {selectedClient.name}
                            <span className="px-2 py-0.5 rounded text-[9px] bg-[#c9a646] text-black font-black uppercase tracking-widest">Portal V1</span>
                        </h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Secure Connection Established
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-8 px-6 py-2 rounded-full bg-white/5 border border-white/5">
                        <div className="text-right">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Active Matters</p>
                            <p className="text-sm font-black text-white">{clientMatters.length}</p>
                        </div>
                        <div className="w-px h-6 bg-white/10"></div>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Shared Docs</p>
                            <p className="text-sm font-black text-[#c9a646]">{clientDocs.length}</p>
                        </div>
                        <div className="w-px h-6 bg-white/10"></div>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Outstanding</p>
                            <p className="text-sm font-black text-white">R {clientInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0).toLocaleString()}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedClient(null)}
                        className="p-3 rounded-xl bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/30 transition-all flex items-center gap-2 group"
                    >
                        <Lock size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block group-hover:text-white transition-colors">Log Out</span>
                    </button>
                </div>
            </div>

            {/* DASHBOARD GRID */}
            <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">

                {/* LEFT COL: MATTERS (4 cols) */}
                <div className="col-span-12 xl:col-span-4 flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-1 px-1">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Your Matters</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                        {clientMatters.map(matter => (
                            <GlassCard key={matter.id} className="p-5 border-l-4 border-l-[#c9a646] group hover:bg-white/[0.03]">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-[#c9a646]/20 text-[#c9a646]">{matter.category}</span>
                                            <span className="text-[9px] font-mono text-gray-600">{matter.ref}</span>
                                        </div>
                                        <h4 className="text-sm font-black text-white uppercase leading-tight group-hover:text-[#c9a646] transition-colors">{matter.name}</h4>
                                    </div>
                                </div>

                                <div className="relative pt-2 pb-1">
                                    <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-2">
                                        <span>Status: {matter.stage}</span>
                                        <span>{Math.round(getStageProgress(matter.stage))}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#c9a646] to-[#fff]"
                                            style={{ width: `${getStageProgress(matter.stage)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>

                {/* MID COL: VAULT (5 cols) */}
                <div className="col-span-12 xl:col-span-5 flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-1 px-1">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck size={14} className="text-blue-500" /> Secure Vault
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-600'}`}><LayoutGrid size={12} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-600'}`}><List size={12} /></button>
                        </div>
                    </div>

                    <div className={`flex-1 overflow-y-auto custom-scrollbar pr-2 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-4 auto-rows-min' : 'space-y-2'}`}>
                        {clientDocs.length === 0 ? (
                            <div className="col-span-2 flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl opacity-40">
                                <Folder size={32} className="mb-2" />
                                <p className="text-[10px] font-bold uppercase">No Shared Documents</p>
                            </div>
                        ) : clientDocs.map(doc => (
                            viewMode === 'grid' ? (
                                <GlassCard key={doc.id} className="p-4 flex flex-col gap-3 group hover:border-blue-500/50">
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                            <FileText size={20} />
                                        </div>
                                        {doc.starred && <span className="text-[#c9a646]"><Globe size={12} /></span>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-gray-200 uppercase truncate mb-1" title={doc.name}>{doc.name}</p>
                                        <p className="text-[8px] font-mono text-gray-500">{doc.size} • {new Date(doc.modifiedTime).toLocaleDateString()}</p>
                                    </div>
                                    <a href={doc.driveUrl} target="_blank" rel="noreferrer" className="w-full py-2 rounded bg-white/5 hover:bg-blue-500 hover:text-white text-[9px] font-black uppercase text-center transition-all flex items-center justify-center gap-2">
                                        <Download size={12} /> Access
                                    </a>
                                </GlassCard>
                            ) : (
                                <div key={doc.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/30 group">
                                    <FileText size={16} className="text-blue-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-gray-200 uppercase truncate">{doc.name}</p>
                                    </div>
                                    <p className="text-[8px] font-mono text-gray-500">{doc.size}</p>
                                    <a href={doc.driveUrl} className="p-2 hover:text-blue-400"><Download size={14} /></a>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* RIGHT COL: FINANCIALS & NOTICES (3 cols) */}
                <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="flex items-center justify-between mb-1 px-1">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Financials</h3>
                        </div>
                        <GlassCard className="p-5 relative overflow-hidden border-t-2 border-t-green-500">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <DollarSign size={48} className="text-green-500" />
                            </div>
                            <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">Total Outstanding</p>
                            <p className="text-3xl font-black text-white mb-6">
                                R {clientInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0).toLocaleString()}
                            </p>
                            <div className="space-y-3">
                                {clientInvoices.slice(0, 3).map(inv => (
                                    <div key={inv.id} className="flex justify-between items-center text-[9px] font-bold border-t border-white/5 pt-2">
                                        <span className="text-gray-400">{inv.number}</span>
                                        <span className="text-white">R {inv.totalAmount?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Updates</h3>
                            </div>
                            <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-center opacity-70">
                                <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center mb-4">
                                    <Bell size={20} className="text-gray-600" />
                                </div>
                                <h4 className="text-sm font-black text-white uppercase mb-2">Registry Silent</h4>
                                <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed max-w-[200px]">
                                    No new secure notices available from your legal team.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
