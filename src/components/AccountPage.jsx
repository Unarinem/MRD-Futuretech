import React, { useState, useEffect } from 'react';
import {
    User, Shield, Lock, Activity, Key, LogOut, CheckCircle2,
    AlertTriangle, RefreshCw, Mail, Phone, Hash, Globe,
    Settings, Layout, CreditCard, Monitor, Smartphone, ShieldCheck
} from 'lucide-react';

const GlassCard = ({ children, className = '' }) => (
    <div className={`glass-card ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ icon: Icon, title, desc }) => (
    <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
            <Icon size={18} className="text-[#c9a646]" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{title}</h3>
        </div>
        {desc && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide ml-8">{desc}</p>}
    </div>
);

const InputRow = ({ label, value, onChange, locked = false, type = 'text', icon: Icon }) => (
    <div className="group mb-5">
        <label className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 group-focus-within:text-[#c9a646] transition-colors">
            {Icon && <Icon size={10} />}
            {label}
            {locked && <Lock size={10} className="text-gray-600 ml-auto" />}
        </label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={(e) => !locked && onChange(e.target.value)}
                readOnly={locked}
                className={`w-full bg-black/40 border ${locked ? 'border-transparent text-gray-500 cursor-not-allowed' : 'border-white/10 text-white focus:border-[#c9a646]'} rounded-lg px-4 py-3 text-xs font-medium outline-none transition-all`}
            />
        </div>
        {locked && <p className="text-[8px] text-gray-600 italic mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">Managed by Firm Administrator</p>}
    </div>
);

const ToggleRow = ({ label, active, onToggle, locked = false }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg border border-transparent ${locked ? 'opacity-50' : 'hover:bg-white/5 hover:border-white/5'} transition-all`}>
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">{label}</span>
        <button
            onClick={() => !locked && onToggle(!active)}
            className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-[#c9a646]' : 'bg-gray-700'}`}
        >
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-4.5' : 'left-0.5'}`} style={{ left: active ? '18px' : '2px' }}></div>
        </button>
    </div>
);

export default function AccountPage({ user, onUpdateUser, auditTrail, settings = {}, onUpdateSettings }) {
    const [subTab, setSubTab] = useState('profile'); // profile, prefs, security, connect
    const [localUser, setLocalUser] = useState(user || {});
    const [isDirty, setIsDirty] = useState(false);
    const [googleStatus, setGoogleStatus] = useState('connected'); // connected, stale, disconnected
    const [sessions, setSessions] = useState([
        { id: 1, device: 'MacBook Pro 16"', location: 'Sandton, ZA', active: true, ip: '192.168.1.4' },
        { id: 2, device: 'iPhone 15 Pro', location: 'Pretoria, ZA', active: false, lastSeen: '2h ago', ip: '10.0.0.12' }
    ]);

    useEffect(() => {
        if (user) setLocalUser(user);
    }, [user]);

    const handleSave = () => {
        onUpdateUser(localUser);
        setIsDirty(false);
        // Log would happen in parent
    };

    const handleChange = (field, value) => {
        setLocalUser(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    // --- Sub-Components for Panes ---

    const IdentityPane = () => (
        <GlassCard className="h-full border-[#c9a646]/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#c9a646]"></div>

            <div className="text-center py-8 border-b border-white/5">
                <div className="w-24 h-24 rounded-full bg-black/50 border-2 border-[#c9a646] mx-auto mb-4 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                    {localUser.avatar ? (
                        <img src={localUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-black text-[#c9a646]">{localUser.initials}</span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-full">
                        <RefreshCw size={20} className="text-white" />
                    </div>
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider mb-1">{localUser.name}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a646]/10 border border-[#c9a646]/20">
                    <ShieldCheck size={10} className="text-[#c9a646]" />
                    <span className="text-[9px] font-black text-[#c9a646] uppercase tracking-widest">{localUser.role}</span>
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                        <Hash size={14} className="text-gray-500" />
                        <div>
                            <p className="text-[8px] font-black text-gray-500 uppercase">Firm Identity</p>
                            <p className="text-xs font-mono text-gray-300">{localUser.id}</p>
                        </div>
                    </div>
                    <Lock size={12} className="text-gray-600" />
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                        <Mail size={14} className="text-gray-500" />
                        <div className="overflow-hidden">
                            <p className="text-[8px] font-black text-gray-500 uppercase">Primary Email</p>
                            <p className="text-xs font-mono text-gray-300 truncate w-32">{localUser.email}</p>
                        </div>
                    </div>
                    <Lock size={12} className="text-gray-600" />
                </div>

                <p className="text-[9px] text-gray-600 leading-relaxed text-center mt-6">
                    Identity attributes are governed by Firm Administration. Contact IT for role elevation.
                </p>
            </div>
        </GlassCard>
    );

    const ProfileSettings = () => (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <SectionHeader icon={User} title="Public Profile" desc="How you appear to clients and colleagues" />

            <InputRow label="Display Name" value={localUser.name || ''} onChange={(v) => handleChange('name', v)} icon={User} />
            <InputRow label="Initials (2-3 Chars)" value={localUser.initials || ''} onChange={(v) => handleChange('initials', v)} icon={Activity} />
            <InputRow label="Mobile Contact" value={localUser.phone || ''} onChange={(v) => handleChange('phone', v)} icon={Phone} />

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button
                    onClick={() => handleChange('avatar', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')}
                    className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                >
                    <Globe size={12} /> Sync Google Profile
                </button>
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={`px-6 py-3 rounded text-[10px] font-black uppercase tracking-widest transition-all ${isDirty ? 'bg-[#c9a646] text-black hover:bg-[#f7d774]' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );

    const PreferenceSettings = () => {
        const updatePref = (key, val) => {
            if (onUpdateSettings) {
                onUpdateSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, [key]: val }
                }));
            }
        };
        const prefs = settings.preferences || {};

        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <SectionHeader icon={Layout} title="Cockpit Preferences" desc="Customize your operational environment" />

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <GlassCard className={`p-4 flex flex-col items-center justify-center gap-3 cursor-pointer border transition-all ${prefs.theme !== 'light' ? 'border-[#c9a646] bg-[#c9a646]/10' : 'border-transparent opacity-50'}`} onClick={() => updatePref('theme', 'obsidian')}>
                        <div className="w-full h-12 bg-[#121212] rounded border border-white/10 opacity-50"></div>
                        <span className="text-[9px] font-black text-[#c9a646] uppercase tracking-widest">Obsidian</span>
                    </GlassCard>
                    <GlassCard className={`p-4 flex flex-col items-center justify-center gap-3 cursor-pointer border transition-all ${prefs.theme === 'light' ? 'border-[#c9a646] bg-white/10' : 'border-transparent opacity-50'}`} onClick={() => updatePref('theme', 'light')}>
                        <div className="w-full h-12 bg-white rounded opacity-20"></div>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Light (Preview)</span>
                    </GlassCard>
                </div>

                <div className="space-y-1">
                    <ToggleRow label="Dense Data Mode (Matrix View)" active={prefs.denseMode} onToggle={(v) => updatePref('denseMode', v)} />
                    <ToggleRow label="Reduce Motion" active={prefs.reduceMotion} onToggle={(v) => updatePref('reduceMotion', v)} />
                    <ToggleRow label="Show AI Confidence Scores" active={prefs.showAiScores !== false} onToggle={(v) => updatePref('showAiScores', v)} />
                    <ToggleRow label="Auto-Expand Audit Logs" active={prefs.expandLogs} onToggle={(v) => updatePref('expandLogs', v)} />
                </div>
            </div>
        );
    };

    const SecurityPane = () => (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <SectionHeader icon={Shield} title="Security & Sessions" desc="Manage access factors and active devices" />

            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-start gap-4 mb-6">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Rotational Key Policy</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed">Your password expires in 14 days. Firm policy requires 90-day rotation.</p>
                    <button onClick={() => alert('Secure Password Reset Link sent to ' + localUser.email)} className="mt-2 text-[9px] font-black text-white bg-red-500/20 px-3 py-1.5 rounded hover:bg-red-500 hover:text-white transition-all">Update Credentials</button>
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Active Sessions</p>
                {sessions.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            {s.device.includes('iPhone') ? <Smartphone size={16} className="text-gray-400" /> : <Monitor size={16} className="text-gray-400" />}
                            <div>
                                <p className="text-xs font-bold text-white">{s.device} <span className="text-gray-600 text-[9px] font-mono mx-1">({s.location})</span></p>
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${s.active ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                                    <span className="text-[8px] font-mono text-gray-500">{s.active ? 'Active Now' : s.lastSeen}</span>
                                </div>
                            </div>
                        </div>
                        {!s.active && <button className="text-gray-600 hover:text-red-500 transition-colors" onClick={() => setSessions(prev => prev.filter(x => x.id !== s.id))}><LogOut size={14} /></button>}
                    </div>
                ))}
            </div>
        </div>
    );

    const ConnectPane = () => (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <SectionHeader icon={Globe} title="Connectivity Services" desc="External system integrations" />

            <div className={`p-6 rounded-xl border ${googleStatus === 'connected' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white">Google Workspace</h4>
                            <p className="text-[10px] text-gray-500 font-mono">Sync: Docs, Drive, Calendar</p>
                        </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${googleStatus === 'connected' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {googleStatus === 'connected' ? 'Healthy' : 'Auth Failed'}
                    </div>
                </div>

                <div className="flex gap-1 mb-4">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className={`h-8 flex-1 rounded-sm ${i > 35 && googleStatus === 'stale' ? 'bg-red-500/50' : 'bg-green-500/30'}`} style={{ opacity: Math.random() * 0.5 + 0.5 }}></div>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-[9px] text-gray-500 font-mono">Heartbeat: 12ms latency</p>
                    <button
                        onClick={() => setGoogleStatus(prev => prev === 'connected' ? 'stale' : 'connected')}
                        className="text-[9px] font-black text-white hover:text-[#c9a646] uppercase tracking-widest flex items-center gap-2"
                    >
                        <RefreshCw size={10} /> Test Connection
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row gap-6 h-auto md:h-full max-w-7xl mx-auto animate-in fade-in duration-500 mobile-scroll-container">
            {/* Left Col: Identity */}
            <div className="w-full md:w-80 flex-shrink-0">
                <IdentityPane />
            </div>

            {/* Right Col: Cockpit */}
            <div className="flex-1 flex flex-col h-auto md:h-[calc(100vh-12rem)]">
                <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-1 overflow-x-auto no-scrollbar md:flex-wrap sticky top-16 md:static bg-[#050505] z-10 py-2">
                    {[
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'prefs', label: 'Preferences', icon: Layout },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'connect', label: 'Integrations', icon: Globe },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs md:text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all flex-shrink-0 ${subTab === tab.id ? 'border-[#c9a646] text-[#c9a646]' : 'border-transparent text-gray-500 hover:text-white'}`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-visible md:overflow-y-auto no-scrollbar pb-32 md:pb-20">
                    <GlassCard className="p-4 md:p-8 border-[#c9a646]/20 bg-black/40 backdrop-blur-2xl">
                        {subTab === 'profile' && <ProfileSettings />}
                        {subTab === 'prefs' && <PreferenceSettings />}
                        {subTab === 'security' && <SecurityPane />}
                        {subTab === 'connect' && <ConnectPane />}
                    </GlassCard>
                </div>
            </div>

            {/* Admin Audit Sidecar (Visible to admins) */}
            {localUser.role === 'Administrator' && ( // Or Admin
                <div className="w-72 hidden 2xl:block space-y-4">
                    <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Activity size={14} className="text-gray-500" />
                            <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Admin Stream</h4>
                        </div>
                        <div className="space-y-3 font-mono text-[9px] text-gray-400">
                            {(auditTrail || []).slice(0, 5).map(log => (
                                <div key={log.id} className="pb-2 border-b border-white/5 last:border-0">
                                    <span className="text-[#c9a646]">{log.user}</span> <span className="text-gray-600">{log.action}</span>
                                    <br /><span className="text-gray-700 opacity-50">{new Date(log.date).toLocaleTimeString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
