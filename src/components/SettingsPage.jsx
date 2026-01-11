import React, { useState, useEffect } from 'react';
import {
    Settings, Shield, Users, DollarSign, Database, Activity,
    Save, AlertTriangle, CheckCircle2, Lock, History,
    Cpu, Wifi, Globe, Mail, Bell, FileText, Server,
    ToggleLeft, ToggleRight, X, ChevronRight, AlertCircle
} from 'lucide-react';

const GlassCard = ({ children, className = "", onClick }) => (
    <div onClick={onClick} className={`glass-card ${className} ${onClick ? 'cursor-pointer hover:border-[#c9a646]/50 transition-colors' : ''}`}>
        {children}
    </div>
);

const SectionHeader = ({ icon: Icon, title, desc }) => (
    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
        <div className="w-12 h-12 rounded-xl bg-[#c9a646]/10 flex items-center justify-center text-[#c9a646] border border-[#c9a646]/20">
            <Icon size={24} />
        </div>
        <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">{title}</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{desc}</p>
        </div>
    </div>
);

const ToggleRow = ({ label, desc, active, onToggle, locked, warning }) => (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider group-hover:text-[#c9a646] transition-colors">{label}</h4>
                    {locked && <Lock size={10} className="text-gray-600" />}
                    {warning && <AlertTriangle size={10} className="text-red-500" />}
                </div>
                <p className="text-[9px] font-medium text-gray-500 leading-relaxed">{desc}</p>
            </div>
            <button
                disabled={locked}
                onClick={() => !locked && onToggle()}
                className={`relative w-10 h-5 rounded-full transition-all ${active ? 'bg-[#c9a646]' : 'bg-white/10'}`}
            >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${active ? 'left-6' : 'left-1'}`}></div>
            </button>
        </div>
    </div>
);

const InputRow = ({ label, value, onChange, type = "text", placeholder, locked }) => (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={locked}
            placeholder={placeholder}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white focus:border-[#c9a646] outline-none disabled:opacity-50"
        />
    </div>
);

export default function SettingsPage({ settings, onUpdateSettings, auditTrail = [] }) {
    const [activeSection, setActiveSection] = useState('general');
    const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'
    const [localSettings, setLocalSettings] = useState(settings || {});
    const [hasChanges, setHasChanges] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success'

    // Update local state when prop changes
    useEffect(() => {
        if (settings) setLocalSettings(settings);
    }, [settings]);

    const handleChange = (section, key, value) => {
        setLocalSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        setSaveStatus('saving');
        // Simulate API delay
        setTimeout(() => {
            onUpdateSettings(localSettings);
            setHasChanges(false);
            setSaveStatus('success');
            setShowConfirmModal(false);
            setTimeout(() => setSaveStatus(null), 2000);
        }, 1000);
    };

    const TABS = [
        { id: 'general', label: 'Firm Identity', icon: Globe },
        { id: 'roles', label: 'Roles & Permissions', icon: Users },
        { id: 'billing', label: 'Financial Law', icon: DollarSign },
        { id: 'ai', label: 'AI Governance', icon: Cpu },
        { id: 'integrations', label: 'System Health', icon: Activity },
    ];

    const settingConfig = localSettings[activeSection] || {};

    return (
        <div className="h-full flex gap-8 animate-in fade-in duration-500">
            {/* PANE A: CATEGORY EXPLORER */}
            <div className={`w-full md:w-64 flex-col gap-6 flex-shrink-0 ${mobileView === 'detail' ? 'hidden md:flex' : 'flex'}`}>
                <GlassCard className="p-2 space-y-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveSection(tab.id); setMobileView('detail'); }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeSection === tab.id ? 'bg-[#c9a646] text-black shadow-lg shadow-[#c9a646]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </GlassCard>

                <div className="mt-auto p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">System Operational</span>
                    </div>
                    <p className="text-[8px] font-bold text-gray-500 uppercase leading-relaxed">
                        All services nominal.<br />Last Heartbeat: {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {/* PANE B: CONFIGURATION MATRIX */}
            <div className={`flex-1 flex flex-col gap-6 overflow-hidden ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
                <GlassCard className="flex-1 overflow-y-auto custom-scrollbar p-8 relative">

                    {/* Toolbar */}
                    <div className="md:hidden mb-4">
                        <button onClick={() => setMobileView('list')} className="flex items-center gap-2 text-gray-400 hover:text-white">
                            <ChevronRight size={20} className="rotate-180" /> <span className="text-xs font-black uppercase">Back</span>
                        </button>
                    </div>

                    {/* Toolbar */}
                    {hasChanges && (
                        <div className="absolute top-6 right-6 z-10 animate-in slide-in-from-top-2">
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                className="px-6 py-2 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:shadow-2xl hover:shadow-[#c9a646]/20 transition-all"
                            >
                                <Save size={14} /> Review Changes
                            </button>
                        </div>
                    )}

                    {/* SECTIONS */}
                    {activeSection === 'general' && (
                        <div className="space-y-6 max-w-3xl">
                            <SectionHeader icon={Globe} title="Firm Profile" desc="Identity & Structural Configuration" />
                            <div className="grid grid-cols-2 gap-4">
                                <InputRow label="Firm Legal Name" value={settingConfig.firmName || ''} onChange={v => handleChange('general', 'firmName', v)} placeholder="e.g. JKM Attorneys Inc." />
                                <InputRow label="Practice Number" value={settingConfig.practiceNumber || ''} onChange={v => handleChange('general', 'practiceNumber', v)} placeholder="LPC-12345" />
                                <InputRow label="Primary Jurisdiction" value={settingConfig.jurisdiction || ''} onChange={v => handleChange('general', 'jurisdiction', v)} />
                                <InputRow label="Tax Reference" value={settingConfig.taxRef || ''} onChange={v => handleChange('general', 'taxRef', v)} />
                            </div>
                            <div className="pt-6 border-t border-white/5">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Localization</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputRow label="Timezone" value={settingConfig.timezone || 'Africa/Johannesburg'} onChange={v => handleChange('general', 'timezone', v)} locked />
                                    <InputRow label="Currency" value={settingConfig.currency || 'ZAR (R)'} onChange={v => handleChange('general', 'currency', v)} locked />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'roles' && (
                        <div className="space-y-6 max-w-3xl">
                            <SectionHeader icon={Users} title="Roles & Permissions" desc="Authority Matrix & Access Control" />
                            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl mb-6 flex gap-3">
                                <AlertTriangle size={20} className="text-orange-500 shrink-0" />
                                <div>
                                    <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Authority Warning</h4>
                                    <p className="text-[9px] font-bold text-gray-500 leading-relaxed max-w-lg">
                                        Changes to role definitions affect all users assigned to that role immediately.
                                        Restricting access may block active workflows. Proceed with caution.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Global Privileges (Admin)</h3>
                                <ToggleRow
                                    label="Billing Override"
                                    desc="Allow modification of locked/issued invoices."
                                    active={settingConfig.billingOverride || false}
                                    onToggle={() => handleChange('roles', 'billingOverride', !settingConfig.billingOverride)}
                                    warning
                                />
                                <ToggleRow
                                    label="Audit Log Deletion"
                                    desc="Allow permanent deletion of audit records (Not Recommended)."
                                    active={false}
                                    locked
                                    warning
                                />
                                <ToggleRow
                                    label="Force Client Portal Push"
                                    desc="Bypass manual review for client portal uploads."
                                    active={settingConfig.forcePush || false}
                                    onToggle={() => handleChange('roles', 'forcePush', !settingConfig.forcePush)}
                                />
                            </div>
                        </div>
                    )}

                    {activeSection === 'billing' && (
                        <div className="space-y-6 max-w-3xl">
                            <SectionHeader icon={DollarSign} title="Financial Law" desc="Billing Rules & Assumptions" />

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <InputRow label="Standard Hourly Rate (R)" type="number" value={settingConfig.standardRate || 0} onChange={v => handleChange('billing', 'standardRate', Number(v))} />
                                <InputRow label="VAT Percentage (%)" type="number" value={settingConfig.vatRate || 15} onChange={v => handleChange('billing', 'vatRate', Number(v))} />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Automations</h3>
                                <ToggleRow
                                    label="Auto-Invoice Generation"
                                    desc="Draft invoices automatically at month-end."
                                    active={settingConfig.autoInvoice || false}
                                    onToggle={() => handleChange('billing', 'autoInvoice', !settingConfig.autoInvoice)}
                                />
                                <ToggleRow
                                    label="Late Payment Penalties"
                                    desc="Automatically apply interest to overdue accounts."
                                    active={settingConfig.latePenalties || false}
                                    onToggle={() => handleChange('billing', 'latePenalties', !settingConfig.latePenalties)}
                                />
                            </div>
                        </div>
                    )}

                    {activeSection === 'ai' && (
                        <div className="space-y-6 max-w-3xl">
                            <SectionHeader icon={Cpu} title="AI Governance" desc="Machine Intelligence Boundaries" />

                            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-6 flex gap-3">
                                <Shield size={20} className="text-blue-500 shrink-0" />
                                <div>
                                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Safety Protocol Active</h4>
                                    <p className="text-[9px] font-bold text-gray-500 leading-relaxed max-w-lg">
                                        Generative models are restricted to "Drafting Assistant" mode. Autonomous client interaction is hard-locked to DISABLED at the kernel level.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <ToggleRow
                                    label="Data Scope Lock"
                                    desc="Restrict AI context strictly to the active matter only (No cross-matter learning)."
                                    active={true}
                                    locked
                                />
                                <ToggleRow
                                    label="Drafting Oracle"
                                    desc="Allow AI to generate document drafts based on precedents."
                                    active={settingConfig.draftingOracle ?? true}
                                    onToggle={() => handleChange('ai', 'draftingOracle', !settingConfig.draftingOracle)}
                                />
                                <ToggleRow
                                    label="Voice Synthesis"
                                    desc="Enable text-to-speech output features."
                                    active={settingConfig.voiceSynthesis ?? true}
                                    onToggle={() => handleChange('ai', 'voiceSynthesis', !settingConfig.voiceSynthesis)}
                                />
                                <ToggleRow
                                    label="Autonomous Client Chat"
                                    desc="Allow AI to respond to client portal messages directly."
                                    active={false}
                                    locked
                                    warning
                                />
                            </div>
                        </div>
                    )}

                    {activeSection === 'integrations' && (
                        <div className="space-y-6 max-w-3xl">
                            <SectionHeader icon={Activity} title="System Integrity" desc="External Connections & Health" />

                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500"><Server size={20} /></div>
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase tracking-wider">Combustion Database</h4>
                                            <p className="text-[9px] font-bold text-gray-500">Internal Storage • Low Latency</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-[9px] font-black uppercase">Online</span>
                                </div>

                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500"><Globe size={20} /></div>
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase tracking-wider">Google Drive Sync</h4>
                                            <p className="text-[9px] font-bold text-gray-500">Document Repository • OAuth 2.0</p>
                                        </div>
                                    </div>
                                    <button className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black text-white uppercase transition-all">
                                        Re-Authenticate
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-500"><Cpu size={20} /></div>
                                            <div>
                                                <h4 className="text-xs font-black text-white uppercase tracking-wider">Gemini Pro Vision</h4>
                                                <p className="text-[9px] font-bold text-gray-500">Intelligence Engine • API v1beta</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-[9px] font-black uppercase">Operational</span>
                                    </div>
                                    <div className="pt-2 border-t border-white/5">
                                        <InputRow
                                            label="API Key Configuration"
                                            type="password"
                                            value={settingConfig.geminiKey || ''}
                                            onChange={v => handleChange('integrations', 'geminiKey', v)}
                                            placeholder="Enter your Gemini API Key (begins with AIza...)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </GlassCard>
            </div>

            {/* PANE C: AUDIT DRAWER */}
            <div className="hidden md:flex w-80 flex-col gap-6">
                <GlassCard className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 mb-6 px-2">
                        <History size={16} className="text-[#c9a646]" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Constitution Log</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 px-2">
                        {auditTrail.slice(0, 10).map((log, i) => (
                            <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[8px] font-black text-[#c9a646] uppercase tracking-wider">{log.action || 'Configuration Change'}</span>
                                    <span className="text-[7px] font-mono text-gray-500">{new Date(log.timestamp || log.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[9px] font-bold text-gray-300 leading-tight mb-2">{log.details}</p>
                                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[6px] font-black text-white">{log.user?.split(' ')[0][0] || 'S'}</div>
                                    <span className="text-[8px] font-bold text-gray-500 uppercase">{log.user || 'System'}</span>
                                </div>
                            </div>
                        ))}
                        {auditTrail.length === 0 && (
                            <div className="text-center opacity-30 py-8">
                                <Lock size={24} className="mx-auto mb-2" />
                                <p className="text-[9px] font-black uppercase">No Changes Recorded</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* CONFIRMATION MODAL */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c9a646] to-[#b8860b] rounded-t-2xl"></div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-widest">Confirm Policy Change</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Constitution Amendment Protocol</p>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/5 mb-8">
                            <p className="text-xs font-bold text-gray-300 leading-relaxed mb-4">
                                You are about to modify the system configuration. This action will be:
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-[10px] uppercase font-black text-white">
                                    <CheckCircle2 size={12} className="text-[#c9a646]" /> Audited permanently in the firm ledger
                                </li>
                                <li className="flex items-center gap-2 text-[10px] uppercase font-black text-white">
                                    <CheckCircle2 size={12} className="text-[#c9a646]" /> Applied prospectively (historical data is immutable)
                                </li>
                                <li className="flex items-center gap-2 text-[10px] uppercase font-black text-white">
                                    <CheckCircle2 size={12} className="text-[#c9a646]" /> Enforced immediately across all active sessions
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-4 rounded-xl border border-white/10 text-xs font-black uppercase hover:bg-white/5 transition-all text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-[2] py-4 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-[#c9a646]/20 transition-all flex items-center justify-center gap-2"
                            >
                                {saveStatus === 'saving' ? 'Committing...' : 'Ratify Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
