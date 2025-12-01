import React, { useEffect, useState } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Play, CheckCircle, ShieldCheck, Wrench, FileCheck, User, Calendar, AlertCircle, XCircle } from 'lucide-react';

const RequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [executors, setExecutors] = useState([]);
    const [engineers, setEngineers] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [selectedExecutor, setSelectedExecutor] = useState('');
    const [selectedEngineer, setSelectedEngineer] = useState('');

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const response = await api.get(`requests/${id}/`);
                setRequest(response.data);
            } catch (error) {
                console.error('Erro ao buscar detalhes da demanda', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUsers = async () => {
            try {
                const execResponse = await api.get('users/?role=EXECUTOR');
                setExecutors(execResponse.data);

                // Fetch both types of engineers
                const mechResponse = await api.get('users/?role=ENGINEER_MECH');
                const elecResponse = await api.get('users/?role=ENGINEER_ELEC');
                setEngineers([...mechResponse.data, ...elecResponse.data]);
            } catch (error) {
                console.error('Erro ao buscar usuários', error);
            }
        };

        fetchRequest();
        fetchUsers();
    }, [id]);

    const handleAction = async (actionType) => {
        try {
            let payload = { comment };
            let endpoint = '';

            if (actionType === 'approve_prod') endpoint = 'approve_production/';
            if (actionType === 'reject_prod') endpoint = 'reject_production/';

            if (actionType === 'approve_maint') {
                endpoint = 'approve_maintenance/';
                payload.type = selectedType;
                if (selectedType === 'TECHNICAL') payload.executor_id = selectedExecutor;
            }
            if (actionType === 'reject_maint') endpoint = 'reject_maintenance/';

            if (actionType === 'approve_manager') {
                endpoint = 'approve_manager/';
                payload.engineer_id = selectedEngineer;
            }

            if (actionType === 'finish') {
                endpoint = 'finish_execution/';
            }

            await api.post(`requests/${id}/${endpoint}`, payload);

            // Refresh data
            const response = await api.get(`requests/${id}/`);
            setRequest(response.data);
            setComment('');
            // Reset selections
            setSelectedType('');
            setSelectedExecutor('');
            setSelectedEngineer('');
        } catch (error) {
            console.error('Erro ao processar ação', error);
            alert('Erro ao processar ação. Verifique os dados e tente novamente.');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!request) return <div className="text-center mt-20 text-slate-500">Demanda não encontrada.</div>;

    const ApprovalIcon = ({ status, type }) => {
        const isApproved = (type === 'PROD' && ['WAITING_MAINT', 'WAITING_MANAGER', 'IN_EXECUTION', 'DONE'].includes(status)) ||
            (type === 'MAINT' && ['WAITING_MANAGER', 'IN_EXECUTION', 'DONE'].includes(status));

        if (!isApproved) return null;

        return (
            <div className={`absolute ${type === 'PROD' ? 'top-4 right-4' : 'top-20 right-4'} opacity-20 rotate-12 pointer-events-none`}>
                <div className="border-4 border-green-600 text-green-600 rounded-lg p-2 font-black text-xl uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle size={32} />
                    Aprovado {type}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-6 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar para o Painel
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden relative">
                    <ApprovalIcon status={request.status} type="PROD" />
                    <ApprovalIcon status={request.status} type="MAINT" />

                    <div className="p-8 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-sm font-mono text-slate-400 dark:text-slate-500 mb-2 block">#{request.id.toString().padStart(4, '0')}</span>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{request.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1"><User size={16} /> {request.requester_name}</span>
                                    <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(request.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${request.status === 'DONE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                request.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                {request.status_display}
                            </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Descrição do Problema</h3>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    {request.problem_description}
                                </p>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Processo</h3>
                                        <p className="font-medium">{request.process}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Equipamento</h3>
                                        <p className="font-medium">{request.equipment}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Matriz GUT</h3>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-center">
                                            <div className="text-xs text-slate-500">Gravidade</div>
                                            <div className="font-bold text-lg">{request.gut_gravity}</div>
                                        </div>
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-center">
                                            <div className="text-xs text-slate-500">Urgência</div>
                                            <div className="font-bold text-lg">{request.gut_urgency}</div>
                                        </div>
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-center">
                                            <div className="text-xs text-slate-500">Tendência</div>
                                            <div className="font-bold text-lg">{request.gut_tendency}</div>
                                        </div>
                                        <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-lg p-2 text-center border-l-2 border-slate-300 dark:border-slate-500">
                                            <div className="text-xs text-slate-600 dark:text-slate-300">Total</div>
                                            <div className="font-black text-lg text-slate-800 dark:text-white">{request.gut_gravity * request.gut_urgency * request.gut_tendency}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info (Type & Assigned To) */}
                        {(request.type || request.assigned_to_name) && (
                            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-wrap gap-6">
                                {request.type_display && (
                                    <div>
                                        <h3 className="text-xs font-bold text-blue-400 dark:text-blue-300 uppercase tracking-wider mb-1">Tipo de Demanda</h3>
                                        <p className="font-bold text-blue-900 dark:text-blue-100">{request.type_display}</p>
                                    </div>
                                )}
                                {request.assigned_to_name && (
                                    <div>
                                        <h3 className="text-xs font-bold text-blue-400 dark:text-blue-300 uppercase tracking-wider mb-1">Responsável Atual</h3>
                                        <p className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                            <User size={16} /> {request.assigned_to_name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {request.photo && (
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Evidência Fotográfica</h3>
                                <img src={request.photo} alt="Evidência" className="rounded-xl max-h-96 object-cover shadow-md" />
                            </div>
                        )}
                    </div>

                    {/* Actions Section */}
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <AlertCircle size={18} />
                            Ações Disponíveis
                        </h3>

                        <div className="flex flex-wrap gap-4">
                            {/* Production Approval */}
                            {request.status === 'OPEN' && (
                                <>
                                    <button onClick={() => handleAction('approve_prod')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 transition-transform hover:-translate-y-0.5 flex items-center gap-2">
                                        <CheckCircle size={20} /> Aprovar (Produção)
                                    </button>
                                    <button onClick={() => handleAction('reject_prod')} className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2">
                                        <XCircle size={20} /> Rejeitar
                                    </button>
                                </>
                            )}

                            {/* Maintenance Approval (Supervisor) */}
                            {request.status === 'WAITING_MAINT' && (
                                <div className="w-full bg-white dark:bg-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
                                    <h4 className="font-bold mb-4 text-slate-800 dark:text-white">Aprovação de Manutenção</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Demanda</label>
                                            <select
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="TECHNICAL">Técnica (Execução Direta)</option>
                                                <option value="ENGINEERING">Engenharia (Gerência)</option>
                                            </select>
                                        </div>

                                        {selectedType === 'TECHNICAL' && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Atribuir Executante</label>
                                                <select
                                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={selectedExecutor}
                                                    onChange={(e) => setSelectedExecutor(e.target.value)}
                                                >
                                                    <option value="">Selecione um técnico...</option>
                                                    {executors.map(user => (
                                                        <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.username})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleAction('approve_maint')}
                                            disabled={!selectedType || (selectedType === 'TECHNICAL' && !selectedExecutor)}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                        >
                                            <CheckCircle size={20} />
                                            {selectedType === 'ENGINEERING' ? 'Encaminhar para Gerência' : 'Aprovar e Atribuir'}
                                        </button>
                                        <button onClick={() => handleAction('reject_maint')} className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2">
                                            <XCircle size={20} /> Rejeitar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Manager Approval */}
                            {request.status === 'WAITING_MANAGER' && (
                                <div className="w-full bg-white dark:bg-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
                                    <h4 className="font-bold mb-4 text-slate-800 dark:text-white">Aprovação Gerencial (Engenharia)</h4>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Atribuir Engenheiro Responsável</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={selectedEngineer}
                                            onChange={(e) => setSelectedEngineer(e.target.value)}
                                        >
                                            <option value="">Selecione um engenheiro...</option>
                                            {engineers.map(user => (
                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.username})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleAction('approve_manager')}
                                            disabled={!selectedEngineer}
                                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                        >
                                            <CheckCircle size={20} /> Aprovar e Atribuir
                                        </button>
                                        <button onClick={() => handleAction('reject_maint')} className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2">
                                            <XCircle size={20} /> Rejeitar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Execution Finish */}
                            {request.status === 'IN_EXECUTION' && (
                                <button onClick={() => handleAction('finish')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-transform hover:-translate-y-0.5 flex items-center gap-2">
                                    <CheckCircle size={20} /> Finalizar Execução
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetails;
