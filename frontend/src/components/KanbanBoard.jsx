import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle2, User, Wrench, Briefcase } from 'lucide-react';

const KanbanColumn = ({ title, status, requests, icon: Icon, color }) => {
    return (
        <div className="flex-1 min-w-[280px] flex flex-col h-full">
            <div className={`flex items-center gap-2 p-3 rounded-t-xl border-b-2 ${color} bg-white dark:bg-slate-800 shadow-sm`}>
                <Icon size={18} className={color.replace('border-', 'text-')} />
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">{title}</h3>
                <span className="ml-auto bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {requests.length}
                </span>
            </div>

            <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 p-2 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-3">
                    {requests.map(req => (
                        <Link
                            to={`/request/${req.id}`}
                            key={req.id}
                            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">#{req.id}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${req.gut_gravity * req.gut_urgency * req.gut_tendency > 60
                                        ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                                        : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-700'
                                    }`}>
                                    GUT: {req.gut_gravity * req.gut_urgency * req.gut_tendency}
                                </span>
                            </div>

                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {req.title}
                            </h4>

                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                                <Wrench size={12} />
                                <span className="truncate">{req.equipment}</span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
                                <div className="flex items-center gap-1.5" title={req.requester_name}>
                                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                                        {req.requester_name ? req.requester_name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[80px]">
                                        {req.requester_name}
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                    {new Date(req.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

const KanbanBoard = ({ requests }) => {
    // Group requests by status
    const columns = [
        {
            id: 'OPEN',
            title: 'Emitido',
            icon: AlertCircle,
            color: 'border-yellow-500',
            statuses: ['OPEN']
        },
        {
            id: 'PRODUCTION',
            title: 'Produção',
            icon: Briefcase,
            color: 'border-orange-500',
            statuses: ['WAITING_PROD']
        },
        {
            id: 'MAINTENANCE',
            title: 'Manutenção',
            icon: Wrench,
            color: 'border-blue-500',
            statuses: ['WAITING_MAINT', 'WAITING_MANAGER']
        },
        {
            id: 'EXECUTION',
            title: 'Execução',
            icon: User,
            color: 'border-purple-500',
            statuses: ['IN_EXECUTION']
        },
        {
            id: 'DONE',
            title: 'Concluído',
            icon: CheckCircle2,
            color: 'border-green-500',
            statuses: ['DONE']
        }
    ];

    return (
        <div className="flex gap-4 h-[calc(100vh-280px)] overflow-x-auto pb-4">
            {columns.map(col => (
                <KanbanColumn
                    key={col.id}
                    title={col.title}
                    icon={col.icon}
                    color={col.color}
                    requests={requests.filter(r => col.statuses.includes(r.status))}
                />
            ))}
        </div>
    );
};

export default KanbanBoard;
