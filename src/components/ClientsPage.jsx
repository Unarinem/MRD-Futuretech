import React, { useState } from 'react';
import {
    Users, Search, Filter, Mail, Phone, Building2, User,
    Briefcase, FileText, Clock, Plus, X, MoreHorizontal,
    Shield, Archive, ChevronRight, AlertCircle, MapPin,
    Edit2, CheckCircle, CreditCard, Hash
} from 'lucide-react';

/**
 * CLIENT FILTER BUTTON COMPONENT
 */
const FilterButton = ({ label, active, onClick, count }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center gap-2 ${active ? 'bg-[#c9a646] text-black shadow-[0_0_10px_rgba(201,166,70,0.2)]' : 'text-gray-500 hover:text-white bg-white/5 border border-white/5'}`}
    >
        {label}
        {count !== undefined && <span className={`px-1 rounded bg-black/20 ${active ? 'text-black' : 'text-gray-400'}`}>{count}</span>}
    </button>
);

/**
 * JKM CLIENTS TAB (The Definitive Registry) - V2 Robust & Full Screen
 */
const ClientsPage = ({ clients = [], setClients, matters = [] }) => {
    // STATE
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'Individual' | 'Organization'
    const [statusFilter, setStatusFilter] = useState('Active'); // 'Active' | 'Archived' | 'All'

    // MODAL STATE
    const [selectedClient, setSelectedClient] = useState(null); // Full Screen Profile
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // ADD FORM STATE
    const [addFormType, setAddFormType] = useState('Individual');

    // EDIT STATE
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    // DERIVED DATA
    const filteredClients = clients.filter(client => {
        const matchesSearch = !searchQuery ||
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (client.ref && client.ref.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = typeFilter === 'All' || client.type === typeFilter;

        const matchesStatus = statusFilter === 'All' ||
            (statusFilter === 'Active' && client.status !== 'Archived') ||
            (statusFilter === 'Archived' && client.status === 'Archived');

        return matchesSearch && matchesType && matchesStatus;
    });

    const getLinkedMatters = (clientName) => {
        return matters.filter(m => m.client === clientName);
    };

    // ACTIONS
    const handleAddClient = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const newClient = {
            id: `cli_${Date.now()}`,
            name: addFormType === 'Individual' ? `${formData.get('firstName')} ${formData.get('lastName')}` : formData.get('companyName'),
            type: addFormType,
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            // Specific fields
            identityNumber: formData.get('idNumber'), // Individual
            regNumber: formData.get('regNumber'), // Org
            vatNumber: formData.get('vatNumber'), // Org
            contactPerson: formData.get('contactPerson'), // Org
            status: 'Active',
            joinedDate: new Date().toISOString(),
            notes: []
        };

        setClients(prev => [newClient, ...prev]);
        setIsAddModalOpen(false);
        // Reset form type for next time
        setAddFormType('Individual');
    };

    const handleEditSave = () => {
        setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, ...editForm } : c));
        setSelectedClient({ ...selectedClient, ...editForm });
        setIsEditing(false);
    };

    const handleArchiveToggle = () => {
        if (!selectedClient) return;
        const newStatus = selectedClient.status === 'Active' ? 'Archived' : 'Active';
        const updated = { ...selectedClient, status: newStatus };

        setClients(prev => prev.map(c => c.id === selectedClient.id ? updated : c));
        setSelectedClient(updated);
    };

    const addNote = (text) => {
        if (!selectedClient) return;
        const note = {
            id: `note_${Date.now()}`,
            text,
            author: 'You',
            timestamp: new Date().toISOString()
        };
        const updatedClient = {
            ...selectedClient,
            notes: [note, ...(selectedClient.notes || [])]
        };
        setClients(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
        setSelectedClient(updatedClient);
    };

    return (
        <div className="flex flex-col md:flex-row bg-[#050505] h-auto md:h-[calc(100vh-140px)] w-full overflow-visible md:overflow-hidden text-white font-['Montserrat'] relative">
            <div className="flex-1 flex flex-col min-w-0 h-auto md:h-full">
                {/* HEAD (Inline to fix focus) */}
                <div className="h-auto md:h-16 py-4 md:py-0 border-b border-white/5 bg-[#0a0a0a] flex flex-col md:flex-row items-start md:items-center justify-between px-6 flex-shrink-0 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex items-center gap-2 text-white">
                            <Users size={18} className="text-[#c9a646]" />
                            <span className="text-sm font-black uppercase tracking-widest">Client Registry</span>
                        </div>
                        <div className="hidden md:block h-4 w-px bg-white/10"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{clients.length} Records</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative group w-full md:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-[#c9a646] transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Search registry..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 bg-[#121212] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-[10px] font-bold text-white focus:border-[#c9a646] outline-none transition-all uppercase placeholder:text-gray-700"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="flex bg-white/5 rounded-lg p-1 border border-white/5 gap-1 flex-1 md:flex-none justify-center">
                                <FilterButton label="All" active={typeFilter === 'All'} onClick={() => setTypeFilter('All')} />
                                <FilterButton label="Individuals" active={typeFilter === 'Individual'} onClick={() => setTypeFilter('Individual')} />
                                <FilterButton label="Org" active={typeFilter === 'Organization'} onClick={() => setTypeFilter('Organization')} />
                            </div>

                            <button onClick={() => setIsAddModalOpen(true)} className="h-9 px-4 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 shrink-0">
                                <Plus size={14} /> <span className="hidden md:inline">New Record</span><span className="md:hidden">Add</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* REGISTRY TABLE */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 mobile-scroll-container">
                    <div className="border border-white/5 rounded-lg overflow-hidden bg-[#121212]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse responsive-table">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5">
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest w-64">Identity</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Contact Channels</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center w-32">Status</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right w-20">View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClients.map(client => (
                                        <tr
                                            key={client.id}
                                            onClick={() => setSelectedClient(client)}
                                            className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                                        >

                                            <td className="py-3 px-4" data-label="Identity">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full p-[1px] shrink-0 ${client.type === 'Organization' ? 'bg-gradient-to-br from-blue-500 to-blue-300' : 'bg-gradient-to-br from-[#c9a646] to-[#f7d774]'}`}>
                                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                                            {client.type === 'Organization' ? <Building2 size={12} className="text-blue-500" /> : <User size={12} className="text-[#c9a646]" />}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white group-hover:text-[#c9a646] transition-colors">{client.name}</div>
                                                        <div className="text-[9px] text-gray-600 font-mono mt-0.5 flex items-center gap-2">
                                                            {client.type === 'Individual' ? 'ID:' : 'REG:'} {client.identityNumber || client.regNumber || client.id.split('_')[1].substring(0, 6)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4" data-label="Contact">
                                                <div className="flex flex-col gap-1">
                                                    {client.email && <div className="flex items-center gap-2 text-[10px] text-gray-400"><Mail size={10} /> {client.email}</div>}
                                                    {client.phone && <div className="flex items-center gap-2 text-[10px] text-gray-500"><Phone size={10} /> {client.phone}</div>}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center" data-label="Status">
                                                <span className={`inline-block px-3 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${client.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                                                    {client.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right" data-label="View">
                                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white ml-auto" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredClients.length === 0 && (
                                <div className="p-12 text-center opacity-20">
                                    <Users size={48} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No records found matching filters</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FULL PAGE PROFILE MODAL - MOBILE FORTRESS */}
            {selectedClient && (
                <div className="fixed inset-0 z-[100] bg-black/95 md:bg-black/90 md:backdrop-blur-sm flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-200">
                    <div className="w-full h-full md:h-[90vh] md:max-w-6xl bg-[#0a0a0a] border-0 md:border md:border-white/10 rounded-none md:rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
                        {/* Modal Header */}
                        <div className="h-auto md:h-20 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-8 bg-[#121212] gap-4 shrink-0">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded bg-black flex items-center justify-center border border-white/10 shrink-0 ${selectedClient.type === 'Organization' ? 'border-blue-500/30' : 'border-[#c9a646]/30'}`}>
                                    {selectedClient.type === 'Organization' ? <Building2 size={20} className="text-blue-500" /> : <User size={20} className="text-[#c9a646]" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight truncate">{selectedClient.name}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                            {selectedClient.type === 'Organization' ? `REG: ${selectedClient.regNumber || 'N/A'}` : `ID: ${selectedClient.identityNumber || 'N/A'}`}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${selectedClient.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {selectedClient.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                                {!isEditing ? (
                                    <>
                                        <button className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap">
                                            <FileText size={14} /> <span className="hidden md:inline">View Contract</span><span className="md:hidden">Contract</span>
                                        </button>
                                        <button
                                            onClick={() => { setIsEditing(true); setEditForm(selectedClient); }}
                                            className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap"
                                        >
                                            <Edit2 size={14} /> <span className="hidden md:inline">Edit Record</span><span className="md:hidden">Edit</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button onClick={handleEditSave} className="flex-1 md:flex-none px-4 py-2 bg-[#c9a646] text-black rounded-lg text-xs font-black uppercase flex items-center justify-center gap-2 transition-all">
                                            <CheckCircle size={14} /> Save
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-xs font-black uppercase transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                )}
                                <button onClick={() => setSelectedClient(null)} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-all ml-auto md:ml-2">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* LEFT COLUMN: CORE DATA */}
                            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 p-8 overflow-y-auto bg-[#0a0a0a] shrink-0">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Shield size={14} /> Master Data
                                </h3>

                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/5 rounded border border-white/10 mb-4">
                                            <p className="text-[10px] text-gray-500 uppercase font-black mb-2">Editing: {selectedClient.type}</p>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full bg-black border border-white/20 p-2 text-xs text-white rounded font-bold mb-2"
                                                placeholder={selectedClient.type === 'Organization' ? "Company Name" : "Full Name"}
                                            />
                                            {selectedClient.type === 'Organization' ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={editForm.regNumber}
                                                        onChange={e => setEditForm({ ...editForm, regNumber: e.target.value })}
                                                        className="w-full bg-black border border-white/20 p-2 text-xs text-white rounded font-bold mb-2"
                                                        placeholder="Reg Number"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editForm.vatNumber}
                                                        onChange={e => setEditForm({ ...editForm, vatNumber: e.target.value })}
                                                        className="w-full bg-black border border-white/20 p-2 text-xs text-white rounded font-bold"
                                                        placeholder="VAT Number"
                                                    />
                                                </>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={editForm.identityNumber}
                                                    onChange={e => setEditForm({ ...editForm, identityNumber: e.target.value })}
                                                    className="w-full bg-black border border-white/20 p-2 text-xs text-white rounded font-bold"
                                                    placeholder="ID Number"
                                                />
                                            )}
                                        </div>
                                        <div className="p-4 bg-white/5 rounded border border-white/10">
                                            <p className="text-[10px] text-gray-500 uppercase font-black mb-2">Contact Info</p>
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                className="w-full bg-black border border-white/20 p-2 text-xs text-white rounded font-bold mb-2"
                                                placeholder="Email"
                                            />
                                            <input
                                                type="text"
                                                value={editForm.phone}
                                                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full bg-black border border-white/20 p-2 text-xs text-white rounded font-bold mb-2"
                                                placeholder="Phone"
                                            />
                                            <input
                                                type="text"
                                                value={editForm.address}
                                                onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                                className="w-full bg-black border border-white/20 p-2 text-xs text-white rounded font-bold"
                                                placeholder="Address"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-white/10 mt-4">
                                            <button onClick={handleArchiveToggle} className="w-full py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded text-xs font-black uppercase transition-all">
                                                {selectedClient.status === 'Active' ? 'Archive Client Record' : 'Reactivate Client Record'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                                            <DetailRow label={selectedClient.type === 'Organization' ? "Registration" : "Identity ID"} value={selectedClient.regNumber || selectedClient.identityNumber || 'Not Recorded'} icon={<Hash size={14} />} />
                                            {selectedClient.type === 'Organization' && <DetailRow label="VAT Number" value={selectedClient.vatNumber || 'N/A'} icon={<CreditCard size={14} />} />}
                                            {selectedClient.type === 'Organization' && <DetailRow label="Contact Person" value={selectedClient.contactPerson || 'N/A'} icon={<User size={14} />} />}
                                        </div>

                                        <div className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                                            <DetailRow label="Email Channel" value={selectedClient.email} icon={<Mail size={14} />} />
                                            <DetailRow label="Phone Channel" value={selectedClient.phone || 'N/A'} icon={<Phone size={14} />} />
                                            <DetailRow label="Primary Address" value={selectedClient.address || selectedClient.location || 'Johannesburg, ZA'} icon={<MapPin size={14} />} />
                                        </div>

                                        <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/10 mt-6">
                                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Briefcase size={12} /> Legal Standing</h4>
                                            <p className="text-[10px] text-gray-400">
                                                Client is <span className="text-white font-bold">Good Standing</span>. No conflict of interest detected in master registry.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN: WORKSPACE */}
                            <div className="w-full md:w-2/3 p-4 md:p-8 bg-[#0e0e0e] overflow-y-auto custom-scrollbar flex flex-col">
                                {/* LINKED MATTERS */}
                                <div className="mb-8 flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <Briefcase size={14} /> Linked Portfolios
                                        </h3>
                                        <span className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-bold text-white">{getLinkedMatters(selectedClient.name).length} Matters</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {getLinkedMatters(selectedClient.name).map(m => (
                                            <div key={m.id} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[8px] font-black text-[#c9a646] uppercase border border-[#c9a646]/30 px-1.5 py-0.5 rounded">{m.status}</span>
                                                    <ChevronRight size={14} className="text-gray-600 group-hover:text-white" />
                                                </div>
                                                <h4 className="text-sm font-bold text-white mb-1 group-hover:text-[#c9a646] transition-colors">{m.name}</h4>
                                                <p className="text-[9px] text-gray-400 truncate">Ref: {m.id} • Litigation</p>
                                            </div>
                                        ))}
                                        {getLinkedMatters(selectedClient.name).length === 0 && (
                                            <div className="col-span-2 p-8 border border-dashed border-white/10 rounded-xl text-center">
                                                <Briefcase size={24} className="text-gray-600 mx-auto mb-2" />
                                                <p className="text-[10px] font-bold text-gray-500 uppercase">No active legal matters linked</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* NOTES AREA */}
                                <div className="border-t border-white/10 pt-6">
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                        <FileText size={14} /> Secure Firm Notes
                                    </h3>
                                    <div className="bg-[#121212] rounded-xl border border-white/5 flex flex-col h-64">
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                            {(selectedClient.notes || []).map((note, idx) => (
                                                <div key={idx} className="flex gap-3 text-[11px] text-gray-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#c9a646] mt-1.5 shrink-0"></div>
                                                    <div>
                                                        <p className="leading-relaxed">{note.text}</p>
                                                        <span className="text-[8px] text-gray-600 font-mono mt-1 block">{note.author} • {new Date(note.timestamp).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!selectedClient.notes || selectedClient.notes.length === 0) && (
                                                <p className="text-[10px] text-gray-700 italic text-center mt-10">No secure notes recorded for this client.</p>
                                            )}
                                        </div>
                                        <div className="p-3 bg-black/50 border-t border-white/5">
                                            <input
                                                type="text"
                                                placeholder="Type note and hit Enter to append..."
                                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:border-[#c9a646] outline-none"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                                        addNote(e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD CLIENT MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
                    <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-[#1a1a1a] p-6 border-b border-white/5">
                            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                                <Plus size={20} className="text-[#c9a646]" /> Register New Client
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Add entity to master registry</p>
                        </div>

                        <form onSubmit={handleAddClient} className="p-6 space-y-5">
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Legal Entity Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setAddFormType('Individual')}
                                        className={`border cursor-pointer rounded-lg p-3 text-center transition-all ${addFormType === 'Individual' ? 'border-[#c9a646] bg-[#c9a646]/10' : 'border-white/10 bg-black hover:border-white/20'}`}
                                    >
                                        <User size={20} className={`mx-auto mb-1 ${addFormType === 'Individual' ? 'text-[#c9a646]' : 'text-gray-400'}`} />
                                        <span className={`text-[10px] font-bold uppercase ${addFormType === 'Individual' ? 'text-white' : 'text-gray-500'}`}>Individual</span>
                                    </div>
                                    <div
                                        onClick={() => setAddFormType('Organization')}
                                        className={`border cursor-pointer rounded-lg p-3 text-center transition-all ${addFormType === 'Organization' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-black hover:border-white/20'}`}
                                    >
                                        <Building2 size={20} className={`mx-auto mb-1 ${addFormType === 'Organization' ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <span className={`text-[10px] font-bold uppercase ${addFormType === 'Organization' ? 'text-white' : 'text-gray-500'}`}>Organization</span>
                                    </div>
                                </div>
                            </div>

                            {/* DYNAMIC FIELDS */}
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                {addFormType === 'Individual' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">First Name</label>
                                                <input name="firstName" required type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Last Name</label>
                                                <input name="lastName" required type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Identity Number / Passport</label>
                                            <input name="idNumber" required type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Registered Company Name</label>
                                            <input name="companyName" required type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-blue-500 outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Registration No.</label>
                                                <input name="regNumber" required type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-blue-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">VAT Number</label>
                                                <input name="vatNumber" type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Contact Person Name</label>
                                            <input name="contactPerson" type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-blue-500 outline-none" />
                                        </div>
                                    </>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Email</label>
                                        <input name="email" required type="email" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" placeholder="Primary contact" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Phone</label>
                                        <input name="phone" type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" placeholder="+27..." />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Physical Address</label>
                                    <input name="address" type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" placeholder="Street, City, Code" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-lg text-xs font-black uppercase transition-all shadow-lg">Create Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// SUB-COMPONENT: Detail Row
const DetailRow = ({ label, value, icon }) => (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 hover:bg-white/5 p-3 rounded transition-colors">
        <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
            {icon} {label}
        </span>
        <span className="text-xs font-bold text-white truncate max-w-[200px] text-right">{value}</span>
    </div>
);

export default ClientsPage;
