import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, User as UserIcon } from 'lucide-react';

const JWTLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('/api/token/', {
                username: username,
                password: password,
            });

            const { access, refresh } = response.data;

            // 토큰 저장
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

            alert('로그인 성공! JWT 토큰이 저장되었습니다.');
            // 대시보드로 이동 (라우트 설정이 필요할 수 있음)
            // navigate('/jwt-dashboard'); 
        } catch (error) {
            console.error('Login error:', error);
            alert('로그인 실패: ' + (error.response?.data?.detail || 'ID 또는 비밀번호를 확인해주세요.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
                        <LogIn className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">JWT 로그인</h1>
                    <p className="text-gray-500 mt-2">안전한 토큰 기반 인증 시스템</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">사용자 이름 (Username)</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <UserIcon className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="ID를 입력하세요..."
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">비밀번호</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Lock className="w-5 h-5" />
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all transform active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? '인증 중...' : '로그인'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    토큰은 로컬 스토리지에 안전하게 보관됩니다.
                </div>
            </div>
        </div>
    );
};

export default JWTLogin;
