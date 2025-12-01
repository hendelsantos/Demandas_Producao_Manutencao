import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, LogOut, Moon, Sun, ChevronLeft, ChevronRight, Eye, LayoutDashboard, FileText, AlertCircle, Wrench, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await api.get('requests/');
                setRequests(response.data);
            } catch (error) {
                console.error('Erro ao buscar demandas', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // Filter and Pagination Logic
    const filteredRequests = requests.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toString().includes(searchTerm) ||
        req.status_display.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const WorkflowStepper = ({ status }) => {
        const steps = [
            { id: 'OPEN', label: 'Emitido' },
            { id: 'WAITING_PROD', label: 'Prod.' },
            { id: 'WAITING_MAINT', label: 'Manut.' },
            { id: 'IN_EXECUTION', label: 'Exec.' }, // Covers WAITING_MANAGER too visually or we merge them
            { id: 'DONE', label: 'Fim' }
        ];

        // Helper to determine step state
        const getStepState = (stepId, index) => {
            const statusOrder = ['OPEN', 'WAITING_PROD', 'WAITING_MAINT', 'WAITING_MANAGER', 'IN_EXECUTION', 'DONE'];
            const currentIdx = statusOrder.indexOf(status);

            // Map step IDs to order index
            let stepIdx = index;
            if (stepId === 'IN_EXECUTION') {
                // If status is WAITING_MANAGER, it's effectively at the same "stage" group as IN_EXECUTION for this simplified view
                if (status === 'WAITING_MANAGER') return 'current';
            }

            if (status === 'REJECTED') return 'rejected';

            // Special handling because our steps array is shorter than statusOrder (we grouped Manager/Exec)
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
                            {/* Tooltip */}
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
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Demandas</span>
                            <FileText size={20} className="text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{requests.length}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Em Aberto</span>
                            <AlertCircle size={20} className="text-yellow-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">
                            {requests.filter(r => ['OPEN', 'WAITING_PROD', 'WAITING_MAINT', 'WAITING_MANAGER'].includes(r.status)).length}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Em Execução</span>
                            <Wrench size={20} className="text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">
                            {requests.filter(r => r.status === 'IN_EXECUTION').length}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Concluídas</span>
                            <CheckCircle2 size={20} className="text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">
                            {requests.filter(r => r.status === 'DONE').length}
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por título, ID ou equipamento..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link
                        to="/new"
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        Nova Demanda
                    </Link>
                </div>

                {/* Table View */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Título</th>
                                    <th className="px-6 py-4">Fluxo</th>
                                    <th className="px-6 py-4">Processo</th>
                                    <th className="px-6 py-4">Equipamento</th>
                                    <th className="px-6 py-4">Solicitante</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4 text-center">GUT</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {currentItems.length > 0 ? (
                                    currentItems.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono text-slate-500 dark:text-slate-400">
                                                #{req.id.toString().padStart(4, '0')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">{req.title}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{req.problem_description}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <WorkflowStepper status={req.status} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {req.process}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {req.equipment}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {req.requester_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'DONE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {req.status_display}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-sm font-bold ${req.gut_gravity * req.gut_urgency * req.gut_tendency > 60
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    {req.gut_gravity * req.gut_urgency * req.gut_tendency}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to={`/request/${req.id}`}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
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
                                Página {currentPage} de {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
