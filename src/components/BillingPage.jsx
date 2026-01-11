import React, { useState, useMemo } from 'react';
import {
    FileText, CheckCircle, AlertCircle, Clock, ChevronRight,
    Plus, Filter, Download, Send, DollarSign, Briefcase,
    User, Calendar, Lock, TrendingUp, ShieldCheck, X
} from 'lucide-react';

/**
 * JKM BILLING TAB (The Financial Control Center)
 * Constitutional V1.0 - Ledger of Record
 * Fixed & Hardened V2.1
 */
const BillingPage = ({
    invoices = [],
    setInvoices,
    timeEntries = [],
    setTimeEntries,
    matters = [],
    clients = []
}) => {
    // STATE
    const [filterQuery, setFilterQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // SELECTION & MODALS
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [draftInvoice, setDraftInvoice] = useState(null);
    const [autoSend, setAutoSend] = useState(false);

    // UTILS
    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0);
        } catch (e) {
            return 'R 0.00';
        }
    };

    // DERIVED DATA
    const filteredInvoices = useMemo(() => {
        if (!invoices) return [];
        return invoices.filter(inv => {
            const matchesQuery = !filterQuery ||
                (inv.number || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
                (inv.clientName || '').toLowerCase().includes(filterQuery.toLowerCase());

            const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
            return matchesQuery && matchesStatus;
        });
    }, [invoices, filterQuery, statusFilter]);

    // KPI STATS
    const stats = useMemo(() => {
        if (!invoices) return { totalOutstanding: 0, totalCollected: 0, overdueCount: 0 };
        return {
            totalOutstanding: invoices
                .filter(i => i.status === 'Sent' || i.status === 'Overdue')
                .reduce((sum, i) => sum + (i.totalAmount || 0), 0),
            totalCollected: invoices
                .filter(i => i.status === 'Paid')
                .reduce((sum, i) => sum + (i.totalAmount || 0), 0),
            overdueCount: invoices.filter(i => i.status === 'Overdue').length
        };
    }, [invoices]);

    // ACTIONS
    const handleCreateInvoice = (e) => {
        e.preventDefault();
        if (!draftInvoice) return;

        const newInvoice = {
            ...draftInvoice,
            issueDate: new Date().toISOString(),
            status: autoSend ? 'Sent' : 'Draft'
        };

        setInvoices(prev => [newInvoice, ...prev]);

        // LOCK TIME ENTRIES
        const linkedEntryIds = (newInvoice.lineItems || []).map(item => item.timeEntryId);

        setTimeEntries(prev => prev.map(entry => {
            if (linkedEntryIds.includes(entry.id)) {
                return { ...entry, status: 'Locked' };
            }
            return entry;
        }));

        setIsCreateModalOpen(false);
        setDraftInvoice(null);
        setCreateStep(1);
    };

    const handleSendInvoice = () => {
        if (!selectedInvoice) return;
        setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'Sent' } : inv));
        setSelectedInvoice(prev => ({ ...prev, status: 'Sent' }));
    };

    const generateDraft = (matterId) => {
        const matter = matters.find(m => m.id === matterId);
        const client = clients.find(c => c.name === matter?.client);

        const unbilledEntries = timeEntries.filter(t =>
            t.matterId === matterId &&
            t.status !== 'Locked' &&
            t.billable
        );

        if (unbilledEntries.length === 0) {
            alert("No unbilled time entries found for this matter.");
            return;
        }

        const draft = {
            id: `inv_${Date.now()}`,
            number: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
            clientId: client?.id || 'unknown',
            clientName: client?.name || matter?.client || 'Unknown Client',
            matterId: matterId,
            matterName: matter?.name,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            totalAmount: unbilledEntries.reduce((sum, e) => sum + ((e.durationMinutes / 60) * (e.rate || 0)), 0),
            lineItems: unbilledEntries.map(e => ({
                id: `li_${e.id}`,
                timeEntryId: e.id,
                description: e.description,
                quantity: e.durationMinutes / 60,
                rate: e.rate,
                amount: (e.durationMinutes / 60) * (e.rate || 0)
            }))
        };

        setDraftInvoice(draft);
        setCreateStep(2);
    };

    const formatDate = (dateString) => {
        try {
            return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // --- UI COMPONENTS ---
    return (
        <div className="flex flex-col md:flex-row bg-[#050505] h-auto md:h-[calc(100vh-140px)] w-full overflow-visible md:overflow-hidden text-white font-['Montserrat'] relative">
            <div className="flex-1 flex flex-col min-w-0 h-auto md:h-full">

                {/* 1. KPI SUMMARY */}
                <div className="h-auto md:h-24 py-6 md:py-0 border-b border-white/5 bg-[#0a0a0a] flex flex-col md:flex-row items-start md:items-center px-8 gap-6 md:gap-12 flex-shrink-0">
                    <div className="w-full md:w-auto">
                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Total Outstanding</span>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-white">{formatCurrency(stats.totalOutstanding)}</span>
                            <TrendingUp size={16} className="text-orange-500 mb-1.5" />
                        </div>
                    </div>
                    <div className="hidden md:block h-8 w-px bg-white/10"></div>
                    <div className="w-full md:w-auto">
                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Collections (YTD)</span>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-[#c9a646]">{formatCurrency(stats.totalCollected)}</span>
                            <CheckCircle size={16} className="text-[#c9a646] mb-1.5" />
                        </div>
                    </div>
                    <div className="hidden md:block h-8 w-px bg-white/10"></div>
                    <div className="w-full md:w-auto">
                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Overdue Invoices</span>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-red-500">{stats.overdueCount}</span>
                            <AlertCircle size={16} className="text-red-500 mb-1.5" />
                        </div>
                    </div>
                </div>

                {/* 2. CONTROL ROW */}
                <div className="h-auto md:h-16 py-4 md:py-0 border-b border-white/5 bg-[#0a0a0a] flex flex-col md:flex-row items-start md:items-center justify-between px-6 flex-shrink-0 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex items-center gap-2 text-white">
                            <FileText size={18} className="text-[#c9a646]" />
                            <span className="text-sm font-black uppercase tracking-widest">Financial Ledger</span>
                        </div>
                        <div className="hidden md:block h-4 w-px bg-white/10"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{invoices.length} Records</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative group w-full md:w-auto">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                className="w-full md:w-48 bg-[#121212] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-[10px] font-bold text-white focus:border-[#c9a646] outline-none uppercase"
                            />
                        </div>

                        <div className="flex flex-wrap bg-white/5 rounded-lg p-1 border border-white/5 gap-1 w-full md:w-auto justify-center">
                            {['All', 'Draft', 'Sent', 'Paid', 'Overdue'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`flex-1 md:flex-none px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${statusFilter === status ? 'bg-[#c9a646] text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => setIsCreateModalOpen(true)} className="h-9 px-4 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 w-full md:w-auto">
                            <Plus size={14} /> <span className="hidden md:inline">Create Invoice</span><span className="md:hidden">New Invoice</span>
                        </button>
                    </div>
                </div>

                {/* 3. INVOICE REGISTRY */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 mobile-scroll-container">
                    <div className="border border-white/5 rounded-lg overflow-hidden bg-[#121212]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse responsive-table">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5">
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest w-64">Client & Matter</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest w-40">Invoice #</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest w-32">Date Issued</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest w-32">Due Date</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right">Amount</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center w-32">Status</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map(inv => (
                                        <tr
                                            key={inv.id}
                                            onClick={() => setSelectedInvoice(inv)}
                                            className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                                        >
                                            <td className="py-3 px-4" data-label="Matter">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a646] to-[#f7d774] p-[1px] shrink-0">
                                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                                            <FileText size={12} className="text-[#c9a646]" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white group-hover:text-[#c9a646] transition-colors">{inv.clientName || 'Unknown Client'}</div>
                                                        <div className="text-[9px] text-gray-600 font-mono mt-0.5">{inv.matterName || 'No Ref'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-[10px] font-mono text-gray-400 font-bold max-w-[100px]" data-label="Invoice #">{inv.number}</td>
                                            <td className="py-3 px-4 text-[10px] text-gray-400" data-label="Issued">{formatDate(inv.issueDate)}</td>
                                            <td className="py-3 px-4 text-[10px] text-gray-400" data-label="Due">{formatDate(inv.dueDate)}</td>
                                            <td className="py-3 px-4 text-right text-xs font-black text-white font-mono" data-label="Amount">
                                                {formatCurrency(inv.totalAmount)}
                                            </td>
                                            <td className="py-3 px-4 text-center" data-label="Status">
                                                <StatusBadge status={inv.status} />
                                            </td>
                                            <td className="py-3 px-4 text-right" data-label="View">
                                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white ml-auto" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredInvoices.length === 0 && (
                            <div className="p-12 text-center opacity-20">
                                <FileText size={48} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No matching financial records</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. INVOICE DETAIL DRAWER - MOBILE FULL SCREEN */}
            {selectedInvoice && (
                <div className="w-full md:w-[500px] border-l border-white/5 bg-[#0a0a0a] flex flex-col fixed inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 shadow-2xl animate-in slide-in-from-right duration-300 z-[100]">
                    <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0a] shrink-0">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Lock size={12} /> Invoice Details (Read-Only)
                        </span>
                        <button onClick={() => setSelectedInvoice(null)} className="text-gray-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {/* Header Block */}
                        <div className="flex justify-between items-start mb-8 pb-8 border-b border-white/5">
                            <div>
                                <h1 className="text-2xl font-black text-white mb-2">{selectedInvoice.number}</h1>
                                <StatusBadge status={selectedInvoice.status} large />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Total Due</p>
                                <p className="text-xl font-black text-[#c9a646] font-mono">{formatCurrency(selectedInvoice.totalAmount)}</p>
                            </div>
                        </div>

                        {/* Meta Data */}
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">To Client</p>
                                <p className="text-xs font-bold text-white">{selectedInvoice.clientName || 'Unknown'}</p>
                                <p className="text-[9px] text-gray-500">{selectedInvoice.matterName || 'No Reference'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Dates</p>
                                <p className="text-[10px] text-gray-300">Issued: {formatDate(selectedInvoice.issueDate)}</p>
                                <p className="text-[10px] text-gray-300">Due: {formatDate(selectedInvoice.dueDate)}</p>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-8">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Line Items</h3>
                            <div className="rounded-lg border border-white/5 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5">
                                            <th className="py-2 px-3 text-[8px] font-black text-gray-500 uppercase">Description</th>
                                            <th className="py-2 px-3 text-[8px] font-black text-gray-500 uppercase text-right">Hrs</th>
                                            <th className="py-2 px-3 text-[8px] font-black text-gray-500 uppercase text-right">Amt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedInvoice.lineItems || []).map((item, i) => (
                                            <tr key={i} className="border-b border-white/5 last:border-0">
                                                <td className="py-3 px-3 text-[10px] text-white">{item?.description || 'Item'}</td>
                                                <td className="py-3 px-3 text-[10px] text-gray-400 font-mono text-right">{(item?.quantity || 0).toFixed(1)}</td>
                                                <td className="py-3 px-3 text-[10px] text-white font-bold font-mono text-right">{formatCurrency(item?.amount)}</td>
                                            </tr>
                                        ))}
                                        {(!selectedInvoice.lineItems || selectedInvoice.lineItems.length === 0) && (
                                            <tr>
                                                <td colSpan="3" className="py-4 text-center text-[10px] text-gray-500 italic">
                                                    No explicit line items recorded
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Audit Stamp */}
                        <div className="p-4 bg-white/5 rounded border border-white/5 flex items-start gap-3">
                            <ShieldCheck size={16} className="text-gray-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">Audit Record</p>
                                <p className="text-[9px] text-gray-500 leading-relaxed">
                                    Generated from immutable time logs. Changes to this invoice are restricted by regulatory compliance rules.
                                    Locked on {formatDate(selectedInvoice.issueDate)}.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-[#0a0a0a] flex gap-3">
                        <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2">
                            <Download size={14} /> PDF
                        </button>
                        {selectedInvoice.status === 'Draft' ? (
                            <button
                                onClick={handleSendInvoice}
                                className="flex-1 py-3 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-lg text-xs font-black uppercase transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                <Send size={14} /> Send to Client
                            </button>
                        ) : (
                            <button disabled className="flex-1 py-3 bg-[#c9a646]/20 text-[#c9a646] rounded-lg text-xs font-black uppercase flex items-center justify-center gap-2 cursor-not-allowed">
                                <CheckCircle size={14} /> {selectedInvoice.status}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* CREATE INVOICE MODAL - MOBILE FULL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[120] bg-black/95 md:bg-black/90 md:backdrop-blur-sm flex items-center justify-center p-0 md:p-4 animate-in zoom-in-95 duration-200">
                    <div className="w-full h-full md:h-auto md:max-w-lg bg-[#121212] border-0 md:border md:border-white/10 rounded-none md:rounded-2xl overflow-y-auto shadow-2xl">
                        <div className="bg-[#1a1a1a] p-6 border-b border-white/5">
                            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                                <DollarSign size={20} className="text-[#c9a646]" /> Generate Tax Invoice
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                Step {createStep}: {createStep === 1 ? 'Select Source' : 'Review & Finalize'}
                            </p>
                        </div>

                        {createStep === 1 ? (
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Select Matter to Bill</label>
                                    <select
                                        id="matterSelect"
                                        className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none"
                                        onChange={(e) => {
                                            if (e.target.value) generateDraft(e.target.value);
                                        }}
                                    >
                                        <option value="">-- Choose Active Matter --</option>
                                        {matters.filter(m => m.status !== 'Closed').map(m => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.client})</option>
                                        ))}
                                    </select>
                                    <p className="text-[9px] text-gray-500 mt-2">Only matters with "Unbilled" "Logged" time entries will appear.</p>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button onClick={() => setIsCreateModalOpen(false)} className="text-xs font-bold text-gray-500 hover:text-white uppercase">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-6">
                                <div className="bg-white/5 border border-white/5 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Client</span>
                                        <span className="text-[10px] font-bold text-white uppercase">{draftInvoice.clientName}</span>
                                    </div>
                                    <div className="flex justify-between mb-4">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Matter Ref</span>
                                        <span className="text-[10px] font-bold text-[#c9a646] uppercase">{draftInvoice.matterName}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-2 flex justify-between">
                                        <span className="text-xs font-black text-white uppercase">Total Amount</span>
                                        <span className="text-xl font-black text-white font-mono">{formatCurrency(draftInvoice.totalAmount)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Line Items Included</p>
                                    {(draftInvoice.lineItems || []).map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-[10px] text-gray-400 border-b border-white/5 pb-1 last:border-0">
                                            <span className="truncate max-w-[200px]">{item.description}</span>
                                            <span className="font-mono">{formatCurrency(item.amount)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded flex gap-3">
                                    <AlertCircle size={16} className="text-blue-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-blue-300 leading-tight mb-2">
                                            <strong className="block uppercase text-blue-400 mb-1">Confirm Ledger Lock</strong>
                                            Creating this invoice will change the status of {(draftInvoice.lineItems || []).length} time entries to <strong>LOCKED</strong>. This action cannot be undone.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 px-1">
                                    <input
                                        type="checkbox"
                                        id="autoSend"
                                        checked={autoSend}
                                        onChange={(e) => setAutoSend(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/20 bg-black/50 text-[#c9a646] focus:ring-[#c9a646]"
                                    />
                                    <label htmlFor="autoSend" className="text-[10px] text-gray-400 font-bold uppercase select-none cursor-pointer">
                                        Dispatch Automatically (Skip Draft)
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setCreateStep(1)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase transition-all">Back</button>
                                    <button onClick={handleCreateInvoice} className="flex-1 py-3 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-lg text-xs font-black uppercase transition-all shadow-lg flex items-center justify-center gap-2">
                                        <CheckCircle size={14} /> Finalize Invoice
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

const StatusBadge = ({ status, large }) => {
    const styles = {
        'Draft': 'bg-gray-800 text-gray-400 border-gray-700',
        'Sent': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        'Paid': 'bg-green-500/10 text-green-500 border-green-500/30',
        'Overdue': 'bg-red-500/10 text-red-500 border-red-500/30',
    };
    return (
        <span className={`inline-block border rounded uppercase font-black tracking-wider ${styles[status] || styles['Draft']} ${large ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[8px]'}`}>
            {status || 'Unknown'}
        </span>
    );
};

export default BillingPage;
