import React, { useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, Lock, ShieldCheck, Database, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JWTDashboard = () => {
    const [secretData, setSecretData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const fetchSecretData = async () => {
        setIsLoading(true);
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            alert('액세스 토큰이 없습니다. 먼저 로그인해 주세요.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get('/api/protected-view/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            console.log('Secret Response:', response.data);
            setSecretData(response.data);
        } catch (error) {
            console.error('Error fetching secret data:', error);
            if (error.response?.status === 401) {
                alert('로그인이 만료되었습니다. 다시 로그인해 주세요.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // navigate('/jwt-login'); 
            } else {
                alert('요청 실패: ' + (error.response?.data?.detail || '오류가 발생했습니다.'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('로그아웃 되었습니다. 토큰이 삭제되었습니다.');
        // navigate('/jwt-login'); 
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8 overflow-hidden relative">
                <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">JWT 대시보드</h1>
                            <p className="text-sm text-gray-500">인증된 회원만 볼 수 있는 페이지</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">비밀 서버 리소스 확인</h2>
                            <p className="text-sm text-gray-600 leading-relaxed mt-1">
                                하단의 버튼을 누르면 서버의 보호된 API에 현재 저장된 Bearer 토큰을 담아 요청을 보냅니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                        {secretData ? (
                            <div className="w-full px-6 transition-all animate-in fade-in zoom-in">
                                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Database className="w-4 h-4" /> 서버로부터 받은 응답 데이터
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                    <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                                        {JSON.stringify(secretData, null, 2)}
                                    </pre>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    현재 토큰이 유효합니다.
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 text-gray-300 rounded-full mb-4">
                                    <Lock className="w-10 h-10" />
                                </div>
                                <p className="text-gray-400 font-medium text-lg">데이터가 로드되지 않았습니다.</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={fetchSecretData}
                        disabled={isLoading}
                        className={`w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? '통신 중...' : '비밀 데이터 가져오기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JWTDashboard;
