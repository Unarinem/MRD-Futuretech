import React, { useState, useEffect, useRef } from 'react';
import {
    Send, Bot, User, FileText, Shield, AlertCircle, CheckCircle,
    Sparkles, MessageSquare, ChevronRight, UploadCloud, Paperclip, X,
    Home, Users, Activity, DollarSign, Scroll, Ban, ArrowLeft, ArrowRight
} from 'lucide-react';

const ClientOnboardingPage = () => {
    // --- CONFIGURATION ---
    const CATEGORIES = {
        'Conveyancing': {
            icon: Home,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/50',
            description: 'Property transfers, bond registrations, and title deed services.',
            keywords: ['house', 'property', 'buy', 'sell', 'transfer', 'buyer', 'seller'],
            fields: [
                { id: 'role', label: 'Your Role', type: 'select', options: ['Buyer', 'Seller'] },
                { id: 'erf', label: 'Erf / Stand Number' },
                { id: 'value', label: 'Property Value' },
                { id: 'occupancy_date', label: 'Occupancy Date', type: 'date' }
            ],
            uploads: ['ID Document', 'Proof of Residence', 'Title Deed (Seller)', 'Rates Clearance']
        },
        'Family / Divorce': {
            icon: Users,
            color: 'text-pink-400',
            bg: 'bg-pink-400/10',
            border: 'border-pink-400/50',
            description: 'Divorce proceedings, custody, maintenance, and marital contracts.',
            keywords: ['divorce', 'spouse', 'husband', 'wife', 'custody', 'child', 'marriage'],
            fields: [
                { id: 'regime', label: 'Marital Regime', type: 'select', options: ['In Community', 'ANC with Accrual', 'ANC without Accrual'] },
                { id: 'spouse_name', label: 'Spouse Name' },
                { id: 'children', label: 'Number of Children' }
            ],
            uploads: ['Marriage Certificate', 'ANC Contract', 'ID Document']
        },
        'Personal Injury': {
            icon: Activity,
            color: 'text-red-400',
            bg: 'bg-red-400/10',
            border: 'border-red-400/50',
            description: 'Road Accident Fund (RAF) claims, medical malpractice, and injury claims.',
            keywords: ['accident', 'injury', 'hurt', 'raf', 'crash', 'hospital'],
            fields: [
                { id: 'accident_date', label: 'Date of Accident', type: 'date' },
                { id: 'police_case', label: 'Case Number' },
                { id: 'injuries', label: 'Description of Injuries', type: 'textarea' }
            ],
            uploads: ['ID Document', 'Medical Reports', 'Accident Photos', 'Police Report']
        },
        'Debt Collection': {
            icon: DollarSign,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            border: 'border-green-400/50',
            description: 'Recovery of outstanding debts, acknowledgement of debts, and litigation.',
            keywords: ['debt', 'owe', 'money', 'loan', 'invoice', 'collect'],
            fields: [
                { id: 'debtor_name', label: 'Debtor Name' },
                { id: 'amount', label: 'Total Amount' },
                { id: 'history', label: 'Payment History', type: 'textarea' }
            ],
            uploads: ['Unpaid Invoice', 'Contract', 'ID Document']
        },
        'Estates': {
            icon: Scroll,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            border: 'border-purple-400/50',
            description: 'Administration of deceased estates, wills, and trusts.',
            keywords: ['death', 'died', 'deceased', 'will', 'estate', 'heir'],
            fields: [
                { id: 'deceased_name', label: 'Deceased Name' },
                { id: 'dod', label: 'Date of Death', type: 'date' },
                { id: 'relationship', label: 'Relationship' }
            ],
            uploads: ['Death Certificate', 'Last Will', 'ID Document']
        },
        'Evictions': {
            icon: Ban,
            color: 'text-orange-400',
            bg: 'bg-orange-400/10',
            border: 'border-orange-400/50',
            description: 'Residential and commercial evictions and rental disputes.',
            keywords: ['evict', 'tenant', 'rent', 'lease', 'arrears'],
            fields: [
                { id: 'address', label: 'Property Address' },
                { id: 'tenant_name', label: 'Tenant Name' },
                { id: 'arrears', label: 'Arrears Amount' }
            ],
            uploads: ['Lease Agreement', 'Notice of Breach', 'ID Document']
        }
    };

    // --- STATE ---
    const [view, setView] = useState('landing'); // 'landing' | 'chat' | 'form'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({});

    // Chat State
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Hello! I'm the JKM Digital Assistant. Not sure which service involves your case? Describe your situation below and I'll recommend the right path." }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    // --- AI LOGIC ---
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userText = chatInput;
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
        setChatInput('');
        setIsTyping(true);

        // Simulation
        setTimeout(() => {
            let detected = null;
            const lower = userText.toLowerCase();

            // Keyword Search
            for (const [key, config] of Object.entries(CATEGORIES)) {
                if (config.keywords.some(k => lower.includes(k))) {
                    detected = key;
                    break;
                }
            }

            let responseMsg = { id: Date.now() + 1, sender: 'ai', text: "I need a little more detail to guide you efficiently. Could you elaborate?" };

            if (detected) {
                responseMsg = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: `Based on your description, this looks like a **${detected}** matter.`,
                    recommendation: detected
                };
            }

            setMessages(prev => [...prev, responseMsg]);
            setIsTyping(false);
        }, 1500);
    };

    useEffect(() => {
        if (view === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, view, isTyping]);

    const handleCategorySelect = (cat) => {
        setSelectedCategory(cat);
        setView('form');
    };

    const handleFormSubmit = () => {
        alert("Case File Submitted Successfully!");
        setView('landing');
        setSelectedCategory(null);
        setFormData({});
    };

    // --- VIEWS ---

    // 1. LANDING VIEW
    const renderLanding = () => (
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
            {/* Hero */}
            <div className="text-center py-16 px-4">
                <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-4">Start Your Legal Journey</h1>
                <p className="text-gray-400 font-bold max-w-lg mx-auto mb-8">Select a service below to open a new file, or consult our AI Assistant if you are unsure how to proceed.</p>

                <button
                    onClick={() => setView('chat')}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-full text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(201,166,70,0.3)] transition-all hover:scale-105"
                >
                    <Sparkles size={18} /> Consult AI Assistant
                </button>
            </div>

            {/* Service Grid */}
            <div className="max-w-6xl mx-auto px-6 w-full pb-20">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8 text-center">Select a Service Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(CATEGORIES).map(([name, conf]) => (
                        <div
                            key={name}
                            onClick={() => handleCategorySelect(name)}
                            className="group relative bg-[#121212] border border-white/10 hover:border-[#c9a646] rounded-2xl p-8 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 p-32 ${conf.bg} blur-3xl rounded-full opacity-20 -mr-16 -mt-16 transition-opacity group-hover:opacity-40`}></div>

                            <div className={`w-12 h-12 rounded-xl ${conf.bg} ${conf.color} flex items-center justify-center mb-6`}>
                                <conf.icon size={24} />
                            </div>

                            <h3 className="text-lg font-black text-white uppercase mb-2 group-hover:text-[#c9a646] transition-colors">{name}</h3>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">{conf.description}</p>

                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase group-hover:text-white transition-colors">
                                Open File <ArrowRight size={12} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // 2. CHAT VIEW
    const renderChat = () => (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <button onClick={() => setView('landing')} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors">
                    <ArrowLeft size={14} /> Back to Services
                </button>
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#c9a646]" />
                    <span className="text-xs font-black text-white uppercase">JKM Digital Assistant</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-gray-700' : 'bg-[#c9a646]/20 text-[#c9a646]'}`}>
                                {msg.sender === 'user' ? <User size={14} /> : <Bot size={16} />}
                            </div>
                            <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${msg.sender === 'user'
                                    ? 'bg-[#c9a646] text-black font-bold rounded-tr-none'
                                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>

                        {/* Recommendation Card */}
                        {msg.recommendation && (
                            <div className="mt-4 ml-11 max-w-sm animate-in fade-in slide-in-from-left">
                                <div className={`p-5 rounded-xl border ${CATEGORIES[msg.recommendation].border} ${CATEGORIES[msg.recommendation].bg} relative overflow-hidden`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        {React.createElement(CATEGORIES[msg.recommendation].icon, { size: 20, className: CATEGORIES[msg.recommendation].color })}
                                        <span className="text-sm font-black text-white uppercase">{msg.recommendation}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-300 mb-4">{CATEGORIES[msg.recommendation].description}</p>
                                    <button
                                        onClick={() => handleCategorySelect(msg.recommendation)}
                                        className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-black uppercase text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        Proceed to Form <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {isTyping && <div className="text-xs text-gray-500 italic ml-12">Assistant is analyzing...</div>}
                <div ref={chatEndRef}></div>
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10">
                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="Describe your legal issue here..."
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-full py-4 pl-6 pr-14 text-sm text-white focus:border-[#c9a646] outline-none transition-all shadow-inner"
                        autoFocus
                    />
                    <button type="submit" disabled={!chatInput.trim()} className="absolute right-2 top-2 p-2 bg-[#c9a646] rounded-full text-black hover:scale-110 transition-all disabled:opacity-50 disabled:scale-100">
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );

    // 3. FORM VIEW
    const renderForm = () => {
        const conf = CATEGORIES[selectedCategory];
        return (
            <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#121212]/50 backdrop-blur-md sticky top-0 z-10">
                    <button onClick={() => setView('landing')} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors">
                        <ArrowLeft size={14} /> Cancel
                    </button>
                    <div className="flex items-center gap-3">
                        <conf.icon size={20} className={conf.color} />
                        <span className="text-lg font-black text-white uppercase">{selectedCategory} Intake</span>
                    </div>
                    <div className="w-20"></div> {/* Spacer */}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="max-w-3xl mx-auto space-y-12">

                        {/* Intro */}
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-400">Please complete the following details to open your file.</p>
                        </div>

                        {/* Section 1: Client Info */}
                        <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xs font-black text-[#c9a646] uppercase mb-6 flex items-center gap-2">
                                <User size={14} /> Part 1: Your Details
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Full Legal Name</label>
                                    <input className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#c9a646] outline-none" placeholder="e.g. John Doe" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">ID Number</label>
                                    <input className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#c9a646] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Email Address</label>
                                    <input className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#c9a646] outline-none" />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Matter Details (Dynamic) */}
                        <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xs font-black text-[#c9a646] uppercase mb-6 flex items-center gap-2">
                                <FileText size={14} /> Part 2: Matter Details
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                {conf.fields.map(field => (
                                    <div key={field.id} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#c9a646] outline-none h-24 resize-none" />
                                        ) : field.type === 'select' ? (
                                            <select className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#c9a646] outline-none">
                                                {field.options.map(o => <option key={o}>{o}</option>)}
                                            </select>
                                        ) : (
                                            <input type={field.type || 'text'} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#c9a646] outline-none" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 3: Uploads (Dynamic) */}
                        <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xs font-black text-[#c9a646] uppercase mb-6 flex items-center gap-2">
                                <UploadCloud size={14} /> Part 3: Required Documents
                            </h3>
                            <div className="space-y-3">
                                {conf.uploads.map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-black/20 hover:border-gray-500 transition-colors group cursor-pointer h-16">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-white transition-colors">
                                                <Paperclip size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-300 uppercase">{doc}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-[#c9a646] border border-[#c9a646]/30 px-3 py-1 rounded hover:bg-[#c9a646] hover:text-black transition-colors">UPLOAD</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <button
                            onClick={handleFormSubmit}
                            className="w-full py-5 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-xl text-sm font-black uppercase tracking-widest shadow-2xl hover:scale-[1.01] transition-all"
                        >
                            Finalize & Submit File
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-140px)] bg-[#050505] text-white font-['Montserrat'] overflow-hidden">
            {view === 'landing' && renderLanding()}
            {view === 'chat' && renderChat()}
            {view === 'form' && renderForm()}
        </div>
    );
};

export default ClientOnboardingPage;
