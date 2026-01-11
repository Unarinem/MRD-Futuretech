import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
    Folder, File, FileText, FileSpreadsheet, Presentation,
    Upload, Archive, Download, Search, Filter, X,
    RefreshCw, AlertCircle, CheckCircle, Clock,
    ChevronRight, Eye, Trash2, MapPin, Briefcase,
    Grid, List, Plus, HardDrive, Star, LayoutGrid, Monitor,
    MoreVertical, Share2, Lock, Shield, ExternalLink,
    UserCircle, User, Globe, Sparkles, Settings,
    FileImage, FileCode
} from 'lucide-react';

// --- SUB-COMPONENTS ---

const SidebarItem = ({ label, subLabel, onClick, active }) => (
    <div
        onClick={onClick}
        className={`px-4 py-3 cursor-pointer transition-all border-l-2 ${active
            ? 'bg-[#c9a646]/10 border-[#c9a646] text-white'
            : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
            }`}
    >
        <p className={`text-xs font-bold truncate ${active ? 'text-white' : ''}`}>{label}</p>
        <p className="text-[10px] font-medium opacity-60 truncate">{subLabel}</p>
    </div>
);

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-bold text-white text-right break-all ml-4">{value}</span>
    </div>
);

const DocumentsPage = ({ documents = [], setDocuments, matters = [] }) => {
    // --- STATE ---
    const [activeMatterId, setActiveMatterId] = useState(matters[0]?.id || null);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date'); // date, name, size, type

    // Feature States
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0); // 0: Idle, 1: Scanning, 2: Proc, 3: Done
    const [analysisResult, setAnalysisResult] = useState(null);
    const [localDocs, setLocalDocs] = useState([]); // For robust upload simulation

    // --- MOCK / FALLBACK DATA ---
    const effectiveDocs = useMemo(() => {
        // Ensure the Demo Doc always exists for the active matter (or first matter)
        const targetMatterId = matters[0]?.id; // Always tie to First Matter for Demo
        const demoDocs = targetMatterId ? [
            {
                id: 'demo_1',
                name: 'Discovery_Bundle_v1.pdf',
                size: '2.4 MB',
                type: 'pdf',
                modifiedTime: '2024-10-10T09:00:00',
                category: 'Evidence',
                matterId: targetMatterId,
                ownerName: 'Paralegal Team',
                driveUrl: '#',
                pageCount: 45,
                confidential: true
            }
        ] : [];

        // Merge User Docs + Demo Docs + Local Uploads
        return [...documents, ...demoDocs, ...localDocs];
    }, [documents, matters, localDocs]);

    // --- DERIVED LIST ---
    const activeMatterDocs = useMemo(() => {
        if (!activeMatterId) return [];
        let docs = effectiveDocs.filter(d => d.matterId === activeMatterId);

        // Deduplicate by ID
        docs = Array.from(new Map(docs.map(item => [item.id, item])).values());

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            docs = docs.filter(d =>
                d.name.toLowerCase().includes(q) ||
                (d.category && d.category.toLowerCase().includes(q))
            );
        }

        // Sort
        return docs.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'size') {
                const getBytes = (s) => {
                    const str = (s || '').toString().toUpperCase();
                    if (str.includes('GB')) return parseFloat(str) * 1024 * 1024 * 1024;
                    if (str.includes('MB')) return parseFloat(str) * 1024 * 1024;
                    if (str.includes('KB')) return parseFloat(str) * 1024;
                    return parseFloat(str) || 0;
                };
                return getBytes(a.size) - getBytes(b.size);
            }
            if (sortBy === 'type') return (a.type || '').localeCompare(b.type || '');
            return new Date(b.modifiedTime) - new Date(a.modifiedTime);
        });
    }, [effectiveDocs, activeMatterId, searchQuery, sortBy]);

    const currentMatter = matters.find(m => m.id === activeMatterId) || {};

    // --- ACTIONS ---
    const handleDownload = (doc) => {
        const link = document.createElement('a');
        link.href = doc.driveUrl || '#';
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const runAnalysis = () => {
        setIsAnalyzing(true);
        setAnalysisStep(1);
        setAnalysisResult(null);

        // Simulate AI Steps
        setTimeout(() => setAnalysisStep(2), 1500); // 1.5s Scanning
        setTimeout(() => setAnalysisStep(3), 3000); // 3.0s Processing
        setTimeout(() => {
            setAnalysisStep(4); // Done
            setAnalysisResult({
                summary: "This document contains 45 pages of discovered evidence. Key entities identified include 'Mbewe Holdings', 'SAPS Region 4', and 'Lieutenant K. Gwala'. The document appears to outline the chronological events of the dispute on Jan 5th, 2025.",
                sentiment: "Neutral / Formal",
                risk: "Medium",
                flags: ["Confidential Watermark Detected", "Incomplete Signature Page 42"]
            });
        }, 4500);
    };

    const runUpload = () => {
        // Simulate Upload
        setUploadProgress(10);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsUploadOpen(false);
                        setUploadProgress(0);
                        // Add Dummy File
                        const newFile = {
                            id: `local_${Date.now()}`,
                            name: `Uploaded_Transcript_${new Date().toLocaleTimeString().replace(/:/g, '')}.pdf`,
                            size: '1.2 MB',
                            type: 'pdf',
                            modifiedTime: new Date().toISOString(),
                            category: 'Uploads',
                            matterId: activeMatterId,
                            ownerName: 'You',
                            driveUrl: '#'
                        };
                        setLocalDocs(prev => [newFile, ...prev]);
                    }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    return (
        <div className="flex bg-[#050505] h-[calc(100vh-140px)] w-full overflow-hidden text-white font-['Montserrat']">
            {/* --- SIDEBAR (Hidden on Mobile) --- */}
            <div className="hidden md:flex w-64 flex-shrink-0 bg-[#0a0a0a] border-r border-white/5 flex-col">
                <div className="h-16 flex items-center px-6 border-b border-white/5 gap-3">
                    <HardDrive size={18} className="text-[#c9a646]" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">Matter Drives</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                    {matters.map(m => (
                        <SidebarItem
                            key={m.id}
                            label={m.name}
                            subLabel={m.clientName || m.client || 'Client'}
                            active={activeMatterId === m.id}
                            onClick={() => { setActiveMatterId(m.id); setSelectedDoc(null); }}
                        />
                    ))}
                </div>
            </div>

            {/* --- MAIN LIST --- */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#050505] transition-all">
                {/* Toolbar */}
                <div className="h-auto md:h-16 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 md:py-0 gap-4">
                    <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                        {/* Mobile Matter Selector (since sidebar is hidden) */}
                        <div className="md:hidden relative w-full">
                            <select
                                value={activeMatterId}
                                onChange={(e) => setActiveMatterId(e.target.value)}
                                className="w-full bg-[#121212] border border-white/10 rounded-lg p-2 text-xs font-bold text-white uppercase outline-none mb-2 focus:border-[#c9a646]"
                            >
                                {matters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div className="relative w-full md:w-auto">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                            <input
                                type="text"
                                placeholder={`Search ${currentMatter.name || 'documents'}...`}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-[#121212] border border-white/10 rounded-full h-9 pl-9 pr-4 text-[10px] font-bold text-white focus:border-[#c9a646] outline-none w-full md:w-64 focus:w-80 transition-all"
                            />
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                        <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/5 overflow-x-auto no-scrollbar">
                            {['Date', 'Name', 'Size', 'Type'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSortBy(type.toLowerCase())}
                                    className={`px-3 py-1 rounded text-[9px] font-bold uppercase transition-all whitespace-nowrap ${sortBy === type.toLowerCase() ? 'bg-[#c9a646] text-black shadow' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-lg text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 shrink-0">
                            <Upload size={14} /> <span className="hidden md:inline">Upload</span><span className="md:hidden">Add</span>
                        </button>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {activeMatterDocs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <Folder size={48} className="text-gray-600 mb-4" />
                            <p className="text-[10px] font-bold text-gray-500 uppercase">No Documents Found</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activeMatterDocs.map(doc => (
                                <div
                                    key={doc.id}
                                    onClick={() => setSelectedDoc(doc)}
                                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${selectedDoc?.id === doc.id
                                        ? 'bg-[#c9a646]/10 border-[#c9a646] shadow-lg shadow-[#c9a646]/10'
                                        : 'bg-[#0a0a0a] border-white/5 hover:border-white/10 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.type === 'pdf' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            {doc.type === 'pdf' ? <FileText size={20} /> : <File size={20} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-xs font-bold truncate mb-1 ${selectedDoc?.id === doc.id ? 'text-[#c9a646]' : 'text-white'}`}>{doc.name}</p>
                                            <p className="text-[9px] font-medium text-gray-500 truncate">
                                                {doc.size} • {new Date(doc.modifiedTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="px-3 py-1 bg-white/5 rounded text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                                            {doc.category || 'General'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- PREVIEW PANEL --- */}
            {selectedDoc && (
                <div className="fixed md:static inset-0 md:inset-auto z-[60] md:z-10 w-full md:w-[400px] flex-shrink-0 bg-[#0a0a0a] border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Preview</span>
                        <button onClick={() => setSelectedDoc(null)} className="text-gray-500 hover:text-white"><X size={16} /></button>
                    </div>

                    {/* Realistic Preview Visual */}
                    <div className="h-64 bg-[#121212] flex items-center justify-center p-8 border-b border-white/5 relative overflow-hidden">
                        <div className="w-full h-full bg-white shadow-2xl rounded-sm p-6 relative transform transition-transform hover:scale-[1.02] duration-500 box-content max-w-[200px] aspect-[3/4]">
                            {/* Fake Text Lines */}
                            <div className="w-3/4 h-3 bg-gray-800 mb-6 rounded-sm opacity-20"></div>
                            <div className="space-y-2">
                                <div className="w-full h-1.5 bg-gray-400 rounded-sm opacity-20"></div>
                                <div className="w-full h-1.5 bg-gray-400 rounded-sm opacity-20"></div>
                                <div className="w-5/6 h-1.5 bg-gray-400 rounded-sm opacity-20"></div>
                            </div>
                            <div className="mt-8 space-y-2">
                                <div className="w-full h-1.5 bg-gray-400 rounded-sm opacity-20"></div>
                                <div className="w-full h-1.5 bg-gray-400 rounded-sm opacity-20"></div>
                                <div className="w-4/5 h-1.5 bg-gray-400 rounded-sm opacity-20"></div>
                            </div>
                            {/* Watermark if PDF */}
                            {selectedDoc.type === 'pdf' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-red-500/10 -rotate-45 uppercase border-4 border-red-500/10 px-4 py-2">Confidential</span>
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button className="p-2 bg-black/80 rounded-full text-white hover:text-[#c9a646] transition-colors"><Eye size={14} /></button>
                            <button className="p-2 bg-black/80 rounded-full text-white hover:text-[#c9a646] transition-colors"><Download size={14} /></button>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <h2 className="text-sm font-black text-white leading-snug mb-1">{selectedDoc.name}</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-6">{selectedDoc.size} • {selectedDoc.type?.toUpperCase()}</p>

                        <div className="space-y-3 mb-8">
                            <button
                                onClick={runAnalysis}
                                disabled={isAnalyzing}
                                className="w-full py-4 bg-gradient-to-r from-[#c9a646] to-[#b89535] hover:to-[#ffe082] text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#c9a646]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {isAnalyzing ? 'Analyzing Document...' : 'Analyze with AI'}
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => handleDownload(selectedDoc)} className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-white/5">
                                    <Download size={14} /> Download
                                </button>
                                <button onClick={() => setIsPropertiesOpen(true)} className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-white/5">
                                    <Settings size={14} /> Properties
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1 bg-white/5 rounded-xl p-4 border border-white/5">
                            <DetailRow label="Matter" value={currentMatter.name || 'Unknown'} />
                            <DetailRow label="Ref" value={currentMatter.id || 'N/A'} />
                            <DetailRow label="Category" value={selectedDoc.category || 'Evidence'} />
                            <DetailRow label="Created" value="Oct 10, 2024" />
                            <DetailRow label="Author" value={selectedDoc.ownerName || 'Paralegal Team'} />
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODALS --- */}

            {/* 1. UPLOAD MODAL */}
            {isUploadOpen && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
                        <button onClick={() => setIsUploadOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={16} /></button>
                        <h3 className="text-lg font-black text-white uppercase mb-1">Smart Upload</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Add files to {currentMatter.name}</p>

                        <div
                            onClick={runUpload}
                            className="bg-white/5 border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#c9a646] hover:bg-[#c9a646]/5 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#c9a646]/20 flex items-center justify-center text-[#c9a646] mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={24} />
                            </div>
                            <p className="text-xs font-bold text-white mb-2">Click to Upload</p>
                            <p className="text-[9px] text-gray-500">Auto-tagging enabled</p>
                        </div>

                        {uploadProgress > 0 && (
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-[9px] font-bold text-white uppercase">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#c9a646] transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. PROPERTIES MODAL */}
            {isPropertiesOpen && selectedDoc && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2"><Settings size={16} className="text-[#c9a646]" /> File Properties</h3>
                            <button onClick={() => setIsPropertiesOpen(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-6">
                            <div>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">File Name</p>
                                <p className="text-xs font-bold text-white truncate">{selectedDoc.name}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">File Size</p>
                                <p className="text-xs font-bold text-white">{selectedDoc.size}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Location</p>
                                <p className="text-xs font-bold text-white truncate">Matter Drives / {currentMatter.name}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Permissions</p>
                                <p className="text-xs font-bold text-[#c9a646]">Restricted (Legal Team)</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">System Path</p>
                                <p className="text-[10px] font-mono text-gray-400 bg-white/5 p-2 rounded truncate select-all">/jkm_vault/{currentMatter.id}/{selectedDoc.name}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsPropertiesOpen(false)} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-black uppercase">Close</button>
                    </div>
                </div>
            )}

            {/* 3. AI ANALYSIS MODAL */}
            {isAnalyzing && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-[#121212] border border-[#c9a646]/30 w-full max-w-2xl rounded-2xl p-8 shadow-2xl relative overflow-hidden">

                        {/* HEADER */}
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase mb-2 flex items-center gap-3">
                                    <Sparkles size={24} className="text-[#c9a646]" />
                                    {analysisStep < 4 ? 'Running Analysis...' : 'JKM Insight Report'}
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Target: {selectedDoc?.name}
                                </p>
                            </div>
                            <button onClick={() => setIsAnalyzing(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>

                        {/* CONTENT BASED ON STEP */}
                        {analysisStep < 4 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 border-4 border-[#c9a646]/20 border-t-[#c9a646] rounded-full animate-spin mb-6"></div>
                                <p className="text-sm font-bold text-white mb-2 animate-pulse">
                                    {analysisStep === 1 && 'Scanning Document Structure...'}
                                    {analysisStep === 2 && 'Extracting Key Entities & Dates...'}
                                    {analysisStep === 3 && 'Generating Legal Summary...'}
                                </p>
                                <p className="text-[10px] text-gray-500 font-mono">Processing 45 Pages / 24,000 Words</p>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-bottom duration-500">
                                <div className="bg-[#c9a646]/5 border border-[#c9a646]/20 rounded-xl p-6 mb-6">
                                    <h4 className="text-[#c9a646] text-xs font-black uppercase tracking-widest mb-3">Executive Summary</h4>
                                    <p className="text-sm text-gray-200 leading-relaxed font-medium">
                                        {analysisResult?.summary}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Risk Assessment</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <span className="text-sm font-bold text-white">{analysisResult?.risk}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Sentiment</span>
                                        <span className="text-sm font-bold text-white">{analysisResult?.sentiment}</span>
                                    </div>
                                </div>

                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
                                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-2 flex items-center gap-2"><AlertCircle size={12} /> Flagged Items</span>
                                    <ul className="space-y-1">
                                        {analysisResult?.flags.map((flag, i) => (
                                            <li key={i} className="text-xs font-bold text-gray-300 flex items-center gap-2">
                                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                {flag}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setIsAnalyzing(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase text-white transition-all">Close</button>
                                    <button className="px-6 py-3 bg-[#c9a646] hover:bg-[#ffe082] rounded-lg text-xs font-black uppercase text-black transition-all shadow-lg flex items-center gap-2">
                                        <Download size={14} /> Export Report
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsPage;


