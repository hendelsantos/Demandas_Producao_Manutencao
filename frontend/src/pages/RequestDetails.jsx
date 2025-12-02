import React, { useEffect, useState } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Play, CheckCircle, ShieldCheck, Wrench, FileCheck, User, Calendar, AlertCircle, XCircle, Clock, FileText, Camera } from 'lucide-react';

const RequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [executors, setExecutors] = useState([]);
    const [engineers, setEngineers] = useState([]);

    // Form States
    const [selectedType, setSelectedType] = useState('');
    const [selectedExecutor, setSelectedExecutor] = useState('');
    const [selectedEngineer, setSelectedEngineer] = useState('');
    const [pm04Order, setPm04Order] = useState('');
    const [executionDesc, setExecutionDesc] = useState('');
    const [finalObservation, setFinalObservation] = useState('');
    const [technicianName, setTechnicianName] = useState('');

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const response = await api.get(`requests/${id}/`);
                setRequest(response.data);
                // Pre-fill fields if editing (though usually we just move forward)
                if (response.data.pm04_order) setPm04Order(response.data.pm04_order);
                if (response.data.execution_description) setExecutionDesc(response.data.execution_description);
                if (response.data.observation) setFinalObservation(response.data.observation);
                if (response.data.technician_name) setTechnicianName(response.data.technician_name);
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
                payload.execution_description = executionDesc;
                payload.pm04_order = pm04Order || 'N/A';
                payload.observation = finalObservation;
                payload.technician_name = technicianName;
            }

            await api.post(`requests/${id}/${endpoint}`, payload);

            // Refresh data
            const response = await api.get(`requests/${id}/`);
            setRequest(response.data);
            setComment('');
        } catch (error) {
            console.error('Erro ao processar ação', error);
            alert('Erro ao processar ação. Verifique os dados e tente novamente.');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!request) return <div className="text-center mt-20 text-slate-500">Demanda não encontrada.</div>;

    // Helper to check if a stage is active or completed
    const getStageStatus = (stage) => {
        const flow = ['OPEN', 'WAITING_PROD', 'WAITING_MAINT', 'IN_EXECUTION', 'DONE'];
        // Map WAITING_MANAGER to WAITING_MAINT logic for visual simplicity or separate it
        // The whiteboard has "Aprovador 2 (Manut)" which splits into "Técnica" or "Engenharia"

        if (request.status === 'REJECTED') return 'rejected';

        const status = request.status;

        if (stage === 'USER') return 'completed'; // Always started by user

        if (stage === 'PROD') {
            if (status === 'OPEN') return 'active';
            if (['WAITING_MAINT', 'WAITING_MANAGER', 'IN_EXECUTION', 'DONE'].includes(status)) return 'completed';
            return 'pending';
        }

        if (stage === 'MAINT') {
            if (status === 'WAITING_MAINT') return 'active';
            if (status === 'WAITING_MANAGER') return 'active'; // Manager is part of Maint/Eng flow
            if (['IN_EXECUTION', 'DONE'].includes(status)) return 'completed';
            return 'pending';
        }

        if (stage === 'EXEC') {
            if (status === 'IN_EXECUTION') return 'active';
            if (status === 'DONE') return 'completed';
            return 'pending';
        }

        return 'pending';
    };

    const StageBox = ({ title, stage, children, icon: Icon }) => {
        const status = getStageStatus(stage);
        const borderColor = status === 'active' ? 'border-blue-500 ring-1 ring-blue-500' :
            status === 'completed' ? 'border-green-500' :
                status === 'rejected' ? 'border-red-500' : 'border-slate-200 dark:border-slate-700';

        const opacity = status === 'pending' ? 'opacity-50' : 'opacity-100';

        return (
            <div className={`bg-white dark:bg-slate-800 rounded-xl border-2 ${borderColor} ${opacity} p-6 flex flex-col h-full transition-all duration-300`}>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div className={`p-2 rounded-lg ${status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'} dark:bg-slate-700 dark:text-slate-300`}>
                        <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{title}</h3>
                    {status === 'completed' && <CheckCircle size={18} className="text-green-500 ml-auto" />}
                </div>
                <div className="flex-1">
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar para o Painel
                </button>

                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-slate-400 dark:text-slate-500">#{request.id.toString().padStart(4, '0')}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${request.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {request.status_display}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{request.title}</h1>
                </div>

                {/* Workflow Grid - Mimicking the Whiteboard Flow */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* 1. Usuário (Solicitante) */}
                    <StageBox title="Usuário" stage="USER" icon={User}>
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="text-slate-500 block text-xs uppercase font-bold">Problema</span>
                                <p className="font-medium">{request.problem_description}</p>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs uppercase font-bold">Processo / Equip.</span>
                                <p>{request.process} - {request.equipment}</p>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs uppercase font-bold">G.U.T.</span>
                                <p>G:{request.gut_gravity} x U:{request.gut_urgency} x T:{request.gut_tendency} = <strong>{request.gut_gravity * request.gut_urgency * request.gut_tendency}</strong></p>
                            </div>
                            {request.photo && (
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Foto</span>
                                    <img src={request.photo} alt="Evidência" className="rounded-lg h-24 w-full object-cover" />
                                </div>
                            )}
                        </div>
                    </StageBox>

                    {/* 2. Aprovador 1 (Produção) */}
                    <StageBox title="Aprovador 1 (Prod.)" stage="PROD" icon={ShieldCheck}>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Validação da necessidade e G.U.T.</p>

                            {request.status === 'OPEN' ? (
                                <div className="flex flex-col gap-2 mt-4">
                                    <textarea
                                        className="w-full p-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                        placeholder="Observação (Opcional)..."
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAction('approve_prod')} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700">Aprovar</button>
                                        <button onClick={() => handleAction('reject_prod')} className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-bold text-sm hover:bg-red-200">Rejeitar</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm italic text-slate-500">
                                    Aprovado/Processado
                                </div>
                            )}
                        </div>
                    </StageBox>

                    {/* 3. Aprovador 2 (Manutenção) */}
                    <StageBox title="Aprovador 2 (Manut.)" stage="MAINT" icon={Wrench}>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Definição técnica ou engenharia.</p>

                            {(request.status === 'WAITING_MAINT' || request.status === 'WAITING_MANAGER') ? (
                                <div className="flex flex-col gap-3 mt-4">
                                    {request.status === 'WAITING_MAINT' && (
                                        <>
                                            <select
                                                className="w-full p-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                            >
                                                <option value="">Tipo de Demanda...</option>
                                                <option value="TECHNICAL">Técnica (H/A/T/M)</option>
                                                <option value="ENGINEERING">Engenharia</option>
                                            </select>

                                            {selectedType === 'TECHNICAL' && (
                                                <select
                                                    className="w-full p-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                                    value={selectedExecutor}
                                                    onChange={(e) => setSelectedExecutor(e.target.value)}
                                                >
                                                    <option value="">Selecione Encarregado...</option>
                                                    {executors.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                                                </select>
                                            )}
                                        </>
                                    )}

                                    {request.status === 'WAITING_MANAGER' && (
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-100 dark:border-purple-800 mb-2">
                                            <span className="text-xs font-bold text-purple-600 uppercase">Aprovação Gerencial</span>
                                            <select
                                                className="w-full p-2 mt-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                                value={selectedEngineer}
                                                onChange={(e) => setSelectedEngineer(e.target.value)}
                                            >
                                                <option value="">Selecione Engenheiro...</option>
                                                {engineers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => request.status === 'WAITING_MANAGER' ? handleAction('approve_manager') : handleAction('approve_maint')}
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    {request.type && <span className="block text-xs font-bold uppercase text-blue-600 mb-1">{request.type_display}</span>}
                                    {request.assigned_to_name && <span className="block text-sm text-slate-700 dark:text-slate-300">Encarregado: {request.assigned_to_name}</span>}
                                </div>
                            )}
                        </div>
                    </StageBox>

                    {/* 4. Executante */}
                    <StageBox title="Executante" stage="EXEC" icon={Wrench}>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Execução e encerramento.</p>

                            {request.status === 'IN_EXECUTION' ? (
                                <div className="flex flex-col gap-3 mt-4">
                                    <input
                                        type="text"
                                        className="w-full p-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                        placeholder="Nome do Técnico Executante"
                                        value={technicianName}
                                        onChange={e => setTechnicianName(e.target.value)}
                                    />
                                    <textarea
                                        className="w-full p-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                        placeholder="Descrição da Atividade..."
                                        value={executionDesc}
                                        onChange={e => setExecutionDesc(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="w-full p-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                        placeholder="Nº Ordem PM04 (ou N/A)"
                                        value={pm04Order}
                                        onChange={e => setPm04Order(e.target.value)}
                                    />
                                    <textarea
                                        className="w-full p-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                        placeholder="Observação Final..."
                                        value={finalObservation}
                                        onChange={e => setFinalObservation(e.target.value)}
                                    />

                                    <button
                                        onClick={() => handleAction('finish')}
                                        className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Encerrar
                                    </button>
                                </div>
                            ) : request.status === 'DONE' ? (
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800">
                                        <span className="block text-xs font-bold text-green-700 dark:text-green-400">PM04: {request.pm04_order}</span>
                                        {request.technician_name && (
                                            <span className="block text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">Técnico: {request.technician_name}</span>
                                        )}
                                        <p className="text-slate-700 dark:text-slate-300 mt-1">{request.execution_description}</p>
                                    </div>
                                    {request.observation && (
                                        <p className="text-xs text-slate-500 italic">Obs: {request.observation}</p>
                                    )}
                                    {request.finished_at && (
                                        <p className="text-xs text-slate-400">Encerrado em: {new Date(request.finished_at).toLocaleDateString()}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-4 text-sm text-slate-400 italic">Aguardando início...</div>
                            )}
                        </div>
                    </StageBox>

                </div>
            </div>
        </div>
    );
};

export default RequestDetails;
