import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Bot, PenTool, Search, FileSearch, Sparkles, Layout, Send, Paperclip, Mic,
    Briefcase, Users, MessageSquare, Volume2, X, Eye, FileText, ArrowRight,
    Zap, Clock, DollarSign, History, Pause, Play, ChevronLeft, Plus, MoreHorizontal
} from 'lucide-react';

// --- Shared Components & Constants ---

const GlassCard = ({ children, className = "", onClick }) => (
    <div onClick={onClick} className={`glass-card ${className} ${onClick ? 'cursor-pointer hover:border-[#f7d774]/50 transition-colors' : ''}`}>
        {children}
    </div>
);

const ACTIVE_STAFF = {
    id: "emp_001",
    name: "Thabo Maseko",
    initials: "TM",
    role: "Administrator",
    rate: 700,
    email: "thabo@jkm.co.za"
};

// Simple Voice Player Component
const VoiceNotePlayer = ({ audioUrl, msgId, playingAudioId, setPlayingAudioId }) => {
    const audioRef = useRef(null);
    const isPlaying = playingAudioId === msgId;
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isPlaying) {
            audioRef.current?.play();
            const interval = setInterval(() => {
                if (audioRef.current) {
                    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
                }
            }, 100);
            return () => clearInterval(interval);
        } else {
            audioRef.current?.pause();
            setProgress(0);
        }
    }, [isPlaying]);

    const togglePlay = () => {
        if (isPlaying) {
            setPlayingAudioId(null);
        } else {
            setPlayingAudioId(msgId);
        }
    };

    return (
        <div className="flex items-center gap-3 py-1 bg-black/20 rounded-lg pr-3 mt-1 w-full max-w-[200px]">
            <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-lg bg-[#c9a646] flex items-center justify-center text-black hover:bg-white transition-colors shrink-0"
            >
                {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
            </button>
            <div className="flex-1 w-full">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden w-full">
                    <div className="h-full bg-[#c9a646] transition-all duration-100" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setPlayingAudioId(null)}
                className="hidden"
            />
            <span className="text-[9px] font-mono font-bold text-gray-500">Voice Note</span>
        </div>
    );
};


export default function ChatPage({ matters, chatState, setChatState, employees, billingEntries, tasks, clients }) {
    // Determine active channel from state or default (Mobile: Default to null for List View; Desktop: Default to first channel)
    const [activeChannelId, setActiveChannelId] = useState(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        return isMobile ? null : (chatState?.channels?.[0]?.id || null);
    });

    // Ensure we have a valid channel selection if state changes (Desktop only enforcement)
    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (!isMobile && !activeChannelId && chatState?.channels?.length > 0) {
            setActiveChannelId(chatState.channels[0].id);
        }
    }, [chatState, activeChannelId]);

    const [aiMode, setAiMode] = useState('General Assistant');
    const [drawerOpen, setDrawerOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768); // Defaults closed on mobile

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
    }, [chatState?.messages]);

    // Per-Channel State Persistence
    const [channelDrafts, setChannelDrafts] = useState({}); // { channelId: { msg: '', files: [], isRecording: false } }

    // Global Audio Controller
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

    const activeChannel = chatState?.channels?.find(c => c.id === activeChannelId);
    const channelMessages = chatState?.messages?.filter(m => m.channelId === activeChannelId) || [];
    const activeMatter = activeChannel?.matterId ? matters?.find(m => m.id === activeChannel.matterId) : null;

    // --- VOICE LOGIC ---
    useEffect(() => {
        if (currentDraft.isRecording) {
            timerRef.current = setInterval(() => {
                updateDraft({ recordingTime: (currentDraft.recordingTime || 0) + 1 });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [currentDraft.isRecording, activeChannelId]);

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
        // Stop any currently playing audio so it doesn't overlap
        if (playingAudioId) setPlayingAudioId(null);
        if (window.speechSynthesis) window.speechSynthesis.cancel();

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
                response = `[SUMMARY & RISK ANALYSIS] Artifact integrity check for ${targetMatter?.ref || 'Active Registry'} complete. \n\nCRITICAL OVERWATCH: Potential prescription risk detected. If summons for ${targetMatter?.name || 'Respondent'} is not served by Feb 20th, the claim may be extinguished by operation of law. \n\nSTRATEGIC DIRECTIVE: Verify service address with tracing agent immediately.`;
            } else if (lowerPrompt.includes('suggest task') || aiMode === 'Drafting Oracle') {
                response = `[STRATEGIC TASK GENERATION] Context: ${targetMatter?.name || 'Matter Registry'}.\n\nGenerated Priority Protocol:\n1. /task title="Service Verification" matterId="${targetMatter?.id}" priority="Urgent"\n2. /task title="Draft Replying Affidavit" matterId="${targetMatter?.id}" priority="High"\n\nLogic: Opposing counsel has not responded to the rule 35(12) notice.`;
            } else if (lowerPrompt.includes('bill discourse') || lowerPrompt.includes('billing')) {
                response = `[FISCAL ALIGNMENT] Strategic discourse analyzed for ${targetMatter?.ref}.\n\nRecommended Ledger Entry:\n/bill duration="0.5" description="Strategic AI risk assessment and trajectory realignment for ${targetMatter?.ref}"\n\nStatus: Ready for ledger synchronization.`;
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

        const fixedVoice = voices.find(v => v.name === 'Google UK English Female') ||
            voices.find(v => v.name.includes('Aria') || v.name.includes('Natural')) ||
            voices.find(v => (v.name.includes('Female') || v.name.includes('Woman')) && v.lang.startsWith('en')) ||
            voices.find(v => v.lang.startsWith('en'));

        if (fixedVoice) speech.voice = fixedVoice;
        speech.rate = 1.1;
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

        setChannelDrafts(prev => ({
            ...prev,
            [targetChannelId]: {
                ...(prev[targetChannelId] || { msg: '', files: [], isRecording: false }),
                msg: prompt
            }
        }));
    };


    const handleAskGemini = () => {
        const geminiChannel = chatState.channels.find(c => c.type === 'ai');
        if (!geminiChannel) return;

        const typedMsg = currentDraft.msg.trim();
        const matterContext = activeMatter ? `Contextual Analysis for ${activeMatter.ref} (${activeMatter.name}). Status: ${activeMatter.stage}. ` : "";
        const finalPrompt = typedMsg ? `${matterContext}${typedMsg}` : `${matterContext}Gemini, analyze the current registry artifacts and suggest strategic next steps.`;

        const targetChannelId = (activeChannel?.type === 'ai' || activeChannel?.type === 'matter')
            ? activeChannelId
            : geminiChannel.id;

        if (targetChannelId !== activeChannelId) {
            updateDraft({ msg: '' });
            setActiveChannelId(targetChannelId);
        }

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
    }, [chatState?.messages, searchQuery]);

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
        updateDraft({ files: [...(currentDraft.files || []), ...newAttached] });
    };

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        const msg = currentDraft.msg || "";
        const files = currentDraft.files || [];

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

    const isSyncValid = (Date.now() - (chatState?.lastSync || 0)) < 15 * 60 * 1000;

    return (
        <div className="h-[calc(100vh-14rem)] flex md:gap-4 animate-in fade-in duration-500 overflow-hidden relative">
            {/* PANE A: THE EXPLORER (SIDEBAR) */}
            <div className={`flex-col gap-4 w-full md:w-80 flex-shrink-0 ${activeChannelId ? 'hidden md:flex' : 'flex'}`}>
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
                            {chatState?.channels.filter(c => c.type === 'ai' && (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.status.toLowerCase().includes(searchQuery.toLowerCase()))).map(channel => (
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
                                {chatState?.channels.filter(c => c.type === 'matter' && (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.initials.toLowerCase().includes(searchQuery.toLowerCase()))).map(channel => {
                                    const matter = matters?.find(m => m.id === channel.matterId);
                                    // View Logic for Last Message Preview
                                    const lastMsg = chatState?.messages?.filter(m => m.channelId === channel.id).pop();
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
                                {chatState?.channels.filter(c => c.type === 'direct' && c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(channel => (
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
            <div className={`flex-col min-w-0 h-full w-full md:flex-1 ${activeChannelId ? 'flex' : 'hidden md:flex'}`}>
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

                        {currentDraft.files && currentDraft.files.length > 0 && (
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

                            {/* Desktop Attachment Tools */}
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
                                value={currentDraft.msg || ""}
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
                                disabled={(!currentDraft.msg?.trim() && (!currentDraft.files || currentDraft.files.length === 0)) || activeMatter?.status === 'Closed'}
                                className="p-3 rounded-xl bg-[#c9a646] text-black hover:bg-[#f7d774] transition-all disabled:opacity-30 disabled:grayscale shadow-lg shrink-0"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </GlassCard>
            </div >

            {/* PANE C: THE CONTEXT DRAWER - Responsive Slide-Over */}
            {drawerOpen && (
                <>
                    {/* Mobile Backdrop */}
                    <div
                        className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] animate-in fade-in duration-300"
                        onClick={() => setDrawerOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="fixed inset-y-0 right-0 z-[60] w-80 md:static md:z-auto md:w-80 md:h-full flex-shrink-0 animate-in slide-in-from-right duration-300 shadow-2xl md:shadow-none">
                        <GlassCard className="h-full flex flex-col p-0 border-l border-[#c9a646]/20 bg-[#0a0a0a] md:bg-black/60 overflow-hidden">
                            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/40">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 text-[#c9a646]">
                                    <History size={16} /> Registry Archive
                                </h3>
                                <button onClick={() => setDrawerOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
                                {activeMatter ? (
                                    <>
                                        <div className="bg-black/40 rounded-2xl p-5 border border-white/5 shadow-inner relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Briefcase size={64} />
                                            </div>
                                            <p className="text-[8px] font-black text-gray-500 uppercase mb-3 tracking-widest relative z-10">Health & Trajectory</p>
                                            <div className="flex items-center justify-between mb-4 relative z-10">
                                                <span className="text-sm font-black text-white tracking-widest uppercase">{activeMatter.status}</span>
                                                <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase ${activeMatter.priority === 'High' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-[#c9a646] text-black shadow-lg shadow-[#c9a646]/20'}`}>
                                                    {activeMatter.priority}
                                                </div>
                                            </div>
                                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden relative z-10">
                                                <div className="h-full bg-gradient-to-r from-[#c9a646] to-[#f7d774] shadow-[0_0_15px_rgba(201,166,70,0.5)]" style={{ width: '68%' }}></div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[8px] font-black text-gray-500 uppercase px-1 tracking-widest">Matter Artifacts</p>
                                            <div className="space-y-2">
                                                {chatState?.messages.flatMap(m => m.attachments || [])
                                                    .slice(0, 4)
                                                    .map(doc => (
                                                        <button
                                                            key={doc.id}
                                                            onClick={() => setPreviewFile(doc)}
                                                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group text-left"
                                                        >
                                                            <div className="p-2 rounded-lg bg-black/40 text-[#c9a646]">
                                                                <FileText size={14} />
                                                            </div>
                                                            <span className="text-[9px] font-bold text-gray-300 uppercase truncate flex-1">{doc.name}</span>
                                                            <Eye size={12} className="text-gray-600 opacity-0 group-hover:opacity-100" />
                                                        </button>
                                                    ))}
                                                {(chatState?.messages.flatMap(m => m.attachments || []).length === 0) && (
                                                    <p className="text-[8px] font-bold text-gray-600 uppercase px-2 py-4 text-center border border-dashed border-white/5 rounded-xl opacity-50">No artifacts detected.</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center opacity-20 py-12">
                                        <Users size={32} className="mx-auto mb-2" />
                                        <p className="text-[10px] uppercase font-bold">No Matter Context</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </>
            )}
        </div>
    );
}
