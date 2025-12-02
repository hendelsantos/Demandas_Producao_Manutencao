import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, LogOut, Moon, Sun, ChevronLeft, ChevronRight, Eye, LayoutDashboard, FileText, AlertCircle, Wrench, CheckCircle2, List, Kanban } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import KanbanBoard from '../components/KanbanBoard';

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
    const [selectedImage, setSelectedImage] = useState(null); // Added selectedImage state

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRequests(1, searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchRequests = async (page = 1, search = '') => {
        setLoading(true);
        try {
            // If in Kanban mode, we might want to fetch ALL (or a lot) to populate columns.
            // For now, let's keep pagination for Table, and maybe fetch more for Kanban?
            // Actually, for a proper Kanban, we need all active tasks. 
            // Let's assume for this version we fetch paginated for Table, and a separate "all" fetch for Kanban or just show paginated data in Kanban (which is weird).
            // BETTER APPROACH: Fetch all for Kanban, Paginated for Table.

            let url = `requests/?page=${page}`;
            if (search) url += `&search=${search}`;

            if (viewMode === 'kanban') {
                // For Kanban, we ideally want all active tasks. 
                // Let's try to fetch a larger page size or disable pagination if backend supports it.
                // Since we just added pagination globally, we can't easily disable it without a specific param.
                // Let's just fetch a large page for Kanban for now.
                url += '&page_size=100';
            }

            const response = await api.get(url);

            if (response.data.results) {
                setRequests(response.data.results);
                setTotalCount(response.data.count);
                setTotalPages(Math.ceil(response.data.count / 10)); // Assuming default page size 10 for table
            } else {
                // Fallback if pagination is not active (shouldn't happen with our backend change)
                setRequests(response.data);
            }
        } catch (error) {
            console.error('Erro ao buscar demandas', error);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when view mode changes to adjust strategy if needed
    useEffect(() => {
        fetchRequests(currentPage, searchTerm);
    }, [viewMode, currentPage]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const WorkflowStepper = ({ status }) => {
        const steps = [
            { id: 'OPEN', label: 'Emitido' },
            { id: 'WAITING_PROD', label: 'Prod.' },
            { id: 'WAITING_MAINT', label: 'Manut.' },
            { id: 'IN_EXECUTION', label: 'Exec.' },
            { id: 'DONE', label: 'Fim' }
        ];

        const getStepState = (stepId, index) => {
            const statusOrder = ['OPEN', 'WAITING_PROD', 'WAITING_MAINT', 'WAITING_MANAGER', 'IN_EXECUTION', 'DONE'];
            const currentIdx = statusOrder.indexOf(status);
            let stepIdx = index;
            if (stepId === 'IN_EXECUTION') {
                if (status === 'WAITING_MANAGER') return 'current';
            }
            if (status === 'REJECTED') return 'rejected';
            const mappedCurrentIdx = status === 'WAITING_MANAGER' ? 3 : currentIdx;
            if (mappedCurrentIdx > index) return 'completed';
            if (mappedCurrentIdx === index) return 'current';
            return 'pending';
        };

        return (
            <div className="flex items-center gap-1">
                {steps.map((step, index) => {
                    const state = getStepState(step.id, index);
                    return (
                        <div key={step.id} className="flex flex-col items-center group relative">
                            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${state === 'completed' ? 'bg-green-500' :
                                state === 'current' ? 'bg-blue-500 ring-2 ring-blue-200 dark:ring-blue-900 animate-pulse' :
                                    state === 'rejected' ? 'bg-red-500' :
                                        'bg-slate-200 dark:bg-slate-700'
                                }`} />
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <LayoutDashboard size={24} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                            Gestão de Demandas <span className="text-blue-600">+Hyundai</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors text-sm font-medium"
                        >
                            <LogOut size={18} />
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview - Note: These might be inaccurate with pagination if we don't fetch stats separately. 
                    For now, we'll hide them or accept they only show current page stats? 
                    Ideally we need a separate stats endpoint. 
                    Let's keep them but acknowledge they might be partial if we don't fetch all.
                    Actually, let's remove them for now or replace with a simpler header to focus on the list/kanban.
                    OR, we can fetch stats separately. Let's keep it simple and remove the stats blocks for this iteration to reduce clutter and inaccuracy.
                */}

                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por título, ID..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                title="Visualização em Lista"
                            >
                                <List size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                title="Visualização em Kanban"
                            >
                                <Kanban size={20} />
                            </button>
                        </div>

                        <Link
                            to="/new"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <Plus size={20} />
                            <span className="hidden md:inline">Nova Demanda</span>
                        </Link>
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : viewMode === 'kanban' ? (
                    <KanbanBoard requests={requests} />
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Nº Pendência</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Título</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Problema</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Processo</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Equipamento</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">G.U.T.</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">Foto</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Data Emissão</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Emitente</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Resp. Atual</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Status</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Descrição Atividade</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Executante</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Observação</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">Fotos</th>
                                        <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Data Encerram.</th>
                                        <th className="px-4 py-3">PM 04</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {requests.length > 0 ? (
                                        requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-sm whitespace-nowrap">
                                                <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
                                                    <Link to={`/request/${req.id}`} className="text-blue-600 hover:underline">
                                                        #{req.id.toString().padStart(4, '0')}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 max-w-[200px] truncate" title={req.title}>{req.title}</td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 max-w-[200px] truncate" title={req.problem_description}>{req.problem_description}</td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">{req.process}</td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">{req.equipment}</td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center font-bold">
                                                    {req.gut_gravity * req.gut_urgency * req.gut_tendency}
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">
                                                    {req.photo ? <Eye size={16} className="text-blue-500 inline cursor-pointer" /> : '-'}
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">{req.requester_name}</td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-slate-500 italic">
                                                    {req.assigned_to_name || '-'}
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${req.status === 'DONE' ? 'bg-green-100 text-green-800' :
                                                        req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {req.status_display}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 max-w-[200px] truncate">{req.execution_description || '-'}</td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">{req.assigned_to_name || '-'}</td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 max-w-[150px] truncate">{req.observation || '-'}</td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">
                                                    {req.execution_photo ? <Eye size={16} className="text-green-500 inline" /> : '-'}
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                                                    {req.finished_at ? new Date(req.finished_at).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                                                    {req.pm04_order || 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="17" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                Nenhuma demanda encontrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Página {currentPage} de {totalPages} ({totalCount} itens)
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
