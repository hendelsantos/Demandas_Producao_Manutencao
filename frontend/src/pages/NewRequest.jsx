import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload } from 'lucide-react';

const NewRequest = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        problem_description: '',
        process: '',
        equipment: '',
        gut_gravity: 3,
        gut_urgency: 3,
        gut_tendency: 3,
    });
    const [photo, setPhoto] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (photo) {
            data.append('photo', photo);
        }

        try {
            await api.post('requests/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/dashboard');
        } catch (error) {
            console.error('Erro ao criar demanda', error);
            alert('Erro ao criar demanda. Verifique os dados.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Voltar
                </button>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 shadow-xl">
                    <h1 className="text-2xl font-bold mb-6">Nova Solicitação de Manutenção</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Título</label>
                            <input name="title" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Descrição do Problema</label>
                            <textarea name="problem_description" required rows="4" onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Processo</label>
                                <input name="process" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Equipamento</label>
                                <input name="equipment" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Gravidade (1-5)</label>
                                <input type="number" min="1" max="5" name="gut_gravity" value={formData.gut_gravity} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Urgência (1-5)</label>
                                <input type="number" min="1" max="5" name="gut_urgency" value={formData.gut_urgency} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Tendência (1-5)</label>
                                <input type="number" min="1" max="5" name="gut_tendency" value={formData.gut_tendency} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Foto (Opcional)</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                        <p className="text-sm text-slate-500"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            </div>
                            {photo && <p className="text-sm text-green-400 mt-2">Arquivo selecionado: {photo.name}</p>}
                        </div>

                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all">
                            <Save size={20} />
                            Salvar Demanda
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewRequest;
