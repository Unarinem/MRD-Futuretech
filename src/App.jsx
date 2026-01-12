import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive } from './hooks/useResponsive';

import CalendarWeekView from './components/CalendarWeekView';
import CalendarDayView from './components/CalendarDayView';
import CalendarMonthView from './components/CalendarMonthView';
import ClientsPage from './components/ClientsPage';
import DocumentsPage from './components/DocumentsPage';
import EmployeesPage from './components/EmployeesPage';
import TimePage from './components/TimePage';
import BillingPage from './components/BillingPage';
import ReportsPage from './components/ReportsPage';
import ChatPage from './components/ChatPage';
import ClientPortalPage from './components/ClientPortalPage';
import ClientOnboardingPage from './components/ClientOnboardingPage';
import SettingsPage from './components/SettingsPage';
import AccountPage from './components/AccountPage';
import {
    Home, Clock, Clock as ClockIcon, Users, Briefcase, Calendar as CalendarIcon, Plus, CheckSquare,
    MessageSquare, Zap, Activity, AlertCircle, ChevronRight,
    Sparkles, Hash, Play, Square, Save, ArrowRight, X, Send, Menu,
    Settings, LogOut, FileText, Phone, Mail, DollarSign, Flag, Bot, Key,
    PenTool, Search, FileSearch, MoreHorizontal, User, ShieldCheck, TrendingUp,
    CheckCircle, Edit2, Edit, Trash2, Bell, RotateCcw, RotateCw, Paperclip, Filter,
    Pin, Reply, Star, Info, ChevronLeft, Upload, Scissors, MessageCircle,
    Eye, CheckCircle2, AlertTriangle, ShieldAlert, StickyNote, BellRing, ListChecks,
    History, Lock, Unlock, HardDrive, CreditCard, Layout, ChevronDown, List,
    CalendarDays, CalendarRange, MapPin, AlignLeft, Building2, UserCircle,
    HardHat, Shield, UserPlus, FilterX, MailQuestion, ToggleLeft, ToggleRight,
    Receipt, Landmark, History as HistoryIcon, FileCheck, Circle, CheckCircle2 as CheckCircleIcon,
    ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon, Globe, RefreshCw,

    Folder, Folder as FolderIcon, File, Download, ExternalLink, MoreVertical, Archive, Menu as MenuIcon,
    Database, FileSpreadsheet, Grid3x3, HelpCircle, Keyboard, Command, Mic, Volume2,
    FileDown, Calculator, Presentation, Video
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import background from './images/back.jpg';


Chart.register(...registerables);

const FilePreviewIcon = ({ type, size = 16 }) => {
    switch (type?.toLowerCase()) {
        case 'pdf': return <FileText size={size} className="text-red-400" />;
        case 'docx':
        case 'doc': return <FileText size={size} className="text-blue-400" />;
        case 'xlsx':
        case 'csv': return <FileSpreadsheet size={size} className="text-green-400" />;
        case 'png':
        case 'jpg':
        case 'jpeg': return <Eye size={size} className="text-orange-400" />;
        default: return <File size={size} className="text-gray-400" />;
    }
};

// --- Configuration ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'jkm-legal-os';

// --- Utility Components ---
const GlassCard = ({ children, className = "", onClick }) => (
    <div onClick={onClick} className={`glass-card ${className} ${onClick ? 'cursor-pointer hover:border-[#f7d774]/50 transition-colors' : ''}`}>
        {children}
    </div>
);




// Temporary API Key (will be moved to Settings)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ACTIVE_STAFF = {
    id: "emp_001",
    name: "Thabo Maseko",
    initials: "TM",
    role: "Administrator",
    rate: 700,
    email: "thabo@jkm.co.za"
};

// --- Mock Data ---
const MOCK_DATA = {
    financial: {
        utilization: 32, lockup: 84, realization: 89, collection: 96,
        revenueWaterfall: { potential: 1850000, wip: 850000, billed: 620000, collected: 595000 }
    },
    compliance: { trustBank: 2450000, vatForecast: 124500, ficaVerified: 92, bbbeeLevel: 2 },
    growth: { referralROI: 82, digitalROI: 18, concentrationRisk: 8.2 },
    employees: [
        { id: 'emp_001', full_name: 'Thabo Maseko', email: 'thabo@jkm.co.za', role: 'Admin', status: 'Active', created_at: '2024-01-10', matters: 12, tasks: 5, phone: '+27 11 444 5555', initials: 'TM' },
        { id: 'emp_002', full_name: 'Zandile Nkosi', email: 'zandile@jkm.co.za', role: 'Attorney', status: 'Active', created_at: '2024-02-15', matters: 24, tasks: 12, phone: '+27 11 444 5556', initials: 'ZN' },
        { id: 'emp_003', full_name: 'Sipho Dlamini', email: 'sipho@jkm.co.za', role: 'Attorney', status: 'Active', created_at: '2024-03-01', matters: 18, tasks: 8, phone: '+27 11 444 5557', initials: 'SD' },
        { id: 'emp_004', full_name: 'Nthabi Mokoena', email: 'nthabi@jkm.co.za', role: 'Paralegal', status: 'Active', created_at: '2024-05-20', matters: 45, tasks: 32, phone: '+27 11 444 5558', initials: 'NM' },
        { id: 'emp_005', full_name: 'Pieter van Wyk', email: 'pieter@jkm.co.za', role: 'Finance', status: 'Inactive', created_at: '2023-11-12', matters: 0, tasks: 0, phone: '+27 11 444 5559', initials: 'PV' }
    ],
    clients: [
        { id: 'cl_001', name: 'Sipho Mbewe', type: 'Individual', email: 'sipho@mbewe.com', phone: '+27 82 123 4567', status: 'Active', created: '2024-11-10', ref: 'MBE001', mattersCount: 1, address: '124 Garsfontein Rd, Pretoria' },
        { id: 'cl_002', name: 'Mbewe Holdings (Pty) Ltd', type: 'Organization', email: 'admin@mbeweholdings.co.za', phone: '+27 11 987 6543', status: 'Active', created: '2025-01-05', ref: 'MBEH01', mattersCount: 0, address: 'Sandton City Office Tower, Level 14' },
        { id: 'cl_003', name: 'State / SAPS', type: 'Organization', email: 'legal@saps.gov.za', phone: '012 334 1000', status: 'Active', created: '2023-05-20', ref: 'SAPS01', mattersCount: 1, address: 'Pretoria Central' }
    ],
    matters: [
        { id: 'cs_001', name: 'Mbewe v Gwala', ref: '2025-0001', client: 'Sipho Mbewe', clientId: 'cl_001', stage: 'Discovery', category: 'Civil Litigation', status: 'On Track', priority: 'High', team: ['Thabo Maseko', 'Zandile Nkosi', 'Nthabi Mokoena'], opened: '2025-01-10', activity: '2h ago', trustBalance: 12500, description: "Main litigation regarding land boundary dispute and property access rights." },
        { id: 'cs_002', name: 'SAPS v Dlamini', ref: '2025-0003', client: 'State', clientId: 'cl_003', stage: 'Trial Prep', category: 'Criminal Defense', status: 'Urgent', priority: 'High', team: ['Sipho Dlamini', 'Nthabi Mokoena'], opened: '2025-02-15', activity: '15m ago', trustBalance: 0, description: "Criminal defense regarding public order charges following regional protests." },
        { id: 'cs_003', name: 'Estate of Van Wyk', ref: '2025-0012', client: 'L. Van Wyk', clientId: 'cl_001', stage: 'Initial Intake', category: 'Trusts & Estates', status: 'Blocked', priority: 'Normal', team: ['Thabo Maseko'], opened: '2025-03-01', activity: '1d ago', trustBalance: 45000, description: "Estate winding up and distribution of cross-border assets and trusts." }
    ],
    calendar: [
        {
            id: 'ev_1',
            title: 'Hearing: Mbewe Summons',
            start: '2026-01-10T10:00:00',
            end: '2026-01-10T12:00:00',
            type: 'EVENT',
            category: 'Court',
            matterId: 'cs_001',
            description: 'Mandatory court appearance. High Court, Pretoria.',
            location: 'High Court, Pretoria',
            attendees: ['emp_001', 'emp_002'],
            createdBy: 'emp_001',
            createdAt: '2026-01-05T09:00:00',
            allDay: false,
            googleEventId: 'g_123',
            googleCalendarId: 'primary',
            lastSyncedAt: new Date(Date.now() - 120000).toISOString(),
            syncStatus: 'synced',
            activityLog: [
                { timestamp: '2026-01-05T09:00:00', action: 'Event Created', user: 'Thabo Maseko', details: 'Court hearing scheduled' },
                { timestamp: '2026-01-06T14:20:00', action: 'Synced to Google', user: 'System', details: 'Event mirrored to Google Calendar' }
            ]
        },
        {
            id: 'ev_2',
            title: 'Consultation: Dlamini',
            start: '2026-01-12T14:30:00',
            end: '2026-01-12T15:30:00',
            type: 'EVENT',
            category: 'Consultation',
            matterId: 'cs_002',
            description: 'Client consultation regarding defense strategy.',
            location: 'JKM Office - Conference Room A',
            attendees: ['emp_003', 'emp_004'],
            createdBy: 'emp_003',
            createdAt: '2026-01-07T11:00:00',
            allDay: false,
            googleEventId: 'g_124',
            googleCalendarId: 'primary',
            lastSyncedAt: new Date(Date.now() - 180000).toISOString(),
            syncStatus: 'synced',
            activityLog: [
                { timestamp: '2026-01-07T11:00:00', action: 'Event Created', user: 'Sipho Dlamini', details: 'Consultation scheduled' }
            ]
        },
        {
            id: 'tk_1',
            title: 'DEADLINE: Filing SAPS',
            start: '2026-01-15T16:00:00',
            end: '2026-01-15T17:00:00',
            type: 'TASK',
            category: 'Deadline',
            matterId: 'cs_002',
            description: 'Submit final defense filing to court registry.',
            location: null,
            attendees: ['emp_003'],
            createdBy: 'emp_003',
            createdAt: '2026-01-06T09:00:00',
            allDay: false,
            completed: false,
            completedAt: null,
            googleEventId: null,
            googleCalendarId: null,
            lastSyncedAt: null,
            syncStatus: 'local-only',
            activityLog: [
                { timestamp: '2026-01-06T09:00:00', action: 'Task Created', user: 'Sipho Dlamini', details: 'Deadline set for court filing' }
            ]
        },
        {
            id: 'nt_1',
            title: 'Site Visit: Garsfontein',
            start: '2026-01-08T09:00:00',
            end: '2026-01-08T11:00:00',
            type: 'NOTE',
            category: 'Internal',
            matterId: 'cs_001',
            description: 'Property inspection for boundary dispute evidence.',
            location: '124 Garsfontein Rd, Pretoria',
            attendees: ['emp_001', 'emp_004'],
            createdBy: 'emp_001',
            createdAt: '2026-01-05T16:00:00',
            allDay: false,
            googleEventId: 'g_125',
            googleCalendarId: 'primary',
            lastSyncedAt: new Date(Date.now() - 900000).toISOString(),
            syncStatus: 'synced',
            activityLog: [
                { timestamp: '2026-01-05T16:00:00', action: 'Note Created', user: 'Thabo Maseko', details: 'Site visit scheduled for evidence gathering' }
            ]
        },
        {
            id: 'ev_3',
            title: 'Team Briefing: Weekly Sync',
            start: '2026-01-09T08:30:00',
            end: '2026-01-09T09:30:00',
            type: 'EVENT',
            category: 'Internal',
            matterId: null,
            description: 'Weekly firm-wide briefing and case updates.',
            location: 'JKM Office - Main Conference',
            attendees: ['emp_001', 'emp_002', 'emp_003', 'emp_004'],
            createdBy: 'emp_001',
            createdAt: '2026-01-02T10:00:00',
            allDay: false,
            googleEventId: 'g_126',
            googleCalendarId: 'primary',
            lastSyncedAt: new Date(Date.now() - 60000).toISOString(),
            syncStatus: 'synced',
            activityLog: [
                { timestamp: '2026-01-02T10:00:00', action: 'Event Created', user: 'Thabo Maseko', details: 'Recurring weekly meeting scheduled' }
            ]
        }
    ],
    pulse: { timeToday: "2h 15m", billedToday: "R 8k", activeTimekeepers: 1 },
    billingAlerts: [{ id: 'a1', client: "Mbewe Holdings", amount: 12500.00, daysOverdue: 14, invoiceRef: "INV-1024" }],
    documents: [
        { id: 'dr_001', name: 'Litigation_Strategy_V1.docx', type: 'doc', size: '2.4 MB', owner: 'Zandile Nkosi', modifiedTime: '2025-01-12T14:20:00', matterId: 'cs_001', status: 'Active', isSharedWithClient: true, driveUrl: 'https://docs.google.com/document/d/1NhjPAKnbGCzIogS5tDtLFAFSvGHk9ROE8mQyiF7kWZ8/preview' },
        { id: 'dr_002', name: 'Criminal_Evidence_Registry.pdf', type: 'pdf', size: '4.8 MB', owner: 'Sipho Dlamini', modifiedTime: '2025-02-16T09:15:00', matterId: 'cs_002', status: 'Active', isSharedWithClient: false, driveUrl: 'https://drive.google.com/file/d/1XkSpfFSDy8DUP4SbPNuOdNFtC9lPMBNq/preview' },
        { id: 'dr_003', name: 'Financial_Ledger_Extract.xlsx', type: 'xls', size: '1.2 MB', owner: 'Thabo Maseko', modifiedTime: '2025-03-02T16:45:00', matterId: 'cs_001', status: 'Active', isSharedWithClient: true, driveUrl: 'https://docs.google.com/spreadsheets/d/11MqdY-L4BL-HaP87pNySRdnzL-yh30k0xGH3pOErbg4/preview' },
        { id: 'dr_004', name: 'Court_Brief_Presentation.pptx', type: 'ppt', size: '15.6 MB', owner: 'Nthabi Mokoena', modifiedTime: '2025-01-10T11:00:00', matterId: 'cs_001', status: 'Active', isSharedWithClient: false, driveUrl: 'https://docs.google.com/presentation/d/1ViR-iObLRwfAkAdyXskZvr1AoDx6nHfanQZ2l5GVAro/preview' },
        { id: 'dr_005', name: 'FICA_Compliance_Audit.pdf', type: 'pdf', size: '3.1 MB', owner: 'Thabo Maseko', modifiedTime: '2025-01-08T07:00:00', matterId: 'cs_003', status: 'Active', isSharedWithClient: false, driveUrl: 'https://drive.google.com/file/d/1-1SNBAGaOFZA1vaArC4tobbPkaLwFHqo/preview' },
        { id: 'dr_006', name: 'SAPS_Statement_Archive.pdf', type: 'pdf', size: '1.9 MB', owner: 'Sipho Dlamini', modifiedTime: '2025-01-08T08:00:00', matterId: 'cs_002', status: 'Active', isSharedWithClient: true, driveUrl: 'https://drive.google.com/file/d/1AlT0LtEAwi9VNjvljv7akWRAw3968OFR/preview' }
    ]
};

// --- Shared UI Components ---

const TaskDetailModal = ({ task, onClose, matter, onToggleCompletion, onEdit }) => {
    if (!task) return null;
    return (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <GlassCard className="w-full max-w-lg border-l-4 border-l-[#c9a646]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-black text-white mb-1">{task.title}</h3>
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${task.priority === 'Urgent' ? 'bg-red-500 text-white' : 'bg-[#c9a646] text-black'}`}>{task.priority}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">{task.dueDate}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="bg-white/5 p-4 rounded-lg mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm text-gray-200 leading-relaxed">{task.description || "No detailed description provided for this task."}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Assigned To</p>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#c9a646] flex items-center justify-center text-[10px] font-black text-black">
                                {MOCK_DATA.employees.find(e => e.id === task.assignedTo)?.initials || '??'}
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-tight">
                                {MOCK_DATA.employees.find(e => e.id === task.assignedTo)?.full_name || 'Unassigned Force'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Related Matter</p>
                        <p className="text-sm font-bold text-[#f7d774] truncate">{matter?.name || "General Registry"}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => { onToggleCompletion(task.id); onClose(); }}
                        className={`flex-1 btn ${task.completed ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-[#c9a646] hover:bg-white text-black'}`}
                    >
                        {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button onClick={() => { onClose(); onEdit(task); }} className="flex-1 py-3 rounded border border-white/10 text-xs font-black uppercase hover:bg-white/5 hover:border-[#c9a646] transition-all">Edit Task</button>
                </div>
            </GlassCard>
        </div>
    );
};




const DocumentPreviewModal = ({ doc, onClose }) => {
    if (!doc) return null;
    return (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
            <div className="w-full max-w-5xl h-full flex flex-col gap-6">
                <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#c9a646] flex items-center justify-center text-black">
                            {doc.typeFamily === 'Image' ? <Eye size={20} /> : <FileText size={20} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-widest leading-none mb-1">{doc.name}</h2>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{doc.size || '3.2 MB'} • {doc.typeFamily || 'Legal Artifact'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
                </div>

                <div className="flex-1 bg-white border-8 border-white rounded-3xl overflow-hidden relative shadow-2xl flex flex-col">
                    {doc.driveUrl ? (
                        <iframe src={doc.driveUrl} className="w-full h-full border-none shadow-inner" title="Artifact Registry Sync" />
                    ) : doc.typeFamily === 'Image' ? (
                        <div className="h-full w-full bg-black/10 flex items-center justify-center p-4">
                            <img src={doc.url || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop"} alt="Preview" className="max-h-full max-w-full rounded shadow-2xl object-contain" />
                        </div>
                    ) : (
                        <div className="h-full w-full bg-gray-50 flex flex-col overflow-y-auto custom-scrollbar-light p-12 text-black font-serif">
                            <div className="max-w-3xl mx-auto w-full space-y-12">
                                <div className="flex justify-between items-start border-b border-black pb-8">
                                    <img src="https://lh3.googleusercontent.com/d/1nk7qVGHgMPwlH3U29gHtglkxu1yNAZaD" alt="Logo" className="h-10 grayscale brightness-0" />
                                    <div className="text-right text-[8px] font-black uppercase space-y-1">
                                        <p className="text-red-600">STRICTLY CONFIDENTIAL</p>
                                        <p>REF: {doc.id?.toUpperCase().slice(0, 8)}</p>
                                        <p>DATE: {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter text-center">{doc.name.replace(/\.[^/.]+$/, "")}</h1>
                                <div className="space-y-6 text-sm leading-relaxed text-justify">
                                    <div className="bg-black/5 p-6 rounded-lg mb-8 border-l-4 border-black">
                                        <p className="text-[10px] font-black uppercase mb-2">NEURAL SCAN SUMMARY</p>
                                        <p>Initial discourse analysis suggests this artifact contains high-priority evidentiary directives correlated with the active matter. Attorney-client privilege is strictly maintained via the JKM Security Protocol.</p>
                                    </div>
                                    <p>The strategic trajectory of this matter is heavily influenced by the contents herein. Personnel are advised to cross-reference these artifacts with the Gemini Intelligence Nexus to ensure jurisdictional alignment.</p>
                                    <div className="py-12 space-y-4 opacity-10">
                                        <div className="h-3 bg-black rounded w-full"></div>
                                        <div className="h-3 bg-black rounded w-11/12"></div>
                                        <div className="h-3 bg-black rounded w-full"></div>
                                        <div className="h-3 bg-black rounded w-4/5"></div>
                                        <div className="h-3 bg-black rounded w-full"></div>
                                        <div className="h-3 bg-black rounded w-11/12"></div>
                                    </div>
                                    <div className="pt-12 border-t border-gray-200 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black uppercase italic">Electronically Certified by</p>
                                            <p className="text-lg font-black uppercase tracking-tighter">Gemini Law Navigator</p>
                                        </div>
                                        <div className="w-24 h-24 border border-black/10 flex items-center justify-center opacity-20">
                                            <Shield size={48} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-center gap-4">
                    <button className="btn px-12 bg-[#c9a646] text-black">Download Artifact</button>
                    <button onClick={onClose} className="btn px-12 bg-white/5 text-white border border-white/10 hover:bg-white/10">Dismiss View</button>
                </div>
            </div>
        </div>
    );
};

const NotificationDropdown = ({ notifications = [], onManage, onMarkAllRead, onSelect, onClose }) => {
    const sorted = [...(notifications || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const unreadCount = (notifications || []).filter(n => !n.read).length;

    const getIcon = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('matter')) return <Briefcase size={12} />;
        if (t.includes('compliance')) return <ShieldCheck size={12} />;
        if (t.includes('ai')) return <Sparkles size={12} />;
        if (t.includes('task') || t.includes('assign')) return <ListChecks size={12} />;
        if (t.includes('system')) return <AlertTriangle size={12} />;
        return <Bell size={12} />;
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-orange-500';
            case 'low': return 'text-blue-500';
            default: return 'text-[#c9a646]';
        }
    };

    return (
        <div className="absolute top-10 right-0 w-96 bg-[#121212] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-white/5 bg-[#c9a646]/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a646]">Registry Notifications</span>
                    <span className="bg-[#c9a646] text-black text-[8px] font-black px-1.5 py-0.5 rounded-full">{notifications.length}</span>
                </div>
                {unreadCount > 0 && (
                    <button onClick={onMarkAllRead} className="text-[9px] font-bold text-gray-500 hover:text-white uppercase transition-colors">Mark all read</button>
                )}
            </div>
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {sorted.length > 0 ? (
                    sorted.map(notif => (
                        <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group ${notif.read ? 'opacity-50 grayscale-[0.5]' : ''}`} onClick={() => { onSelect(notif.id); }}>
                            <div className="flex items-center justify-between mb-2">
                                <div className={`flex items-center gap-2 ${getSeverityColor(notif.severity)}`}>
                                    {getIcon(notif.type)}
                                    <span className="text-[8px] font-black uppercase opacity-80">{notif.type}</span>
                                </div>
                                <span className="text-[7px] text-gray-600 uppercase font-bold">{new Date(notif.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <h4 className="text-sm font-black text-white mb-1 group-hover:text-[#c9a646] transition-colors">{notif.title}</h4>
                            <p className="text-[11px] text-gray-400 leading-relaxed mb-3">{notif.message}</p>

                            {notif.matterId && !notif.read && (
                                <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => onSelect(notif.id, 'Overview')}
                                        className="px-2 py-1 bg-[#c9a646]/10 border border-[#c9a646]/30 text-[#c9a646] text-[8px] font-black uppercase rounded hover:bg-[#c9a646] hover:text-black transition-all"
                                    >
                                        Open Matter
                                    </button>
                                    <button
                                        onClick={() => onSelect(notif.id, 'Documents')}
                                        className="px-2 py-1 bg-white/5 border border-white/10 text-gray-400 text-[8px] font-black uppercase rounded hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        View Documents
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center opacity-20">
                        <Bell size={48} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No notifications in registry</p>
                    </div>
                )}
            </div>
            <button onClick={onManage} className="w-full py-4 bg-white/5 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#c9a646] hover:text-black transition-all">Archive Browser</button>
        </div>
    );
};

const StatBox = ({ label, value, sub, trend, colorClass = "text-white" }) => (
    <GlassCard className="group hover:border-[#f7d774] transition-all duration-300">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
            {trend && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${trend < 0 ? 'text-red-400 bg-red-900/30' : 'text-green-400 bg-green-900/30'}`}>
                    {trend}%
                </span>
            )}
        </div>
        <div className={`text-2xl font-black mb-1 ${colorClass}`}>{value}</div>
        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">{sub}</div>
    </GlassCard>
);

const WaterfallItem = ({ label, amount, total, colorClass }) => (
    <div className="relative">
        <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{label}</span>
            <span className="text-xs font-black text-white">R {(amount / 1000).toFixed(0)}k</span>
        </div>
        <div className="w-full bg-white/5 h-4 rounded shadow-inner overflow-hidden border border-white/5">
            <div className={`h-full ${colorClass} transition-all duration-1000`} style={{ width: `${(amount / total) * 100}%` }}></div>
        </div>
    </div>
);

// --- MODAL COMPONENTS FOR ALERTS AND MATTERS ---

const AlertDetailModal = ({ alert, onClose }) => {
    if (!alert) return null;
    return (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <GlassCard className="w-full max-w-lg border-l-4 border-l-red-500" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-black text-white mb-1">Critical Alert</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500 text-white">OVERDUE</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">{alert.daysOverdue} Days</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="bg-white/5 p-4 rounded-lg mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Client</p>
                    <p className="text-lg font-bold text-white mb-4">{alert.client}</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Amount Due</p>
                            <p className="text-2xl font-black text-red-500">R {alert.amount.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Invoice Ref</p>
                            <p className="text-lg font-bold text-white">{alert.invoiceRef}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 btn bg-[#c9a646] hover:bg-white text-black">Send Reminder</button>
                    <button onClick={onClose} className="flex-1 py-3 rounded border border-white/10 text-xs font-black uppercase hover:bg-white/5 hover:border-[#c9a646] transition-all">View Invoice</button>
                </div>
            </GlassCard>
        </div>
    );
};

const MatterDetailModal = ({ matter, onClose, setActiveTab, setSelectedMatterIntent }) => {
    if (!matter) return null;
    return (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <GlassCard className="w-full max-w-2xl border-l-4 border-l-[#c9a646]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-black text-white mb-1">{matter.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${matter.status === 'Urgent' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{matter.status}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">{matter.ref}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="bg-white/5 p-4 rounded-lg mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm text-gray-200 leading-relaxed">{matter.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Client</p>
                        <p className="text-sm font-bold text-white">{matter.client}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Attorney</p>
                        <p className="text-sm font-bold text-[#f7d774]">{matter.attorney}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Stage</p>
                        <p className="text-sm font-bold text-white">{matter.stage}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => { if (setActiveTab) setActiveTab('Matters'); if (setSelectedMatterIntent) setSelectedMatterIntent('Overview'); onClose(); }}
                        className="flex-1 btn bg-[#c9a646] hover:bg-white text-black font-black uppercase tracking-widest"
                    >
                        Open Matter
                    </button>
                    <button
                        onClick={() => { if (setActiveTab) setActiveTab('Matters'); if (setSelectedMatterIntent) setSelectedMatterIntent('Documents'); onClose(); }}
                        className="flex-1 py-3 rounded border border-white/10 text-xs font-black uppercase hover:bg-white/5 hover:border-[#c9a646] transition-all"
                    >
                        View Documents
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

const EventDetailModal = ({ event, onClose, matter, setActiveTab }) => {
    if (!event) return null;
    const eventDate = new Date(event.start);
    const endDate = new Date(event.end);

    return (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <GlassCard className="w-full max-w-lg border-l-4 border-l-blue-500" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-black text-white mb-1">{event.title}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-500 text-white">{event.type}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">{eventDate.toLocaleDateString('en-GB')}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="bg-white/5 p-4 rounded-lg mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Details</p>
                    <p className="text-sm text-gray-200 leading-relaxed">{event.description || "No description provided."}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Start Time</p>
                        <p className="text-sm font-bold text-white">{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">End Time</p>
                        <p className="text-sm font-bold text-white">{endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>

                {matter && (
                    <div className="bg-white/5 p-3 rounded-lg mb-6">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Related Matter</p>
                        <p className="text-sm font-bold text-[#f7d774]">{matter.name}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={() => { onClose(); setActiveTab('Calendar'); }} className="flex-1 btn bg-[#c9a646] hover:bg-white text-black">View in Calendar</button>
                    <button onClick={onClose} className="flex-1 py-3 rounded border border-white/10 text-xs font-black uppercase hover:bg-white/5 hover:border-[#c9a646] transition-all">Close</button>
                </div>
            </GlassCard>
        </div>
    );
};

// --- 6-PANEL PERSONAL HUB COMPONENT (ANIMATED & RESPONSIVE) ---

const PersonalHubPage = ({ tasks, matters, pulse, setActiveTab, openQuickAdd, timerActive, toggleTimer, timerSeconds, setTimerMatter, timerMatter, toggleTaskCompletion, onTaskClick, onAlertClick, onMatterClick, onEventClick }) => {
    const { isMobile, isDesktop } = useResponsive();

    // Sort tasks
    const myPriorities = useMemo(() => {
        return tasks
            .filter(t => (t.assignedTo === ACTIVE_STAFF.id || t.assignedTo === 'emp_001' || !t.assignedTo) && !t.completed)
            .sort((a, b) => {
                if (a.priority === 'Urgent' && b.priority !== 'Urgent') return -1;
                if (a.priority !== 'Urgent' && b.priority === 'Urgent') return 1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            }).slice(0, 5);
    }, [tasks]);

    // AI Insight Handlers
    const handleReviewFile = () => setActiveTab('Documents');
    const handleDismissAI = () => {
        const bubble = document.getElementById('ai-insight-bubble');
        if (bubble) bubble.style.display = 'none';
    };

    const urgentCount = myPriorities.filter(t => t.priority === 'Urgent' || t.priority === 'High').length;
    const now = new Date();
    const getGreeting = () => 'Hello';

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: isMobile ? 0.05 : 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: isMobile ? 10 : 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: isMobile ? "tween" : "spring", stiffness: 50 }
        }
    };

    return (
        <motion.div
            className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-20 pb-32"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >

            {/* 1. Welcome Banner */}
            <motion.div variants={itemVariants}>
                <GlassCard className="p-0 overflow-hidden relative bg-gradient-to-r from-[#1a1a1a] via-[#121212] to-black border-l-4 border-l-[#c9a646]">
                    <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8">
                        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                            <motion.div
                                className="relative shrink-0"
                                whileHover={isDesktop ? { scale: 1.1, rotate: 5 } : {}}
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#c9a646] flex items-center justify-center bg-black/80 text-white font-black text-xl md:text-2xl shadow-lg shadow-[#c9a646]/30">
                                    {ACTIVE_STAFF.initials}
                                </div>
                                <div className="absolute bottom-1 right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-4 border-[#121212] animate-pulse"></div>
                            </motion.div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1 md:mb-2 truncate">Welcome, {ACTIVE_STAFF.name.split(' ')[0]}</h2>
                                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                                    <span className="bg-[#c9a646]/20 px-2 md:px-3 py-1 rounded text-[9px] md:text-[10px] uppercase font-black text-[#c9a646] tracking-widest">{ACTIVE_STAFF.role}</span>
                                    <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Insight Bubble */}
                        <div id="ai-insight-bubble" className="hidden md:block flex-1 mx-12">
                            <div className="bg-[#1a1a1a] border border-white/5 p-4 rounded-xl relative">
                                <div className="absolute -left-2 top-6 w-4 h-4 bg-[#1a1a1a] transform rotate-45 border-l border-b border-white/5"></div>
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-[#c9a646] mt-1 shrink-0 animate-pulse" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-200 leading-snug">
                                            {getGreeting()}, {ACTIVE_STAFF.initials}. You have <span className="text-white border-b-2 border-red-500">{urgentCount} urgent deadlines</span> approaching.
                                        </p>
                                        <div className="flex gap-4 mt-2">
                                            <motion.button
                                                onClick={handleReviewFile}
                                                whileHover={{ x: 5 }}
                                                className="text-[10px] font-black uppercase text-[#c9a646] hover:text-white transition-colors flex items-center gap-1"
                                            >
                                                Review File <ChevronRight size={10} />
                                            </motion.button>
                                            <button onClick={handleDismissAI} className="text-[10px] font-black uppercase text-gray-600 hover:text-gray-400 transition-colors">Dismiss</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* 2. Daily Pulse Section */}
            <motion.div variants={itemVariants}>
                <GlassCard className="border-l-4 border-l-[#c9a646]">
                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <Zap className="w-5 h-5 text-[#c9a646]" />
                        <h3 className="text-[#f7d774] font-black uppercase text-sm tracking-widest">Daily Pulse</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-4">
                        {[
                            { label: 'Utilization', val: '32%', icon: TrendingUp, color: 'white', iconColor: 'text-blue-500' },
                            { label: 'Time Logged', val: pulse.timeToday, icon: Clock, color: 'white', iconColor: 'text-purple-500' },
                            { label: 'Billed', val: pulse.billedToday, icon: DollarSign, color: '#f7d774', iconColor: 'text-[#c9a646]' },
                            { label: 'Staff Active', val: pulse.activeTimekeepers, icon: Users, color: 'white', iconColor: 'text-blue-500' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                className="text-center p-2 md:p-0 bg-white/5 md:bg-transparent rounded-lg md:rounded-none"
                                whileHover={isDesktop ? { scale: 1.05, y: -5 } : {}}
                            >
                                <p className="text-[9px] md:text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">{stat.label}</p>
                                <p className={`text-2xl md:text-3xl font-black mb-1`} style={{ color: stat.color }}>{stat.val}</p>
                                <stat.icon className={`${stat.iconColor} w-4 h-4 md:w-5 md:h-5 mx-auto opacity-50`} />
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* LEFT COLUMN */}
                <motion.div className="space-y-6" variants={itemVariants}>
                    <GlassCard className="border-t-4 border-t-[#c9a646] flex flex-col max-h-[500px] md:max-h-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[#f7d774] font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                <CheckSquare className="w-4 h-4" /> Priority Stack
                            </h3>
                            <motion.button
                                onClick={() => openQuickAdd('task')}
                                whileTap={{ scale: 0.95 }}
                                whileHover={isDesktop ? { scale: 1.05 } : {}}
                                className="text-[10px] bg-white/10 hover:bg-[#c9a646] hover:text-black px-3 py-2 md:py-1.5 rounded-lg md:rounded transition-colors font-bold flex items-center gap-2 touch-manipulation"
                            >
                                <Plus size={14} /> <span className="hidden md:inline">New Task</span><span className="md:hidden">Add</span>
                            </motion.button>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {myPriorities.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-xs uppercase font-bold tracking-widest text-gray-500">No Priority Items</p>
                                </div>
                            ) : myPriorities.map((t, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={isDesktop ? { scale: 1.02, x: 5 } : {}}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#c9a646]/50 transition-colors group cursor-pointer"
                                >
                                    <div onClick={() => toggleTaskCompletion(t.id)} className="text-gray-600 hover:text-green-500 transition-colors p-1">
                                        <Circle size={24} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0" onClick={() => onTaskClick(t)}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${t.priority === 'Urgent' ? 'bg-red-500/20 text-red-500' : 'bg-[#c9a646]/20 text-[#c9a646]'}`}>{t.priority}</span>
                                            <span className="text-[10px] font-black uppercase text-gray-500">{t.dueDate}</span>
                                        </div>
                                        <p className="text-sm font-bold text-white group-hover:text-[#f7d774] truncate">{t.title}</p>
                                        <p className="text-[10px] text-gray-500 truncate font-mono mt-1">{matters.find(m => m.id === t.matterId)?.name || 'General Task'}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Critical Alerts */}
                    <GlassCard className="border-t-4 border-t-red-500 bg-red-500/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-red-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2"><AlertCircle className="w-4 h-4 animate-pulse" /> Critical Alerts</h3>
                            <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-black">3 Active</span>
                        </div>
                        <div className="space-y-2">
                            {/* Static Alerts Refactored to Loop for cleaner code */}
                            {[
                                { icon: DollarSign, color: 'text-red-500', title: MOCK_DATA.billingAlerts[0].client, sub: `${MOCK_DATA.billingAlerts[0].daysOverdue} Days Overdue`, val: `R ${MOCK_DATA.billingAlerts[0].amount.toLocaleString()}`, action: () => onAlertClick(MOCK_DATA.billingAlerts[0]) },
                                { icon: AlertTriangle, color: 'text-orange-500', title: 'Court Filing Deadline', sub: 'Due Tomorrow', action: () => setActiveTab('Tasks') },
                                { icon: ShieldAlert, color: 'text-yellow-500', title: 'FICA Verification Pending', sub: '2 Clients', action: () => setActiveTab('Clients') }
                            ].map((alert, i) => (
                                <motion.div
                                    key={`alert-${i}`}
                                    onClick={alert.action}
                                    whileHover={isDesktop ? { x: 5, backgroundColor: 'rgba(239, 68, 68, 0.1)' } : {}}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center justify-between p-3 md:p-3 p-4 rounded-xl bg-black/40 border border-white/5 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center gap-3 md:gap-2">
                                        <alert.icon size={16} className={`${alert.color} shrink-0`} />
                                        <div>
                                            <p className={`text-xs md:text-xs text-sm font-bold text-white group-hover:${alert.color.replace('text-', 'text-')} transition-colors`}>{alert.title}</p>
                                            <span className={`text-[9px] ${alert.color.replace('text-', 'text-')} font-bold uppercase`}>{alert.sub}</span>
                                        </div>
                                    </div>
                                    {alert.val && <div className="text-right"><p className="text-xs md:text-xs text-sm font-black text-red-500">{alert.val}</p></div>}
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Upcoming Events */}
                    <GlassCard className="border-t-4 border-t-blue-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-blue-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" /> Upcoming Events
                            </h3>
                            <button onClick={() => setActiveTab('Calendar')} className="text-[#c9a646] hover:text-white transition-colors p-2 -mr-2">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {MOCK_DATA.calendar.filter(e => e.type === 'EVENT').slice(0, 3).map((event, i) => {
                                const eventDate = new Date(event.start);
                                const isToday = eventDate.toDateString() === new Date().toDateString();
                                return (
                                    <motion.div
                                        key={i}
                                        onClick={() => onEventClick(event)}
                                        whileHover={isDesktop ? { x: 5, backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-blue-500/20 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex-shrink-0 text-center">
                                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex flex-col items-center justify-center">
                                                <p className="text-[10px] font-black text-blue-400 uppercase">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</p>
                                                <p className="text-lg font-black text-white">{eventDate.getDate()}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">{event.title}</p>
                                            <p className="text-[9px] text-gray-500 uppercase mt-1">
                                                {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* RIGHT COLUMN */}
                <motion.div className="space-y-6" variants={itemVariants}>

                    {/* Fee Timer Card */}
                    <GlassCard className="relative overflow-hidden bg-gradient-to-br from-black to-[#1a1a1a] border-white/10">
                        {timerActive && (
                            <motion.div
                                className="absolute inset-0 border-2 border-red-500/20 rounded-xl pointer-events-none"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-black uppercase text-xs tracking-widest">Fee Timer</h3>
                            {timerActive && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
                        </div>

                        <div className="text-center py-6 md:py-8 bg-black/40 rounded-xl border border-white/5 mb-4 shadow-inner">
                            <span className="text-5xl md:text-6xl font-mono font-bold text-white tracking-tighter block tabular-nums">
                                {new Date(timerSeconds * 1000).toISOString().substr(11, 8)}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <select value={timerMatter} onChange={e => setTimerMatter(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 md:p-3 p-4 text-xs md:text-xs text-sm text-gray-300 focus:border-[#c9a646] outline-none font-bold uppercase transition-all">
                                <option value="">Select Matter...</option>
                                {matters.map(m => <option key={m.id} value={m.ref}>{m.name}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleTimer}
                                    className={`py-3 md:py-3 py-4 rounded-lg font-black text-xs md:text-xs text-sm uppercase tracking-widest transition-all ${timerActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-600 text-white hover:bg-green-500'}`}
                                >
                                    {timerActive ? 'Stop' : 'Start'}
                                </motion.button>
                                <button className="bg-white/5 hover:bg-white/10 rounded-lg font-black text-xs md:text-xs text-sm uppercase text-gray-400">Sync</button>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Quick Actions Grid */}
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-gray-500 font-black uppercase text-xs tracking-widest">Quick Actions</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Matter', icon: Briefcase, action: () => openQuickAdd('matter') },
                                { label: 'Event', icon: CalendarIcon, action: () => openQuickAdd('event') },
                                { label: 'Client', icon: UserPlus, action: () => openQuickAdd('client') },
                                { label: 'Log Time', icon: Clock, action: () => openQuickAdd('time') }
                            ].map((btn, i) => (
                                <motion.button
                                    key={i}
                                    onClick={btn.action}
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={isDesktop ? { scale: 1.05, backgroundColor: 'rgba(201, 166, 70, 0.1)', borderColor: '#c9a646' } : {}}
                                    className="bg-white/5 border border-white/5 py-2 md:py-2 py-3 rounded text-[10px] md:text-[10px] text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <btn.icon size={14} className="text-[#c9a646] group-hover:text-white transition-colors" />
                                    <span className="group-hover:text-white text-gray-300">{btn.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Active Matters */}
                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-black uppercase text-xs tracking-widest">Active Matters</h3>
                            <button onClick={() => setActiveTab('Matters')} className="text-[#c9a646] hover:text-white transition-colors p-2 -mr-2">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {matters.slice(0, 3).map((m, i) => (
                                <motion.div
                                    key={i}
                                    onClick={() => onMatterClick(m)}
                                    whileHover={isDesktop ? { x: 5, backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center justify-between group cursor-pointer p-2 rounded -mx-2 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs md:text-xs text-sm font-bold text-white truncate group-hover:text-[#f7d774]">{m.name}</p>
                                        <p className="text-[9px] text-gray-500 uppercase">{m.ref}</p>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${m.status === 'Urgent' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>{m.status}</span>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Apps Quick Access */}
                    <GlassCard className="border-t-2 border-t-[#c9a646]/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-black uppercase text-xs tracking-widest">Quick Apps</h3>
                            <button onClick={() => setActiveTab('Apps')} className="text-[#c9a646] hover:text-white transition-colors p-2 -mr-2">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { name: 'Gemini AI', icon: Sparkles, color: 'text-blue-400', url: 'https://gemini.google.com' },
                                { name: 'Docs', icon: FileText, color: 'text-blue-500', url: 'https://docs.google.com' },
                                { name: 'Drive', icon: HardDrive, color: 'text-yellow-500', url: 'https://drive.google.com' },
                                { name: 'Calendar', icon: CalendarIcon, color: 'text-blue-500', url: 'https://calendar.google.com' }
                            ].map((app, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => window.open(app.url, '_blank')}
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={isDesktop ? { scale: 1.05, borderColor: '#c9a646' } : {}}
                                    className="bg-white/5 p-3 rounded border border-white/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-2">
                                        <app.icon size={16} className={`${app.color} group-hover:text-[#c9a646] transition-colors`} />
                                        <div className="text-left min-w-0">
                                            <p className="text-[10px] font-bold text-white truncate">{app.name}</p>
                                            <p className="text-[8px] text-gray-500">Linked</p>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </motion.div>
    );
};


// --- MATTERS TAB (V1) - THE GRAVITATIONAL CORE ---
const MattersPage = ({ matters, tasks, documents, billingEntries = [], events = [], auditTrail, setAuditTrail, setBillingEntries, data, setActiveTab, openQuickAdd, toggleTaskCompletion, onTaskClick, setMatters, setTasks, onEditTask, chatState, setChatState, initialMatterId, initialSubTab }) => {
    const [selectedMatterId, setSelectedMatterId] = useState(initialMatterId || null);
    const [detailTab, setDetailTab] = useState(initialSubTab || 'Overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [showStatementPreview, setShowStatementPreview] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [genDocModal, setGenDocModal] = useState(null);
    const [notification, setNotification] = useState(null); // { type, message }

    useEffect(() => {
        if (initialMatterId) setSelectedMatterId(initialMatterId);
        if (initialSubTab) setDetailTab(initialSubTab);
    }, [initialMatterId, initialSubTab]);

    const notify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };
    const [newMsg, setNewMsg] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);

    const selectedMatter = useMemo(() =>
        matters.find(m => m.id === selectedMatterId), [matters, selectedMatterId]
    );

    const activeChannel = useMemo(() =>
        chatState.channels.find(c => c.matterId === selectedMatterId), [chatState.channels, selectedMatterId]
    );

    const channelMessages = useMemo(() =>
        chatState.messages.filter(m => m.channelId === activeChannel?.id), [chatState.messages, activeChannel]
    );

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        } else {
            clearInterval(timerRef.current);
            setRecordingTime(0);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                handleSendVoice(blob);
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) { alert("Microphone access denied."); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
    };

    const handleSendVoice = (blob) => {
        const voiceMsg = { id: `msg_${Date.now()}`, channelId: activeChannel.id, senderId: ACTIVE_STAFF.id, senderName: ACTIVE_STAFF.name, role: 'Me', content: "Voice Note", timestamp: new Date().toISOString(), type: 'voice', audioUrl: URL.createObjectURL(blob) };
        setChatState(prev => ({ ...prev, messages: [...prev.messages, voiceMsg] }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files).map(f => ({ id: Math.random().toString(36).substr(2, 9), name: f.name, size: (f.size / 1024).toFixed(1) + ' KB', typeFamily: f.type.includes('image') ? 'Image' : 'Document' }));
        setAttachedFiles(prev => [...prev, ...files]);
    };

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!newMsg.trim() && attachedFiles.length === 0 || !activeChannel) return;
        const msg = {
            id: `msg_${Date.now()}`,
            channelId: activeChannel.id,
            senderId: ACTIVE_STAFF.id,
            senderName: ACTIVE_STAFF.name,
            role: 'Me',
            content: newMsg,
            timestamp: new Date().toISOString(),
            type: 'text',
            attachments: attachedFiles
        };
        setChatState(prev => ({ ...prev, messages: [...prev.messages, msg] }));
        setNewMsg('');
        setAttachedFiles([]);
    };

    const filteredMatters = useMemo(() => {
        return matters.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.client.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [matters, searchQuery]);

    const handleUpdateStage = (direction) => {
        const stages = ['Initial Intake', 'Discovery', 'Litigation', 'Trial Prep', 'Mediation', 'Final Judgment', 'Closed'];
        const currentIdx = stages.indexOf(selectedMatter.stage);
        let nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;

        if (nextIdx >= 0 && nextIdx < stages.length) {
            const nextStage = stages[nextIdx];
            setMatters(matters.map(m => m.id === selectedMatter.id ? { ...m, stage: nextStage, status: nextStage === 'Closed' ? 'Closed' : m.status } : m));

            // Log to Audit Trail
            setAuditTrail(prev => [{
                id: `a_${Date.now()}`,
                matterId: selectedMatter.id,
                date: new Date().toISOString(),
                action: 'Stage Progression',
                user: ACTIVE_STAFF.name,
                details: `Matter moved from "${selectedMatter.stage}" to "${nextStage}".`
            }, ...prev]);
        }
    };


    const handleGenerateInvoice = () => {
        setShowStatementPreview(true);
    };

    const isClosed = selectedMatter?.status === 'Closed';

    return (
        <>
            {selectedMatterId && selectedMatter ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
                    {/* 1. Breadcrumb & Actions */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedMatterId(null)}
                                className="text-gray-500 hover:text-[#c9a646] transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                <span className="text-gray-600 cursor-pointer hover:text-white" onClick={() => setSelectedMatterId(null)}>Matters</span>
                                <span className="text-gray-800">/</span>
                                <span className="text-[#c9a646]">{selectedMatter.ref}</span>
                                <span className="text-gray-800">/</span>
                                <span className="text-white">{selectedMatter.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isClosed && (
                                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded text-[9px] font-black text-red-500 uppercase">
                                    <Lock size={12} /> Closed & Locked
                                </div>
                            )}
                            <button onClick={() => window.open('https://drive.google.com', '_blank')} className="px-4 py-2 border border-white/5 bg-white/5 rounded text-[10px] font-black uppercase text-gray-400 hover:text-[#c9a646] hover:border-[#c9a646] transition-all flex items-center gap-2">
                                <ExternalLink size={14} /> Open Drive
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
                        {/* LEFT PANEL: Context & Management */}
                        <div className="xl:col-span-1 space-y-6">
                            <GlassCard className="border-t-4 border-t-[#c9a646]">
                                <div className="mb-6">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status Health</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedMatter.status === 'Urgent' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                        <span className="text-sm font-black text-white uppercase">{selectedMatter.status}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-white/5 text-[11px]">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Primary Client</p>
                                        <p className="text-sm font-bold text-white mb-0.5">{selectedMatter.client}</p>
                                        <p className="text-[10px] text-gray-600 font-mono tracking-tighter">{selectedMatter.clientId}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1 text-[#c9a646]">Current Lifecycle Stage</p>
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="text-sm font-bold text-white uppercase">{selectedMatter.stage}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleUpdateStage('prev')}
                                                disabled={isClosed}
                                                className={`flex-1 py-2 bg-white/5 border border-white/10 rounded flex items-center justify-center transition-all ${isClosed ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-gray-400 group'}`}
                                            >
                                                <ChevronLeftIcon size={14} className={!isClosed ? "group-hover:text-white" : ""} />
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStage('next')}
                                                disabled={isClosed}
                                                className={`flex-1 py-2 bg-[#c9a646] rounded flex items-center justify-center text-black shadow-lg shadow-[#c9a646]/20 transition-all ${isClosed ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#f7d774]'}`}
                                            >
                                                <ChevronRightIcon size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase mb-2">Assigned Personnel</p>
                                        <div className="space-y-2">
                                            {(selectedMatter.team || [selectedMatter.attorney]).map((name, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5 group hover:bg-white/10 transition-all">
                                                    <div className="w-5 h-5 rounded-full bg-[#c9a646]/20 text-[#c9a646] flex items-center justify-center text-[8px] font-black border border-[#c9a646]/30 group-hover:bg-[#c9a646] group-hover:text-black transition-all">
                                                        {name?.charAt(0) || '?'}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-gray-300 group-hover:text-white transition-colors uppercase tracking-tight">{name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="bg-black/40">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Financial Snap</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">TRUST BAL:</span>
                                        <span className="text-sm font-black text-white">R {selectedMatter.trustBalance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">UNBILLED:</span>
                                        <span className="text-sm font-black text-[#c9a646]">R 4,250</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* MAIN WORKSPACE: Sectioned Sub-Tabs */}
                        <div className="xl:col-span-3 space-y-6">
                            <div className="flex gap-1 border-b border-white/5 pb-px overflow-x-auto no-scrollbar">
                                {['Overview', 'Events', 'Documents', 'Tasks', 'Billing', 'Reports', 'Team Discourse'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setDetailTab(tab === 'Team Discourse' ? 'Chat' : tab)}
                                        className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${(detailTab === tab || (tab === 'Team Discourse' && detailTab === 'Chat')) ? 'text-[#c9a646]' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        {tab}
                                        {(detailTab === tab || (tab === 'Team Discourse' && detailTab === 'Chat')) && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c9a646] rounded-t-full"></div>}
                                    </button>
                                ))}
                            </div>

                            {/* SUB-TAB CONTENT */}
                            <div className="pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {detailTab === 'Overview' && (
                                    <div className="space-y-8">
                                        <GlassCard className="bg-black/20 p-8">
                                            <div className="flex justify-between items-start mb-6">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Matter Synopsis & Strategy</p>
                                                <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-tighter ${isClosed ? 'bg-red-500/20 text-red-500' : 'bg-[#c9a646]/20 text-[#c9a646]'}`}>
                                                    {isClosed ? 'Audit Locked' : 'Live Portfolio'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 leading-relaxed font-bold tracking-tight mb-10 max-w-4xl border-l-2 border-[#c9a646]/30 pl-6 py-2 bg-white/[0.02] italic">
                                                {selectedMatter.category === 'Civil Litigation' ? (
                                                    `Strategic Focus: Pursuing claim of R${selectedMatter.claimValue || 'TBD'} against ${selectedMatter.opposingCounsel || 'Defaulting Party'}. Jurisdiction: ${selectedMatter.jurisdiction}. Core strategy involves discovery of financial disclosure and mediation before trial enrollment.`
                                                ) : selectedMatter.category === 'Criminal Defense' ? (
                                                    `Defense Protocol: Matter involves state prosecution under jurisdiction of ${selectedMatter.jurisdiction}. Focus is on procedural compliance, evidence suppression, and plea negotiation where viable. Priority: Urgent liberty protection.`
                                                ) : (selectedMatter.category === 'Estates' || selectedMatter.category === 'Trusts & Estates') ? (
                                                    `Winding Up Strategy: Management of assets for the estate of ${selectedMatter.deceasedName || 'the Deceased'}. Ref: ${selectedMatter.mastersRef || 'Pending'}. Focus is on creditor verification and statutory distribution under the Administration of Estates Act.`
                                                ) : (
                                                    `"${selectedMatter.description}"`
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 border-t border-white/5">
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-600 uppercase mb-4 text-[#c9a646]">Litigation Profile</p>
                                                    <ul className="space-y-4">
                                                        <li className="flex justify-between text-[10px] uppercase tracking-tighter border-b border-white/5 pb-2">
                                                            <span className="text-gray-500 font-bold">JURISDICTION:</span>
                                                            <span className="text-white font-black">{selectedMatter.jurisdiction || 'High Court'}</span>
                                                        </li>
                                                        <li className="flex justify-between text-[10px] uppercase tracking-tighter border-b border-white/5 pb-2">
                                                            <span className="text-gray-500 font-bold">CLAIM VALUE:</span>
                                                            <span className="text-[#c9a646] font-black">R {selectedMatter.claimValue || '0.00'}</span>
                                                        </li>
                                                        <li className="flex justify-between text-[10px] uppercase tracking-tighter">
                                                            <span className="text-gray-500 font-bold">INCIDENT DATE:</span>
                                                            <span className="text-white font-black">{selectedMatter.incidentDate || 'N/A'}</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-600 uppercase mb-4">Adversarial Context</p>
                                                    <div className="bg-white/5 p-4 rounded border border-white/5">
                                                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Opposing Counsel / Firm</p>
                                                        <p className="text-xs font-black text-white uppercase tracking-tight">{selectedMatter.opposingCounsel || 'Not Disclosed'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-600 uppercase mb-4">Assigned Force</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(selectedMatter.team || [selectedMatter.attorney]).map((name, i) => (
                                                            <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:bg-[#c9a646]/10 transition-all cursor-default group">
                                                                <div className="w-4 h-4 rounded bg-[#c9a646] flex items-center justify-center text-[7px] font-black text-black">{name?.charAt(0) || '?'}</div>
                                                                <span className="text-[9px] font-black text-gray-400 group-hover:text-white uppercase tracking-tighter transition-colors">{name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>

                                        <div className="grid grid-cols-3 gap-6">
                                            <StatBox label="Last Activity" value={selectedMatter.activity} sub="System Scan" />
                                            <StatBox label="Lifecycle Stage" value={selectedMatter.stage} sub="Current Position" trend={2} />
                                            <StatBox label="Risk Level" value="Minimal" sub="Compliance Pass" />
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'Documents' && (
                                    <div className="space-y-6">
                                        <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 p-5 rounded-lg border border-white/5 gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#c9a646]/10 flex items-center justify-center border border-[#c9a646]/20">
                                                    <FolderIcon className="text-[#c9a646]" size={20} />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest block">Bound Repository Active</span>
                                                    <span className="text-[8px] text-gray-500 font-bold uppercase">Google Drive Shared Folder</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <button
                                                    onClick={() => window.open('https://drive.google.com', '_blank')}
                                                    className="px-4 py-2.5 border border-[#c9a646]/30 bg-[#c9a646]/5 rounded text-[9px] font-black uppercase text-[#c9a646] hover:bg-[#c9a646] hover:text-black transition-all flex items-center gap-2"
                                                >
                                                    <ExternalLink size={14} /> Global Drive
                                                </button>
                                                <button
                                                    onClick={() => openQuickAdd('doc', selectedMatter.id)}
                                                    disabled={isClosed}
                                                    className={`w-full md:w-auto text-[9px] font-black bg-[#c9a646] text-black px-6 py-3 rounded uppercase transition-all shadow-xl shadow-[#c9a646]/20 ${isClosed ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:scale-105 active:scale-95'}`}
                                                >
                                                    {isClosed ? 'Repository Locked' : 'Upload New File'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {documents.filter(d => d.matterId === selectedMatter.id).map(doc => (
                                                <GlassCard key={doc.id} className="p-4 hover:border-[#c9a646] transition-all flex items-center justify-between group">
                                                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                                                        <FilePreviewIcon type={doc.type} size={20} />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-bold text-white group-hover:text-[#f7d774] truncate max-w-[180px]">{doc.name}</p>
                                                            <p className="text-[9px] text-gray-500 uppercase">{doc.size} • {doc.owner}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setPreviewDoc(doc)} className="p-2 hover:bg-white/10 rounded transition-colors" title="Quick View"><Eye size={14} className="text-[#c9a646]" /></button>
                                                        <a
                                                            href="#"
                                                            onClick={(e) => { e.preventDefault(); setPreviewDoc(doc); }}
                                                            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-500"
                                                            title="Download"
                                                        >
                                                            <Download size={14} />
                                                        </a>
                                                        <button
                                                            onClick={() => {
                                                                setDocuments(documents.filter(d => d.id !== doc.id));
                                                                notify(`Deleted ${doc.name} successfully.`);
                                                            }}
                                                            className="p-2 hover:bg-red-500/10 rounded transition-colors text-red-500/50 hover:text-red-500"
                                                            title="Delete File"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </GlassCard>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'Tasks' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Matter Obligations</p>
                                            <button
                                                onClick={() => openQuickAdd('task', selectedMatter.id)}
                                                disabled={isClosed}
                                                className={`text-[9px] font-black flex items-center gap-2 uppercase transition-all ${isClosed ? 'text-gray-600 cursor-not-allowed' : 'text-[#c9a646] hover:text-white'}`}
                                            >
                                                <Plus size={12} /> New Action
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {tasks.filter(t => t.matterId === selectedMatter.id).map(task => (
                                                <div key={task.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg group hover:bg-[#c9a646]/5 transition-all cursor-pointer" onClick={() => onTaskClick(task)}>
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-[#c9a646]'}`}
                                                            onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(task.id); }}
                                                        >
                                                            {task.completed && <CheckCircle2 size={12} className="text-black" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-bold ${task.completed ? 'text-gray-600 line-through' : 'text-white'}`}>{task.title}</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Due: {task.dueDate}</p>
                                                                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                                    <User size={8} className="text-[#c9a646]" />
                                                                    <span className="text-[8px] font-black text-gray-400 uppercase">{MOCK_DATA.employees.find(e => e.id === task.assignedTo)?.full_name || 'Unassigned'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded ${task.priority === 'Urgent' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-gray-400'}`}>{task.priority}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'Events' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scheduled Events</p>
                                            <button
                                                onClick={() => openQuickAdd('event', selectedMatter.id)}
                                                disabled={isClosed}
                                                className={`text-[9px] font-black flex items-center gap-2 uppercase transition-all ${isClosed ? 'text-gray-600 cursor-not-allowed' : 'text-[#c9a646] hover:text-white'}`}
                                            >
                                                <Plus size={12} /> New Event
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {events.filter(e => e.matterId === selectedMatter.id).length === 0 ? (
                                                <p className="col-span-full text-center text-[10px] uppercase text-gray-600 font-bold py-8">No scheduled events</p>
                                            ) : events.filter(e => e.matterId === selectedMatter.id).map(e => (
                                                <GlassCard key={e.id} className="p-4 border-l-4 border-l-[#c9a646]">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[8px] font-black uppercase bg-white/10 px-2 py-0.5 rounded text-gray-300">{e.type}</span>
                                                        <span className="text-[9px] font-bold text-gray-500">{new Date(e.start).toLocaleDateString()}</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-white mb-1">{e.title}</h4>
                                                    <p className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(e.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </GlassCard>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'Billing' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 gap-6">
                                            <StatBox
                                                label="WIP Accrued"
                                                value={`R ${(billingEntries || []).filter(b => b.matterId === selectedMatter.id).reduce((sum, b) => sum + b.amount, 0).toLocaleString()}`}
                                                sub={`${(billingEntries || []).filter(b => b.matterId === selectedMatter.id).length} Entries Recorded`}
                                                colorClass="text-[#c9a646]"
                                            />
                                            <StatBox label="Trust Balance" value={`R ${selectedMatter.trustBalance.toLocaleString()}`} sub="Compliance Lock On" />
                                            <StatBox label="Collection Life" value="R 0" sub="Invoiced To Date" trend={0} />
                                        </div>

                                        <GlassCard className="p-0 overflow-hidden bg-black/40 border-white/10">
                                            <table className="w-full text-left">
                                                <thead className="text-[9px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 bg-black/40">
                                                    <tr>
                                                        <th className="p-4">Entry Date</th>
                                                        <th className="p-4">Deliverable Summary</th>
                                                        <th className="p-4">Resource</th>
                                                        <th className="p-4 text-right">Rand Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-xs font-bold divide-y divide-white/5">
                                                    {(billingEntries || []).filter(b => b.matterId === selectedMatter.id).map((entry) => (
                                                        <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                                                            <td className="p-4 text-gray-500">{entry.date}</td>
                                                            <td className="p-4 text-white">
                                                                <div>
                                                                    <p className="font-bold">{entry.description}</p>
                                                                    <p className="text-[10px] text-gray-500 mt-0.5">{entry.type}</p>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-gray-400 uppercase tracking-tighter">{entry.resource}</td>
                                                            <td className="p-4 text-right text-white">R {entry.amount.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="p-6 text-center border-t border-white/10">
                                                <button
                                                    onClick={() => openQuickAdd('time', selectedMatter.id)}
                                                    disabled={isClosed}
                                                    className={`text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 mx-auto ${isClosed ? 'text-gray-600 cursor-not-allowed' : 'text-[#c9a646] hover:text-white'}`}
                                                >
                                                    <ClockIcon size={14} /> {isClosed ? 'Ledger Closed' : 'Record Billable Units'}
                                                </button>
                                            </div>
                                        </GlassCard>
                                    </div>
                                )}

                                {detailTab === 'Reports' && (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-white/5 border border-white/10 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div>
                                                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Document Generation Suite</h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Automated Legal Drafting & Reporting</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                                                <button onClick={handleGenerateInvoice} className="text-[9px] font-black bg-[#c9a646] text-black px-4 py-3 rounded uppercase hover:bg-[#f7d774] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c9a646]/20">
                                                    <Receipt size={14} /> Fee Statement
                                                </button>
                                                <button onClick={() => setGenDocModal({ type: 'summary', title: 'Case Summary Report' })} className="text-[9px] font-black bg-white/10 border border-white/10 px-4 py-3 rounded uppercase text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                                                    <FileSearch size={14} /> Summary Report
                                                </button>
                                                <button onClick={() => setGenDocModal({ type: 'mandate', title: 'Mandate & Engagement Letter' })} className="text-[9px] font-black bg-white/10 border border-white/10 px-4 py-3 rounded uppercase text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                                                    <PenTool size={14} /> Engagement Letter
                                                </button>
                                                <button onClick={() => setGenDocModal({ type: 'fica', title: 'FICA Compliance Declaration' })} className="text-[9px] font-black bg-white/10 border border-white/10 px-4 py-3 rounded uppercase text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                                                    <Shield size={14} /> FICA Form
                                                </button>
                                            </div>
                                        </div>

                                        <GlassCard className="p-0 overflow-hidden">
                                            <div className="p-4 bg-black/40 border-b border-white/10">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Generated Reports History</p>
                                            </div>
                                            <div className="p-8 text-center opacity-50">
                                                <FileText size={32} className="mx-auto mb-2 text-gray-600" />
                                                <p className="text-[10px] font-black uppercase text-gray-500">No reports generated in this session</p>
                                            </div>
                                        </GlassCard>
                                    </div>
                                )}

                                {detailTab === 'Chat' && (
                                    <div className="flex flex-col h-[400px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
                                        {/* Header */}
                                        <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between bg-gradient-to-r from-[#c9a646]/5 to-transparent">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#c9a646]/10 border border-[#c9a646]/20 text-[#c9a646]">
                                                    <MessageCircle size={20} />
                                                </div>
                                                <div>
                                                    <h5 className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">Secure File Discourse</h5>
                                                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Matter Protocol Active
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/5">
                                            {channelMessages.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                                                    <Users size={48} className="mb-4 text-white" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Registry Discourse Ready</p>
                                                </div>
                                            ) : channelMessages.map((msg, i) => (
                                                <div key={msg.id} className={`flex ${msg.role === 'Me' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                                    <div className={`max-w-[85%] flex flex-col ${msg.role === 'Me' ? 'items-end' : 'items-start'}`}>
                                                        <div className="flex items-center gap-2 mb-1 px-1">
                                                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{msg.senderName}</span>
                                                            <span className="text-[7px] text-gray-700 font-bold uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className={`p-2.5 rounded-2xl text-[11px] font-medium leading-relaxed shadow-xl ${msg.role === 'Me' ? 'bg-[#c9a646] text-black rounded-tr-none' : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'}`}>
                                                            {msg.type === 'voice' ? (
                                                                <div className="flex items-center gap-3 py-1">
                                                                    <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                                                                        <Play size={14} className="fill-current" />
                                                                    </div>
                                                                    <div className="w-24 h-1 bg-black/10 rounded-full relative overflow-hidden">
                                                                        <div className="absolute inset-0 bg-[#c9a646] w-1/3"></div>
                                                                    </div>
                                                                    <span className="text-[9px] font-bold">Voice Note</span>
                                                                </div>
                                                            ) : msg.content}

                                                            {msg.attachments?.length > 0 && (
                                                                <div className="mt-2 space-y-1">
                                                                    {msg.attachments.map(file => (
                                                                        <div key={file.id} className="flex items-center gap-2 bg-black/20 p-1.5 rounded-lg border border-white/5">
                                                                            <FileText size={10} className="text-[#c9a646]" />
                                                                            <span className="text-[8px] font-black tracking-widest uppercase truncate max-w-[120px]">{file.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Composer */}
                                        <div className="p-3 bg-black/40 border-t border-white/5">
                                            {attachedFiles.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {attachedFiles.map(file => (
                                                        <div key={file.id} className="flex items-center gap-2 bg-[#c9a646]/10 border border-[#c9a646]/20 py-1 px-2 rounded-full">
                                                            <span className="text-[8px] font-black text-white uppercase truncate max-w-[100px]">{file.name}</span>
                                                            <button onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}><X size={10} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <form onSubmit={handleSendMessage} className="flex flex-col gap-2 bg-white/5 rounded-xl border border-white/10 p-2 focus-within:border-[#c9a646] transition-all">
                                                <textarea
                                                    rows="1"
                                                    value={newMsg}
                                                    onChange={(e) => setNewMsg(e.target.value)}
                                                    placeholder={isRecording ? "Recording..." : "Dispatch secure message..."}
                                                    disabled={isRecording}
                                                    className="w-full bg-transparent border-none text-[11px] text-white p-2 outline-none resize-none"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-[#c9a646] transition-all"><Paperclip size={14} /></button>
                                                        <button
                                                            type="button"
                                                            onClick={isRecording ? stopRecording : startRecording}
                                                            className={`p-2 rounded transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-500 hover:text-[#c9a646]'}`}
                                                        >
                                                            <Mic size={14} />
                                                            {isRecording && <span className="text-[9px] font-mono ml-1">{recordingTime}s</span>}
                                                        </button>
                                                    </div>
                                                    <button type="submit" className="p-2 rounded-lg bg-[#c9a646] text-black hover:bg-[#f7d774] transition-all">
                                                        <Send size={14} />
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Modals outside panels but inside root return */}
                    {showStatementPreview && (
                        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-8">
                            <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white text-black p-20 shadow-[0_35px_100px_rgba(0,0,0,0.5)] relative custom-scrollbar-light border-8 border-white">
                                <button onClick={() => setShowStatementPreview(false)} className="fixed top-8 right-8 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors z-50"><X size={24} /></button>
                                <div className="flex justify-between items-start mb-16 border-b-2 border-black pb-8">
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <img src="https://lh3.googleusercontent.com/d/1nk7qVGHgMPwlH3U29gHtglkxu1yNAZaD" alt="Mokwebo Logo" className="h-10 grayscale invert filter contrast-200" style={{ filter: 'brightness(0)' }} />
                                        </div>
                                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">JK MOKWEBO ATTORNEYS</h2>
                                        <p className="text-xs font-bold text-gray-600 uppercase">Statement of Account • Professional Services</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase mb-1">Date: {new Date().toLocaleDateString()}</p>
                                        <p className="text-[10px] font-black uppercase">Ref: {selectedMatter.ref}</p>
                                    </div>
                                </div>
                                <div className="mb-12">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Matter Information</p>
                                    <p className="text-xl font-bold uppercase">{selectedMatter.name}</p>
                                    <p className="text-sm font-bold text-gray-600 mt-1">Client: {selectedMatter.client}</p>
                                </div>
                                <table className="w-full text-left mb-16">
                                    <thead className="border-b border-black text-[10px] font-black uppercase">
                                        <tr>
                                            <th className="py-4">Date</th>
                                            <th className="py-4">Service Description</th>
                                            <th className="py-4 text-right">Amount (ZAR)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs font-medium">
                                        {billingEntries.filter(b => b.matterId === selectedMatter.id).map(entry => (
                                            <tr key={entry.id} className="border-b border-gray-100">
                                                <td className="py-4">{entry.date}</td>
                                                <td className="py-4 font-bold">{entry.description}</td>
                                                <td className="py-4 text-right">R {entry.amount.toLocaleString()}.00</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-black text-white">
                                            <td colSpan="2" className="p-4 font-black text-[10px] uppercase">Total Outstanding Balance</td>
                                            <td className="p-4 text-right font-black text-lg">R {billingEntries.filter(b => b.matterId === selectedMatter.id).reduce((sum, b) => sum + b.amount, 0).toLocaleString()}.00</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                <div className="grid grid-cols-2 gap-12 pt-12 border-t border-gray-100">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase">Banking Details</h4>
                                        <div className="bg-gray-50 p-6 rounded text-[11px] font-bold space-y-1">
                                            <p>Bank: FNB Corporate</p>
                                            <p>Account Name: JK Mokwebo Trust</p>
                                            <p>Branch Code: 250655</p>
                                            <p>Account: 62044558899</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-end items-end gap-4">
                                        <button onClick={() => { notify('Statement downloaded to drive.'); setShowStatementPreview(false); }} className="btn w-full bg-black text-white hover:bg-gray-800 tracking-widest py-4">Download PDF Statement</button>
                                        <p className="text-[8px] text-gray-400 font-bold uppercase">This is a system-generated document for digital discovery.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {genDocModal && (
                        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-8">
                            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-black p-20 shadow-3xl relative border-8 border-white">
                                <button onClick={() => setGenDocModal(null)} className="fixed top-8 right-8 bg-black text-white p-2 rounded-full z-50"><X size={24} /></button>
                                <div className="flex border-b-2 border-black pb-8 mb-12">
                                    <img src="https://lh3.googleusercontent.com/d/1nk7qVGHgMPwlH3U29gHtglkxu1yNAZaD" alt="Logo" className="h-12 mr-6 grayscale invert" style={{ filter: 'brightness(0)' }} />
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tighter">{genDocModal.title}</h2>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{selectedMatter.ref} • {selectedMatter.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-8 text-sm font-medium leading-relaxed">
                                    {genDocModal.type === 'summary' && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-8 bg-gray-50 p-6 rounded">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Portfolio Status</p>
                                                    <p className="font-bold">{selectedMatter.status}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Current Lifecycle</p>
                                                    <p className="font-bold">{selectedMatter.stage}</p>
                                                </div>
                                            </div>
                                            <p>This report documents the current judicial position and strategic trajectory of the matter. As of {new Date().toLocaleDateString()}, the matter is categorized under {selectedMatter.category}.</p>
                                            <h4 className="font-black uppercase text-xs border-b border-gray-100 pb-2">Strategic Objectives</h4>
                                            <p>{selectedMatter.category === 'Civil Litigation' ? 'Primary objective: Resolution of commercial dispute and asset recovery.' : 'Primary objective: Statutory compliance and legal defense navigation.'}</p>
                                            <div className="pt-12">
                                                <p className="text-[10px] font-bold text-gray-400 italic">Signature: __________________________</p>
                                                <p className="text-[10px] uppercase font-black mt-2">Managing Partner: Thabo Maseko</p>
                                            </div>
                                        </div>
                                    )}
                                    {genDocModal.type === 'mandate' && (
                                        <div className="space-y-6">
                                            <p>Dear {selectedMatter.client},</p>
                                            <p>This document formalizes the mandate granted to JK Mokwebo Attorneys to represent your interests regarding "{selectedMatter.name}".</p>
                                            <h4 className="font-black uppercase text-xs">Scope of Work</h4>
                                            <p>1. Legal representation in the {selectedMatter.jurisdiction}.<br />2. Drafting of legal processes and discovery management.<br />3. Consultation and strategic advisory services.</p>
                                            <p>Fees are structured at R700 per unit as per the agreed tariff. Interest on overdue accounts will be levied at the prescribed rate.</p>
                                            <div className="grid grid-cols-2 gap-20 pt-20">
                                                <div className="border-t border-black pt-2 text-[10px] font-black uppercase">Client Acceptance</div>
                                                <div className="border-t border-black pt-2 text-[10px] font-black uppercase">For the Firm</div>
                                            </div>
                                        </div>
                                    )}
                                    {genDocModal.type === 'fica' && (
                                        <div className="space-y-6">
                                            <p className="text-center font-black text-lg underline">STATIC COMPLIANCE DECLARATION</p>
                                            <div className="bg-gray-50 p-8 space-y-4 rounded">
                                                <p><strong>ENTITY:</strong> {selectedMatter.client}</p>
                                                <p><strong>REGISTRY:</strong> {selectedMatter.ref}</p>
                                                <p><strong>VERIFICATION DATE:</strong> {new Date().toLocaleDateString()}</p>
                                            </div>
                                            <p>I hereby certify that all required statutory documentation including ID, Proof of Residents, and Tax Compliance has been verified against national registries. This matter is cleared for trust account operations.</p>
                                            <div className="flex justify-center pt-10">
                                                <div className="w-40 h-40 border-2 border-gray-100 flex items-center justify-center text-[10px] text-gray-300 font-bold uppercase">Compliance Stamp</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-16 flex justify-end gap-4 border-t border-gray-100 pt-8 no-print">
                                    <button onClick={() => setGenDocModal(null)} className="px-6 py-3 border border-gray-200 rounded text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black">Cancel</button>
                                    <button onClick={() => { notify('Document queued for generation.'); setGenDocModal(null); }} className="px-6 py-3 bg-black text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2">
                                        <Download size={14} /> Download Final PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
                    {/* Header Area */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                                <Briefcase size={28} className="text-[#c9a646]" />
                                MATTERS COMMAND
                            </h1>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-2">Firm-Wide Litigation & Portfolio Registry</p>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search by name, ref, or client..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:border-[#c9a646] outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button onClick={() => openQuickAdd('matter')} className="bg-[#c9a646] text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#f7d774] transition-all shadow-lg shadow-[#c9a646]/10">
                                New Intake
                            </button>
                        </div>
                    </div>

                    {/* HIGH-DENSITY LIST VIEW (Desktop Table) */}
                    <GlassCard className="hidden md:block p-0 overflow-hidden border-t-4 border-t-[#c9a646]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left responsive-table">
                                <thead className="bg-[#121212] border-b border-white/5">
                                    <tr>
                                        <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Reference</th>
                                        <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Matter Name</th>
                                        <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Client Name</th>
                                        <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Stage</th>
                                        <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                                        <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Assigned Team</th>
                                        <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-black/20">
                                    {filteredMatters.map(m => (
                                        <tr
                                            key={m.id}
                                            className="group hover:bg-[#c9a646]/5 transition-all cursor-pointer"
                                            onClick={() => setSelectedMatterId(m.id)}
                                        >
                                            <td className="p-4" data-label="Reference">
                                                <span className="text-[10px] font-black text-[#c9a646] tracking-widest">{m.ref}</span>
                                            </td>
                                            <td className="p-4" data-label="Matter Name">
                                                <p className="text-sm font-bold text-white group-hover:text-[#f7d774] transition-colors">{m.name}</p>
                                                <p className="text-[9px] text-gray-600 font-medium uppercase tracking-tighter mt-0.5">{m.category}</p>
                                            </td>
                                            <td className="p-4 text-xs font-bold text-gray-400" data-label="Client Name">{m.client}</td>
                                            <td className="p-4 text-[10px] font-black text-gray-500 uppercase italic" data-label="Stage">{m.stage}</td>
                                            <td className="p-4 text-center" data-label="Status">
                                                <div className="flex flex-col items-center md:items-center items-start">
                                                    <div className={`w-1.5 h-1.5 rounded-full mb-1 ${m.status === 'Urgent' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                                    <span className={`text-[8px] font-black uppercase ${m.status === 'Urgent' ? 'text-red-500' : 'text-green-500'}`}>{m.status}</span>
                                                </div>
                                            </td>
                                            <td className="p-4" data-label="Assigned Team">
                                                <div className="flex -space-x-2">
                                                    {(m.team || [m.attorney]).map((name, i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center text-[7px] font-black text-[#c9a646]" title={name}>{name?.charAt(0) || '?'}</div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right" data-label="Actions">
                                                <button className="text-gray-600 group-hover:text-[#c9a646] transition-colors">
                                                    <ArrowRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* MOBILE LIST VIEW (Spacious Cards) */}
                    <div className="md:hidden space-y-4 pb-32">
                        {filteredMatters.map(m => (
                            <GlassCard key={m.id} className="p-5 flex flex-col gap-4 relative overflow-hidden active:scale-[0.98] transition-transform" onClick={() => setSelectedMatterId(m.id)}>
                                {/* Status Strip */}
                                <div className={`absolute top-0 bottom-0 left-0 w-1 ${m.status === 'Urgent' ? 'bg-red-500' : 'bg-[#c9a646]'}`}></div>

                                <div className="flex justify-between items-start pl-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-[#c9a646] uppercase tracking-widest bg-[#c9a646]/10 px-2 py-1 rounded border border-[#c9a646]/20">{m.ref}</span>
                                            {m.status === 'Urgent' && <span className="text-[9px] font-black text-red-500 uppercase bg-red-500/10 px-2 py-0.5 rounded animate-pulse">Urgent</span>}
                                        </div>
                                        <h3 className="text-base font-black text-white uppercase leading-tight">{m.name}</h3>
                                        <p className="text-[11px] font-bold text-gray-500 uppercase mt-1">{m.client}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                        <ArrowRight size={16} className="text-gray-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2 pl-2 text-[10px]">
                                    <div>
                                        <span className="text-[9px] font-bold text-gray-600 uppercase block mb-1">Stage</span>
                                        <span className="font-bold text-white uppercase">{m.stage}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-bold text-gray-600 uppercase block mb-1">Team</span>
                                        <div className="flex justify-end -space-x-2">
                                            {(m.team || [m.attorney]).map((name, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center text-[8px] font-black text-[#c9a646]">{name?.charAt(0) || '?'}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}

            {/* In-App Notification Overlay */}
            {notification && (
                <div className="fixed bottom-[calc(90px+env(safe-area-inset-bottom))] md:bottom-10 right-4 md:right-10 z-[300] animate-in slide-in-from-right-10 duration-500">
                    <GlassCard className={`px-8 py-4 border-l-4 ${notification.type === 'success' ? 'border-l-green-500' : 'border-l-red-500'} shadow-2xl`}>
                        <div className="flex items-center gap-4">
                            {notification.type === 'success' ? <CheckCircle2 className="text-green-500" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
                            <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">{notification.message}</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* In-App Document Viewer */}
            {previewDoc && <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
        </>
    );
};

const CalculatorIcon = Calculator;

// --- JKM APP REGISTRY (CONSTITUTIONAL SEED V1) ---
const APP_REGISTRY = [
    {
        id: 'voice-note-taker',
        name: 'AI Voice Note Taker',
        category: 'Intelligence',
        type: 'AI',
        icon: Mic,
        color: 'text-[#c9a646]',
        description: 'Capture voice notes, transcribe audio, and generate smart summaries.',
        status: 'Active',
        roleAccess: ['Administrator', 'Attorney', 'Paralegal'],
        reviewGated: false,
        isBuiltIn: true,
        healthNotice: 'Ready'
    },
    {
        id: 'google-docs',
        name: 'Docs Editor',
        category: 'Workspace',
        type: 'Google',
        icon: FileText,
        color: 'text-blue-500',
        description: 'Collaborative document creation. Direct Matter-folder integration.',
        status: 'Linked',
        roleAccess: ['Administrator', 'Attorney', 'Paralegal', 'Finance'],
        launchUrl: 'https://docs.google.com/',
        healthNotice: 'Auth Verified'
    },
    {
        id: 'google-sheets',
        name: 'Financial Sheets',
        category: 'Workspace',
        type: 'Google',
        icon: FileSpreadsheet,
        color: 'text-green-500',
        description: 'Data analysis and financial modeling for complex litigation.',
        status: 'Linked',
        roleAccess: ['Administrator', 'Attorney', 'Finance'],
        launchUrl: 'https://sheets.google.com/',
        healthNotice: 'Connected'
    },
    {
        id: 'google-slides',
        name: 'Courtroom Slides',
        category: 'Workspace',
        type: 'Google',
        icon: Presentation,
        color: 'text-orange-500',
        description: 'High-impact visual presentations for trial advocacy.',
        status: 'Linked',
        roleAccess: ['Administrator', 'Attorney'],
        launchUrl: 'https://slides.google.com/',
        healthNotice: 'Syncing'
    },
    {
        id: 'google-drive',
        name: 'Firm Registry (Drive)',
        category: 'Workspace',
        type: 'Google',
        icon: HardDrive,
        color: 'text-yellow-500',
        description: 'Firm-wide artifact repository. Structured by JKM Governance.',
        status: 'Connected',
        roleAccess: ['Administrator', 'Attorney', 'Paralegal', 'Finance'],
        launchUrl: 'https://drive.google.com/',
        healthNotice: 'Syncing'
    },
    {
        id: 'gmail',
        name: 'Legal Mail (Gmail)',
        category: 'Workspace',
        type: 'Google',
        icon: Mail,
        color: 'text-red-500',
        description: 'High-security correspondence layer with encryption.',
        status: 'Linked',
        roleAccess: ['Administrator', 'Attorney', 'Paralegal', 'Finance', 'Clerk'],
        launchUrl: 'https://mail.google.com/',
        healthNotice: 'Secure'
    },
    {
        id: 'google-meet',
        name: 'Virtual Consult (Meet)',
        category: 'Workspace',
        type: 'Google',
        icon: Video,
        color: 'text-blue-400',
        description: 'Encrypted video conferencing for client consultations.',
        status: 'Active',
        roleAccess: ['Administrator', 'Attorney', 'Paralegal'],
        launchUrl: 'https://meet.google.com/',
        healthNotice: 'Ready'
    },
    {
        id: 'audit-vault',
        name: 'Audit Vault',
        category: 'Governance',
        type: 'Internal',
        icon: ShieldCheck,
        color: 'text-red-400',
        description: 'Immutable firm logs. Built-in compliance engine.',
        status: 'Active',
        roleAccess: ['Administrator'],
        isBuiltIn: true,
        healthNotice: 'Immutable'
    }
];



// --- BUILT-IN TOOL: AUDIT VAULT ---
const AuditVault = ({ auditTrail }) => {
    const [filter, setFilter] = useState('All');
    const filtered = auditTrail.filter(item => filter === 'All' || item.type === filter);

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Audit Registry</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Immutable Transaction & Event Logs</p>
                </div>
                <div className="flex gap-2">
                    {['All', 'System', 'Matter', 'Financial', 'Security'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {filtered.map((entry, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center group hover:border-red-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${entry.severity === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-400'}`}>
                                <ShieldCheck size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-tight">{entry.action}</p>
                                <p className="text-[10px] font-medium text-gray-500">{entry.timestamp}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">{entry.type}</span>
                            <span className="text-[10px] font-bold text-white opacity-40">{entry.user}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- BUILT-IN TOOL: AI VOICE NOTE TAKER ---
const AiVoiceNoteTaker = () => {
    const [isListening, setIsListening] = useState(false);
    const [notes, setNotes] = useState('');
    const [summary, setSummary] = useState('');
    const [status, setStatus] = useState('Ready');
    const [isProcessing, setIsProcessing] = useState(false);

    // Using refs to prevent stutter/state-loop issues in onresult
    const recognitionRef = useRef(null);
    const finalTranscriptRef = useRef('');
    const fileInputRef = useRef(null);

    // Helper for robust API calls
    const fetchWithRetry = async (url, options, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error?.message || `HTTP ${response.status}`);
                }
                return await response.json();
            } catch (err) {
                if (i === maxRetries - 1) throw err;
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
            }
        }
    };

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            setStatus('Live Voice Not Supported');
            return;
        }
        const sr = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new sr();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setStatus('Listening...');
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscriptRef.current += transcript + ' ';
                } else {
                    interimTranscript = transcript;
                }
            }
            setNotes(finalTranscriptRef.current + interimTranscript);
        };

        recognition.onerror = (e) => {
            console.error('Speech recognition error:', e.error);
            setIsListening(false);
            setStatus(`Error: ${e.error}`);
        };

        recognition.onend = () => {
            setIsListening(false);
            if (status === 'Listening...') setStatus('Ready');
        };

        recognitionRef.current = recognition;
        return () => recognitionRef.current?.stop();
    }, [status]);

    const toggleMic = () => {
        if (isListening) {
            // Immediate UI feedback
            setIsListening(false);
            setStatus('Ready');
            recognitionRef.current?.stop();
        } else {
            finalTranscriptRef.current = '';
            setNotes('');
            setSummary('');
            recognitionRef.current?.start();
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            setStatus('Error: Please select an audio file.');
            return;
        }

        setIsProcessing(true);
        setStatus(`Transcribing ${file.name}...`);

        try {
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
            });
            reader.readAsDataURL(file);
            const base64Data = await base64Promise;

            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

            const result = await fetchWithRetry(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "Please provide a complete and accurate transcription of this audio. Return only the transcribed text." },
                            { inlineData: { mimeType: file.type, data: base64Data } }
                        ]
                    }]
                })
            });

            const transcription = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (transcription) {
                finalTranscriptRef.current = transcription;
                setNotes(transcription);
                setStatus('Transcription Complete');
            } else {
                throw new Error('No transcription generated.');
            }
        } catch (error) {
            console.error('Transcription failed:', error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSummarize = async () => {
        if (!notes) return;
        setIsProcessing(true);
        setStatus('Generating AI Summary...');

        try {
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

            const result = await fetchWithRetry(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `You are an expert legal assistant. Summarize these notes into a concise, professional summary with key takeaways and action items: \n\n${notes}` }]
                    }],
                    generationConfig: { temperature: 0.1 }
                })
            });

            const generatedSummary = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (generatedSummary) {
                setSummary(generatedSummary);
                setStatus('Summary Generated');
            } else {
                throw new Error('Summarization failed.');
            }
        } catch (error) {
            console.error('Summarization failed:', error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportPDF = () => {
        // Implementation check for jsPDF
        if (!window.jspdf) {
            setStatus('Error: PDF engine not loaded.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text("JKM Legal OS - Voice Note Record", 20, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Timestamp: ${new Date().toLocaleString()}`, 20, 30);

        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("TRANCRIPTION:", 20, 45);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(notes || "No transcription found.", 170);
        doc.text(splitNotes, 20, 55);

        if (summary) {
            doc.addPage();
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("AI SUMMARY & ACTIONS:", 20, 20);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const splitSummary = doc.splitTextToSize(summary, 170);
            doc.text(splitSummary, 20, 30);
        }

        doc.save(`Legal_Note_${new Date().getTime()}.pdf`);
        setStatus('PDF Exported Successfully');
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">AI Voice Note Taker</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Capture • Transcribe • Synthesize</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={toggleMic}
                        disabled={isProcessing}
                        className={`p-5 rounded-full shadow-2xl transition-all active:scale-95 flex items-center justify-center ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[#c9a646] hover:bg-white text-black'}`}
                        title="Live Voice"
                    >
                        {isListening ? <Square size={22} fill="currentColor" /> : <Mic size={22} fill="currentColor" />}
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing || isListening}
                        className="bg-white/5 border border-white/10 p-5 rounded-full shadow-2xl hover:bg-[#c9a646] hover:text-black text-white transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center"
                        title="From File"
                    >
                        <Upload size={22} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />

                    <button
                        onClick={handleSummarize}
                        disabled={!notes || isListening || isProcessing}
                        className="bg-white/5 border border-white/10 p-5 rounded-full shadow-2xl hover:bg-[#c9a646] hover:text-black text-white transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center"
                        title="AI Summary"
                    >
                        {isProcessing && status.includes('Summarizing') ? <RotateCw size={22} className="animate-spin" /> : <Sparkles size={22} />}
                    </button>

                    <button
                        onClick={handleExportPDF}
                        disabled={!notes || isListening || isProcessing}
                        className="bg-white/5 border border-white/10 p-5 rounded-full shadow-2xl hover:bg-[#c9a646] hover:text-black text-white transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center"
                        title="Export PDF"
                    >
                        <FileDown size={22} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 flex-1 min-h-0">
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <p className="text-[10px] font-black text-[#c9a646] uppercase tracking-widest flex items-center gap-2">
                            <Edit2 size={12} /> Transcription Hub
                        </p>
                        {isListening && <span className="text-[8px] font-black text-red-500 uppercase animate-pulse flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-red-500"></div> Recording...</span>}
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => {
                            setNotes(e.target.value);
                            finalTranscriptRef.current = e.target.value;
                        }}
                        placeholder="Start recording your voice notes, or load an audio file for transcription here..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-8 text-sm text-white focus:border-[#c9a646] outline-none resize-none custom-scrollbar font-medium leading-relaxed placeholder:text-gray-800"
                    />
                </div>
                <div className="flex flex-col space-y-4">
                    <p className="text-[10px] font-black text-[#c9a646] uppercase tracking-widest flex items-center gap-2 px-2">
                        <Bot size={12} /> Smart Synthesis
                    </p>
                    <div className="flex-1 bg-[#c9a646]/5 border border-[#c9a646]/10 rounded-3xl p-8 text-sm text-gray-300 overflow-y-auto custom-scrollbar leading-relaxed whitespace-pre-wrap italic">
                        {summary || "The generated summary will appear here after you click the 'AI Summary' button."}
                    </div>
                </div>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-[#c9a646] animate-pulse outline outline-4 outline-[#c9a646]/20' : 'bg-green-500'}`}></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        System Status: <span className={status.includes('Error') ? 'text-red-500' : 'text-white'}>{status}</span>
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">Encrypted Sandbox</span>
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">Gemini 1.5 Flash</span>
                </div>
            </div>
        </div>
    );
};

const AppsPage = ({ activeCategory, setActiveCategory, auditTrail }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [recentlyUsed, setRecentlyUsed] = useState(() => {
        const saved = localStorage.getItem('JKM_RECENT_APPS');
        return saved ? JSON.parse(saved) : [];
    });

    const filtered = useMemo(() => {
        return APP_REGISTRY.filter(app => {
            const matchesTab = activeCategory === 'All' || app.category === activeCategory;
            const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.description.toLowerCase().includes(searchQuery.toLowerCase());
            const hasPermission = app.roleAccess.includes(ACTIVE_STAFF.role);
            return matchesTab && matchesSearch && hasPermission;
        });
    }, [activeCategory, searchQuery]);

    const handleLaunch = (app) => {
        if (app.status === 'Maintenance') return;

        // Tracking recently used
        setRecentlyUsed(prev => {
            const updated = [app.id, ...prev.filter(id => id !== app.id)].slice(0, 4);
            localStorage.setItem('JKM_RECENT_APPS', JSON.stringify(updated));
            return updated;
        });

        if (app.launchUrl) {
            window.open(app.launchUrl, '_blank');
        } else {
            setSelectedApp(app);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">The Firm's Toolbox</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Curated Productivity Surface • Secure Access Layer</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-[#c9a646] transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="SEARCH THE TOOLBOX..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest text-white focus:border-[#c9a646] focus:outline-none transition-all placeholder:text-gray-700"
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* PANE D: GOVERNANCE & CATEGORIES */}
                <div className="w-full md:w-72 flex-shrink-0 space-y-6">
                    <GlassCard className="p-6">
                        <p className="text-[10px] font-black text-[#c9a646] uppercase tracking-[0.3em] mb-6">Categories</p>
                        <nav className="space-y-2">
                            {['All', 'Intelligence', 'Workspace', 'Governance'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-[#c9a646] text-black shadow-lg shadow-[#c9a646]/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    {cat}
                                    {activeCategory === cat && <ChevronRight size={14} />}
                                </button>
                            ))}
                        </nav>
                    </GlassCard>

                    <GlassCard className="p-6 border-l-4 border-l-blue-500/50">
                        <div className="flex items-center gap-2 mb-4 text-blue-400">
                            <Shield size={14} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Health Notice</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Google Sync</span>
                                <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    Healthy
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-500 uppercase">AI Layer</span>
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">Verified</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Audit Level</span>
                                <span className="text-[9px] font-black text-white uppercase tracking-tighter">Full Stream</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* MAIN GRID HUB (PANE A, B, C) */}
                <div className="flex-1 space-y-8">
                    {/* Recently Used Sub-Pane */}
                    {recentlyUsed.length > 0 && !searchQuery && activeCategory === 'All' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-4 opacity-40">Tactical Recall</p>
                            <div className="grid grid-cols-4 gap-4">
                                {recentlyUsed.map(id => {
                                    const app = APP_REGISTRY.find(a => a.id === id);
                                    if (!app) return null;
                                    return (
                                        <GlassCard
                                            key={app.id}
                                            onClick={() => handleLaunch(app)}
                                            className="p-4 flex items-center gap-4 group cursor-pointer hover:border-[#c9a646] transition-all"
                                        >
                                            <div className={`p-2 rounded-lg bg-white/5 ${app.color}`}>
                                                <app.icon size={16} />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-[10px] font-black text-white uppercase truncate">{app.name}</p>
                                                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter truncate">{app.category}</p>
                                            </div>
                                        </GlassCard>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* App Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(app => (
                            <GlassCard
                                key={app.id}
                                className="group relative overflow-hidden flex flex-col items-start p-0 border-0 transition-all duration-500 hover:shadow-2xl hover:shadow-black/40"
                            >
                                <div className={`h-1.5 w-full bg-gradient-to-r ${app.color.includes('blue') ? 'from-blue-600 to-cyan-400' : app.color.includes('purple') ? 'from-purple-600 to-pink-400' : app.color.includes('red') ? 'from-red-600 to-orange-400' : 'from-[#c9a646] to-[#f7d774]'}`}></div>

                                <div className="p-6 w-full flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${app.color} group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-xl`}>
                                            <app.icon size={28} />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${app.status === 'Active' || app.status === 'Connected' || app.status === 'Linked' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`}></div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{app.healthNotice}</span>
                                            </div>
                                            <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">{app.type} Tool</span>
                                        </div>
                                    </div>

                                    <h4 className="text-xl font-black text-white mb-2 group-hover:text-[#f7d774] transition-colors tracking-tighter uppercase">{app.name}</h4>
                                    <p className="text-[11px] font-medium text-gray-400 mb-6 leading-relaxed flex-1">{app.description}</p>

                                    <button
                                        onClick={() => handleLaunch(app)}
                                        className="w-full relative group/btn overflow-hidden rounded-xl border border-white/10 p-3 flex items-center justify-center gap-3 transition-all hover:border-[#c9a646]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#c9a646] to-[#f7d774] opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                        <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-white group-hover/btn:text-black">Launch Interface</span>
                                        <ArrowRight size={14} className="relative z-10 text-gray-500 group-hover/btn:text-black transition-colors" />
                                    </button>
                                </div>

                                {app.reviewGated && (
                                    <div className="absolute top-4 left-4 flex gap-1 pointer-events-none">
                                        <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/5 flex items-center gap-1">
                                            <ShieldAlert size={8} className="text-[#c9a646]" />
                                            <span className="text-[7px] font-black text-white uppercase tracking-tighter">Human Gated</span>
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        ))}

                        {filtered.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20 grayscale">
                                <Database size={64} className="mb-4" />
                                <p className="text-sm font-black uppercase tracking-[0.5em]">No Tools Found in This Vault</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Review Gate Modal / Built-In App Engine */}
            {selectedApp && (
                <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="w-full max-w-6xl h-full flex flex-col space-y-6">
                        <div className="flex justify-between items-center text-white">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${selectedApp.color}`}>
                                    <selectedApp.icon size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-widest leading-none mb-1">{selectedApp.name}</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{selectedApp.isBuiltIn ? 'Internal Registry Tool' : 'High-Security Sandbox'} • Protocol B</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedApp(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:rotate-90 duration-300"><X size={24} /></button>
                        </div>

                        <div className="flex-1 min-h-0 bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 overflow-hidden shadow-2xl">
                            {selectedApp.isBuiltIn ? (
                                <>
                                    {selectedApp.id === 'voice-note-taker' && <AiVoiceNoteTaker />}
                                    {selectedApp.id === 'audit-vault' && <AuditVault auditTrail={auditTrail} />}
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-white/5">
                                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10 animate-pulse">
                                        <selectedApp.icon size={48} className="text-gray-600" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Review Gate: Interface Ready</h3>
                                    <p className="max-w-2xl text-base text-gray-400 leading-relaxed mb-8 font-medium">
                                        The **{selectedApp.name}** is constrained by the firm's strict **Assistive, Not Autonomous** directive.
                                        AI outputs must be manually reviewed before being committed to any official matter record.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                                        <button className="px-8 py-5 bg-[#c9a646] text-black font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-xl shadow-[#c9a646]/20">Initialize Tool</button>
                                        <button onClick={() => setSelectedApp(null)} className="px-8 py-5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-gray-500">Exit Sandbox</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center items-center gap-6 text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">
                            <span className="flex items-center gap-2"><Shield size={12} className="text-green-500" /> Data Residency Active</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                            <span className="flex items-center gap-2"><Lock size={12} /> TLS 1.3 Encrypted</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                            <span className="flex items-center gap-2"><Activity size={12} /> Audit Stream Live</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- FIRM OVERVIEW TAB (V1) - THE EXECUTIVE MIRROR (HI-FI SCREENSHOT VERSION) ---
const FirmOverviewPage = ({ tasks, matters, data, setActiveTab }) => {
    const [period, setPeriod] = useState('This Month');
    const isExecutive = ACTIVE_STAFF.role === 'Administrator' || ACTIVE_STAFF.role === 'Partner';

    // Simulated filtering logic to show "Growth & Efficiency" based on period
    const filteredStats = useMemo(() => {
        let multiplier = 1;
        if (period === 'Today') multiplier = 0.05;
        if (period === 'This Week') multiplier = 0.25;

        const wf = data.financial.revenueWaterfall;
        const fm = {
            potential: Math.round(wf.potential * multiplier),
            wip: Math.round(wf.wip * multiplier),
            billed: Math.round(wf.billed * multiplier),
            collected: Math.round(wf.collected * multiplier),
        };

        const activeCount = matters.filter(m => m.status !== 'Closed').length;
        const urgent = matters.filter(m => m.status === 'Urgent');
        const blocked = matters.filter(m => m.status === 'Blocked');

        // Dynamic Case Velocity for Heatmap
        const velocity = {
            five: Math.max(1, Math.round(5 * multiplier * 2)),
            eight: Math.max(1, Math.round(12 * multiplier * 2)),
            fortyFive: Math.max(1, Math.round(28 * multiplier * 2)),
            oneTwenty: Math.max(1, Math.round(15 * multiplier * 2))
        };

        // Section 05 Profitability Data (Simulated across months, but scaled by current period)
        const profitabilityData = [
            { m: 'AUG', val: 450000 * multiplier },
            { m: 'SEP', val: 820000 * multiplier },
            { m: 'OCT', val: 650000 * multiplier },
            { m: 'NOV', val: 950000 * multiplier },
            { m: 'DEC', val: 780000 * multiplier }
        ];

        return { fm, activeCount, urgent, blocked, velocity, profitabilityData, multiplier };
    }, [period, data, matters]);

    if (!isExecutive) {
        return (
            <div className="flex flex-col items-center justify-center py-40 animate-in fade-in zoom-in duration-500">
                <ShieldAlert size={64} className="text-red-500/20 mb-6" />
                <h2 className="text-xl font-black text-gray-500 uppercase tracking-widest">Restricted Access</h2>
                <p className="text-sm text-gray-700 mt-2">Executive Mirror requires Partner or Administrator permissions.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 pb-32">

            {/* Firm Header & Period Selector */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                        <Activity className="text-[#c9a646] w-10 h-10" />
                        EXECUTIVE COMMAND CENTER
                    </h1>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-3">JKM LEGAL OS • STRATEGIC MIRROR V1.0</p>
                </div>
                <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/10 shadow-2xl">
                    {['Today', 'This Week', 'This Month'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-[#c9a646] text-black shadow-lg shadow-[#c9a646]/30 px-10' : 'text-gray-500 hover:text-white'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* SECTION 01: FINANCIAL CHAIN (As seen in Screenshot 2) */}
                <GlassCard className="border-t-2 border-[#c9a646]/30">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <Zap size={18} className="text-[#c9a646]" />
                            <h3 className="text-white font-black uppercase text-xs tracking-[0.2em]">Section 01: Financial Chain</h3>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded">
                            <span className="text-[9px] font-black text-green-500 uppercase">Liquidity: Optimal</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {[
                            { label: 'Potential Revenue', val: filteredStats.fm.potential, color: 'bg-gray-700', total: filteredStats.fm.potential },
                            { label: 'Work in Progress', val: filteredStats.fm.wip, color: 'bg-[#f7d774]', total: filteredStats.fm.potential },
                            { label: 'Billed Amount', val: filteredStats.fm.billed, color: 'bg-white', total: filteredStats.fm.potential },
                            { label: 'Total Collected', val: filteredStats.fm.collected, color: 'bg-green-500', total: filteredStats.fm.potential }
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-lg font-black text-white">R {item.val.toLocaleString()}</p>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-sm overflow-hidden border border-white/5 p-[1px]">
                                    <div
                                        className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                                        style={{ width: `${(item.val / (item.total || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* PERFORMANCE GRID (Scaled by period) */}
                <div className="grid grid-cols-2 gap-6">
                    <GlassCard className="p-8 group hover:border-[#c9a646]/50 transition-all">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Utilization</p>
                        <div className="flex items-end gap-2">
                            <p className="text-4xl font-black text-white">{Math.round(data.financial.utilization * (0.8 + filteredStats.multiplier * 0.2))}%</p>
                            <span className="text-[10px] text-gray-600 font-bold mb-1 uppercase">Target: 75%</span>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-8 group hover:border-green-500/50 transition-all">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Collection</p>
                        <div className="flex items-end gap-2">
                            <p className="text-4xl font-black text-green-500">{data.financial.collection}%</p>
                            <span className="text-[10px] text-gray-600 font-bold mb-1 uppercase">Invoice vs Paid</span>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-8 group hover:border-orange-500/50 transition-all">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Lockup</p>
                        <div className="flex items-end gap-2">
                            <p className="text-4xl font-black text-white">{data.financial.lockup}d</p>
                            <span className="text-[10px] text-gray-600 font-bold mb-1 uppercase">WIP-to-Cash</span>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-8 group hover:border-blue-500/50 transition-all">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Realization</p>
                        <div className="flex items-end gap-2">
                            <p className="text-4xl font-black text-white">{data.financial.realization}%</p>
                            <span className="text-[10px] text-gray-600 font-bold mb-1 uppercase">Billed vs Logged</span>
                        </div>
                    </GlassCard>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* SECTION 02: COMPLIANCE PILLAR */}
                <GlassCard className="border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 mb-8">
                        <ShieldCheck className="text-blue-500" size={16} />
                        <h3 className="text-white font-black uppercase text-[10px] tracking-[0.2em]">Section 02: Compliance Pillar</h3>
                    </div>
                    <div className="bg-black/60 p-6 rounded-lg border border-white/5 mb-6">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Trust Account Integrity</p>
                        <div className="flex items-center justify-between">
                            <p className="text-3xl font-black text-white">R {(data.compliance.trustBank / 1000000).toFixed(2)}M</p>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">In Sync</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                            <p className="text-[8px] font-black text-gray-600 uppercase mb-2">VAT Forecast</p>
                            <p className="text-xl font-black text-white">R {data.compliance.vatForecast.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                            <p className="text-[8px] font-black text-gray-600 uppercase mb-2">B-BBEE Level</p>
                            <p className="text-xl font-black text-[#c9a646]">{data.compliance.bbbeeLevel}</p>
                        </div>
                    </div>
                </GlassCard>

                {/* SECTION 03: TRIAGE / FLAGS */}
                <GlassCard className="border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="text-red-500" size={16} />
                            <h3 className="text-white font-black uppercase text-[10px] tracking-[0.2em]">Section 03: Triage</h3>
                        </div>
                        <span className="text-[8px] bg-red-500 text-white px-2 py-0.5 rounded-sm font-black uppercase tracking-widest">Flags</span>
                    </div>
                    <div className="space-y-4">
                        {[
                            { title: 'Prepare Court Bundle', cat: 'LITIGATION', priority: 'URGENT', deadline: '2025-12-24' },
                            { title: 'FICA Verification: Gwala', cat: 'COMPLIANCE', priority: 'HIGH', deadline: '2025-12-23' }
                        ].map((flag, i) => (
                            <div key={i} className="bg-black/40 p-5 rounded-lg border border-white/5 hover:border-red-500/30 transition-all cursor-pointer group" onClick={() => setActiveTab('Tasks')}>
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-sm font-black text-white group-hover:text-red-400 transition-colors uppercase">{flag.title}</h4>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${flag.priority === 'URGENT' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>{flag.priority}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                    <span>{flag.cat}</span>
                                    <span>Due: {flag.deadline}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* SECTION 04: STRATEGIC INTELLIGENCE */}
                <GlassCard className="border-l-4 border-l-[#c9a646]">
                    <div className="flex items-center gap-2 mb-8">
                        <Zap className="text-[#c9a646]" size={16} />
                        <h3 className="text-white font-black uppercase text-[10px] tracking-[0.2em]">Section 04: Strategic Intelligence</h3>
                    </div>
                    <div className="mb-8">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Case Velocity Heatmap</p>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="p-3 bg-green-500 text-black text-center rounded-sm font-black text-[10px]">{filteredStats.velocity.five}d</div>
                            <div className="p-3 bg-green-600 text-white text-center rounded-sm font-black text-[10px]">{filteredStats.velocity.eight}d</div>
                            <div className="p-3 bg-yellow-500 text-black text-center rounded-sm font-black text-[10px]">{filteredStats.velocity.fortyFive}d</div>
                            <div className="p-3 bg-red-600 text-white text-center rounded-sm font-black text-[10px]">{filteredStats.velocity.oneTwenty}d</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-xl text-center">
                            <p className="text-[8px] font-black text-gray-600 uppercase mb-2">Referral ROI</p>
                            <p className="text-2xl font-black text-white">82%</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-xl text-center">
                            <p className="text-[8px] font-black text-gray-600 uppercase mb-2">Conc. Risk</p>
                            <p className="text-2xl font-black text-green-500">8.2%</p>
                        </div>
                    </div>
                </GlassCard>

                {/* SECTION 05: PROFITABILITY */}
                <GlassCard className="border-l-4 border-l-[#c9a646]">
                    <div className="flex items-center gap-2 mb-8">
                        <TrendingUp className="text-[#c9a646]" size={16} />
                        <h3 className="text-white font-black uppercase text-[10px] tracking-[0.2em]">Section 05: Profitability</h3>
                    </div>

                    {/* Functional Bar Graph with Period Scaling */}
                    <div className="h-44 flex items-end justify-between px-6 pb-2 bg-black/40 rounded-xl border border-white/5 relative">
                        {/* Background grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-6 opacity-5">
                            <div className="border-t border-white w-full"></div>
                            <div className="border-t border-white w-full"></div>
                            <div className="border-t border-white w-full"></div>
                        </div>

                        {filteredStats.profitabilityData.map((d, i) => {
                            const maxVal = 1000000; // Reference for 100% height
                            const heightPercent = Math.min(100, (d.val / maxVal) * 100);
                            return (
                                <div key={i} className="w-[14%] group relative h-full flex flex-col justify-end">
                                    <div
                                        className="w-full bg-[#c9a646] rounded-t-sm transition-all duration-1000 group-hover:bg-[#f7d774] shadow-lg shadow-[#c9a646]/20 relative z-10"
                                        style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-black border border-white/10 px-2 py-1 rounded-md shadow-2xl z-20 whitespace-nowrap">
                                            <p className="text-[9px] font-black text-[#c9a646]">R {Math.round(d.val).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest mt-2 text-center">{d.m}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Growth Index</span>
                            <span className="text-sm font-black text-white">+{Math.round(filteredStats.multiplier * 12)}%</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Efficiency</span>
                            <span className="text-sm font-black text-green-500">OPTIMAL</span>
                        </div>
                    </div>
                </GlassCard>
            </div>


            {/* AI STRATEGIC ADVISORY (Refined & Compact) */}
            <GlassCard className="border-t-2 border-t-[#c9a646] relative overflow-hidden py-6 px-8">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                    <Sparkles size={160} className="text-[#c9a646]" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#c9a646] to-[#af8d2d] flex items-center justify-center shadow-lg shadow-[#c9a646]/10 shrink-0">
                        <Bot size={28} className="text-black" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-[#c9a646] font-black uppercase text-[10px] tracking-[0.3em] mb-2">Gemini Strategic Advisory • {period} Analysis</h4>
                        <p className="text-sm text-gray-300 font-medium leading-relaxed italic max-w-5xl">
                            "Growth trajectory is healthy at <span className="text-white font-black underline decoration-[#c9a646]/50">8.2% annual risk concentration</span>.
                            However, case velocity for 'Complex Litigation' has slowed in the <span className="text-white font-black">120d bracket</span>.
                            I recommend allocating paralegal support to the <span className="text-red-500 font-black">Court Bundle triage</span> to maintain billing efficiency."
                        </p>
                    </div>
                </div>
            </GlassCard>


        </div>
    );
};
// --- TASKS PAGE COMPONENT (CONSTITUTIONAL V1 - THE EXECUTION ENGINE) ---
const TasksPage = ({ tasks, toggleTaskCompletion, onTaskClick, matters, openQuickAdd, setModalType }) => {
    const [filter, setFilter] = useState('Active');
    const [search, setSearch] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskPanel, setShowTaskPanel] = useState(false);

    // Status Calculation Logic (Deterministic)
    const getTaskStatus = (task) => {
        if (task.completed) return 'Completed';
        const today = new Date().toISOString().split('T')[0];
        if (task.dueDate < today) return 'Late';
        if (task.dueDate === today) return 'Today';
        return 'Upcoming';
    };

    // Calculate KPIs
    const activeTasks = tasks.filter(t => !t.completed);
    const lateTasks = activeTasks.filter(t => getTaskStatus(t) === 'Late');
    const todayTasks = activeTasks.filter(t => getTaskStatus(t) === 'Today');
    const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

    // Enhanced filtering with status
    const filtered = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const status = getTaskStatus(t);

        if (filter === 'Active') return !t.completed && matchesSearch;
        if (filter === 'Completed') return t.completed && matchesSearch;
        if (filter === 'Urgent') return t.priority === 'Urgent' && !t.completed && matchesSearch;
        if (filter === 'Late') return status === 'Late' && matchesSearch;
        if (filter === 'Today') return status === 'Today' && matchesSearch;
        if (filter === 'Upcoming') return status === 'Upcoming' && matchesSearch;
        return matchesSearch;
    });

    // Sort: Late first, then Today, then by due date
    const sortedTasks = [...filtered].sort((a, b) => {
        const statusA = getTaskStatus(a);
        const statusB = getTaskStatus(b);

        if (statusA === 'Late' && statusB !== 'Late') return -1;
        if (statusA !== 'Late' && statusB === 'Late') return 1;
        if (statusA === 'Today' && statusB !== 'Today' && statusB !== 'Late') return -1;
        if (statusA !== 'Today' && statusB === 'Today' && statusA !== 'Late') return 1;

        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowTaskPanel(true);
        if (onTaskClick) onTaskClick(task);
    };

    const getStatusColor = (task) => {
        const status = getTaskStatus(task);
        if (status === 'Late') return 'bg-red-500/10 border-l-4 border-l-red-500';
        if (status === 'Today') return 'bg-[#c9a646]/10 border-l-4 border-l-[#c9a646]';
        if (status === 'Completed') return 'bg-green-500/5 border-l-4 border-l-green-500/30';
        return '';
    };

    const getStatusBadge = (task) => {
        const status = getTaskStatus(task);
        if (status === 'Late') return <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-red-500 text-white">LATE</span>;
        if (status === 'Today') return <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-[#c9a646] text-black">TODAY</span>;
        if (status === 'Completed') return <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-green-500 text-white">DONE</span>;
        return <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">UPCOMING</span>;
    };

    return (
        <div className="max-w-[1800px] mx-auto h-full flex gap-6 animate-in fade-in duration-500 flex-col md:flex-row">
            {/* Main Content */}
            <div className="flex-1 md:space-y-6 flex flex-col h-full md:h-auto md:block relative">

                {/* Pane A: The Triage Header (Mobile Optimized) */}
                <div className="md:hidden sticky top-0 z-30 bg-[#000000]/95 backdrop-blur-xl border-b border-white/10 pb-2 -mx-4 px-4 pt-2 mb-4">
                    {/* Search Bar Mobile */}
                    <div className="mb-4 relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2.5 text-sm text-white focus:border-[#c9a646] outline-none transition-all placeholder-gray-600 font-medium"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Horizontal Scrollable Filters */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pr-4">
                        {['Active', 'Late', 'Today', 'Upcoming', 'Completed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wide transition-all border ${filter === f
                                    ? 'bg-[#c9a646] text-black border-[#c9a646] shadow-[0_0_15px_rgba(201,166,70,0.3)]'
                                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                {f}
                                {f === 'Late' && lateTasks.length > 0 && (
                                    <span className="ml-2 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[8px]">{lateTasks.length}</span>
                                )}
                                {f === 'Today' && todayTasks.length > 0 && (
                                    <span className="ml-2 bg-black/20 text-current px-1.5 py-0.5 rounded-full text-[8px]">{todayTasks.length}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPI Dashboard (Desktop Only) */}
                <div className="hidden md:grid grid-cols-4 gap-4">
                    <GlassCard className="p-4 hover:border-[#c9a646]/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Late Tasks</span>
                            <AlertTriangle size={14} className="text-red-500" />
                        </div>
                        <div className="text-3xl font-black text-red-500">{lateTasks.length}</div>
                        <div className="text-[8px] text-gray-600 uppercase font-bold mt-1">Requires Immediate Action</div>
                    </GlassCard>

                    <GlassCard className="p-4 hover:border-[#c9a646]/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Due Today</span>
                            <Clock size={14} className="text-[#c9a646]" />
                        </div>
                        <div className="text-3xl font-black text-[#c9a646]">{todayTasks.length}</div>
                        <div className="text-[8px] text-gray-600 uppercase font-bold mt-1">Today's Deadline</div>
                    </GlassCard>

                    <GlassCard className="p-4 hover:border-[#c9a646]/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Tasks</span>
                            <ListChecks size={14} className="text-blue-400" />
                        </div>
                        <div className="text-3xl font-black text-white">{activeTasks.length}</div>
                        <div className="text-[8px] text-gray-600 uppercase font-bold mt-1">In Progress</div>
                    </GlassCard>

                    <GlassCard className="p-4 hover:border-[#c9a646]/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Completion</span>
                            <TrendingUp size={14} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-black text-green-400">{completionRate}%</div>
                        <div className="text-[8px] text-gray-600 uppercase font-bold mt-1">Overall Progress</div>
                    </GlassCard>
                </div>

                {/* Header Controls (Desktop Only) */}
                <GlassCard className="hidden md:flex p-4 flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <CheckSquare size={20} className="text-[#c9a646]" />
                            <h2 className="text-white font-black uppercase text-sm tracking-widest">Execution Engine</h2>
                        </div>
                        <div className="flex gap-1 bg-white/5 p-1 rounded">
                            {['Active', 'Late', 'Today', 'Urgent', 'Completed', 'All'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all ${filter === f ? 'bg-[#c9a646] text-black shadow-lg shadow-[#c9a646]/20' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {f}
                                    {f === 'Late' && lateTasks.length > 0 && (
                                        <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[7px]">{lateTasks.length}</span>
                                    )}
                                    {f === 'Today' && todayTasks.length > 0 && (
                                        <span className="ml-1 bg-[#c9a646] text-black px-1.5 py-0.5 rounded-full text-[7px]">{todayTasks.length}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-[#c9a646] outline-none transition-all"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button onClick={() => openQuickAdd('task')} className="bg-[#c9a646] hover:bg-[#f7d774] text-black px-4 py-2 rounded font-black text-[10px] uppercase transition-all flex items-center gap-2 shrink-0">
                            <Plus size={14} /> New Task
                        </button>
                    </div>
                </GlassCard>

                {/* Tasks Table (Desktop Only) */}
                <GlassCard className="hidden md:block p-0 overflow-hidden border-t-4 border-t-[#c9a646]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest w-12 text-center">Done</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Status</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Priority</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Title</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Matter Context</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Due Date</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest w-24 text-center">Sync</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedTasks.length === 0 ? (
                                    <tr><td colSpan="7" className="p-20 text-center text-gray-600 uppercase font-black text-[10px] tracking-widest">No matching tasks found</td></tr>
                                ) : sortedTasks.map(t => {
                                    const status = getTaskStatus(t);
                                    const matter = matters.find(m => m.id === t.matterId);

                                    return (
                                        <tr
                                            key={t.id}
                                            className={`hover:bg-white/5 transition-colors cursor-pointer group ${getStatusColor(t)}`}
                                            onClick={() => handleTaskClick(t)}
                                        >
                                            <td className="p-4 text-center" data-label="Done" onClick={e => { e.stopPropagation(); toggleTaskCompletion(t.id); }}>
                                                {t.completed ? <CheckCircle2 className="text-green-500 mx-auto" size={18} /> : <Circle className="text-gray-600 group-hover:text-[#c9a646] mx-auto" size={18} />}
                                            </td>
                                            <td className="p-4" data-label="Status">
                                                {getStatusBadge(t)}
                                            </td>
                                            <td className="p-4" data-label="Priority">
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${t.priority === 'Urgent' ? 'bg-red-500/20 text-red-500' : t.priority === 'High' ? 'bg-orange-500/20 text-orange-500' : 'bg-[#c9a646]/20 text-[#c9a646]'}`}>
                                                    {t.priority}
                                                </span>
                                            </td>
                                            <td className="p-4" data-label="Title">
                                                <p className={`text-sm font-bold ${t.completed ? 'text-gray-600 line-through' : status === 'Late' ? 'text-red-400' : status === 'Today' ? 'text-[#c9a646]' : 'text-white'} group-hover:text-[#f7d774] transition-colors`}>
                                                    {t.title}
                                                </p>
                                            </td>
                                            <td className="p-4" data-label="Matter Context">
                                                <p className="text-xs text-gray-400 font-mono italic">{matter?.name || 'General Operations'}</p>
                                            </td>
                                            <td className="p-4" data-label="Due Date">
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-black uppercase ${status === 'Late' ? 'text-red-500' : status === 'Today' ? 'text-[#c9a646]' : 'text-gray-500'}`}>
                                                        {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    {status === 'Late' && (
                                                        <span className="text-[8px] text-red-500 font-bold uppercase">
                                                            {Math.abs(Math.floor((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24)))}d overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center" data-label="Sync">
                                                <div className="flex items-center justify-center gap-1">
                                                    {t.syncedToCalendar && <CalendarIcon size={12} className="text-green-500" title="Synced to Calendar" />}
                                                    {t.syncedToChat && <MessageSquare size={12} className="text-blue-500" title="Synced to Chat" />}
                                                    {!t.syncedToCalendar && !t.syncedToChat && <span className="text-[8px] text-gray-600">—</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>

                {/* Pane B: The Card Timeline (Mobile Adaptive) */}
                <div className="md:hidden space-y-4 pb-32">
                    {/* Floating Add Button for Mobile Tasks */}
                    <div className="fixed bottom-24 right-4 z-[60]">
                        <button
                            onClick={() => { setModalType('task'); setEditingTask(null); }}
                            className="w-14 h-14 rounded-full bg-[#c9a646] text-black shadow-lg shadow-[#c9a646]/20 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                    {sortedTasks.length === 0 ? (
                        <div className="text-center p-12 opacity-50">
                            <CheckSquare size={48} className="mx-auto mb-4 text-gray-600" />
                            <p className="text-xs font-black uppercase text-gray-500">No tasks in this view</p>
                        </div>
                    ) : sortedTasks.map(t => {
                        const status = getTaskStatus(t);
                        const matter = matters.find(m => m.id === t.matterId);
                        const priorityColor = t.priority === 'Urgent' ? '#ef4444' : t.priority === 'High' ? '#f97316' : '#c9a646';

                        return (
                            <div
                                key={t.id}
                                onClick={() => handleTaskClick(t)}
                                className="group relative"
                            >
                                <GlassCard
                                    className={`relative p-5 overflow-hidden transition-all active:scale-[0.98] ${t.completed ? 'opacity-60' : getStatusColor(t)}`}
                                    style={{ borderLeftWidth: '4px', borderLeftColor: priorityColor }}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Touch-First Checkbox (44px target) */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(t.id); }}
                                            className="min-w-[44px] min-h-[44px] -ml-2 rounded-full flex items-center justify-center transition-colors focus:outline-none"
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${t.completed
                                                ? 'bg-green-500 border-green-500'
                                                : 'border-white/20 group-hover:border-[#c9a646]'
                                                }`}>
                                                {t.completed && <CheckCircle2 size={16} className="text-black" />}
                                            </div>
                                        </button>

                                        <div className="flex-1 min-w-0 pt-1">
                                            {/* Primary Line: Task Title */}
                                            <h3 className={`text-base font-bold leading-snug mb-1.5 ${t.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                {t.title}
                                            </h3>

                                            {/* Secondary Line: Matter + Assignee */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-black text-[#c9a646] uppercase truncate max-w-[60%]">
                                                    {matter?.name || 'General'}
                                                </span>
                                                <span className="text-[10px] text-gray-500">
                                                    • {MOCK_DATA.employees.find(e => e.id === t.assignedTo)?.initials || 'UN'}
                                                </span>
                                            </div>

                                            {/* Urgency Indicator */}
                                            <div className="flex items-center gap-2 text-xs">
                                                <CalendarIcon size={12} className={status === 'Late' ? 'text-red-500' : 'text-gray-500'} />
                                                <span className={`font-bold ${status === 'Late' ? 'text-red-500 uppercase' : 'text-gray-400'}`}>
                                                    {status === 'Late'
                                                        ? `Late: ${new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                                        : new Date(t.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        );
                    })}
                </div>


            </div>

            {/* Pane C: Action Overlay (Full Screen Mobile, Drawer Desktop) */}
            {showTaskPanel && selectedTask && (
                <div className="fixed inset-0 z-[100] md:relative md:inset-auto md:z-0 md:w-96 shrink-0 md:block animate-in slide-in-from-right duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setShowTaskPanel(false)}></div>
                    <GlassCard className="relative w-full h-full md:h-full flex flex-col md:border-l-4 md:border-l-[#c9a646] rounded-none md:rounded-xl">
                        {/* Drawer Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">Task Details</h3>
                                <p className="text-[10px] text-gray-500 font-mono uppercase truncate w-64">
                                    ID: {selectedTask.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowTaskPanel(false)}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Urgent Status Banner if needed */}
                            {getTaskStatus(selectedTask) === 'Late' && (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
                                    <AlertTriangle size={20} className="text-red-500" />
                                    <div>
                                        <p className="text-xs font-black text-red-500 uppercase">Overdue Critical Item</p>
                                        <p className="text-[10px] text-gray-400">This item requires immediate resolution.</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Objective</label>
                                <p className="text-xl font-black text-white leading-tight">{selectedTask.title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Matter</label>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <p className="text-xs font-bold text-[#f7d774] truncate">
                                            {matters.find(m => m.id === selectedTask.matterId)?.name || 'General'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Deadline</label>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <p className={`text-xs font-bold ${getTaskStatus(selectedTask) === 'Late' ? 'text-red-500' : 'text-white'}`}>
                                            {new Date(selectedTask.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Directives</label>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-sm text-gray-300 leading-relaxed font-serif">
                                        {selectedTask.description}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Assigned Agent</label>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-[#c9a646] flex items-center justify-center text-[10px] font-black text-black">
                                        {MOCK_DATA.employees.find(e => e.id === selectedTask.assignedTo)?.initials || '??'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white max-w-[150px] truncate">
                                            {MOCK_DATA.employees.find(e => e.id === selectedTask.assignedTo)?.full_name || 'Unassigned'}
                                        </p>
                                        <p className="text-[9px] text-gray-500 uppercase">Responsible Party</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Audit Trail</label>
                                <div className="space-y-3">
                                    {selectedTask.auditLog?.map((log, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="w-1 bg-[#c9a646]/30 rounded-full my-1"></div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-gray-300 uppercase">{log.action}</p>
                                                <p className="text-[9px] text-gray-500 mt-1">{log.details}</p>
                                                <p className="text-[8px] text-gray-600 mt-1">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.user}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Drawer Actions */}
                        <div className="p-4 border-t border-white/10 bg-[#121212]/50 backdrop-blur-md pb-8 md:pb-4">
                            <div className="flex gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(selectedTask.id); }}
                                    className={`flex-1 py-4 md:py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-xl ${selectedTask.completed
                                        ? 'bg-gray-800 text-white border border-gray-700'
                                        : 'bg-[#c9a646] text-black hover:bg-[#f7d774] shadow-[#c9a646]/20'
                                        }`}
                                >
                                    {selectedTask.completed ? 'Reopen Case' : 'Complete Task'}
                                </button>
                                <button className="w-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                                    <Edit2 size={18} />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

// --- CALENDAR PAGE COMPONENT (CONSTITUTIONAL V1 - THE PULSE) ---
const CalendarPage = ({ events: initialEvents, matters, onEventClick, openQuickAdd }) => {
    const [view, setView] = useState('month'); // 'month' | 'week' | 'day' | 'agenda'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventDrawer, setShowEventDrawer] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [events, setEvents] = useState(initialEvents);
    const [sourceFilters, setSourceFilters] = useState({
        events: true,
        tasks: true,
        notes: true
    });

    // Event form state
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        start: '',
        end: '',
        location: '',
        matterId: '',
        category: 'Internal',
        type: 'EVENT'
    });

    // Sync Health Monitor (Heartbeat Doctrine)
    const getSyncHealth = () => {
        const now = Date.now();
        const threshold = 15 * 60 * 1000; // 15 minutes
        const staleEvents = events.filter(e => {
            if (!e.lastSyncedAt) return false;
            return (now - new Date(e.lastSyncedAt).getTime()) > threshold;
        });

        if (staleEvents.length > 0) {
            return { status: 'warning', message: `${staleEvents.length} events >15min stale`, color: 'text-orange-500' };
        }

        const lastSync = events
            .filter(e => e.lastSyncedAt)
            .map(e => new Date(e.lastSyncedAt).getTime())
            .sort((a, b) => b - a)[0];

        if (!lastSync) return { status: 'local', message: 'Local only', color: 'text-gray-500' };

        const minutesAgo = Math.floor((now - lastSync) / 60000);
        return {
            status: 'healthy',
            message: `Synced ${minutesAgo}m ago`,
            color: 'text-green-500'
        };
    };

    const syncHealth = getSyncHealth();

    // Filter events by source type
    const filteredEvents = events.filter(e => {
        if (e.type === 'EVENT' && !sourceFilters.events) return false;
        if (e.type === 'TASK' && !sourceFilters.tasks) return false;
        if (e.type === 'NOTE' && !sourceFilters.notes) return false;
        return true;
    });

    // Get current month/year
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const today = new Date();

    // Calendar grid logic
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setShowEventDrawer(true);
        if (onEventClick) onEventClick(event);
    };


    const getEventColor = (event) => {
        if (event.type === 'TASK') return 'border-red-500 bg-red-500/10 text-red-200';
        if (event.type === 'NOTE') return 'border-[#c9a646] bg-[#c9a646]/10 text-[#c9a646]';
        if (event.category === 'Court') return 'border-purple-500 bg-purple-500/10 text-purple-200';
        return 'border-blue-500 bg-blue-500/10 text-blue-200';
    };

    // Event CRUD Functions
    const openCreateEventModal = (date = null, hour = null) => {
        const startDate = date || selectedDate;
        const startHour = hour !== null ? hour : 9; // Default to 9 AM

        const start = new Date(startDate);
        start.setHours(startHour, 0, 0, 0);

        const end = new Date(start);
        end.setHours(startHour + 1, 0, 0, 0); // Default 1-hour duration

        setEventForm({
            title: '',
            description: '',
            start: start.toISOString().slice(0, 16),
            end: end.toISOString().slice(0, 16),
            location: '',
            matterId: '',
            category: 'Internal',
            type: 'EVENT'
        });
        setEditingEvent(null);
        setShowEventModal(true);
    };

    const openEditEventModal = (event) => {
        setEventForm({
            title: event.title,
            description: event.description || '',
            start: new Date(event.start).toISOString().slice(0, 16),
            end: new Date(event.end).toISOString().slice(0, 16),
            location: event.location || '',
            matterId: event.matterId || '',
            category: event.category || 'Internal',
            type: event.type || 'EVENT'
        });
        setEditingEvent(event);
        setShowEventModal(true);
        setShowEventDrawer(false);
    };

    const handleSaveEvent = () => {
        if (!eventForm.title.trim()) {
            alert('Please enter an event title');
            return;
        }

        const now = new Date().toISOString();

        if (editingEvent) {
            // Update existing event
            setEvents(events.map(e => e.id === editingEvent.id ? {
                ...e,
                title: eventForm.title,
                description: eventForm.description,
                start: eventForm.start,
                end: eventForm.end,
                location: eventForm.location,
                matterId: eventForm.matterId,
                category: eventForm.category,
                type: eventForm.type,
                activityLog: [
                    ...(e.activityLog || []),
                    {
                        timestamp: now,
                        action: 'Event Updated',
                        user: 'Current User',
                        details: 'Event details modified'
                    }
                ]
            } : e));
        } else {
            // Create new event
            const newEvent = {
                id: `ev_${Date.now()}`,
                title: eventForm.title,
                description: eventForm.description,
                start: eventForm.start,
                end: eventForm.end,
                location: eventForm.location,
                matterId: eventForm.matterId,
                category: eventForm.category,
                type: eventForm.type,
                createdBy: 'emp_001',
                createdAt: now,
                allDay: false,
                googleEventId: null,
                googleCalendarId: null,
                lastSyncedAt: null,
                syncStatus: 'local-only',
                attendees: [],
                activityLog: [
                    {
                        timestamp: now,
                        action: 'Event Created',
                        user: 'Current User',
                        details: 'New event added to calendar'
                    }
                ]
            };
            setEvents([...events, newEvent]);
        }

        setShowEventModal(false);
        setEventForm({
            title: '',
            description: '',
            start: '',
            end: '',
            location: '',
            matterId: '',
            category: 'Internal',
            type: 'EVENT'
        });
    };

    const handleDeleteEvent = (event) => {
        if (confirm(`Are you sure you want to delete "${event.title}"?\n\nThis action cannot be undone.`)) {
            setEvents(events.filter(e => e.id !== event.id));
            setShowEventDrawer(false);
            setSelectedEvent(null);
        }
    };

    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


    return (
        <div className="max-w-[1800px] mx-auto h-full flex gap-6 animate-in fade-in duration-500">
            {/* PANE A: SOURCE EXPLORER (Left Sidebar) - HIDDEN ON MOBILE */}
            <div className="hidden md:block w-64 shrink-0 space-y-4">
                <GlassCard className="p-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#c9a646] mb-4">Calendar Sources</h3>
                    <div className="space-y-3">
                        {[
                            { key: 'events', label: 'Events', count: events.filter(e => e.type === 'EVENT').length, icon: CalendarIcon },
                            { key: 'tasks', label: 'Tasks', count: events.filter(e => e.type === 'TASK').length, icon: CheckSquare },
                            { key: 'notes', label: 'Notes', count: events.filter(e => e.type === 'NOTE').length, icon: StickyNote }
                        ].map(source => (
                            <label key={source.key} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={sourceFilters[source.key]}
                                    onChange={() => setSourceFilters(prev => ({ ...prev, [source.key]: !prev[source.key] }))}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-[#c9a646] checked:border-[#c9a646] transition-all"
                                />
                                <source.icon size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                                <span className="text-xs font-bold text-white flex-1">{source.label}</span>
                                <span className="text-[10px] font-black text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{source.count}</span>
                            </label>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#c9a646] mb-4 flex items-center gap-2">
                        <RefreshCw size={10} /> Sync Health
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Status</span>
                            <span className={`text-[9px] font-black uppercase ${syncHealth.color}`}>{syncHealth.status}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Last Sync</span>
                            <span className="text-[9px] font-black text-white">{syncHealth.message}</span>
                        </div>
                        <div className="pt-2 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${syncHealth.status === 'healthy' ? 'bg-green-500' : syncHealth.status === 'warning' ? 'bg-orange-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                <span className="text-[8px] font-bold text-gray-600 uppercase">Google Calendar</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#c9a646] mb-4">Quick Stats</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">This Week</span>
                            <span className="text-sm font-black text-white">{events.filter(e => {
                                const eventDate = new Date(e.start);
                                const weekStart = new Date(today);
                                weekStart.setDate(today.getDate() - today.getDay() + 1);
                                const weekEnd = new Date(weekStart);
                                weekEnd.setDate(weekStart.getDate() + 7);
                                return eventDate >= weekStart && eventDate < weekEnd;
                            }).length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Court Dates</span>
                            <span className="text-sm font-black text-purple-400">{events.filter(e => e.category === 'Court').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Deadlines</span>
                            <span className="text-sm font-black text-red-400">{events.filter(e => e.category === 'Deadline').length}</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* PANE B: TIMELINE WORKSPACE (Center) */}
            <div className="flex-1 space-y-4">
                {/* Header Controls */}
                <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                        <div className="flex items-center gap-4">
                            <CalendarIcon className="text-[#c9a646]" size={24} />
                            <div>
                                <h2 className="text-white font-black uppercase text-sm tracking-widest">The Pulse</h2>
                                <p className="text-lg text-[#c9a646] font-black uppercase tracking-wide">{MONTHS[currentMonth]} {currentYear}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:hidden">
                            {/* Mobile View Toggles */}
                            <div className="flex bg-white/5 rounded p-1 overflow-x-auto no-scrollbar">
                                {['month', 'week', 'day', 'agenda'].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v)}
                                        className={`px-3 py-1 rounded text-[8px] font-black uppercase transition-all whitespace-nowrap ${view === v ? 'bg-[#c9a646] text-black' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center justify-between w-full md:w-auto gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const newDate = new Date(selectedDate);
                                        newDate.setMonth(newDate.getMonth() - 1);
                                        setSelectedDate(newDate);
                                    }}
                                    className="p-2 hover:bg-white/5 rounded transition-all"
                                >
                                    <ChevronLeft size={16} className="text-gray-500" />
                                </button>
                                <button
                                    onClick={() => setSelectedDate(new Date())}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[9px] font-black uppercase text-gray-400 hover:text-white transition-all"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => {
                                        const newDate = new Date(selectedDate);
                                        newDate.setMonth(newDate.getMonth() + 1);
                                        setSelectedDate(newDate);
                                    }}
                                    className="p-2 hover:bg-white/5 rounded transition-all"
                                >
                                    <ChevronRight size={16} className="text-gray-500" />
                                </button>
                            </div>

                            <button onClick={() => openQuickAdd('event')} className="bg-[#c9a646] hover:bg-[#f7d774] text-black px-4 py-2 rounded font-black text-[10px] uppercase transition-all flex items-center gap-2 md:hidden">
                                <Plus size={14} /> New
                            </button>
                        </div>

                        <div className="hidden md:flex h-6 w-px bg-white/10"></div>

                        <button onClick={() => openQuickAdd('event')} className="hidden md:flex bg-[#c9a646] hover:bg-[#f7d774] text-black px-4 py-2 rounded font-black text-[10px] uppercase transition-all items-center gap-2">
                            <Plus size={14} /> New Event
                        </button>

                        <div className="hidden md:flex bg-white/5 rounded p-1">
                            {['month', 'week', 'day', 'agenda'].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-3 py-1 rounded text-[8px] font-black uppercase transition-all ${view === v ? 'bg-[#c9a646] text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                </GlassCard>


                {/* Calendar Grid (Month View) */}
                {view === 'month' && (
                    <CalendarMonthView
                        selectedDate={selectedDate}
                        filteredEvents={filteredEvents}
                        handleEventClick={handleEventClick}
                        openCreateEventModal={openQuickAdd}
                        DAYS={DAYS}
                        startOffset={startOffset}
                        daysInMonth={daysInMonth}
                        today={today}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                        getEventColor={getEventColor}
                    />
                )}

                {/* WEEK VIEW */}
                {view === 'week' && (
                    <CalendarWeekView
                        selectedDate={selectedDate}
                        filteredEvents={filteredEvents}
                        handleEventClick={handleEventClick}
                        openCreateEventModal={openQuickAdd}
                        DAYS={DAYS}
                    />
                )}

                {/* Agenda View */}
                {view === 'agenda' && (
                    <GlassCard className="p-6">
                        <div className="space-y-4">
                            {filteredEvents
                                .sort((a, b) => new Date(a.start) - new Date(b.start))
                                .map(event => {
                                    const eventDate = new Date(event.start);
                                    const matter = matters.find(m => m.id === event.matterId);

                                    return (
                                        <div
                                            key={event.id}
                                            onClick={() => handleEventClick(event)}
                                            className="flex items-start gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-[#c9a646]/30 transition-all cursor-pointer group"
                                        >
                                            <div className="text-center shrink-0">
                                                <div className="text-2xl font-black text-white">{eventDate.getDate()}</div>
                                                <div className="text-[8px] font-black text-gray-600 uppercase">{MONTHS[eventDate.getMonth()].slice(0, 3)}</div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-black text-white group-hover:text-[#c9a646] transition-colors">{event.title}</h4>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${getEventColor(event)}`}>
                                                        {event.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mb-2">{event.description}</p>
                                                <div className="flex items-center gap-4 text-[9px] text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} /> {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {event.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={10} /> {event.location}
                                                        </span>
                                                    )}
                                                    {matter && (
                                                        <span className="flex items-center gap-1 text-[#c9a646]">
                                                            <Briefcase size={10} /> {matter.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${event.syncStatus === 'synced' ? 'bg-green-500' : event.syncStatus === 'pending' ? 'bg-orange-500 animate-pulse' : 'bg-gray-500'}`} title={event.syncStatus}></div>
                                        </div>
                                    );
                                })}
                        </div>
                    </GlassCard>
                )}


                {/* WEEK VIEW - Google Calendar Style */}
                {view === 'week' && (
                    <CalendarWeekView
                        selectedDate={selectedDate}
                        filteredEvents={filteredEvents}
                        handleEventClick={handleEventClick}
                        openCreateEventModal={openQuickAdd}
                        DAYS={DAYS}
                    />
                )}

                {/* DAY VIEW - Google Calendar Style */}
                {view === 'day' && (
                    <CalendarDayView
                        selectedDate={selectedDate}
                        filteredEvents={filteredEvents}
                        handleEventClick={handleEventClick}
                        openCreateEventModal={openQuickAdd}
                    />
                )}
            </div>

            {/* PANE C: EVENT DRAWER (Right Panel - Conditional) */}
            {showEventDrawer && selectedEvent && (
                <div className="w-96 shrink-0 animate-in slide-in-from-right duration-300">



                    <GlassCard className="p-6 h-full flex flex-col border-l-4 border-l-[#c9a646]">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Event Details</h3>
                            <button onClick={() => setShowEventDrawer(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Title</label>
                                <p className="text-sm font-bold text-white">{selectedEvent.title}</p>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Description</label>
                                <p className="text-xs text-gray-400 leading-relaxed">{selectedEvent.description || 'No description provided.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Type</label>
                                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${getEventColor(selectedEvent)}`}>
                                        {selectedEvent.type}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Category</label>
                                    <p className="text-xs font-bold text-white">{selectedEvent.category}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Time</label>
                                <p className="text-xs font-bold text-white">
                                    {new Date(selectedEvent.start).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    {' → '}
                                    {new Date(selectedEvent.end).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            {selectedEvent.location && (
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Location</label>
                                    <p className="text-xs font-bold text-white flex items-center gap-2">
                                        <MapPin size={12} className="text-[#c9a646]" />
                                        {selectedEvent.location}
                                    </p>
                                </div>
                            )}

                            {selectedEvent.matterId && (
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Matter Context</label>
                                    <p className="text-xs font-bold text-[#c9a646]">
                                        {matters.find(m => m.id === selectedEvent.matterId)?.name || 'Unknown Matter'}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white/10">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-3">Sync Status</label>
                                <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                    <span className="text-xs font-bold text-white">Google Calendar</span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedEvent.syncStatus === 'synced' ? 'bg-green-500' : selectedEvent.syncStatus === 'pending' ? 'bg-orange-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                        <span className="text-[9px] font-black uppercase text-gray-500">{selectedEvent.syncStatus}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-3">Activity Log</label>
                                <div className="space-y-2">
                                    {selectedEvent.activityLog?.map((log, idx) => (
                                        <div key={idx} className="bg-white/5 p-3 rounded-lg border-l-2 border-[#c9a646]/30">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[9px] font-black text-white uppercase">{log.action}</span>
                                                <span className="text-[8px] font-bold text-gray-600">
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400">{log.details}</p>
                                            <p className="text-[8px] text-gray-600 mt-1">by {log.user}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex gap-3">
                            <button
                                onClick={() => openEditEventModal(selectedEvent)}
                                className="flex-1 bg-[#c9a646] hover:bg-[#f7d774] text-black py-2 rounded font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2"
                            >
                                <Edit size={14} /> Edit Event
                            </button>
                            <button
                                onClick={() => handleDeleteEvent(selectedEvent)}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded font-black text-[10px] uppercase transition-all hover:bg-red-500/30"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* EVENT CREATION/EDIT MODAL (Google Calendar Style) */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-gradient-to-br from-black/95 to-black/90 border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                {editingEvent ? 'Edit Event' : 'Create New Event'}
                            </h2>
                            <button
                                onClick={() => setShowEventModal(false)}
                                className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
                            {/* Title */}
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                    placeholder="Add title"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#c9a646] focus:bg-white/10 outline-none transition-all text-lg font-bold"
                                    autoFocus
                                />
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                                        Start Date & Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={eventForm.start}
                                        onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#c9a646] focus:bg-white/10 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                                        End Date & Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={eventForm.end}
                                        onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#c9a646] focus:bg-white/10 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                                    <MapPin size={10} className="inline mr-1" /> Location
                                </label>
                                <input
                                    type="text"
                                    value={eventForm.location}
                                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                    placeholder="Add location"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#c9a646] focus:bg-white/10 outline-none transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                    placeholder="Add description"
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#c9a646] focus:bg-white/10 outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Matter & Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                                        <Briefcase size={10} className="inline mr-1" /> Matter Context
                                    </label>
                                    <select
                                        value={eventForm.matterId}
                                        onChange={(e) => setEventForm({ ...eventForm, matterId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#c9a646] focus:bg-white/10 outline-none transition-all"
                                    >
                                        <option value="">General / No Matter</option>
                                        {matters.map(m => (
                                            <option key={m.id} value={m.id} className="bg-black">
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={eventForm.category}
                                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#c9a646] focus:bg-white/10 outline-none transition-all"
                                    >
                                        <option value="Internal" className="bg-black">Internal</option>
                                        <option value="Court" className="bg-black">Court</option>
                                        <option value="Consultation" className="bg-black">Consultation</option>
                                        <option value="Deadline" className="bg-black">Deadline</option>
                                    </select>
                                </div>
                            </div>

                            {/* Event Type */}
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">
                                    Event Type
                                </label>
                                <div className="flex gap-3">
                                    {['EVENT', 'TASK', 'NOTE'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setEventForm({ ...eventForm, type })}
                                            className={`flex-1 py-3 rounded-lg font-black text-[10px] uppercase transition-all ${eventForm.type === type
                                                ? 'bg-[#c9a646] text-black shadow-lg shadow-[#c9a646]/20'
                                                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/10 flex gap-3">
                            <button
                                onClick={() => setShowEventModal(false)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-black text-[11px] uppercase transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEvent}
                                className="flex-1 bg-[#c9a646] hover:bg-[#f7d774] text-black py-3 rounded-lg font-black text-[11px] uppercase transition-all shadow-lg shadow-[#c9a646]/20"
                            >
                                {editingEvent ? 'Update Event' : 'Create Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};




// --- MODAL COMPONENTS ---

const QuickAddMenu = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed bottom-24 right-8 w-64 bg-[#121212] border border-white/10 rounded-xl shadow-2xl shadow-black z-[60] overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
            <div className="bg-[#c9a646] p-3 flex justify-between items-center">
                <span className="text-black font-black uppercase text-xs tracking-widest flex items-center gap-2">
                    <Zap size={12} fill="black" /> Quick Actions
                </span>
                <X size={14} className="text-black cursor-pointer hover:scale-110 transition-transform" onClick={onClose} />
            </div>
            <div className="p-2 space-y-1">
                {[
                    { id: 'task', label: 'New Task', icon: CheckSquare, desc: 'Create logic item' },
                    { id: 'note', label: 'New Note', icon: StickyNote, desc: 'Internal memo' },
                    { id: 'reminder', label: 'Set Reminder', icon: Bell, desc: 'Time alert' },
                    { id: 'doc', label: 'Upload Document', icon: Upload, desc: 'Add to Vault' },
                    { id: 'msg', label: 'Send Message', icon: MessageSquare, desc: 'Secure chat' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className="w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-all group hover:bg-white/5 border border-transparent hover:border-white/5"
                    >
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-gray-500 group-hover:text-[#c9a646] transition-colors border border-white/10">
                            <item.icon size={14} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-white group-hover:text-[#c9a646] transition-colors uppercase">{item.label}</p>
                            <p className="text-[9px] font-bold text-gray-600 group-hover:text-gray-500">{item.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
            <div className="bg-black/50 p-2 text-center">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Context Aware System</p>
            </div>
        </div>
    );
};

// --- ROBUST MODALS ---

const InputField = ({ label, name, type = "text", required = false, defaultValue, step }) => (
    <div className="mb-4">
        <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block tracking-wider">{label}</label>
        <input name={name} type={type} required={required} defaultValue={defaultValue} step={step} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-[#c9a646] outline-none transition-colors" />
    </div>
);

const SelectField = ({ label, name, options, defaultValue, onChange, required }) => (
    <div className="mb-4">
        <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block tracking-wider">{label}</label>
        <select
            name={name}
            defaultValue={defaultValue}
            onChange={onChange}
            required={required}
            className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-[#c9a646] outline-none transition-colors"
        >
            <option value="">Select Option...</option>
            {options.map((opt, i) => <option key={i} value={opt.value || opt}>{opt.label || opt}</option>)}
        </select>
    </div>
);

const TaskModal = ({ isOpen, onClose, onSave, matters, editTask, defaultMatterId, employees }) => {
    if (!isOpen) return null;
    const isEditing = !!editTask;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
            <GlassCard className="w-full h-full md:h-auto md:max-w-lg border-[#c9a646] rounded-none md:rounded-xl overflow-y-auto">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-[#c9a646] font-black uppercase tracking-widest text-sm flex items-center gap-2">
                        <CheckSquare size={16} /> {isEditing ? 'Edit Task' : 'New Priority Task'}
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-white" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(new FormData(e.target), editTask); }}>
                    <InputField label="Task Title" name="title" required defaultValue={editTask?.title} />
                    <div className="mb-4">
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block tracking-wider">Description</label>
                        <textarea
                            name="description"
                            defaultValue={editTask?.description}
                            className="w-full h-24 bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-[#c9a646] outline-none transition-colors"
                            placeholder="Task details..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Due Date" name="dueDate" type="date" required defaultValue={editTask?.dueDate} />
                        <SelectField label="Priority" name="priority" options={['Urgent', 'High', 'Normal']} defaultValue={editTask?.priority} />
                    </div>
                    <SelectField
                        label="Related Matter"
                        name="matterId"
                        required
                        options={matters.map(m => ({ value: m.id, label: m.name }))}
                        defaultValue={editTask?.matterId || defaultMatterId}
                    />
                    <SelectField
                        label="Assigned Force"
                        name="assignedTo"
                        required
                        options={employees.map(emp => ({ value: emp.id, label: emp.full_name }))}
                        defaultValue={editTask?.assignedTo}
                    />
                    <button type="submit" className="w-full btn mt-4">{isEditing ? 'Update Task' : 'Create Task'}</button>
                </form>
            </GlassCard>
        </div>
    );
};

const MatterModal = ({ isOpen, onClose, onSave, employees }) => {
    const [category, setCategory] = useState('');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
            <GlassCard className="w-full h-full md:!max-h-[90vh] md:max-w-2xl border-[#c9a646] overflow-y-auto custom-scrollbar rounded-none md:rounded-xl">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-[#c9a646] font-black uppercase tracking-widest text-sm flex items-center gap-2"><Briefcase size={16} /> New Matter Intake</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-white" /></button>
                </div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    onSave(formData);
                }}>
                    <div className="grid grid-cols-2 gap-6">
                        <InputField label="Matter Name / Citation" name="name" required placeholder="e.g. Smith v Jones" />
                        <InputField label="Primary Client" name="client" required placeholder="Client Name" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <SelectField
                            label="Legal Category"
                            name="category"
                            required
                            options={['Civil Litigation', 'Criminal Defense', 'Commercial', 'Family Law', 'Estates']}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                        <InputField label="Jurisdiction / Court" name="jurisdiction" defaultValue="Gauteng High Court" />
                    </div>

                    {/* Conditional Fields Based on Category */}
                    {category === 'Civil Litigation' && (
                        <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                            <InputField label="Claim Value (R)" name="claimValue" type="number" placeholder="500000" />
                            <InputField label="Opposing Counsel" name="opposingCounsel" />
                        </div>
                    )}
                    {category === 'Criminal Defense' && (
                        <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                            <InputField label="Police Case Number (CAS)" name="casNumber" placeholder="123/01/2026" />
                            <InputField label="Investigating Officer" name="investigatingOfficer" />
                        </div>
                    )}
                    {category === 'Family Law' && (
                        <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                            <InputField label="Spouse/Party B Name" name="spouseName" />
                            <SelectField label="Type" name="familyType" options={['Divorce', 'Custody', 'Maintenance']} />
                        </div>
                    )}
                    {category === 'Estates' && (
                        <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                            <InputField label="Deceased Name" name="deceasedName" />
                            <InputField label="Master's Ref Number" name="mastersRef" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 mb-4">
                        <InputField label="Action Date / Milestone" name="incidentDate" type="date" />
                    </div>
                    <div className="mb-6">
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block tracking-wider">Matter Synopsis & Objectives</label>
                        <textarea name="description" required className="w-full h-24 bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-[#c9a646] outline-none" placeholder="Detailed description of the matter..." />
                    </div>
                    <div className="mb-6">
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-wider">Assign Initial Team</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {employees.map(emp => (
                                <label key={emp.id} className="flex items-center gap-2 bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10 transition-colors">
                                    <input type="checkbox" name="team" value={emp.full_name} className="accent-[#c9a646]" />
                                    <span className="text-[10px] font-bold text-gray-300 uppercase">{emp.full_name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-white/10 rounded text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Cancel</button>
                        <button type="submit" className="flex-[2] py-3 bg-[#c9a646] text-black rounded text-[10px] font-black uppercase tracking-widest hover:bg-[#f7d774] transition-all flex items-center justify-center gap-2">
                            <Plus size={16} /> Initialize Matter
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

const EventModal = ({ isOpen, onClose, matters }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-0 md:p-4">
            <GlassCard className="w-full h-full md:h-auto md:max-w-lg border-[#c9a646] rounded-none md:rounded-xl overflow-y-auto">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-[#c9a646] font-black uppercase tracking-widest text-sm flex items-center gap-2"><CalendarIcon size={16} /> Schedule Event</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-white" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onClose(); }}>
                    <InputField label="Event Title" name="title" required />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Start Time" name="start" type="datetime-local" required />
                        <InputField label="End Time" name="end" type="datetime-local" required />
                    </div>
                    <SelectField label="Type" name="type" options={['Court Appearance', 'Client Consultation', 'Internal Meeting', 'Deadline']} />
                    <SelectField label="Related Matter" name="matterId" options={matters.map(m => ({ value: m.id, label: m.name }))} />
                    <button type="submit" className="w-full btn mt-4">Add to Calendar</button>
                </form>
            </GlassCard>
        </div>
    );
};

const ClientModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-lg border-[#c9a646]">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-[#c9a646] font-black uppercase tracking-widest text-sm flex items-center gap-2"><UserPlus size={16} /> New Client Intake</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-white" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onClose(); }}>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="First Name" name="fname" required />
                        <InputField label="Last Name" name="lname" required />
                    </div>
                    <InputField label="Email Address" name="email" type="email" required />
                    <InputField label="Phone Number" name="phone" type="tel" required />
                    <SelectField label="Type" name="type" options={['Individual', 'Corporate', 'Government']} />
                    <button type="submit" className="w-full btn mt-4">Create Client Profile</button>
                </form>
            </GlassCard>
        </div>
    );
};

const TimeEntryModal = ({ isOpen, onClose, matters, defaultMatterId, onSave, employees }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-lg border-[#c9a646]">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-[#c9a646] font-black uppercase tracking-widest text-sm flex items-center gap-2"><Clock size={16} /> New Time Entry</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-white" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(new FormData(e.target)); }}>
                    <SelectField
                        label="Matter Binding"
                        name="matterId"
                        required
                        options={matters.map(m => ({ value: m.id, label: m.name }))}
                        defaultValue={defaultMatterId}
                    />
                    <SelectField
                        label="Acting Staff Member"
                        name="resource"
                        required
                        options={employees.map(e => ({ value: e.full_name, label: e.full_name }))}
                        defaultValue={ACTIVE_STAFF.name}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Duration (Hours)" name="duration" type="number" step="0.1" required />
                        <InputField label="Date of Work" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <InputField label="Deliverable Description" name="description" required placeholder="e.g. Drafting summons, research..." />
                    <button type="submit" className="w-full btn mt-4">Record Billable Units</button>
                </form>
            </GlassCard>
        </div>
    );
};


const NoteModal = ({ isOpen, onClose, matters, defaultMatterId }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-lg border-[#c9a646]">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10"><h3 className="text-[#c9a646] font-black uppercase text-sm"><StickyNote size={16} className="inline mr-2" /> New Internal Note</h3><button onClick={onClose}><X size={20} /></button></div>
                <textarea className="w-full h-32 bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-[#c9a646] outline-none mb-4" placeholder="Type your note here..."></textarea>
                <select className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-gray-400 mb-4" defaultValue={defaultMatterId}>
                    {matters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <div className="flex justify-between items-center"><span className="text-xs text-gray-500 italic">Saved privately.</span><button onClick={onClose} className="btn">Save Note</button></div>
            </GlassCard>
        </div>
    );
};

const UploadModal = ({ isOpen, onClose, onUpload, matters, defaultMatterId }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Please select a file first.');
            return;
        }
        setUploading(true);
        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
            setProgress(i);
            await new Promise(r => setTimeout(r, 100));
        }
        onUpload(new FormData(e.target));
        setUploading(false);
        setProgress(0);
        setSelectedFile(null);
    };

    return (
        <div className="fixed inset-0 z-[130] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in duration-300">
            <GlassCard className="w-full max-w-lg border-[#c9a646]">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-[#c9a646] font-black uppercase tracking-widest text-sm flex items-center gap-2"><Upload size={16} /> Digital File Upload</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-white" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-[#c9a646] transition-all cursor-pointer group mb-6 relative overflow-hidden">
                        {uploading && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-[#c9a646] transition-all" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Uploading... {progress}%</p>
                            </div>
                        )}
                        <Upload size={48} className="text-gray-700 group-hover:text-[#c9a646] mx-auto mb-4 transition-colors" />
                        <p className="text-sm font-bold text-white mb-2">{selectedFile ? selectedFile.name : 'Drop legal documents here'}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PDF, DOCX, ZIP supported (Max 50MB)</p>
                        <input type="file" className="hidden" id="file-upload" name="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                        <label htmlFor="file-upload" className="mt-6 inline-block px-6 py-2 bg-white/5 rounded text-[10px] font-black uppercase tracking-widest text-[#c9a646] hover:bg-[#c9a646] hover:text-black cursor-pointer transition-all">Select Local Files</label>
                    </div>

                    <SelectField
                        label="Primary Matter Binding"
                        name="matterId"
                        options={matters.map(m => ({ value: m.id, label: m.name }))}
                        defaultValue={defaultMatterId}
                    />

                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-white/10 rounded text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Cancel</button>
                        <button type="submit" disabled={uploading || !selectedFile} className="flex-[2] py-3 bg-[#c9a646] text-black rounded text-[10px] font-black uppercase tracking-widest hover:bg-[#f7d774] transition-all disabled:opacity-30">Secure Upload</button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

const MessageModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-lg border-[#c9a646]">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-[#c9a646] font-black uppercase tracking-widest text-sm flex items-center gap-2"><MessageSquare size={16} /> Secure Message</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-white" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onClose(); }}>
                    <InputField label="Recipient (Email or Client Name)" name="recipient" required />
                    <InputField label="Subject" name="subject" required />
                    <div className="mb-4">
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block tracking-wider">Message</label>
                        <textarea className="w-full h-32 bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-[#c9a646] outline-none" placeholder="Type secure message..."></textarea>
                    </div>
                    <button type="submit" className="w-full btn">Send Encrypted</button>
                </form>
            </GlassCard>
        </div>
    );
};

const ReminderModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-sm border-[#c9a646]">
                <div className="flex justify-between items-center mb-6"><h3 className="text-[#c9a646] font-black uppercase text-sm"><Bell size={16} className="inline mr-2" /> Set Reminder</h3><button onClick={onClose}><X size={20} /></button></div>
                <input className="w-full bg-black/40 border border-white/10 rounded p-3 mb-4 text-white" placeholder="Remind me to..." />
                <input type="datetime-local" className="w-full bg-black/40 border border-white/10 rounded p-3 mb-4 text-white" />
                <button onClick={onClose} className="w-full btn">Set Reminder</button>
            </GlassCard>
        </div>
    );
};

// --- MODERN VOICE PLAYER (WhatsApp Style) ---
const VoiceNotePlayer = ({ audioUrl, msgId, playingAudioId, setPlayingAudioId }) => {
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const audioRef = useRef(null);

    const isPlaying = playingAudioId === msgId;

    useEffect(() => {
        if (!isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPaused(true);
        }
    }, [isPlaying]);

    const handleTogglePlay = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onloadedmetadata = () => setDuration(audioRef.current.duration);
            audioRef.current.ontimeupdate = () => setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
            audioRef.current.onended = () => {
                setPlayingAudioId(null);
                setProgress(0);
                setIsPaused(true);
            };
        }

        if (isPlaying && !isPaused) {
            audioRef.current.pause();
            setIsPaused(true);
        } else {
            setPlayingAudioId(msgId);
            audioRef.current.play();
            setIsPaused(false);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="mt-3 bg-black/30 p-2.5 rounded-xl flex items-center gap-3 border border-white/5">
            <button
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-full bg-[#c9a646] text-black flex items-center justify-center hover:bg-[#f7d774] shadow-lg transition-all"
            >
                {isPlaying && !isPaused ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">Audio Feed</span>
                    <span className="text-[9px] font-mono text-[#c9a646]">{formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-[#c9a646] transition-all duration-100" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};

// --- JKM UNIFIED CHAT SYSTEM (THE NERVOUS SYSTEM) ---

const LegacyChatPage = ({ matters, chatState, setChatState, employees, billingEntries, tasks }) => {
    const [activeChannelId, setActiveChannelId] = useState(chatState.channels[0]?.id || null);
    const [aiMode, setAiMode] = useState('General Assistant');
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    const AI_THEMES = useMemo(() => ({
        'General Assistant': {
            color: '#c9a646',
            rgb: '201, 166, 70',
            icon: <Bot size={20} />,
            label: 'General Assistant',
            desc: 'Strategic Office Orchestration',
            ready: 'Digital Administrator Online. Ready to audit your registry and optimize caseload workflow.',
            suggestions: ['Summarize daily billing', 'Check deadline status', 'Audit active registry'],
            badge: 'bg-[#c9a646]/10 text-[#c9a646] border-[#c9a646]/20'
        },
        'Drafting Oracle': {
            color: '#a855f7',
            rgb: '168, 85, 247',
            icon: <PenTool size={20} />,
            label: 'Drafting Oracle',
            desc: 'Clause & Artifact Synthesis',
            ready: 'Synthetic Drafter Active. Prepared to generate affidavits and analyze contractual terminology.',
            suggestions: ['Draft Replying Affidavit', 'Suggest dispute clause', 'Refine artifact language'],
            badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        },
        'Legal Researcher': {
            color: '#3b82f6',
            rgb: '59, 130, 246',
            icon: <Search size={20} />,
            label: 'Legal Researcher',
            desc: 'Jurisdictional Precedent Analysis',
            ready: 'Research Layer Established. Scanning SCA and Constitutional Court archives for jurisdictional finality.',
            suggestions: ['Research Rule 34 precedent', 'Find recent SCA judgments', 'Scan for case finality'],
            badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        },
        'Caselaw Summarizer': {
            color: '#10b981',
            rgb: '16, 185, 129',
            icon: <FileSearch size={20} />,
            label: 'Caselaw Summarizer',
            desc: 'Registry Content Condensation',
            ready: 'Artifact Compression Layer Active. Ready to condense massive discovery bundles into tactical summaries.',
            suggestions: ['Summarize discovery bundle', 'Extract plea keypoints', 'Identify evidentiary gaps'],
            badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }
    }), []);

    const currentTheme = AI_THEMES[aiMode] || AI_THEMES['General Assistant'];

    const messagesEndRef = useRef(null);
    const scrollToBottom = (instant = false) => {
        messagesEndRef.current?.scrollIntoView({ behavior: instant ? "auto" : "smooth" });
    };

    useEffect(() => {
        scrollToBottom(true);
    }, [activeChannelId]);

    useEffect(() => {
        scrollToBottom(false);
    }, [chatState.messages]);

    // Per-Channel State Persistence
    const [channelDrafts, setChannelDrafts] = useState({}); // { channelId: { msg: '', files: [], isRecording: false } }

    // Global Audio Controller (WhatsApp style: one audio at a time)
    const [playingAudioId, setPlayingAudioId] = useState(null);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [isAiPaused, setIsAiPaused] = useState(false);
    const [isVoiceReplyEnabled, setIsVoiceReplyEnabled] = useState(true);
    const aiSpeechRef = useRef(null);

    // Current Channel Helpers
    const currentDraft = channelDrafts[activeChannelId] || { msg: '', files: [], isRecording: false, recordingTime: 0 };

    const updateDraft = (updates) => {
        setChannelDrafts(prev => ({
            ...prev,
            [activeChannelId]: { ...currentDraft, ...updates }
        }));
    };

    // Voice Recording Refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);

    const activeChannel = chatState.channels.find(c => c.id === activeChannelId);
    const channelMessages = chatState.messages.filter(m => m.channelId === activeChannelId);
    const activeMatter = activeChannel?.matterId ? matters.find(m => m.id === activeChannel.matterId) : null;

    // --- VOICE LOGIC ---
    useEffect(() => {
        if (currentDraft.isRecording) {
            timerRef.current = setInterval(() => {
                updateDraft({ recordingTime: currentDraft.recordingTime + 1 });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [currentDraft.isRecording, currentDraft.recordingTime, activeChannelId]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                handleSendVoice(audioBlob);
            };

            mediaRecorderRef.current.start();
            updateDraft({ isRecording: true, recordingTime: 0 });
        } catch (err) {
            console.error("Microphone access denied:", err);
            alert("Protocol Violation: Microphone access is required for voice discourse.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && currentDraft.isRecording) {
            mediaRecorderRef.current.stop();
            updateDraft({ isRecording: false });
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSendVoice = (blob) => {
        const voiceMsg = {
            id: `msg_${Date.now()}`,
            channelId: activeChannelId,
            senderId: ACTIVE_STAFF.id,
            senderName: ACTIVE_STAFF.name,
            role: 'Me',
            content: "Voice Note Sent [Transcribing...]",
            timestamp: new Date().toISOString(),
            type: 'voice',
            audioUrl: URL.createObjectURL(blob)
        };

        setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, voiceMsg],
            lastSync: Date.now()
        }));

        // Simulate Transcription & AI Response
        setTimeout(() => {
            const transcript = "Draft a summons for the Gwala matter regarding jurisdictional issues.";
            setChatState(prev => ({
                ...prev,
                messages: prev.messages.map(m => m.id === voiceMsg.id ? { ...m, content: `Voice Memo: "${transcript}"`, transcription: transcript } : m)
            }));

            if (activeChannel?.type === 'ai') {
                handleAiResponse(transcript, true); // true = voice input
            }
        }, 1500);
    };

    // --- AI LOGIC ---
    const handleAiResponse = (prompt, isVoiceInput = false, contextMatter = null) => {
        setIsAiProcessing(true);
        const targetMatter = contextMatter || activeMatter;

        setTimeout(() => {
            let response = "";
            const lowerPrompt = prompt.toLowerCase();

            if (lowerPrompt.includes('summarize risk') || aiMode === 'Caselaw Summarizer') {
                response = `[SUMMARY & RISK ANALYSIS] Artifact integrity check for ${targetMatter?.ref || 'Active Registry'} complete. 
                
CRITICAL OVERWATCH: Potential prescription risk detected. If summons for ${targetMatter?.name || 'Respondent'} is not served by Feb 20th, the claim may be extinguished by operation of law. 

STRATEGIC DIRECTIVE: Verify service address with tracing agent immediately.`;
            } else if (lowerPrompt.includes('suggest task') || aiMode === 'Drafting Oracle') {
                response = `[STRATEGIC TASK GENERATION] Context: ${targetMatter?.name || 'Matter Registry'}.
                
Generated Priority Protocol:
1. /task title="Service Verification" matterId="${targetMatter?.id}" priority="Urgent"
2. /task title="Draft Replying Affidavit" matterId="${targetMatter?.id}" priority="High"

Logic: Opposing counsel has not responded to the rule 35(12) notice.`;
            } else if (lowerPrompt.includes('bill discourse') || lowerPrompt.includes('billing')) {
                response = `[FISCAL ALIGNMENT] Strategic discourse analyzed for ${targetMatter?.ref}.
                
Recommended Ledger Entry:
/bill duration="0.5" description="Strategic AI risk assessment and trajectory realignment for ${targetMatter?.ref}"

Status: Ready for ledger synchronization.`;
            } else if (aiMode === 'Legal Researcher' || lowerPrompt.includes('research')) {
                response = `[RESEARCH MODE] Precedent scan for ${targetMatter?.name || 'Active Case'}: Found 3 conflicting judgments in the Supreme Court of Appeal. Recommend relying on Mbewe vs The State (2023) for jurisdictional finality.`;
            } else {
                response = `[GENERAL INTELLIGENCE] Contextual scan for ${targetMatter?.name || 'Registry'} complete. I am monitoring for filing deadlines and judicial precedents. How can I assist with your caseload?`;
            }

            const aiMsg = {
                id: `msg_ai_${Date.now()}`,
                channelId: activeChannelId,
                senderId: 'ai',
                senderName: 'Gemini Law Navigator',
                role: 'AI',
                content: response,
                timestamp: new Date().toISOString(),
                type: 'text',
                mode: aiMode
            };

            setChatState(prev => ({ ...prev, messages: [...prev.messages, aiMsg] }));
            setIsAiProcessing(false);

            if (activeChannel?.type === 'ai' && (isVoiceInput || isVoiceReplyEnabled)) {
                speakText(response, aiMsg.id);
            }
        }, 1500);
    };

    const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);

    const speakText = (text, msgId) => {
        if (!window.speechSynthesis) return;

        if (currentlySpeakingId === msgId) {
            toggleAiSpeech();
            return;
        }

        window.speechSynthesis.cancel();
        setIsAiPaused(false);
        setCurrentlySpeakingId(msgId);

        const speech = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();

        // Fixed High-Quality Voice Strategy
        const fixedVoice = voices.find(v => v.name === 'Google UK English Female') ||
            voices.find(v => v.name.includes('Aria') || v.name.includes('Natural')) ||
            voices.find(v => (v.name.includes('Female') || v.name.includes('Woman')) && v.lang.startsWith('en')) ||
            voices.find(v => v.lang.startsWith('en'));

        if (fixedVoice) speech.voice = fixedVoice;
        speech.rate = 1.1; // More natural speed
        speech.onstart = () => setIsAiSpeaking(true);
        speech.onend = () => { setIsAiSpeaking(false); setIsAiPaused(false); setCurrentlySpeakingId(null); };
        speech.onerror = () => { setIsAiSpeaking(false); setIsAiPaused(false); setCurrentlySpeakingId(null); };

        aiSpeechRef.current = speech;
        window.speechSynthesis.speak(speech);
    };

    const toggleAiSpeech = () => {
        if (window.speechSynthesis.speaking) {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
                setIsAiPaused(false);
            } else {
                window.speechSynthesis.pause();
                setIsAiPaused(true);
            }
        }
    };

    const stopAiSpeech = () => {
        window.speechSynthesis.cancel();
        setIsAiSpeaking(false);
        setIsAiPaused(false);
        setCurrentlySpeakingId(null);
    };

    // Initialize voices
    useEffect(() => {
        const loadVoices = () => window.speechSynthesis.getVoices();
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const handleAiInvoke = (tool) => {
        if (!activeMatter) {
            alert("CONTEXT REQUIRED: Please select a Matter channel for Intelligence Augmentation.");
            return;
        }

        const geminiChannel = chatState.channels.find(c => c.type === 'ai');
        if (!geminiChannel) return;

        // If not in AI or Matter channel, redirect to AI
        const targetChannelId = (activeChannel?.type === 'ai' || activeChannel?.type === 'matter')
            ? activeChannelId
            : geminiChannel.id;

        if (activeChannelId !== targetChannelId) {
            setActiveChannelId(targetChannelId);
        }

        let toolName = "";
        if (tool === 'Summarize') { toolName = "Summarize Risk"; setAiMode('Caselaw Summarizer'); }
        if (tool === 'Task') { toolName = "Suggest Task"; setAiMode('Drafting Oracle'); }
        if (tool === 'Bill') { toolName = "Bill Discourse"; setAiMode('General Assistant'); }
        if (tool === 'Research') { toolName = "Conduct Legal Research"; setAiMode('Legal Researcher'); }

        const prompt = `Gemini, please ${toolName} for Matter ${activeMatter.ref} (${activeMatter.name}).`;

        // Populate Target draft
        setChannelDrafts(prev => ({
            ...prev,
            [targetChannelId]: {
                ...(prev[targetChannelId] || { msg: '', files: [], isRecording: false }),
                msg: prompt
            }
        }));
    };


    // Smart "Ask Gemini" - Context Aware Switch
    const handleAskGemini = () => {
        const geminiChannel = chatState.channels.find(c => c.type === 'ai');
        if (!geminiChannel) return;

        const typedMsg = currentDraft.msg.trim();
        const matterContext = activeMatter ? `Contextual Analysis for ${activeMatter.ref} (${activeMatter.name}). Status: ${activeMatter.stage}. ` : "";
        const finalPrompt = typedMsg ? `${matterContext}${typedMsg}` : `${matterContext}Gemini, analyze the current registry artifacts and suggest strategic next steps.`;

        // If in AI or Matter channel, keep it there. Otherwise switch to AI.
        const targetChannelId = (activeChannel?.type === 'ai' || activeChannel?.type === 'matter')
            ? activeChannelId
            : geminiChannel.id;

        // Clear current channel draft (if we are moving)
        if (targetChannelId !== activeChannelId) {
            updateDraft({ msg: '' });
            setActiveChannelId(targetChannelId);
        }

        // Populate Target Gemini draft
        setChannelDrafts(prev => ({
            ...prev,
            [targetChannelId]: {
                ...(prev[targetChannelId] || { msg: '', files: [], isRecording: false }),
                msg: finalPrompt
            }
        }));
    };


    const messageSearchResults = useMemo(() => {
        if (!searchQuery || searchQuery.length < 2) return [];
        return chatState.messages.filter(m =>
            m.content.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 10);
    }, [chatState.messages, searchQuery]);

    // --- FILE LOGIC ---
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newAttached = files.map(f => {
            const ext = f.name.split('.').pop().toLowerCase();
            let typeFamily = 'General';
            if (['pdf', 'doc', 'docx'].includes(ext)) typeFamily = 'Document';
            if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) typeFamily = 'Image';
            if (['xls', 'xlsx', 'csv'].includes(ext)) typeFamily = 'Spreadsheet';

            return {
                id: `file_${Date.now()}_${Math.random()}`,
                name: f.name,
                size: (f.size / 1024).toFixed(1) + ' KB',
                type: f.type,
                typeFamily,
                url: URL.createObjectURL(f)
            };
        });
        updateDraft({ files: [...currentDraft.files, ...newAttached] });
    };

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        const msg = currentDraft.msg;
        const files = currentDraft.files;

        if (!msg.trim() && files.length === 0) return;

        if (activeMatter?.status === 'Closed') {
            alert('PROTOCOL ERROR: Matter is closed. Communication is read-only.');
            return;
        }

        const newMsg = {
            id: `msg_${Date.now()}`,
            channelId: activeChannelId,
            senderId: ACTIVE_STAFF.id,
            senderName: ACTIVE_STAFF.name,
            role: 'Me',
            content: msg,
            timestamp: new Date().toISOString(),
            type: files.length > 0 ? 'file' : 'text',
            attachments: files
        };

        setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, newMsg],
            lastSync: Date.now()
        }));

        updateDraft({ msg: '', files: [] });

        if ((activeChannel?.type === 'ai' || msg.toLowerCase().includes('gemini')) && msg) {
            handleAiResponse(msg, false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Urgent': return 'bg-red-500';
            case 'At Risk': return 'bg-orange-500';
            default: return 'bg-green-500';
        }
    };

    const isSyncValid = (Date.now() - chatState.lastSync) < 15 * 60 * 1000;

    return (
        <div className="h-[calc(100vh-14rem)] flex gap-4 animate-in fade-in duration-500 overflow-hidden">
            {/* PANE A: THE EXPLORER (SIDEBAR) */}
            <div className={`w-full md:w-80 flex-shrink-0 flex flex-col gap-4 ${activeChannelId ? 'hidden md:flex' : 'flex'}`}>
                <GlassCard className="flex-1 flex flex-col p-4 overflow-hidden border-[#c9a646]/20">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                        <input
                            type="text"
                            placeholder="Search Discourse..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold text-white outline-none focus:border-[#c9a646] transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-1">
                        {/* AI Assistant Section */}
                        <div>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 px-2">Intelligence Nexus</p>
                            {chatState.channels.filter(c => c.type === 'ai' && (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.status.toLowerCase().includes(searchQuery.toLowerCase()))).map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => setActiveChannelId(channel.id)}
                                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${activeChannelId === channel.id ? 'bg-[#c9a646] text-black shadow-lg shadow-[#c9a646]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeChannelId === channel.id ? 'bg-black/20' : 'bg-blue-500/20 text-blue-400'}`}>
                                        <Sparkles size={16} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-wider">{channel.name}</p>
                                        <p className="text-[8px] font-bold opacity-60 uppercase">{channel.status}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Matter Channels */}
                        <div>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 px-2 flex justify-between items-center">
                                Matters Registry
                                <Briefcase size={10} />
                            </p>
                            <div className="space-y-1">
                                {chatState.channels.filter(c => c.type === 'matter' && (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.initials.toLowerCase().includes(searchQuery.toLowerCase()))).map(channel => {
                                    const matter = matters.find(m => m.id === channel.matterId);
                                    // View Logic for Last Message Preview
                                    const lastMsg = chatState.messages.filter(m => m.channelId === channel.id).pop();
                                    const previewText = lastMsg ? lastMsg.content : "No messages yet";
                                    const timeDisplay = lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

                                    return (
                                        <button
                                            key={channel.id}
                                            onClick={() => setActiveChannelId(channel.id)}
                                            className={`w-full flex flex-col gap-1 p-4 border-b border-white/5 transition-all group relative ${activeChannelId === channel.id ? 'bg-[#c9a646]/10' : 'bg-[#121212] hover:bg-white/5'}`}
                                        >
                                            <div className="flex justify-between items-start w-full">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 truncate ${activeChannelId === channel.id ? 'text-[#c9a646]' : 'text-[#c9a646]'}`}>
                                                        {matter?.ref || "UNKNOWN"}
                                                    </p>
                                                    <p className="text-xs font-bold text-white truncate">{channel.name}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-[9px] font-mono text-gray-500">{timeDisplay}</span>
                                                    {lastMsg && !lastMsg.read && (
                                                        <div className="w-2 h-2 rounded-full bg-[#c9a646] ml-auto mt-1"></div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between w-full mt-1">
                                                <p className="text-[10px] text-gray-400 truncate max-w-[85%]">{previewText}</p>
                                                {matter?.status === 'Urgent' && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Direct Messages */}
                        <div>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 px-2">Personnel</p>
                            <div className="space-y-1">
                                {chatState.channels.filter(c => c.type === 'direct' && c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(channel => (
                                    <button
                                        key={channel.id}
                                        onClick={() => setActiveChannelId(channel.id)}
                                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${activeChannelId === channel.id ? 'bg-[#c9a646] text-black shadow-lg shadow-[#c9a646]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-[10px] font-black">
                                            {channel.initials}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase tracking-wider">{channel.name}</p>
                                            <p className="text-[8px] font-bold text-green-500 uppercase">Online</p>
                                        </div>
                                    </button>
                                )) /* Close Personnel map */}
                            </div>
                        </div>

                        {/* Search Intersection: Message Content */}
                        {searchQuery.length >= 2 && messageSearchResults.length > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-[#c9a646] uppercase tracking-[0.2em] mb-3 px-2 flex justify-between items-center">
                                    Discourse Matches
                                    <MessageSquare size={10} />
                                </p>
                                <div className="space-y-2 px-1">
                                    {messageSearchResults.map(msg => {
                                        const channel = chatState.channels.find(c => c.id === msg.channelId);
                                        return (
                                            <button
                                                key={msg.id}
                                                onClick={() => setActiveChannelId(msg.channelId)}
                                                className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-[10px] font-black text-white uppercase truncate">{msg.senderName}</p>
                                                    <span className="text-[7px] text-gray-600 font-bold uppercase">{channel?.initials}</span>
                                                </div>
                                                <p className="text-[9px] text-gray-400 line-clamp-2 italic font-medium">"{msg.content}"</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${isSyncValid ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                            <span className="text-[8px] font-black text-gray-500 uppercase">GW_SYNC: {isSyncValid ? 'LIVE' : 'FAILED'}</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* PANE B: THE TIMELINE (CENTER) */}
            <div className={`flex-1 flex flex-col min-w-0 h-full ${!activeChannelId ? 'hidden md:flex' : 'flex'}`}>
                <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-t-0 md:border-t-4 border-t-[#c9a646]">
                    {/* MOBILE HEADER - STICKY GLASS FORTRESS */}
                    <div className="md:hidden sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between px-4">
                        <button onClick={() => setActiveChannelId(null)} className="p-2 -ml-2 text-gray-300 hover:text-white active:scale-95 transition-all">
                            <ChevronLeft size={24} />
                        </button>

                        <div className="flex flex-col items-center flex-1 mx-4 min-w-0">
                            <span className="text-[9px] font-black text-[#c9a646] uppercase tracking-widest leading-tight truncate w-full text-center">
                                {activeChannel?.type === 'ai' ? 'NEURAL LINK' : activeMatter?.ref || 'DIRECT MESSAGE'}
                            </span>
                            <span className="text-sm font-bold text-white truncate w-full text-center leading-tight">
                                {activeChannel?.name || 'Chat'}
                            </span>
                        </div>

                        <button onClick={() => setDrawerOpen(!drawerOpen)} className="p-2 -mr-2 text-gray-300 hover:text-[#c9a646]">
                            <MoreHorizontal size={24} />
                        </button>
                    </div>

                    {/* DESKTOP HEADER (Unchanged, hidden on mobile) */}
                    <div className="hidden md:flex p-4 border-b border-white/5 bg-black/40 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500" style={{
                                    backgroundColor: (activeChannel?.type === 'ai' || activeChannel?.type === 'matter') ? `rgba(${currentTheme.rgb}, 0.1)` : 'rgba(255, 255, 255, 0.05)',
                                    border: `1px solid ${(activeChannel?.type === 'ai' || activeChannel?.type === 'matter') ? `rgba(${currentTheme.rgb}, 0.3)` : 'rgba(255, 255, 255, 0.1)'}`,
                                    color: (activeChannel?.type === 'ai' || activeChannel?.type === 'matter') ? currentTheme.color : 'white'
                                }}>
                                    {activeChannel?.type === 'ai' ? currentTheme.icon : activeChannel?.type === 'matter' ? <Briefcase size={20} /> : <Users size={20} />}
                                </div>
                                {activeChannel?.type === 'ai' && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black animate-pulse shadow-lg" style={{ backgroundColor: currentTheme.color }}></div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                        {activeChannel?.type === 'ai' ? currentTheme.label : activeChannel?.name}
                                    </h3>
                                    {activeChannel?.type === 'ai' && (
                                        <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${currentTheme.badge}`}>
                                            Neural Active
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] font-bold text-gray-500 uppercase">
                                    {activeChannel?.type === 'ai' ? (
                                        <span className="flex items-center gap-2">
                                            <Sparkles size={10} style={{ color: currentTheme.color }} />
                                            {currentTheme.desc}
                                        </span>
                                    ) : activeMatter ? (
                                        <>Matter Context: {activeMatter.ref} • <span className="text-[#c9a646] shadow-[0_0_10px_rgba(201,166,70,0.3)]">{activeMatter.stage}</span></>
                                    ) : 'Authorized Personnel Only'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {activeChannel?.type === 'ai' && (
                                <>
                                    <button
                                        onClick={() => setIsVoiceReplyEnabled(!isVoiceReplyEnabled)}
                                        className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase transition-all flex items-center gap-2 ${isVoiceReplyEnabled ? 'bg-[#c9a646]/10 border-[#c9a646]/30 text-[#c9a646]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                                    >
                                        <Volume2 size={12} /> {isVoiceReplyEnabled ? 'Voice Reply: ON' : 'Voice Reply: OFF'}
                                    </button>
                                    <select
                                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase text-[#c9a646] outline-none cursor-pointer hover:border-[#c9a646]/50 transition-all font-mono"
                                        value={aiMode}
                                        onChange={(e) => setAiMode(e.target.value)}
                                    >
                                        <option>General Assistant</option>
                                        <option>Drafting Oracle</option>
                                        <option>Legal Researcher</option>
                                        <option>Caselaw Summarizer</option>
                                    </select>
                                </>
                            )}
                            <button onClick={() => setDrawerOpen(!drawerOpen)} className={`p-2 transition-colors ${drawerOpen ? 'text-[#c9a646]' : 'text-gray-400 hover:text-white'}`}>
                                <Layout size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/5">
                        {channelMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
                                {activeChannel?.type === 'ai' ? (
                                    <div className="max-w-md w-full text-center space-y-8">
                                        <div className="relative inline-block">
                                            <div className="w-24 h-24 rounded-3xl flex items-center justify-center border-2 shadow-2xl transition-all duration-1000" style={{
                                                backgroundColor: `rgba(${currentTheme.rgb}, 0.05)`,
                                                borderColor: `rgba(${currentTheme.rgb}, 0.2)`,
                                                color: currentTheme.color,
                                                boxShadow: `0 0 40px rgba(${currentTheme.rgb}, 0.1)`
                                            }}>
                                                {React.cloneElement(currentTheme.icon, { size: 48 })}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center animate-bounce">
                                                <Sparkles size={14} className="text-[#c9a646]" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-xl font-black text-white uppercase tracking-widest tracking-tighter">{currentTheme.label} Initialized</h2>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{currentTheme.desc}</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-xs font-medium text-gray-300 leading-relaxed italic border-l-4" style={{ borderLeftColor: currentTheme.color }}>
                                            "{currentTheme.ready}"
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {currentTheme.suggestions.map((suggestion, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => updateDraft({ msg: suggestion })}
                                                    className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left flex items-center justify-between group"
                                                >
                                                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">{suggestion}</span>
                                                    <ArrowRight size={14} className="text-gray-700 group-hover:translate-x-1 group-hover:text-[#c9a646] transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : activeChannel?.type === 'matter' ? (
                                    <div className="max-w-md w-full text-center space-y-8">
                                        <div className="relative inline-block">
                                            <div className="w-24 h-24 rounded-3xl flex items-center justify-center border-2 shadow-2xl transition-all duration-1000 bg-[#c9a646]/5 border-[#c9a646]/20 text-[#c9a646]">
                                                <Briefcase size={48} />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center">
                                                <Sparkles size={14} className="text-[#c9a646]" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-xl font-black text-white uppercase tracking-widest">{activeMatter?.name} Registry</h2>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest tracking-tighter">Matter Ref: {activeMatter?.ref} • Status: {activeMatter?.status}</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                                            Secure Matter-Specific Discourse Layer Active.<br />Authorized for artifacts and strategic analysis.
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => handleAiInvoke('Summarize')} className="p-4 rounded-xl bg-white/5 hover:bg-[#c9a646]/10 border border-white/5 transition-all text-center space-y-2 group">
                                                <FileSearch size={16} className="mx-auto text-[#c9a646] group-hover:scale-110 transition-transform" />
                                                <span className="block text-[8px] font-black text-white uppercase tracking-widest">Summarize Risk</span>
                                            </button>
                                            <button onClick={() => handleAiInvoke('Task')} className="p-4 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/5 transition-all text-center space-y-2 group">
                                                <Zap size={16} className="mx-auto text-blue-400 group-hover:scale-110 transition-transform" />
                                                <span className="block text-[8px] font-black text-white uppercase tracking-widest">Suggest Task</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="opacity-10 text-center">
                                        <MessageSquare size={64} className="mx-auto mb-4" />
                                        <p className="text-sm font-black uppercase tracking-[0.3em]">Registry Discourse Layer<br />Standing By.</p>
                                    </div>
                                )}
                            </div>
                        ) : channelMessages.map((msg, i) => (

                            <div key={msg.id} className={`flex ${msg.role === 'Me' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 px-2 md:px-0`}>
                                <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${msg.role === 'Me' ? 'items-end' : 'items-start'}`}>
                                    {/* Sender Label (Desktop Only or AI) */}
                                    <div className={`hidden md:flex items-center gap-2 mb-1.5 px-1`}>
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${msg.role === 'AI' ? '' : 'text-gray-500'}`} style={msg.role === 'AI' ? { color: AI_THEMES[msg.mode]?.color || '#3b82f6' } : {}}>{msg.senderName}</span>
                                        <span className="text-[7px] font-bold text-gray-700 uppercase tabular-nums">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    {/* Message Bubble - Mobile Optimized */}
                                    <div
                                        className={`
                                            p-4 md:p-3.5 rounded-2xl text-[15px] md:text-xs font-medium leading-relaxed shadow-xl relative
                                            ${msg.role === 'Me'
                                                ? 'bg-[#c9a646] text-black rounded-tr-none md:rounded-tr-none'
                                                : msg.role === 'AI'
                                                    ? 'rounded-tl-none ring-1 border-l-4'
                                                    : 'bg-white/5 text-gray-200 border border-white/10 border-l-4 border-l-slate-700 rounded-tl-none'
                                            }
                                        `}
                                        style={msg.role === 'AI' ? {
                                            backgroundColor: `rgba(${AI_THEMES[msg.mode]?.rgb || '59, 130, 246'}, 0.08)`,
                                            borderColor: `rgba(${AI_THEMES[msg.mode]?.rgb || '59, 130, 246'}, 0.2)`,
                                            borderLeftColor: AI_THEMES[msg.mode]?.color || '#3b82f6',
                                            color: '#e5e7eb',
                                            ringColor: `rgba(${AI_THEMES[msg.mode]?.rgb || '59, 130, 246'}, 0.1)`
                                        } : {}}
                                    >
                                        {msg.content}
                                        {msg.type === 'voice' && (
                                            <VoiceNotePlayer
                                                audioUrl={msg.audioUrl}
                                                msgId={msg.id}
                                                playingAudioId={playingAudioId}
                                                setPlayingAudioId={setPlayingAudioId}
                                            />
                                        )}
                                        {/* Mobile Timestamp Footer (Visible inside bubble for easy scan) */}
                                        <div className={`md:hidden mt-1 text-[9px] font-bold uppercase ${msg.role === 'Me' ? 'text-black/60' : 'text-white/30 text-right'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>

                                        <button
                                            onClick={() => speakText(msg.content, msg.id)}
                                            className={`absolute -right-8 top-0 p-1.5 transition-all rounded-full hidden md:block ${currentlySpeakingId === msg.id ? (isAiPaused ? 'text-orange-400 animate-pulse' : 'text-blue-400 animate-bounce') : 'text-gray-600 hover:text-[#c9a646]'}`}
                                            title={currentlySpeakingId === msg.id ? (isAiPaused ? 'Resume Strategy' : 'Pause Analysis') : 'Speak Artifact'}
                                        >
                                            {currentlySpeakingId === msg.id && !isAiPaused ? <Mic size={14} /> : (isAiPaused && currentlySpeakingId === msg.id ? <Pause size={14} /> : <Volume2 size={14} />)}
                                        </button>

                                        {msg.attachments?.length > 0 && (
                                            <div className="mt-4 grid grid-cols-1 gap-2">
                                                {msg.attachments.map(file => (
                                                    <button
                                                        key={file.id}
                                                        onClick={() => setPreviewFile(file)}
                                                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left group ${msg.role === 'Me' ? 'bg-black/10 border-black/10' : 'bg-black/40 border-white/10'}`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${file.typeFamily === 'Image' ? 'bg-orange-500/20 text-orange-400' :
                                                            file.typeFamily === 'Spreadsheet' ? 'bg-green-500/20 text-green-400' :
                                                                'bg-[#c9a646]/20 text-[#c9a646]'
                                                            }`}>
                                                            {file.typeFamily === 'Image' ? <Eye size={16} /> : <FileText size={16} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-[10px] font-black truncate uppercase tracking-widest ${msg.role === 'Me' ? 'text-black' : 'text-white'}`}>{file.name}</p>
                                                            <p className={`text-[8px] font-bold uppercase ${msg.role === 'Me' ? 'text-black/60' : 'opacity-50'}`}>{file.size} • {file.typeFamily || 'Artifact'}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isAiProcessing && (
                            <div className="flex justify-start">
                                <div className="bg-blue-500/5 p-3 rounded-2xl border border-blue-500/20 flex items-center gap-4 px-5">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Neural Processing...</span>
                                </div>
                            </div>
                        )}
                        <div className="h-2"></div>
                        <div ref={messagesEndRef} />
                    </div>


                    {/* Composer - Mobile Optimized Bottom Bar */}
                    <div className="p-2 md:p-4 bg-black/80 backdrop-blur-md border-t border-white/10 sticky bottom-0 z-40">
                        {/* Status/AI Controls - Desktop mostly, small on mobile */}
                        <div className="flex items-center gap-4 mb-2 md:mb-4 px-2">
                            {(isAiSpeaking || isAiPaused) && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleAiSpeech}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isAiPaused ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400 animate-pulse'}`}
                                    >
                                        <Bot size={12} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">{isAiPaused ? 'AI Paused' : 'AI Speaking...'}</span>
                                    </button>
                                    <button
                                        onClick={stopAiSpeech}
                                        className="p-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/40 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {currentDraft.files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3 px-2">
                                {currentDraft.files.map(file => (
                                    <div key={file.id} className="flex items-center gap-2 bg-[#c9a646]/10 border border-[#c9a646]/20 py-1.5 px-3 rounded-full group">
                                        <FileText size={12} className="text-[#c9a646]" />
                                        <span className="text-[9px] font-black text-white uppercase">{file.name}</span>
                                        <button onClick={() => updateDraft({ files: currentDraft.files.filter(f => f.id !== file.id) })} className="text-gray-500 hover:text-white transition-colors"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
                            {/* Mobile Append Button */}
                            <button
                                type="button"
                                className="md:hidden p-3 bg-white/10 rounded-xl text-white hover:text-[#c9a646] active:bg-white/20 transition-all shrink-0"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Plus size={20} />
                            </button>

                            {/* Desktop Attachment Tools (Hidden on Mobile view if we use the + button interaction, but here I keep them inline for speed) */}
                            <div className="hidden md:flex items-center gap-1 pl-2 absolute left-2 bottom-3 z-10">
                                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-[#c9a646] transition-all hover:bg-white/5 rounded-lg" title="Attach"><Paperclip size={16} /></button>
                                <button
                                    type="button"
                                    onClick={currentDraft.isRecording ? stopRecording : startRecording}
                                    className={`p-2 rounded-lg transition-all ${currentDraft.isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-500 hover:text-[#c9a646] hover:bg-white/5'}`}
                                >
                                    <Mic size={16} />
                                </button>
                            </div>

                            <textarea
                                rows="1"
                                placeholder="Type message..."
                                disabled={activeMatter?.status === 'Closed' || currentDraft.isRecording}
                                className="flex-1 bg-white/5 md:pl-24 border border-white/10 rounded-xl px-4 py-3 text-[15px] md:text-xs text-white outline-none resize-none custom-scrollbar min-h-[48px] max-h-[120px] focus:border-[#c9a646] transition-all"
                                value={currentDraft.msg}
                                onChange={(e) => {
                                    updateDraft({ msg: e.target.value });
                                    e.target.style.height = 'auto';
                                    e.target.style.height = (e.target.scrollHeight) + 'px';
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />

                            <button
                                type="submit"
                                disabled={(!currentDraft.msg.trim() && currentDraft.files.length === 0) || activeMatter?.status === 'Closed'}
                                className="p-3 rounded-xl bg-[#c9a646] text-black hover:bg-[#f7d774] transition-all disabled:opacity-30 disabled:grayscale shadow-lg shrink-0"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </GlassCard>
            </div >

            {/* PANE C: THE CONTEXT DRAWER (Redesigned) */}
            {
                drawerOpen && (
                    <div className="w-80 flex-shrink-0 animate-in slide-in-from-right-10 duration-500 h-full">
                        <GlassCard className="h-full flex flex-col p-0 border-[#c9a646]/20 bg-black/60 overflow-hidden">
                            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 text-[#c9a646]">
                                    <History size={16} /> Registry Archive
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
                                {activeMatter ? (
                                    <>
                                        <div className="bg-black/40 rounded-2xl p-5 border border-white/5 shadow-inner">
                                            <p className="text-[8px] font-black text-gray-500 uppercase mb-3 tracking-widest">Health & Trajectory</p>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-sm font-black text-white tracking-widest uppercase">{activeMatter.status}</span>
                                                <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase ${activeMatter.priority === 'High' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-[#c9a646] text-black shadow-lg shadow-[#c9a646]/20'}`}>
                                                    {activeMatter.priority}
                                                </div>
                                            </div>
                                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#c9a646] to-[#f7d774] shadow-[0_0_15px_rgba(201,166,70,0.5)]" style={{ width: '68%' }}></div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[8px] font-black text-gray-500 uppercase px-1 tracking-widest">Matter Artifacts</p>
                                            <div className="space-y-2">
                                                {chatState.messages.flatMap(m => m.attachments || []).concat(MOCK_DATA.documents.filter(d => d.matterId === activeMatter.id)).slice(0, 4).map(doc => (
                                                    <button
                                                        key={doc.id}
                                                        onClick={() => setPreviewFile(doc)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group text-left"
                                                    >
                                                        <FileText size={14} className="text-gray-500 group-hover:text-[#c9a646]" />
                                                        <span className="text-[9px] font-bold text-gray-300 uppercase truncate flex-1">{doc.name}</span>
                                                        <Eye size={12} className="text-gray-600 opacity-0 group-hover:opacity-100" />
                                                    </button>
                                                ))}
                                                {(!MOCK_DATA.documents.some(d => d.matterId === activeMatter.id)) && (
                                                    <p className="text-[8px] font-bold text-gray-600 uppercase px-2 py-4 text-center border border-dashed border-white/5 rounded-xl">No artifacts detected in registry.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[8px] font-black text-gray-500 uppercase px-1 tracking-widest">Intelligence Augmentation</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                <button
                                                    onClick={() => handleAiInvoke('Summarize')}
                                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-[#c9a646]/10 border border-white/5 hover:border-[#c9a646]/30 transition-all text-left group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileSearch size={16} className="text-[#c9a646] group-hover:scale-110 transition-transform" />
                                                        <div>
                                                            <span className="text-[10px] font-black text-white uppercase tracking-widest block">Summarize Risk</span>
                                                            <span className="text-[7px] font-bold text-gray-500 uppercase tracking-tighter">AI Analysis Layer</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleAiInvoke('Task')}
                                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-[#c9a646]/10 border border-white/5 hover:border-[#c9a646]/30 transition-all text-left group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Zap size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                                        <div>
                                                            <span className="text-[10px] font-black text-white uppercase tracking-widest block">Suggest Task</span>
                                                            <span className="text-[7px] font-bold text-gray-500 uppercase tracking-tighter">Strategic Queue</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleAiInvoke('Bill')}
                                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-[#c9a646]/10 border border-white/5 hover:border-[#c9a646]/30 transition-all text-left group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Landmark size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                                        <div>
                                                            <span className="text-[10px] font-black text-white uppercase tracking-widest block">Bill Discourse</span>
                                                            <span className="text-[7px] font-bold text-gray-500 uppercase tracking-tighter">Budget Alignment</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleAiInvoke('Research')}
                                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-[#c9a646]/10 border border-white/5 hover:border-[#c9a646]/30 transition-all text-left group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Search size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                                        <div>
                                                            <span className="text-[10px] font-black text-white uppercase tracking-widest block">Legal Research</span>
                                                            <span className="text-[7px] font-bold text-gray-500 uppercase tracking-tighter">Precedent Registry</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-600" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-[8px] font-black text-gray-500 uppercase mb-3 px-1 tracking-widest">Fiscal Performance</p>
                                            <div className="p-5 rounded-2xl bg-[#c9a646]/5 border border-[#c9a646]/20 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a646]/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
                                                <p className="text-3xl font-black text-white tracking-tighter mb-1 select-none">R {billingEntries.filter(b => b.matterId === activeMatter.id).reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-[#c9a646] uppercase tracking-widest opacity-80">Pending Finalization</p>
                                            </div>
                                        </div>
                                    </>
                                ) : activeChannel?.type === 'direct' ? (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                        <div className="flex flex-col items-center py-6">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a646] to-[#f7d774] p-1 mb-4 shadow-xl shadow-[#c9a646]/20">
                                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-2xl font-black text-[#c9a646]">
                                                    {activeChannel.initials}
                                                </div>
                                            </div>
                                            <h4 className="text-lg font-black text-white uppercase tracking-widest">{activeChannel.name}</h4>
                                            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">Authorized & Online</p>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-1">Personnel Profile</p>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                                    <p className="text-[8px] font-black text-gray-500 uppercase">Role Elevation</p>
                                                    <p className="text-xs font-bold text-white uppercase">Senior Attorney</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                                    <p className="text-[8px] font-black text-gray-500 uppercase">Secure Communication</p>
                                                    <p className="text-xs font-bold text-white uppercase text-blue-400">P2P Encrypted</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <ShieldCheck size={14} className="text-blue-400" />
                                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Protocol Gate</p>
                                            </div>
                                            <p className="text-[8px] font-bold text-gray-500 leading-relaxed uppercase">Direct discourse is logged under internal audit trail A-909. Avoid sharing unmasked PII.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-20 py-20 animate-in fade-in">
                                        <Database size={48} className="mb-6" />
                                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                            {activeChannel?.name} Registry Inactive.<br />Select a Matter context for augmented intelligence.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                )
            }

            {/* --- GLOBAL MODALS --- */}
            <DocumentPreviewModal
                doc={previewFile}
                onClose={() => setPreviewFile(null)}
            />


        </div >
    );
};


// --- Main Application Orchestrator ---

const NotificationToast = ({ notification, onClose }) => {
    useEffect(() => {
        if (!notification) return;
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [notification, onClose]);

    if (!notification) return null;

    return (
        <div className="fixed top-24 right-8 z-[200] animate-in slide-in-from-right duration-300">
            <div className="glass-card p-4 border-[#c9a646] bg-[#121212] shadow-2xl flex items-start gap-4 max-w-sm">
                <div className="p-2 bg-[#c9a646]/20 rounded-full text-[#c9a646]">
                    <BellRing size={16} />
                </div>
                <div className="flex-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">{notification.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">{notification.message}</p>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={14} /></button>
            </div>
        </div>
    );
};

function App() {
    const { isMobile } = useResponsive();
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('JKM_ACTIVE_TAB_V1') || 'Personal Hub');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const connectivityStatus = 'OPTIMAL'; // 'OPTIMAL' | 'STALE' | 'OFFLINE'
    useEffect(() => localStorage.setItem('JKM_ACTIVE_TAB_V1', activeTab), [activeTab]);
    const [currentUser, setCurrentUser] = useState(ACTIVE_STAFF);
    const [quickAddContext, setQuickAddContext] = useState(null);

    const [systemLogs, setSystemLogs] = useState([
        { id: 'al_1', user: 'Thabo Maseko', action: 'Accessed Client Portal', date: new Date().toISOString() },
        { id: 'al_2', user: 'System', action: 'Google Sync Verified', date: new Date(Date.now() - 3600000).toISOString() },
        { id: 'al_3', user: 'Zandile Nkosi', action: 'Created Matter CS_002', date: new Date(Date.now() - 86400000).toISOString() },
        { id: 'al_4', user: 'System', action: 'Backup Completed', date: new Date(Date.now() - 172800000).toISOString() }
    ]);
    const [matters, setMatters] = useState(MOCK_DATA.matters);
    const [documents, setDocuments] = useState(MOCK_DATA.documents);
    const [tasks, setTasks] = useState([
        {
            id: 'tk_101',
            title: 'Prepare Court Bundle: Mbewe',
            matterId: 'cs_001',
            dueDate: '2026-01-08',
            priority: 'Urgent',
            assignedTo: 'emp_001',
            completed: false,
            completedAt: null,
            description: 'Compile all discovery documents, index them according to court rules, and prepare 3 copies for filing.',
            createdBy: 'emp_001',
            createdAt: '2026-01-05T09:00:00',
            status: 'Today', // System-calculated: 'Late' | 'Today' | 'Upcoming' | 'Completed'
            syncedToChat: false,
            syncedToCalendar: true,
            lastSyncAttempt: new Date(Date.now() - 300000).toISOString(),
            auditLog: [
                { timestamp: '2026-01-05T09:00:00', action: 'Task Created', user: 'Thabo Maseko', details: 'Court bundle preparation assigned' },
                { timestamp: '2026-01-06T14:00:00', action: 'Synced to Calendar', user: 'System', details: 'Task deadline added to calendar' }
            ]
        },
        {
            id: 'tk_102',
            title: 'FICA Verification: Gwala',
            matterId: 'cs_002',
            dueDate: '2026-01-09',
            priority: 'High',
            assignedTo: 'emp_001',
            completed: false,
            completedAt: null,
            description: 'Verify proof of residence and ID copies against the original documents.',
            createdBy: 'emp_002',
            createdAt: '2026-01-06T10:30:00',
            status: 'Upcoming',
            syncedToChat: false,
            syncedToCalendar: false,
            lastSyncAttempt: null,
            auditLog: [
                { timestamp: '2026-01-06T10:30:00', action: 'Task Created', user: 'Zandile Nkosi', details: 'FICA compliance verification required' }
            ]
        },
        {
            id: 'tk_103',
            title: 'Consultation Notes Review',
            matterId: 'cs_002',
            dueDate: '2026-01-12',
            priority: 'Normal',
            assignedTo: 'emp_001',
            completed: false,
            completedAt: null,
            description: 'Review and transcribe notes from client consultation on Jan 5th.',
            createdBy: 'emp_003',
            createdAt: '2026-01-06T15:00:00',
            status: 'Upcoming',
            syncedToChat: true,
            syncedToCalendar: true,
            lastSyncAttempt: new Date(Date.now() - 180000).toISOString(),
            auditLog: [
                { timestamp: '2026-01-06T15:00:00', action: 'Task Created', user: 'Sipho Dlamini', details: 'Consultation notes require review and transcription' },
                { timestamp: '2026-01-07T09:00:00', action: 'Synced to Chat', user: 'System', details: 'Task mentioned in matter channel' }
            ]
        },
        {
            id: 'tk_104',
            title: 'Submit Discovery Affidavit',
            matterId: 'cs_001',
            dueDate: '2026-01-14',
            priority: 'Urgent',
            assignedTo: 'emp_001',
            completed: false,
            completedAt: null,
            description: 'Draft and submit the discovery affidavit to the opposing counsel.',
            createdBy: 'emp_001',
            createdAt: '2026-01-05T11:00:00',
            status: 'Upcoming',
            syncedToChat: false,
            syncedToCalendar: true,
            lastSyncAttempt: new Date(Date.now() - 120000).toISOString(),
            auditLog: [
                { timestamp: '2026-01-05T11:00:00', action: 'Task Created', user: 'Thabo Maseko', details: 'Discovery affidavit submission deadline set' },
                { timestamp: '2026-01-06T16:00:00', action: 'Priority Elevated', user: 'Thabo Maseko', details: 'Marked as urgent due to court timeline' }
            ]
        },
        {
            id: 'tk_105',
            title: 'Review Estate Documents',
            matterId: 'cs_003',
            dueDate: '2026-01-06',
            priority: 'High',
            assignedTo: 'emp_001',
            completed: false,
            completedAt: null,
            description: 'Review all estate documentation for Van Wyk matter.',
            createdBy: 'emp_001',
            createdAt: '2026-01-03T10:00:00',
            status: 'Late', // Overdue
            syncedToChat: false,
            syncedToCalendar: false,
            lastSyncAttempt: null,
            auditLog: [
                { timestamp: '2026-01-03T10:00:00', action: 'Task Created', user: 'Thabo Maseko', details: 'Estate documentation review required' }
            ]
        },
        {
            id: 'tk_106',
            title: 'File Court Appearance Notice',
            matterId: 'cs_001',
            dueDate: '2026-01-05',
            priority: 'Urgent',
            assignedTo: 'emp_002',
            completed: true,
            completedAt: '2026-01-05T16:30:00',
            description: 'File notice of appearance with court registry.',
            createdBy: 'emp_001',
            createdAt: '2026-01-04T09:00:00',
            status: 'Completed',
            syncedToChat: true,
            syncedToCalendar: true,
            lastSyncAttempt: new Date(Date.now() - 86400000).toISOString(),
            auditLog: [
                { timestamp: '2026-01-04T09:00:00', action: 'Task Created', user: 'Thabo Maseko', details: 'Court appearance notice filing required' },
                { timestamp: '2026-01-05T16:30:00', action: 'Task Completed', user: 'Zandile Nkosi', details: 'Notice filed with High Court registry' }
            ]
        }
    ]);
    const [timeEntries, setTimeEntries] = useState([
        { id: 't_001', matterId: 'cs_001', matterName: 'Mbewe v Gwala', date: '2026-01-07', description: 'Jurisdictional Research & Drafting', employeeId: 'emp_001', employeeName: 'JK Mokwebo', durationMinutes: 90, rate: 2500, status: 'Logged', billable: true },
        { id: 't_002', matterId: 'cs_001', matterName: 'Mbewe v Gwala', date: '2026-01-06', description: 'Consultation with Counsel', employeeId: 'emp_002', employeeName: 'TM Maseko', durationMinutes: 120, rate: 1500, status: 'Locked', billable: true }
    ]);
    const [invoices, setInvoices] = useState([
        { id: 'inv_001', number: 'INV-2026-001', clientId: 'cli_001', clientName: 'Mbewe Transport', matterId: 'cs_001', matterName: 'Mbewe v Gwala', issueDate: '2026-01-01', dueDate: '2026-01-31', totalAmount: 15400, status: 'Sent', lineItems: [{ description: 'Legal Services', quantity: 1, amount: 15400 }] },
        { id: 'inv_002', number: 'INV-2026-002', clientId: 'cli_002', clientName: 'Sipho Dlamini', matterId: 'cs_002', matterName: 'SAPS v Dlamini', issueDate: '2025-12-15', dueDate: '2026-01-15', totalAmount: 8500, status: 'Overdue', lineItems: [{ description: 'Bail Application', quantity: 1, amount: 8500 }] }
    ]);

    const [employees, setEmployees] = useState(MOCK_DATA.employees);
    const [clients, setClients] = useState(MOCK_DATA.clients);

    // Timer State
    const [timerActive, setTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerMatter, setTimerMatter] = useState('');
    const timerInterval = useRef(null);

    // Global Timer Logic
    useEffect(() => {
        if (timerActive) {
            timerInterval.current = setInterval(() => {
                setTimerSeconds(s => s + 1);
            }, 1000);
        } else {
            clearInterval(timerInterval.current);
        }
        return () => clearInterval(timerInterval.current);
    }, [timerActive]);

    // Modal States
    const [quickAddOpen, setQuickAddOpen] = useState(false);

    // --- MASTER SEARCH (THE GLOBAL COMPASS) ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const searchInputRef = useRef(null);

    // CMD+K SHORTCUT
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setSearchQuery('');
                searchInputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // INDEXING ENGINE (MOCK)
    useEffect(() => {
        if (!searchQuery) {
            setSearchResults(null);
            return;
        }

        const q = searchQuery.toLowerCase();
        const results = {
            matters: matters.filter(m => m.name.toLowerCase().includes(q) || m.ref.toLowerCase().includes(q)),
            clients: MOCK_DATA.clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)),
            documents: documents.filter(d => d.name.toLowerCase().includes(q)),
            tasks: tasks.filter(t => t.title.toLowerCase().includes(q))
        };

        setSearchResults(results);
    }, [searchQuery, matters, documents, tasks]);

    // --- TABS SCROLL LOGIC ---
    const tabsContainerRef = useRef(null);
    const scrollRafRef = useRef(null);

    const handleTabsMouseMove = (e) => {
        const container = tabsContainerRef.current;
        if (!container) return;

        // Reset Main Scroll on Tab Change
        window.scrollTo(0, 0);
        document.body.scrollTo(0, 0);
        const main = document.querySelector('main');
        if (main) main.scrollTo(0, 0);

        // Get viewport dimensions (the wrapper)
        const wrapper = e.currentTarget;
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        // Define Active Zones
        const zoneSize = 80; // 80px scroll zone
        const maxSpeed = 15; // Speed factor

        // Clear existing loop
        cancelAnimationFrame(scrollRafRef.current);

        let speed = 0;
        if (x < zoneSize) {
            // Left Zone
            const intensity = (zoneSize - x) / zoneSize;
            speed = -intensity * maxSpeed;
        } else if (x > width - zoneSize) {
            // Right Zone
            const intensity = (x - (width - zoneSize)) / zoneSize;
            speed = intensity * maxSpeed;
        }

        if (speed !== 0) {
            const scrollStep = () => {
                if (container) {
                    container.scrollLeft += speed;
                    // Check bounds to stop unnecessary ref calls? browser handles scrollLeft clamping
                    scrollRafRef.current = requestAnimationFrame(scrollStep);
                }
            };
            scrollRafRef.current = requestAnimationFrame(scrollStep);
        }
    };

    const handleTabsMouseLeave = () => {
        cancelAnimationFrame(scrollRafRef.current);
    };

    const [modalType, setModalType] = useState(null); // 'task', 'note', 'reminder', 'upload', 'msg', 'matter', 'event', 'client', 'time'
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [selectedMatter, setSelectedMatter] = useState(null);
    const [selectedMatterIntent, setSelectedMatterIntent] = useState('Overview'); // 'Overview' or 'Documents'
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [activeAppCategory, setActiveAppCategory] = useState('All');



    // --- CHAT SYSTEM STATE ---
    const [chatState, setChatState] = useState(() => {
        const saved = localStorage.getItem('JKM_CHAT_STATE_V1');
        if (saved) return JSON.parse(saved);
        return {
            lastSync: Date.now(),
            channels: [
                { id: 'ch_ai', name: 'Gemini Law Navigator', type: 'ai', status: 'Available', initials: 'AI', matterId: null },
                { id: 'ch_gen', name: 'General Office', type: 'general', status: 'Available', initials: 'JKM', matterId: null },
                { id: 'ch_m1', name: 'Mbewe v Gwala', type: 'matter', matterId: 'cs_001', initials: 'MG' },
                { id: 'ch_m2', name: 'SAPS v Dlamini', type: 'matter', matterId: 'cs_002', initials: 'SD' },
                { id: 'ch_zandile', name: 'Zandile Nkosi', type: 'direct', initials: 'ZN' },
                { id: 'ch_sipho', name: 'Sipho Dlamini', type: 'direct', initials: 'SD' }
            ],
            messages: [
                { id: 'msg_1', channelId: 'ch_gen', senderId: 'emp_001', senderName: 'System', role: 'Staff', content: 'Secure Discourse System Online.', timestamp: new Date().toISOString(), type: 'text' }
            ]
        };
    });

    useEffect(() => {
        localStorage.setItem('JKM_CHAT_STATE_V1', JSON.stringify(chatState));
    }, [chatState]);

    const [globalNotification, setGlobalNotification] = useState(null);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileNotificationsOpen, setMobileNotificationsOpen] = useState(false);
    const [notifState, setNotifState] = useState(() => {
        const saved = localStorage.getItem('JKM_NOTIF_STATE_V1');
        if (saved) return JSON.parse(saved);
        return {
            lastSync: Date.now(),
            notifications: [
                { id: 'n1', title: 'Critical Filing Deadline', message: 'Mbewe v Gwala Summons due in 48 hours.', severity: 'high', type: 'Matter Alert', actionLink: 'Matters', timestamp: new Date().toISOString(), read: false, matterId: 'cs_001' },
                { id: 'n2', title: 'Trust Account Imbalance', message: 'Unauthorized trust-to-business transfer attempt blocked.', severity: 'critical', type: 'Compliance', actionLink: 'Matters', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
                { id: 'n3', title: 'Research Complete', message: 'Gemini has finalized SCA judgment summary for Rule 34.', severity: 'low', type: 'AI Insight', actionLink: 'Chat', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true },
                { id: 'n4', title: 'New Matter Assigned', message: 'Van Wyk Estate initial intake assigned to you.', severity: 'normal', type: 'Assignment', actionLink: 'Matters', timestamp: new Date(Date.now() - 14400000).toISOString(), read: false, matterId: 'cs_003' },
                { id: 'n5', title: 'Evidence Uploaded', message: 'Sipho Dlamini uploaded "SAPS_Statement_Archive.pdf" to CS_002.', severity: 'high', type: 'File Activity', actionLink: 'Matters', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false, matterId: 'cs_002' },
                { id: 'n6', title: 'System Pulse: Google Sync', message: 'Google Drive sync stabilized after 12ms jitter.', severity: 'low', type: 'System', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true },
                { id: 'n7', title: 'Billing Threshold Reached', message: 'Mbewe v Gwala has reached 80% of current trust deposit.', severity: 'high', type: 'Financial', actionLink: 'Matters', timestamp: new Date(Date.now() - 259200000).toISOString(), read: false, matterId: 'cs_001' }
            ],
            preferences: {
                criticalOverride: true,
                emailEscalation: false,
                heartbeatAlerts: true
            }
        };
    });

    useEffect(() => {
        localStorage.setItem('JKM_NOTIF_STATE_V1', JSON.stringify(notifState));
    }, [notifState]);

    const [activeToast, setActiveToast] = useState(null);
    const prevNotifCount = useRef(notifState.notifications.length);

    useEffect(() => {
        if (notifState.notifications.length > prevNotifCount.current) {
            const latest = notifState.notifications[0];
            setActiveToast(latest); // Trigger popup
        }
        prevNotifCount.current = notifState.notifications.length;
    }, [notifState.notifications]);

    const [settingsState, setSettingsState] = useState(() => {
        const saved = localStorage.getItem('JKM_SETTINGS_V1');
        return saved ? JSON.parse(saved) : {
            general: { firmName: 'JKM Attorneys Inc.', timezone: 'Africa/Johannesburg', currency: 'ZAR (R)' },
            roles: { billingOverride: false, forcePush: false },
            billing: { standardRate: 1500, vatRate: 15, autoInvoice: true },
            ai: { draftingOracle: true, voiceSynthesis: true },
            preferences: { theme: 'obsidian', denseMode: true, reduceMotion: false, showAiScores: true, expandLogs: false }
        };
    });

    useEffect(() => {
        localStorage.setItem('JKM_SETTINGS_V1', JSON.stringify(settingsState));
    }, [settingsState]);

    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    const addNotification = useCallback((notif) => {
        setNotifState(prev => ({
            ...prev,
            notifications: [{
                id: `notif_${Date.now()}_${Math.random()}`,
                timestamp: new Date().toISOString(),
                read: false,
                ...notif
            }, ...prev.notifications]
        }));
    }, []);

    const handleNotificationAction = useCallback((id, intent = 'Overview') => {
        const notif = notifState.notifications.find(n => n.id === id);
        if (!notif) return;

        setSelectedMatterIntent(intent);

        // 1. Mark as Read
        setNotifState(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        }));

        // 2. Intelligence: Determine best destination
        let destination = notif.actionLink;
        if (!destination) {
            const typeLower = (notif.type || '').toLowerCase();
            if (notif.matterId) {
                destination = 'Matters';
            } else if (typeLower.includes('task')) {
                destination = 'Tasks';
            } else if (typeLower.includes('chat') || typeLower.includes('ai')) {
                destination = 'Chat';
            }
        }

        if (destination) setActiveTab(destination);

        // 3. Deep Linking: Select specific context
        if (notif.matterId) {
            const matter = matters.find(m => m.id === notif.matterId);
            if (matter) setSelectedMatter(matter);
        } else if (notif.taskId) {
            const task = tasks.find(t => t.id === notif.taskId);
            if (task) setSelectedTask(task);
        }

        setShowNotifDropdown(false);
    }, [notifState.notifications, matters, tasks]);

    // --- HEARTBEAT PROTOCOL (INTERNAL CONSTITIONAL CHECK) ---
    useEffect(() => {
        const checkHealth = () => {
            if (!notifState.preferences.heartbeatAlerts) return;

            const lastSync = chatState.lastSync || 0;
            const diff = Date.now() - lastSync;

            if (diff > 15 * 60 * 1000) {
                const alertMsg = 'GOOGLE SYNC DISRUPTION: System has lost contact with the external registry for over 15 minutes.';

                // Persistence logic
                const exists = notifState.notifications.some(n => n.type === 'SYSTEM_ALERT' && !n.read);
                if (!exists) {
                    addNotification({
                        title: 'HEARTBEAT FAILURE',
                        message: alertMsg,
                        severity: 'critical',
                        type: 'SYSTEM_ALERT',
                        actionLink: 'Apps'
                    });
                }
            }
        };

        const interval = setInterval(checkHealth, 30000);
        checkHealth();
        return () => clearInterval(interval);
    }, [chatState.lastSync, addNotification, notifState.notifications, notifState.preferences.heartbeatAlerts]);

    // Handlers
    const toggleTimer = () => {
        if (timerActive) { clearInterval(timerInterval.current); setTimerActive(false); }
        else { if (!timerMatter) return; setTimerActive(true); timerInterval.current = setInterval(() => setTimerSeconds(s => s + 1), 1000); }
    };


    const activeQuickAdd = (type, contextId = null) => {
        setQuickAddOpen(false);
        setModalType(type);
        setQuickAddContext(contextId);
    }

    const handleSaveTask = (formData, existingTask = null) => {
        if (existingTask) {
            // Edit existing task
            const updatedTask = {
                ...existingTask,
                title: formData.get('title'),
                dueDate: formData.get('dueDate'),
                priority: formData.get('priority'),
                matterId: formData.get('matterId'),
                description: formData.get('description') || existingTask.description
            };
            setTasks(tasks.map(t => t.id === existingTask.id ? updatedTask : t));
            setEditingTask(null);

            addNotification({
                title: 'Task Updated',
                message: `Task "${updatedTask.title}" has been revised.`,
                severity: 'low',
                type: 'Task Update',
                matterId: updatedTask.matterId,
                actionLink: 'Tasks'
            });
        } else {
            // Create new task
            const newTask = {
                id: `tk_${Date.now()}`,
                title: formData.get('title'),
                dueDate: formData.get('dueDate'),
                priority: formData.get('priority'),
                matterId: formData.get('matterId'),
                assignedTo: formData.get('assignedTo'),
                completed: false,
                description: formData.get('description') || 'Quick added task.'
            };
            setTasks(prev => [newTask, ...prev]);

            const assignedName = MOCK_DATA.employees.find(e => e.id === newTask.assignedTo)?.full_name || 'Staff';
            addNotification({
                title: 'New Task Assigned',
                message: `New task "${newTask.title}" assigned to ${assignedName}.`,
                severity: newTask.priority === 'Urgent' ? 'high' : 'low',
                type: 'Assignment',
                matterId: newTask.matterId,
                actionLink: 'Tasks'
            });
        }
        setModalType(null);
        setQuickAddContext(null);
    };

    const handleSaveMatter = (formData) => {
        const team = formData.getAll('team');
        const year = new Date().getFullYear();
        const count = matters.length + 1;
        const autoRef = `${year}-${String(count).padStart(4, '0')}`;
        const matterUid = `cs_${Date.now()}`;

        const newMatter = {
            id: matterUid,
            name: formData.get('name'),
            ref: autoRef,
            client: formData.get('client'),
            clientId: `cl_${Math.floor(Math.random() * 1000)}`,
            stage: 'Initial Intake',
            category: formData.get('category'),
            status: 'On Track',
            priority: 'Normal',
            team: team.length > 0 ? team : [ACTIVE_STAFF.name],
            opened: new Date().toISOString().split('T')[0],
            activity: 'Just Now',
            trustBalance: 0,
            description: formData.get('description'),
            // Detailed Metadata
            opposingCounsel: formData.get('opposingCounsel') || 'Not Yet Recorded',
            claimValue: formData.get('claimValue') || 'TBD',
            jurisdiction: formData.get('jurisdiction') || 'Gauteng High Court',
            incidentDate: formData.get('incidentDate') || 'N/A'
        };

        setMatters(prev => [...prev, newMatter]);

        addNotification({
            title: 'New Matter Initialized',
            message: `Matter "${newMatter.name}" (${newMatter.ref}) has been added to the firm registry.`,
            severity: 'low',
            type: 'Firm Update',
            actionLink: 'Matters'
        });

        // Add initial audit log
        setAuditTrail(prev => [{
            id: `a_${Date.now()}`,
            matterId: matterUid,
            date: new Date().toISOString(),
            action: 'Matter Initialized',
            user: ACTIVE_STAFF.name,
            details: `Portfolio created with reference ${autoRef}. Initial team assigned.`
        }, ...prev]);

        setModalType(null);
        setQuickAddContext(null);
    };

    const handleSaveTimeEntry = (formData) => {
        const duration = parseFloat(formData.get('duration'));
        const resourceName = formData.get('resource');

        // Find staff member to get their rate if available, otherwise use default
        const staff = MOCK_DATA.employees.find(e => e.full_name === resourceName);
        // We use a simplified rate logic here: if it's TM he has a specific rate, others default to 700
        const rate = (resourceName === ACTIVE_STAFF.name) ? ACTIVE_STAFF.rate : 700;

        const amount = duration * rate;
        const matterId = formData.get('matterId');

        const newEntry = {
            id: `b_${Date.now()}`,
            matterId: matterId,
            date: formData.get('date'),
            description: formData.get('description'),
            resource: resourceName,
            amount: amount,
            duration: duration,
            type: 'Professional Fee'
        };

        setBillingEntries(prev => [newEntry, ...prev]);

        // Log to Audit Trail
        setAuditTrail(prev => [{
            id: `a_${Date.now()}`,
            matterId: matterId,
            date: new Date().toISOString(),
            action: 'Time Entry Recorded',
            user: ACTIVE_STAFF.name,
            details: `Logged ${duration} hours for "${formData.get('description')}". Value: R ${amount.toLocaleString()}.`
        }, ...prev]);

        setModalType(null);
        setQuickAddContext(null);
    };

    const handleUploadDocument = (formData) => {
        const file = formData.get('file');
        if (!file || !file.name) {
            alert('No valid file selected.');
            return;
        }

        const newDoc = {
            id: `dr_${Date.now()}`,
            name: file.name,
            mimeType: file.type || 'application/pdf',
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            owner: ACTIVE_STAFF.name,
            modifiedTime: new Date().toISOString(),
            matterId: formData.get('matterId'),
            status: 'Active',
            driveUrl: '#'
        };

        setDocuments(prev => [newDoc, ...prev]);
        setModalType(null);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setModalType('task');
    };

    const toggleTaskCompletion = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <div className="min-h-screen text-white font-['Montserrat'] relative overflow-x-hidden bg-[#050505]">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');
        :root { --gold1: #c9a646; --gold2: #f7d774; --glass-bg: rgba(18,18,18,0.7); }
        html, body { 
            background: url(${background}) no-repeat center center fixed !important; 
            background-size: cover !important;
            background-color: #050505; 
            min-height: 100vh;
        }
        /* body::before removed to brighten background */
        /* GLOSSY GLASS SYSTEM (HIGH SHINE) */
        .glass-card { background: rgba(0,0,0,0.35); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; box-shadow: 0 8px 32px 0 rgba(0,0,0,0.4); }
        .glass-panel { background: rgba(5,5,5,0.6); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); border-right: 1px solid rgba(255,255,255,0.08); }
        .glass-modal { background: rgba(0,0,0,0.7); backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px); border: 1px solid rgba(255,255,255,0.1); }
        .glass-btn { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        
        /* MOBILE READABILITY & SCROLL FIXES */
        @media (max-width: 768px) {
            html, body { font-size: 16px; overflow-x: hidden; }
            .text-[10px] { font-size: 0.75rem !important; } /* 12px */
            .text-xs { font-size: 0.85rem !important; } /* 13.6px */
            .text-sm { font-size: 0.95rem !important; } /* 15.2px */
            
            /* UNLOCK SCROLLING ON MOBILE */
            .mobile-scroll-container { height: auto !important; overflow-y: visible !important; min-height: 100vh; padding-bottom: 8rem; }
            .mobile-stack { flex-direction: column !important; }
            .mobile-full-width { width: 100% !important; max-width: none !important; }
            
            /* HIDE NEGATIVE SPACE (TIGHTER FIT) */
            main { padding-top: 4rem !important; }
            .content-pad-mobile { padding-top: 5rem; }
        }
      `}</style>

            {/* --- MOBILE TACTICAL HEADER (AVIATION COCKPIT V2) --- */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#121212]/90 backdrop-blur-xl border-b border-white/10 transition-all duration-300 h-16 flex items-center justify-between px-4">
                {/* Pane A: Notification Gateway (Was System Drawer) */}
                <button
                    onClick={() => setMobileNotificationsOpen(true)}
                    className="w-11 h-11 flex items-center justify-center -ml-2 text-gray-400 hover:text-[#c9a646] active:scale-95 transition-all relative"
                >
                    <Bell size={24} />
                    {notifState.notifications.some(n => !n.read) && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border border-[#121212]"></span>
                    )}
                </button>

                {/* Pane B: Context Anchor (Heads-Up Display) */}
                <div
                    onClick={() => selectedMatter && setActiveTab('Matters')}
                    className={`flex flex-col items-center justify-center transition-all ${selectedMatter ? 'cursor-pointer active:scale-95' : 'pointer-events-none'}`}
                >
                    <span className="text-[10px] font-black text-[#c9a646] tracking-[0.2em] uppercase leading-tight">
                        {selectedMatter ? 'MATTER DETAILS' : (activeTab === 'Personal Hub' ? 'PERSONAL HUB' : activeTab)}
                    </span>
                    <span className={`text-xs font-bold text-white leading-tight ${selectedMatter?.status === 'Urgent' ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''}`}>
                        {selectedMatter ? `${selectedMatter.ref} • ${selectedMatter.stage}` : 'Command Center'}
                    </span>
                </div>

                {/* Pane C: Global Compass & Identity */}
                <div className="flex items-center gap-1 -mr-2">
                    <button
                        onClick={() => setMobileSearchOpen(true)}
                        className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white active:scale-95 transition-all"
                    >
                        <Search size={20} />
                    </button>
                    <button
                        onClick={() => setActiveTab('Account')}
                        className="w-11 h-11 flex items-center justify-center active:scale-95 transition-all relative"
                    >
                        <div className="w-8 h-8 rounded-full border border-[#c9a646] flex items-center justify-center text-[10px] font-black text-white bg-black/40 overflow-hidden">
                            {ACTIVE_STAFF.initials}
                        </div>
                        {/* Pulse Heartbeat */}
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-green-500 border-2 border-[#121212] animate-pulse"></div>
                    </button>
                </div>
            </header>

            {/* --- DESKTOP HEADER (Original Refined) --- */}
            <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-md border-b border-white/5 z-50 px-4 md:px-6 items-center justify-between">
                {/* 1. Brand Anchor (Responsive Context) */}
                <div className="flex items-center gap-4 w-64 cursor-pointer" onClick={() => setActiveTab(selectedMatter ? 'Matters' : 'Personal Hub')}>
                    <div className="flex items-center gap-4">
                        <img src="https://lh3.googleusercontent.com/d/1nk7qVGHgMPwlH3U29gHtglkxu1yNAZaD" alt="Mokwebo Logo" className="h-6 opacity-90" />
                        <span className="text-white font-black tracking-[0.2em] text-xs uppercase">Mokwebo Legal</span>
                    </div>
                </div>

                {/* 2. Global Search */}
                {/* 2. Master Search (The Global Compass) */}
                <div className="flex-1 max-w-2xl px-8 relative z-[60]">
                    <div className="relative group">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-[#c9a646]' : 'text-gray-600'}`} size={14} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type to search registry..."
                            className="w-full bg-[#121212] border border-white/5 rounded-full py-2 pl-10 pr-12 text-xs text-white focus:border-[#c9a646] focus:outline-none transition-all placeholder:text-gray-700 font-medium tracking-wide"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {searchQuery ? (
                                <X size={12} className="text-gray-500 hover:text-white cursor-pointer" onClick={() => setSearchQuery('')} />
                            ) : (
                                <>
                                    <span className="text-[9px] font-black text-gray-700 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">CMD</span>
                                    <span className="text-[9px] font-black text-gray-700 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">K</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* SEARCH RESULTS DROPDOWN */}
                    {searchQuery && searchResults && (
                        <div className="absolute top-12 left-8 right-8 bg-[#121212] border border-white/10 rounded-xl shadow-2xl shadow-black overflow-hidden animate-in slide-in-from-top-2">
                            {/* RESULTS LIST */}
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {/* MATTERS */}
                                {searchResults.matters.length > 0 && (
                                    <div className="p-2">
                                        <div className="px-2 py-1 text-[9px] font-black text-gray-500 uppercase tracking-widest">Matters</div>
                                        {searchResults.matters.map(m => (
                                            <div key={m.id} onClick={() => { setActiveTab('Matters'); setSearchQuery(''); }} className="p-3 hover:bg-white/5 rounded-lg cursor-pointer flex items-center justify-between group">
                                                <div>
                                                    <p className="text-xs font-bold text-white group-hover:text-[#c9a646]">{m.name}</p>
                                                    <p className="text-[9px] text-gray-500 font-mono">{m.ref}</p>
                                                </div>
                                                <div className={`w-2 h-2 rounded-full ${m.status === 'Active' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* CLIENTS */}
                                {searchResults.clients.length > 0 && (
                                    <div className="p-2 border-t border-white/5">
                                        <div className="px-2 py-1 text-[9px] font-black text-gray-500 uppercase tracking-widest">Clients</div>
                                        {searchResults.clients.map(c => (
                                            <div key={c.id} onClick={() => { setActiveTab('Clients'); setSearchQuery(''); }} className="p-3 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center text-xs font-black">{c.initials}</div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">{c.name}</p>
                                                    <p className="text-[9px] text-gray-500">{c.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* DOCUMENTS */}
                                {searchResults.documents.length > 0 && (
                                    <div className="p-2 border-t border-white/5">
                                        <div className="px-2 py-1 text-[9px] font-black text-gray-500 uppercase tracking-widest">Documents</div>
                                        {searchResults.documents.map(d => (
                                            <div key={d.id} onClick={() => { setActiveTab('Documents'); setSearchQuery(''); }} className="p-3 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-3">
                                                <FileText size={14} className="text-gray-400" />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-xs font-bold text-white truncate">{d.name}</p>
                                                    <p className="text-[9px] text-gray-500 font-mono">{d.size}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* TASKS */}
                                {searchResults.tasks.length > 0 && (
                                    <div className="p-2 border-t border-white/5">
                                        <div className="px-2 py-1 text-[9px] font-black text-gray-500 uppercase tracking-widest">Tasks</div>
                                        {searchResults.tasks.map(t => (
                                            <div key={t.id} onClick={() => { setActiveTab('Tasks'); setSearchQuery(''); }} className="p-3 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded border border-gray-600 flex items-center justify-center ${t.completed ? 'bg-green-500 border-green-500' : ''}`}>
                                                    {t.completed && <CheckSquare size={8} className="text-black" />}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-xs font-bold text-white truncate">{t.title}</p>
                                                    <p className="text-[9px] text-gray-500 font-mono">{t.priority}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* EMPTY STATE */}
                                {!searchResults.matters.length && !searchResults.clients.length && !searchResults.documents.length && !searchResults.tasks.length && (
                                    <div className="p-8 text-center">
                                        <Search size={24} className="text-gray-700 mx-auto mb-3" />
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nothing found in registry.</p>
                                        <button className="mt-4 px-4 py-2 bg-[#c9a646]/10 text-[#c9a646] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#c9a646]/20 transition-all flex items-center gap-2 mx-auto">
                                            <Sparkles size={12} /> Ask AI to find "{searchQuery}"
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* FOOTER */}
                            <div className="bg-black/50 p-2 border-t border-white/5 flex justify-between items-center px-4">
                                <span className="text-[8px] font-bold text-gray-600 uppercase">Index v1.0 • Latency: 12ms</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] font-bold text-gray-600 uppercase"><span className="text-white">↑↓</span> Navigate</span>
                                    <span className="text-[8px] font-bold text-gray-600 uppercase"><span className="text-white">↵</span> Open</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center gap-6 w-64 justify-end">

                    {/* 3. System Indicators */}
                    <div className="flex items-center gap-3 border-r border-white/10 pr-6 mr-2">
                        <div className="group relative flex items-center justify-center" title="Google Sync: Active">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        </div>
                        <div className="group relative" title="AI: Ready">
                            <Sparkles size={14} className="text-blue-400 opacity-80" />
                        </div>
                        <div className="group relative" title="Network: Online">
                            <Activity size={14} className="text-gray-500" />
                        </div>
                    </div>

                    {/* 4. Notifications */}
                    {/* 4. Notifications */}
                    <div className="relative">
                        <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className={`relative transition-colors ${showNotifDropdown ? 'text-[#c9a646]' : 'text-gray-400 hover:text-white'}`}>
                            <Bell size={16} />
                            {notifState.notifications.some(n => !n.read) && (
                                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black ${notifState.notifications.some(n => n.severity === 'critical' && !n.read) ? 'bg-red-500 animate-pulse' : 'bg-[#c9a646]'}`}></span>
                            )}
                        </button>
                        {showNotifDropdown && (
                            <>
                                <div className="fixed inset-0 z-[90]" onClick={() => setShowNotifDropdown(false)}></div>
                                <NotificationDropdown
                                    notifications={notifState.notifications}
                                    onManage={() => { setActiveTab('Notifications'); setShowNotifDropdown(false); }}
                                    onMarkAllRead={() => {
                                        setNotifState(prev => ({
                                            ...prev,
                                            notifications: prev.notifications.map(n => ({ ...n, read: true }))
                                        }));
                                    }}
                                    onSelect={handleNotificationAction}
                                    onClose={() => setShowNotifDropdown(false)}
                                />
                            </>
                        )}
                    </div>

                    {/* 5. Apps Shortcut */}
                    <button onClick={() => setActiveTab('Apps')} className={`text-gray-400 hover:text-[#c9a646] transition-colors ${activeTab === 'Apps' ? 'text-[#c9a646]' : ''}`}>
                        <Grid3x3 size={16} />
                    </button>

                    {/* 6. User Profile (Identity Gateway) */}
                    <div className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer hover:bg-white/5 p-1 rounded-full transition-all" onClick={() => setActiveTab('Account')}>
                        <div className="text-right hidden xl:block">
                            <p className="text-[10px] font-black text-white uppercase leading-none mb-0.5">{currentUser.name.split(' ')[0]}</p>
                            <p className="text-[8px] font-bold text-gray-500 uppercase leading-none">{currentUser.role}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a646] to-[#f7d774] p-[1px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <span className="text-[10px] font-black text-[#c9a646]">{ACTIVE_STAFF.initials}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <QuickAddMenu isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} onSelect={activeQuickAdd} />

            {/* Navigation (Sub-Header) - SCROLLABLE TABS (DESKTOP ONLY) */}
            <nav className="hidden md:flex fixed top-16 left-0 right-0 h-14 bg-black/90 backdrop-blur-md z-40 border-b border-white/5 items-center">
                <div
                    className="w-full h-full relative overflow-hidden group"
                    onMouseMove={handleTabsMouseMove}
                    onMouseLeave={handleTabsMouseLeave}
                >
                    {/* Visual Fades */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Scroll Container */}
                    <div
                        ref={tabsContainerRef}
                        className="flex items-center h-full overflow-x-auto no-scrollbar px-4 gap-1"
                    >
                        {['Personal Hub', 'Firm Overview', 'Apps', 'Tasks', 'Clients', 'Client Onboarding', 'Matters', 'Documents', 'Time', 'Billing', 'Reports', 'Team', 'Chat', 'Client Portal', 'Calendar', 'Settings'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-shrink-0 px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-b-2 hover:bg-white/5 ${activeTab === tab ? 'border-[#c9a646] text-[#f7d774]' : 'border-transparent text-gray-500 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* --- MOBILE NAVIGATION DOCK (BOTTOM - V1.0) --- */}
            {/* --- MOBILE BOTTOM NAVIGATION (Premium Glass Dock) --- */}
            {/* --- MOBILE BOTTOM NAVIGATION (Premium Glass Dock) --- */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-3xl border-t border-white/10 z-50 px-2 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
                <button
                    onClick={() => setActiveTab('Personal Hub')}
                    className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-300 relative ${activeTab === 'Personal Hub' ? 'text-[#c9a646]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {activeTab === 'Personal Hub' && <div className="absolute top-0 w-8 h-0.5 bg-[#c9a646] shadow-[0_0_10px_#c9a646]"></div>}
                    <Home size={22} strokeWidth={activeTab === 'Personal Hub' ? 2.5 : 2} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Home</span>
                </button>

                <button
                    onClick={() => setActiveTab('Matters')}
                    className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-300 relative ${activeTab === 'Matters' ? 'text-[#c9a646]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {activeTab === 'Matters' && <div className="absolute top-0 w-8 h-0.5 bg-[#c9a646] shadow-[0_0_10px_#c9a646]"></div>}
                    <Briefcase size={22} strokeWidth={activeTab === 'Matters' ? 2.5 : 2} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Matters</span>
                </button>

                <div className="relative -top-8">
                    <button
                        onClick={() => setQuickAddOpen(!quickAddOpen)}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white backdrop-blur-3xl border border-white/20 shadow-[0_0_30px_rgba(201,166,70,0.6)] animate-pulse transition-all active:scale-95 ${quickAddOpen ? 'bg-red-500/90 rotate-45' : 'bg-[#c9a646] hover:bg-[#ffe082] text-black'}`}
                    >
                        <Plus size={32} strokeWidth={2.5} />
                    </button>
                </div>

                <button
                    onClick={() => setActiveTab('Chat')}
                    className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-300 relative ${activeTab === 'Chat' ? 'text-[#c9a646]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {activeTab === 'Chat' && <div className="absolute top-0 w-8 h-0.5 bg-[#c9a646] shadow-[0_0_10px_#c9a646]"></div>}
                    <MessageSquare size={22} strokeWidth={activeTab === 'Chat' ? 2.5 : 2} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Chat</span>
                </button>

                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-300 relative ${mobileMenuOpen ? 'text-[#c9a646]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Grid3x3 size={22} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">More</span>
                </button>
            </nav>

            {/* --- MOBILE APP HUB (DRAWER) --- */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 flex flex-col md:hidden">
                    {/* Drawer Header */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 bg-[#0a0a0a]">
                        <div>
                            <span className="text-xl font-black text-white uppercase tracking-tighter">App Hub</span>
                            <p className="text-[10px] text-[#c9a646] font-bold uppercase tracking-widest">JK Mokwebo OS v1.0</p>
                        </div>
                        <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white active:bg-white/10">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
                        {/* 1. Operational Core */}
                        <div>
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Operational Core</h4>
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { id: 'Tasks', icon: CheckSquare, label: 'Tasks' },
                                    { id: 'Calendar', icon: CalendarIcon, label: 'Calendar' },
                                    { id: 'Documents', icon: FileText, label: 'Docs' },
                                    { id: 'Chat', icon: MessageSquare, label: 'Chat' }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                                        className="flex flex-col items-center gap-3"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${activeTab === item.id ? 'bg-[#c9a646] border-[#c9a646] text-black shadow-[0_0_15px_rgba(201,166,70,0.4)]' : 'bg-[#121212] border-white/10 text-gray-400'}`}>
                                            <item.icon size={24} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${activeTab === item.id ? 'text-[#c9a646]' : 'text-gray-500'}`}>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Financial Control */}
                        <div>
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Financial Control</h4>
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { id: 'Time', icon: Clock, label: 'Logs' },
                                    { id: 'Billing', icon: DollarSign, label: 'Billing' },
                                    { id: 'Reports', icon: Activity, label: 'Reports' },
                                    { id: 'Clients', icon: Users, label: 'Clients' }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                                        className="flex flex-col items-center gap-3"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${activeTab === item.id ? 'bg-[#c9a646] border-[#c9a646] text-black shadow-[0_0_15px_rgba(201,166,70,0.4)]' : 'bg-[#121212] border-white/10 text-gray-400'}`}>
                                            <item.icon size={24} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${activeTab === item.id ? 'text-[#c9a646]' : 'text-gray-500'}`}>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Administrative */}
                        <div>
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Administrative</h4>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                {[
                                    { id: 'Apps', icon: Grid3x3, label: 'Apps' },
                                    { id: 'Settings', icon: Settings, label: 'Settings' },
                                    { id: 'Account', icon: UserCircle, label: 'Account' },
                                    { id: 'Team', icon: Shield, label: 'Admin' }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                                        className="flex flex-col items-center gap-3"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${activeTab === item.id ? 'bg-[#c9a646] border-[#c9a646] text-black shadow-[0_0_15px_rgba(201,166,70,0.4)]' : 'bg-[#121212] border-white/10 text-gray-400'}`}>
                                            <item.icon size={24} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${activeTab === item.id ? 'text-[#c9a646]' : 'text-gray-500'}`}>{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            <button className="w-full h-12 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center gap-2 mt-8">
                                <LogOut size={16} className="text-red-500" />
                                <span className="text-xs font-black text-red-500 uppercase tracking-widest">Secure Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INVISIBLE SPACER FOR MOBILE NAV */}
            <nav className="md:hidden h-20 bg-transparent pointer-events-none"></nav>

            <main className="pt-24 md:pt-48 pb-32 md:pb-20 px-4 md:px-8 min-h-screen">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: isMobile ? 10 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isMobile ? -10 : -20 }}
                        transition={{ duration: isMobile ? 0.2 : 0.3, ease: "easeInOut" }}
                        className="h-full"
                    >
                        {(() => {
                            switch (activeTab) {
                                case 'Personal Hub':
                                    return <PersonalHubPage
                                        tasks={tasks}
                                        matters={matters}
                                        pulse={MOCK_DATA.pulse}
                                        setActiveTab={setActiveTab}
                                        openQuickAdd={activeQuickAdd}
                                        timerActive={timerActive}
                                        toggleTimer={toggleTimer}
                                        timerSeconds={timerSeconds}
                                        setTimerMatter={setTimerMatter}
                                        timerMatter={timerMatter}

                                        toggleTaskCompletion={toggleTaskCompletion}
                                        onTaskClick={setSelectedTask}
                                        onAlertClick={setSelectedAlert}
                                        onMatterClick={setSelectedMatter}
                                        onEventClick={setSelectedEvent}
                                    />;
                                case 'Firm Overview': return <FirmOverviewPage tasks={tasks} matters={matters} data={MOCK_DATA} setActiveTab={setActiveTab} />;
                                case 'Apps': return <AppsPage activeCategory={activeAppCategory} setActiveCategory={setActiveAppCategory} auditTrail={systemLogs} />;
                                case 'Tasks': return <TasksPage tasks={tasks} toggleTaskCompletion={toggleTaskCompletion} onTaskClick={setSelectedTask} matters={matters} openQuickAdd={activeQuickAdd} setModalType={setModalType} />;
                                case 'Clients': return <ClientsPage clients={clients} setClients={setClients} matters={matters} />;
                                case 'Account': return <AccountPage user={currentUser} onUpdateUser={setCurrentUser} auditTrail={systemLogs} settings={settingsState} onUpdateSettings={setSettingsState} />;
                                case 'Time': return (
                                    <TimePage
                                        timeEntries={timeEntries}
                                        setTimeEntries={setTimeEntries}
                                        matters={matters}
                                        employees={employees}
                                        timerActive={timerActive}
                                        timerSeconds={timerSeconds}
                                        setTimerActive={setTimerActive}
                                        setTimerSeconds={setTimerSeconds}
                                    />
                                );
                                case 'Billing': return (
                                    <BillingPage
                                        invoices={invoices}
                                        setInvoices={setInvoices}
                                        timeEntries={timeEntries}
                                        setTimeEntries={setTimeEntries}
                                        matters={matters}
                                        clients={clients}
                                    />
                                );
                                case 'Reports': return (
                                    <ReportsPage
                                        matters={matters}
                                        tasks={tasks}
                                        timeEntries={timeEntries}
                                        invoices={invoices}
                                        employees={employees}
                                        clients={clients}
                                        auditTrail={systemLogs}
                                    />
                                );
                                case 'Chat': return (
                                    <ChatPage
                                        matters={matters}
                                        chatState={chatState}
                                        setChatState={setChatState}
                                        employees={employees}
                                        billingEntries={timeEntries}
                                        tasks={tasks}
                                        clients={clients}
                                    />
                                );
                                case 'Client Onboarding': return (
                                    <ClientOnboardingPage />
                                );
                                case 'Client Portal': return (
                                    <ClientPortalPage
                                        clients={clients}
                                        matters={matters}
                                        documents={documents}
                                        invoices={invoices}
                                    />
                                );
                                case 'Settings': return (
                                    <SettingsPage
                                        settings={settingsState}
                                        onUpdateSettings={setSettingsState}
                                        auditTrail={systemLogs}
                                    />
                                );
                                case 'Matters': return (
                                    <MattersPage
                                        matters={matters}
                                        tasks={tasks}
                                        documents={documents}
                                        events={MOCK_DATA.calendar}
                                        billingEntries={timeEntries}
                                        auditTrail={systemLogs}
                                        setAuditTrail={setSystemLogs}
                                        setBillingEntries={setTimeEntries}
                                        data={MOCK_DATA}
                                        setActiveTab={setActiveTab}
                                        openQuickAdd={activeQuickAdd}
                                        toggleTaskCompletion={toggleTaskCompletion}
                                        onTaskClick={setSelectedTask}
                                        setMatters={setMatters}
                                        setTasks={setTasks}
                                        onEditTask={handleEditTask}
                                        chatState={chatState}
                                        setChatState={setChatState}
                                        initialMatterId={selectedMatter?.id}
                                        initialSubTab={selectedMatterIntent || 'Overview'}
                                    />
                                );
                                case 'Team': return <EmployeesPage employees={employees} setEmployees={setEmployees} tasks={tasks} />;
                                case 'Documents': return <DocumentsPage documents={documents} setDocuments={setDocuments} matters={matters} clients={MOCK_DATA.clients} />;
                                case 'Calendar': return <CalendarPage events={MOCK_DATA.calendar} matters={matters} onEventClick={setSelectedEvent} openQuickAdd={activeQuickAdd} />;
                                case 'Notifications': return <NotificationsPage state={notifState} setState={setNotifState} setActiveTab={setActiveTab} onAction={handleNotificationAction} />;
                                default: return <div className="py-20 text-center uppercase font-black text-gray-500 tracking-widest">{activeTab} Module Ready</div>;
                            }
                        })()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Modals */}
            <TaskModal isOpen={modalType === 'task'} onClose={() => { setModalType(null); setEditingTask(null); }} onSave={handleSaveTask} matters={matters} editTask={editingTask} defaultMatterId={quickAddContext} employees={MOCK_DATA.employees} />
            <NoteModal isOpen={modalType === 'note'} onClose={() => setModalType(null)} matters={matters} defaultMatterId={quickAddContext} />
            <ReminderModal isOpen={modalType === 'reminder'} onClose={() => setModalType(null)} />
            <UploadModal isOpen={modalType === 'doc'} onClose={() => setModalType(null)} onUpload={handleUploadDocument} matters={matters} defaultMatterId={quickAddContext} />
            <MessageModal isOpen={modalType === 'msg'} onClose={() => setModalType(null)} />
            <MatterModal isOpen={modalType === 'matter'} onClose={() => setModalType(null)} onSave={handleSaveMatter} employees={MOCK_DATA.employees} />
            <EventModal isOpen={modalType === 'event'} onClose={() => setModalType(null)} matters={matters} />
            <ClientModal isOpen={modalType === 'client'} onClose={() => setModalType(null)} />
            <TimeEntryModal isOpen={modalType === 'time'} onClose={() => setModalType(null)} matters={matters} defaultMatterId={quickAddContext} onSave={handleSaveTimeEntry} employees={MOCK_DATA.employees} />

            {/* Task Details Modal */}
            <TaskDetailModal
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                matter={matters.find(m => m.id === selectedTask?.matterId)}
                onToggleCompletion={toggleTaskCompletion}
                onEdit={handleEditTask}
            />

            {/* QUICK ADD FAB (Context Aware) */}
            <button
                onClick={() => setQuickAddOpen(!quickAddOpen)}
                className={`hidden md:flex fixed bottom-8 right-8 w-14 h-14 rounded-full items-center justify-center shadow-2xl z-[50] transition-all hover:scale-110 active:scale-95 group ${quickAddOpen ? 'bg-white text-black rotate-45' : 'bg-[#c9a646] text-black hover:bg-[#ffe082]'}`}
            >
                <Plus size={24} strokeWidth={3} />
            </button>

            <QuickAddMenu
                isOpen={quickAddOpen}
                onClose={() => setQuickAddOpen(false)}
                onSelect={(action) => {
                    setQuickAddOpen(false);
                    // Context Awareness Logic
                    const contextId = (activeTab === 'Matters' && selectedMatter) ? selectedMatter.id : null;
                    if (contextId && setQuickAddContext) setQuickAddContext(contextId);

                    switch (action) {
                        case 'task': setModalType('task'); break;
                        case 'note': setModalType('note'); break;
                        case 'reminder': setModalType('reminder'); break;
                        case 'doc': setModalType('doc'); break;
                        case 'msg': setModalType('msg'); break;
                    }
                }}
            />
            {/* AI Assistant Shortcut */}
            {/* AI Assistant Shortcut - Desktop Only */}
            <button
                onClick={() => setActiveTab('Chat')}
                className="hidden md:flex fixed bottom-28 right-8 w-10 h-10 rounded-full bg-black border border-white/20 items-center justify-center shadow-lg z-[49] text-gray-400 hover:text-white hover:border-[#c9a646] transition-all"
                title="Open Assistant"
            >
                <MessageSquare size={16} />
            </button>

            {/* Alert Detail Modal */}
            <AlertDetailModal
                alert={selectedAlert}
                onClose={() => setSelectedAlert(null)}
            />

            {/* Matter Detail Modal */}
            <MatterDetailModal
                matter={selectedMatter}
                onClose={() => setSelectedMatter(null)}
                setActiveTab={setActiveTab}
                setSelectedMatterIntent={setSelectedMatterIntent}
            />

            {/* Event Detail Modal */}
            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                matter={matters.find(m => m.id === selectedEvent?.matterId)}
                setActiveTab={setActiveTab}
            />

            {/* Footer */}
            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 h-14 bg-black/95 backdrop-blur-md border-t border-white/5 z-40 px-8">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between text-[10px]">
                    {/* System Status */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-gray-400 uppercase font-bold tracking-wider">Online</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <HardDrive size={12} />
                            <span>Drive Synced</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <CalendarIcon size={12} />
                            <span>Calendar Connected</span>
                        </div>
                    </div>

                    {/* Context Indicator */}
                    <div className="flex items-center gap-3">
                        {timerActive && (
                            <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded border border-green-500/30">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-green-400 font-bold uppercase">Timer Running</span>
                                <span className="text-white font-mono">{new Date((timerSeconds || 0) * 1000).toISOString().substr(11, 8)}</span>
                            </div>
                        )}
                    </div>

                    {/* Account & Legal */}
                    <div className="flex items-center gap-4">
                        <div className="text-gray-600 text-[9px]">
                            <span>v1.0.0</span>
                        </div>
                    </div>

                    {/* Help & Support */}
                    <div className="flex items-center gap-3">
                        <button className="text-gray-500 hover:text-[#c9a646] transition-colors flex items-center gap-1.5">
                            <HelpCircle size={12} />
                            <span className="uppercase font-bold">Help</span>
                        </button>
                        <button className="text-gray-500 hover:text-[#c9a646] transition-colors flex items-center gap-1.5">
                            <Keyboard size={12} />
                            <span className="uppercase font-bold">Shortcuts</span>
                        </button>
                    </div>
                </div>
            </footer>
            {/* Mobile Search Overlay */}
            {mobileSearchOpen && (
                <div className="md:hidden fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-in slide-in-from-top duration-200">
                    <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#121212]">
                        <Search className="text-[#c9a646]" size={20} />
                        <input
                            autoFocus
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search matters, clients, docs..."
                            className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-base font-medium"
                        />
                        <button onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }} className="text-gray-500 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
                        {searchQuery && searchResults ? (
                            <div className="space-y-6 pb-20">
                                {Object.entries(searchResults).map(([category, items]) => items.length > 0 && (
                                    <div key={category}>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{category}</p>
                                        <div className="space-y-2">
                                            {items.map((item) => (
                                                <GlassCard
                                                    key={item.id}
                                                    onClick={() => {
                                                        setActiveTab(category.charAt(0).toUpperCase() + category.slice(1));
                                                        setMobileSearchOpen(false);
                                                        setSearchQuery('');
                                                        if (category === 'matters') setSelectedMatterId(item.id);
                                                    }}
                                                    className="p-3 border-l-2 border-l-[#c9a646] active:scale-[0.98] transition-all"
                                                >
                                                    <p className="text-sm font-bold text-white">{item.name || item.title}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase">{item.ref || item.priority || item.email}</p>
                                                </GlassCard>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {!searchResults.matters.length && !searchResults.clients.length && !searchResults.documents.length && !searchResults.tasks.length && (
                                    <div className="text-center py-20 opacity-50">
                                        <Ghost size={48} className="mx-auto mb-4 text-gray-700" />
                                        <p className="text-xs font-black uppercase text-gray-500">No signals found in registry</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 opacity-30">
                                <Search size={48} className="mx-auto mb-4 text-gray-700" />
                                <p className="text-xs font-black uppercase text-gray-500">Enter query to scan database</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MOBILE NOTIFICATION MODAL (Premium) */}
            {mobileNotificationsOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col">
                    <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/60 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#c9a646]/20 flex items-center justify-center text-[#c9a646]">
                                <Bell size={18} />
                            </div>
                            <span className="text-sm font-black text-white uppercase tracking-widest">Notifications</span>
                        </div>
                        <button onClick={() => setMobileNotificationsOpen(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white active:bg-white/20">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                        {notifState.notifications.map(n => (
                            <div key={n.id} className="glass-card p-0 overflow-hidden active:scale-[0.98] transition-all relative group border-l-4 border-l-[#c9a646]">
                                <div className="p-5 flex gap-4">
                                    <div className={`mt-1 p-2 rounded-lg bg-white/5 text-[#c9a646]`}>
                                        <Bell size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {!n.read && <div className="w-2 h-2 rounded-full bg-[#c9a646] shadow-[0_0_8px_#c9a646]"></div>}
                                        </div>
                                        <h4 className={`text-sm font-bold leading-snug mb-2 ${n.read ? 'text-gray-500' : 'text-white'}`}>{n.title}</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed font-medium">{n.message}</p>
                                    </div>
                                </div>
                                {!n.read && (
                                    <div className="flex border-t border-white/5 divide-x divide-white/5">
                                        <button onClick={() => { handleNotificationAction(n.id); setMobileNotificationsOpen(false); }} className="flex-1 py-3 text-[10px] font-black uppercase text-[#c9a646] hover:bg-[#c9a646]/10">View Context</button>
                                        <button onClick={() => { setNotifState(prev => ({ ...prev, notifications: prev.notifications.map(x => x.id === n.id ? { ...x, read: true } : x) })); }} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400 hover:text-white hover:bg-white/5">Mark Read</button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {notifState.notifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center opacity-30 mt-32">
                                <BellRing size={56} className="mb-6 text-gray-500" />
                                <p className="text-sm font-black uppercase tracking-widest text-gray-500">All Caught Up</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <NotificationToast notification={activeToast} onClose={() => setActiveToast(null)} />
        </div>
    );
}

const NotificationsPage = ({ state, setState, setActiveTab, onAction }) => {
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('stream'); // stream, preferences

    const notifications = state?.notifications || [];

    const filtered = useMemo(() => {
        if (filter === 'all') return notifications;
        if (filter === 'unread') return notifications.filter(n => !n.read);
        if (filter === 'critical') return notifications.filter(n => n.severity === 'critical');
        return notifications.filter(n => n.type === filter);
    }, [notifications, filter]);

    const handleAcknowledge = (id) => {
        if (onAction) {
            onAction(id);
        } else {
            if (!setState) return;
            setState(prev => ({
                ...prev,
                notifications: (prev?.notifications || []).map(n => n.id === id ? { ...n, read: true } : n)
            }));
        }
    };

    const handleMarkAllRead = () => {
        setState(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => ({ ...n, read: true }))
        }));
    };

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'critical': return 'border-l-red-500 bg-red-500/5 text-red-500';
            case 'high': return 'border-l-orange-500 bg-orange-500/5 text-orange-400';
            case 'low': return 'border-l-blue-500 bg-blue-500/5 text-blue-400';
            default: return 'border-l-[#c9a646] bg-[#c9a646]/5 text-[#c9a646]';
        }
    };

    const getIcon = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('matter')) return <Briefcase size={18} />;
        if (t.includes('compliance')) return <ShieldCheck size={18} />;
        if (t.includes('ai')) return <Sparkles size={18} />;
        if (t.includes('task') || t.includes('assign')) return <ListChecks size={18} />;
        if (t.includes('system')) return <AlertTriangle size={18} />;
        return <Bell size={18} />;
    };

    return (
        <div className="flex gap-8 h-[calc(100vh-280px)] animate-in fade-in duration-500">
            {/* PANE A: FILTER BAR */}
            <div className="w-64 space-y-4">
                <GlassCard className="p-4 space-y-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 mb-4">Filters</p>
                    <button onClick={() => { setFilter('all'); setViewMode('stream'); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between ${filter === 'all' && viewMode === 'stream' ? 'bg-[#c9a646] text-black' : 'text-gray-400 hover:bg-white/5'}`}>
                        <span>All Notifications</span>
                        <span className="opacity-50">{notifications.length}</span>
                    </button>
                    <button onClick={() => { setFilter('unread'); setViewMode('stream'); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between ${filter === 'unread' ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'text-gray-400 hover:bg-white/5'}`}>
                        <span>Unread</span>
                        <span className="opacity-50">{notifications.filter(n => !n.read).length}</span>
                    </button>
                    <button onClick={() => { setFilter('critical'); setViewMode('stream'); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between ${filter === 'critical' ? 'bg-red-500 text-white' : 'text-red-500 hover:bg-red-500/10'}`}>
                        <span>High Priority</span>
                        <AlertCircle size={14} />
                    </button>
                    <div className="h-px bg-white/5 my-4"></div>
                    <button onClick={() => setViewMode('preferences')} className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-3 ${viewMode === 'preferences' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}>
                        <Settings size={14} /> Attention Settings
                    </button>
                </GlassCard>

                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <Shield size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">System Integrity</span>
                    </div>
                    <p className="text-[8px] font-bold text-gray-500 uppercase leading-relaxed">Notifications are kept for auditing purposes. They cannot be deleted from the firm record.</p>
                </div>
            </div>

            {/* PANE B: ACTIVITY STREAM */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                        {viewMode === 'stream' ? 'Notifications' : 'Notification Settings'}
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </h2>
                    {viewMode === 'stream' && (
                        <button onClick={handleMarkAllRead} className="text-[9px] font-black text-[#c9a646] uppercase tracking-widest hover:text-white transition-colors">Mark all read</button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {viewMode === 'stream' ? (
                        filtered.length > 0 ? (
                            filtered.map(notif => (
                                <GlassCard key={notif.id} className={`p-0 overflow-hidden border-0 transition-all ${notif.read ? 'opacity-40 grayscale-[0.5]' : 'opacity-100 shadow-xl shadow-black/20'}`}>
                                    <div className={`p-6 border-l-4 ${getSeverityStyles(notif.severity)} flex items-center justify-between group`}>
                                        <div className="flex items-start gap-5 flex-1 cursor-pointer" onClick={() => handleAcknowledge(notif.id)}>
                                            <div className={`p-3 rounded-xl bg-white/5 ${getSeverityStyles(notif.severity).split(' ')[2]}`}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60">{notif.type}</span>
                                                    <span className="text-[7px] font-bold text-gray-600 uppercase tracking-tighter">{new Date(notif.timestamp).toLocaleString()}</span>
                                                </div>
                                                <h4 className="text-lg font-black text-white group-hover:text-[#c9a646] transition-colors mb-1">{notif.title}</h4>
                                                <p className="text-[11px] font-medium text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">{notif.message}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 pl-8">
                                            <div className="flex items-center gap-4">
                                                {notif.read ? (
                                                    <div className="flex flex-col items-center gap-1 opacity-40">
                                                        <CheckCircle2 size={24} className="text-gray-500" />
                                                        <span className="text-[7px] font-black uppercase tracking-widest mt-1">Resolved</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleAcknowledge(notif.id); }}
                                                        className="flex flex-col items-center gap-1 group/btn"
                                                    >
                                                        <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center group-hover/btn:bg-current group-hover/btn:text-black transition-all">
                                                            <ArrowRight size={20} />
                                                        </div>
                                                        <span className="text-[7px] font-black uppercase tracking-widest mt-1">Mark Read</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Smart Actions for Matter/Task Context */}
                                            {notif.matterId && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onAction(notif.id, 'Overview'); }}
                                                        className="px-3 py-1.5 bg-white/5 hover:bg-[#c9a646] hover:text-black border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        Open Matter
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onAction(notif.id, 'Documents'); }}
                                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        View Documents
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action bar for high-priority or contextual items */}
                                    {!notif.read && (notif.matterId || notif.taskId) && (
                                        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-end gap-3">
                                            <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest mr-auto italic">Direct Neural Link Available</span>
                                            {notif.matterId && (
                                                <>
                                                    <button onClick={() => onAction(notif.id, 'Overview')} className="text-[8px] font-black uppercase tracking-widest text-[#c9a646] hover:text-white transition-colors">Go to Matter</button>
                                                    <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                                </>
                                            )}
                                            {notif.taskId && (
                                                <button onClick={() => onAction(notif.id)} className="text-[8px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">Focus Task</button>
                                            )}
                                        </div>
                                    )}
                                </GlassCard>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                                <Activity size={64} className="mb-6" />
                                <p className="text-sm font-black uppercase tracking-[0.4em]">Attention Registry Clear</p>
                            </div>
                        )
                    ) : (
                        <div className="space-y-6">
                            <GlassCard className="p-8">
                                <h3 className="text-[10px] font-black text-[#c9a646] uppercase tracking-[0.3em] mb-8">Escalation Logic</h3>
                                <div className="space-y-6">
                                    <PreferenceToggle
                                        label="Critical Override"
                                        desc="Allow high-priority alerts to bypass busy modes or silence protocols."
                                        active={state?.preferences?.criticalOverride}
                                        onToggle={(val) => setState && setState(prev => ({ ...prev, preferences: { ...(prev?.preferences || {}), criticalOverride: val } }))}
                                    />
                                    <PreferenceToggle
                                        label="System Heartbeat"
                                        desc="Keep firm-wide alerts active for Google Drive/Calendar sync disruptions."
                                        active={state?.preferences?.heartbeatAlerts}
                                        onToggle={(val) => setState && setState(prev => ({ ...prev, preferences: { ...(prev?.preferences || {}), heartbeatAlerts: val } }))}
                                    />
                                </div>
                            </GlassCard>
                        </div>
                    )}
                </div>
            </div>

            {/* PANE C: ATTENTION MANAGEMENT (AI Summary) */}
            <div className="w-80 space-y-6">
                <GlassCard className="p-6 border-[#c9a646]/20 bg-black/60">
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles size={18} className="text-[#c9a646]" />
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">AI Insight</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <p className="text-[8px] font-black text-gray-500 uppercase mb-2 tracking-widest">Decision Cluster</p>
                            <p className="text-[10px] font-bold text-gray-300 leading-relaxed italic">"I observe 3 pending deadlines for Mbewe. Recommend priority re-alignment before the 15:00 registry lock."</p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[8px] font-black text-gray-500 uppercase px-1 tracking-widest">Focus Patterns</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                    <p className="text-[14px] font-black text-white">89%</p>
                                    <p className="text-[7px] font-bold text-gray-600 uppercase pt-1">Response Rate</p>
                                </div>
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                    <p className="text-[14px] font-black text-blue-400">12m</p>
                                    <p className="text-[7px] font-bold text-gray-600 uppercase pt-1">Avg Resolution</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                            <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1">Risk Indicator</p>
                            <p className="text-[8px] font-bold text-gray-500 uppercase leading-relaxed">System monitoring shows elevated ignore-rate for low-severity tasks. Danger of alert fatigue detected.</p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

const PreferenceToggle = ({ label, desc, active, onToggle, locked = false }) => (
    <div className="flex items-start justify-between gap-6 group">
        <div className="flex-1">
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                {label}
                {locked && <Lock size={10} className="text-[#c9a646]" />}
            </h5>
            <p className="text-[9px] text-gray-500 font-bold uppercase mt-1 leading-relaxed">{desc}</p>
        </div>
        <button
            disabled={locked}
            onClick={() => onToggle && onToggle(!active)}
            className={`w-10 h-5 rounded-full transition-all relative ${active ? 'bg-[#c9a646]' : 'bg-white/10'}`}
        >
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left-6' : 'left-1'}`}></div>
        </button>
    </div>
);

export default App;
