import React, { useState } from 'react';
import {
    Users, Search, Filter, Mail, Phone, Shield,
    MoreHorizontal, UserCheck, X, Activity, Briefcase,
    FileText, CheckCircle, AlertCircle, Plus, Edit2,
    Save, TrendingUp, Target, BarChart, ChevronRight
} from 'lucide-react';

/**
 * JKM EMPLOYEES TAB (Architecture: Admin Command Center)
 * V2.1: Fixed Focus Issue
 */
const EmployeesPage = ({ employees = [], setEmployees, tasks = [] }) => {
    // STATE
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Active');

    // MODAL STATE
    const [selectedEmployee, setSelectedEmployee] = useState(null); // Full Screen Profile
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false); // Add Staff Modal

    // EDIT STATE
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    // --- DERIVED DATA ---
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = !searchQuery ||
            emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'All' ||
            (statusFilter === 'Active' && emp.status !== 'Inactive') ||
            (statusFilter === 'Inactive' && emp.status === 'Inactive');

        return matchesSearch && matchesStatus;
    });

    const getEmployeeStats = (empId) => {
        // Calculate real stats from tasks prop
        const empTasks = tasks.filter(t => t.assigneeId === empId || t.assignedTo === empId); // Handle varied task structure
        const completed = empTasks.filter(t => t.completed || t.status === 'done').length;
        const total = empTasks.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            totalTasks: total,
            completedTasks: completed,
            completionRate: completionRate,
            billableHours: Math.floor(Math.random() * 40) + 120, // Mocked for V1
            targetHours: 160
        };
    };

    // --- ACTIONS ---
    const handleAddStaff = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newEmp = {
            id: `emp_${Date.now()}`,
            full_name: formData.get('fullName'),
            role: formData.get('role'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            status: 'Active',
            initials: formData.get('fullName').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
            kpi: {
                billableTarget: parseInt(formData.get('billableTarget')) || 160,
                taskTarget: parseInt(formData.get('taskTarget')) || 90
            },
            joinedDate: new Date().toISOString()
        };

        setEmployees(prev => [newEmp, ...prev]);
        setIsOnboardingOpen(false);
    };

    const handleEditSave = () => {
        setEmployees(prev => prev.map(emp => emp.id === selectedEmployee.id ? { ...emp, ...editForm } : emp));
        setSelectedEmployee({ ...selectedEmployee, ...editForm }); // Update local view
        setIsEditing(false);
    };

    const handleDeactivate = () => {
        const newStatus = selectedEmployee.status === 'Active' ? 'Inactive' : 'Active';
        setEmployees(prev => prev.map(emp => emp.id === selectedEmployee.id ? { ...emp, status: newStatus } : emp));
        setSelectedEmployee({ ...selectedEmployee, status: newStatus });
    };

    return (
        <div className="flex flex-col md:flex-row bg-[#050505] h-auto md:h-[calc(100vh-140px)] w-full overflow-visible md:overflow-hidden text-white font-['Montserrat'] relative">
            <div className="flex-1 flex flex-col min-w-0 h-auto md:h-full">

                {/* HEAD PANE (Inlined) */}
                <div className="h-auto md:h-16 py-4 md:py-0 border-b border-white/5 bg-[#0a0a0a] flex flex-col md:flex-row items-start md:items-center justify-between px-6 flex-shrink-0 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex items-center gap-2 text-white">
                            <Users size={18} className="text-[#c9a646]" />
                            <span className="text-sm font-black uppercase tracking-widest">Firm Directory</span>
                        </div>
                        <div className="hidden md:block h-4 w-px bg-white/10"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{employees.length} Members</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative group w-full md:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-[#c9a646] transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Search personnel..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 bg-[#121212] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-[10px] font-bold text-white focus:border-[#c9a646] outline-none transition-all uppercase"
                            />
                        </div>
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/5 gap-1 w-full md:w-auto justify-center">
                            {['Active', 'Inactive', 'All'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`flex-1 md:flex-none px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${statusFilter === status ? 'bg-[#c9a646] text-black shadow-[0_0_10px_rgba(201,166,70,0.2)]' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsOnboardingOpen(true)} className="h-9 px-4 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 w-full md:w-auto">
                            <Plus size={14} /> <span className="hidden md:inline">Onboard Staff</span><span className="md:hidden">Add Staff</span>
                        </button>
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
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest w-48">System Role</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Contact Protocol</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center w-24">Status</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right w-20">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map(emp => (
                                        <tr
                                            key={emp.id}
                                            onClick={() => setSelectedEmployee(emp)}
                                            className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                                        >
                                            <td className="py-3 px-4" data-label="Identity">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a646] to-[#f7d774] p-[1px] shrink-0">
                                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                                            <span className="text-[10px] font-black text-[#c9a646]">{emp.initials}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white group-hover:text-[#c9a646] transition-colors">{emp.full_name}</div>
                                                        <div className="text-[9px] text-gray-600 font-mono">ID: {emp.id.split('-')[0]}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4" data-label="Role">
                                                <div className="flex items-center gap-2">
                                                    <Shield size={12} className="text-gray-600" />
                                                    <span className="text-[10px] font-bold text-gray-300 uppercase">{emp.role}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4" data-label="Contact">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                        <Mail size={10} /> {emp.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center" data-label="Status">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${emp.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right" data-label="Action">
                                                <button className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredEmployees.length === 0 && (
                                <div className="p-12 text-center opacity-20">
                                    <UserCheck size={48} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No personnel matching protocol</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PROFILE MODAL - FULL SCREEN MOBILE */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-[100] bg-black/95 md:bg-black/90 md:backdrop-blur-sm flex items-center justify-center p-0 md:p-8 animate-in zoom-in-95 duration-200">
                    <div className="w-full h-full md:h-auto md:max-w-5xl bg-[#121212] border-0 md:border md:border-white/10 rounded-none md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
                        {/* Close Button */}
                        <button onClick={() => setSelectedEmployee(null)} className="absolute top-4 right-4 z-[110] bg-black/50 p-2 rounded-full hover:bg-white/10 text-white transition-all">
                            <X size={20} />
                        </button>

                        {/* LEFT COLUMN: IDENTITY CARD */}
                        <div className="w-full md:w-1/3 bg-gradient-to-br from-[#1a1a1a] to-black p-8 border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center justify-center text-center relative shrink-0">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c9a646] to-[#f7d774] p-[2px] mb-6 shadow-2xl shadow-[#c9a646]/20">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                    <span className="text-3xl font-black text-[#c9a646]">{selectedEmployee.initials}</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{selectedEmployee.full_name}</h2>

                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-xs font-bold text-[#c9a646] uppercase">{selectedEmployee.role}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${selectedEmployee.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {selectedEmployee.status}
                                </span>
                            </div>

                            <div className="flex gap-3 w-full">
                                {!isEditing && (
                                    <>
                                        <button onClick={() => alert("Task Assignment Modal (simulated)")} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all">
                                            <CheckCircle size={14} /> Assign Task
                                        </button>
                                        <button
                                            onClick={() => { setIsEditing(true); setEditForm(selectedEmployee); }}
                                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Edit2 size={14} /> Edit
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* MIDDLE/RIGHT CONTENT AREA */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* DETAILS COLUMN */}
                            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 p-8 overflow-y-auto bg-[#0a0a0a] shrink-0 custom-scrollbar">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Personnel Details</h3>

                                {isEditing ? (
                                    <div className="space-y-4 animate-in fade-in">
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Full Name</label>
                                            <input type="text" value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full bg-[#121212] border border-white/20 p-2 text-xs text-white rounded font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Role</label>
                                            <input type="text" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full bg-[#121212] border border-white/20 p-2 text-xs text-white rounded font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Email</label>
                                            <input type="text" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-[#121212] border border-white/20 p-2 text-xs text-white rounded font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Phone</label>
                                            <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-[#121212] border border-white/20 p-2 text-xs text-white rounded font-bold" />
                                        </div>

                                        <div className="pt-4 flex gap-2">
                                            <button onClick={handleEditSave} className="flex-1 bg-[#c9a646] p-2 rounded text-black text-xs font-black uppercase">Save</button>
                                            <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/5 p-2 rounded text-white text-xs font-black uppercase">Cancel</button>
                                        </div>

                                        <div className="pt-8 border-t border-white/10 mt-8">
                                            <p className="text-[9px] text-red-500 font-bold uppercase mb-2">Danger Zone</p>
                                            <button onClick={handleDeactivate} className="w-full py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded text-xs font-black uppercase transition-all">
                                                {selectedEmployee.status === 'Active' ? 'Deactivate User' : 'Reactivate User'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <DetailRow label="Role" value={selectedEmployee.role} icon={<Shield size={14} />} />
                                        <DetailRow label="Email" value={selectedEmployee.email} icon={<Mail size={14} />} />
                                        <DetailRow label="Phone" value={selectedEmployee.phone || 'N/A'} icon={<Phone size={14} />} />
                                        <DetailRow label="Joined" value={new Date(selectedEmployee.joinedDate || '2025-01-01').toLocaleDateString()} icon={<Activity size={14} />} />

                                        <div className="p-4 bg-white/5 rounded-lg border border-white/5 mt-6">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><CheckCircle size={12} /> System Status</h4>
                                            <p className="text-[10px] text-gray-300">
                                                User has <span className="text-green-500 font-bold">Level 3 Clearance</span>.
                                                Authorized for Matter Management and billing entry.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PERFORMANCE COLUMN */}
                            <div className="w-full md:w-2/3 p-8 bg-[#0e0e0e] overflow-y-auto custom-scrollbar">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <BarChart size={14} /> Performance & KPIs
                                    </h3>
                                    <button className="text-[9px] text-[#c9a646] font-bold uppercase hover:underline">Download Report</button>
                                </div>

                                {/* KPI CARDS */}
                                {(() => {
                                    const stats = getEmployeeStats(selectedEmployee.id);
                                    const kpi = selectedEmployee.kpi || { billableTarget: 160, taskTarget: 90 };
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            <KPICard label="Billable Hours" value={stats.billableHours} target={kpi.billableTarget} unit="hrs" icon={<TrendingUp size={16} />} />
                                            <KPICard label="Task Completion" value={stats.completionRate} target={kpi.taskTarget} unit="%" icon={<CheckCircle size={16} />} />
                                        </div>
                                    );
                                })()}

                                {/* RECENT ACTIVITY */}
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Recent Activity</h3>
                                <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                    <div className="p-3 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400"><FileText size={14} /></div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white">Drafted Motion for Dismissal</p>
                                            <p className="text-[9px] text-gray-500">Matter #24-902 • 2 hours ago</p>
                                        </div>
                                        <span className="text-[9px] font-bold text-[#c9a646] uppercase">Billable</span>
                                    </div>
                                    <div className="p-3 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center text-green-400"><CheckCircle size={14} /></div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white">Completed Task: Client Intake</p>
                                            <p className="text-[9px] text-gray-500">Assigned by TM Maseko • Yesterday</p>
                                        </div>
                                    </div>
                                    <div className="p-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400"><Mail size={14} /></div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white">Sent Correspondence</p>
                                            <p className="text-[9px] text-gray-500">To Client B • 2 days ago</p>
                                        </div>
                                    </div>
                                </div>

                                {/* GOALS */}
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mt-8 mb-4">Quarterly Goals</h3>
                                <div className="space-y-3">
                                    <GoalItem label="Complete Ethics Compliance Training" progress={100} completed />
                                    <GoalItem label="Lead 3 Major Litigation Files" progress={66} />
                                    <GoalItem label="Mentor Junior Associate (Sipho)" progress={40} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {
                isOnboardingOpen && (
                    <div className="fixed inset-0 z-[120] bg-black/95 md:bg-black/90 md:backdrop-blur-sm flex items-center justify-center p-0 md:p-4 animate-in zoom-in-95 duration-200">
                        <div className="w-full h-full md:h-auto md:max-w-lg bg-[#121212] border-0 md:border md:border-white/10 rounded-none md:rounded-2xl overflow-y-auto shadow-2xl">
                            <div className="bg-[#1a1a1a] p-6 border-b border-white/5">
                                <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                                    <Plus size={20} className="text-[#c9a646]" /> Onboard New Staff
                                </h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Add to payroll & assign KPIs</p>
                            </div>

                            <form onSubmit={handleAddStaff} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Full Name</label>
                                        <input name="fullName" required type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" placeholder="e.g. Sarah Dlamini" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Role Title</label>
                                        <input name="role" required type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" placeholder="e.g. Associate" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Email Address</label>
                                        <input name="email" required type="email" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" placeholder="email@firm.com" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Phone Extension</label>
                                        <input name="phone" type="text" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" placeholder="e.g. x404" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <p className="text-[9px] text-[#c9a646] font-bold uppercase tracking-widest mb-3">Performance Targets (KPIs)</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Monthly Billable Hours</label>
                                            <input name="billableTarget" type="number" defaultValue="140" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Task Completion Rate (%)</label>
                                            <input name="taskTarget" type="number" max="100" defaultValue="95" className="w-full bg-black border border-white/20 p-3 text-xs text-white rounded-lg focus:border-[#c9a646] outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setIsOnboardingOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-[#c9a646] hover:bg-[#ffe082] text-black rounded-lg text-xs font-black uppercase transition-all shadow-lg">Complete Onboarding</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

// --- SUB COMPONENTS ---

const DetailRow = ({ label, value, icon }) => (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 hover:bg-white/5 p-2 rounded transition-colors">
        <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
            {icon} {label}
        </span>
        <span className="text-xs font-bold text-white">{value}</span>
    </div>
);

const KPICard = ({ label, value, target, unit, icon }) => {
    const progress = Math.min((value / target) * 100, 100);
    const isGood = progress >= 90;

    return (
        <div className="bg-white/5 rounded-xl border border-white/5 p-4 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${isGood ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
                <span className={`${isGood ? 'text-green-500' : 'text-orange-500'}`}>{icon}</span>
            </div>
            <div className="flex items-end gap-1 mb-3">
                <span className="text-2xl font-black text-white">{value}</span>
                <span className="text-xs font-bold text-gray-500 mb-1">/ {target} {unit}</span>
            </div>
            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${isGood ? 'bg-green-500' : 'bg-orange-500'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

const GoalItem = ({ label, progress, completed }) => (
    <div className="mb-3">
        <div className="flex justify-between items-end mb-1">
            <span className={`text-[10px] font-bold ${completed ? 'text-green-500 line-through' : 'text-gray-300'}`}>{label}</span>
            <span className="text-[9px] font-mono text-gray-500">{progress}%</span>
        </div>
        <div className="w-full h-1 bg-black rounded-full overflow-hidden">
            <div className={`h-full ${completed ? 'bg-green-500' : 'bg-[#c9a646]'}`} style={{ width: `${progress}%` }}></div>
        </div>
    </div>
);

export default EmployeesPage;
