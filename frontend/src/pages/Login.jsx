
import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('api-token-auth/', { username, password });
            localStorage.setItem('token', response.data.token);

            // Fetch user profile to store role
            const userResponse = await api.get('users/me/', {
                headers: { Authorization: `Token ${response.data.token}` }
            });
            localStorage.setItem('userRole', userResponse.data.role);

            navigate('/dashboard');
        } catch (err) {
            setError('Credenciais inválidas. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-center p-12 relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 z-0"></div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
                    <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-purple-400 blur-3xl"></div>
                </div>

                <div className="relative z-10 text-white">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl mb-6">
                            <span className="text-3xl font-bold italic" style={{ fontFamily: '"Exo 2", sans-serif' }}>+</span>
                        </div>
                        <span className="text-2xl font-bold tracking-widest uppercase" style={{ fontFamily: '"Exo 2", sans-serif' }}>
                            +Hyundai
                        </span>
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                        Sistema de <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                            Gestão de Demandas
                        </span>
                    </h1>
                    <p className="text-xl text-blue-100 font-light mb-8 max-w-lg leading-relaxed">
                        Otimize o fluxo de produção e manutenção com agilidade e colaboração.
                    </p>
                    <div className="flex gap-3 mt-8">
                        <div className="h-1.5 w-16 bg-white rounded-full opacity-80"></div>
                        <div className="h-1.5 w-8 bg-white rounded-full opacity-40"></div>
                        <div className="h-1.5 w-8 bg-white rounded-full opacity-40"></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-slate-900 p-8 transition-colors duration-300">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight">Bem-vindo de volta</h2>
                        <p className="text-slate-500 dark:text-slate-400">Insira suas credenciais para acessar o painel.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 border border-red-100 dark:border-red-800 flex items-center gap-3 text-sm font-medium">
                            <span className="block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Usuário</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Seu usuário"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="Sua senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transform transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide uppercase"
                        >
                            Acessar Sistema
                        </button>
                    </form>

                    <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-600 font-medium">
                        2025 Sistema de Demandas. Feito Por Hendel / Ederson. Supervisão: Gabriel Borges
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
