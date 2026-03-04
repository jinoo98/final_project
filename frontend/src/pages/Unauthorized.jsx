import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, Home } from 'lucide-react';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-border">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="w-10 h-10 text-red-600" /></div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h1>
                <p className="text-gray-600 mb-8 leading-relaxed">이 페이지를 볼 수 있는 권한이 없거나 로그인이 필요합니다.<br />서비스를 이용하시려면 로그인해주세요.</p>
                <div className="grid grid-cols-2 gap-4"><button onClick={() => navigate('/login')} className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md shadow-primary/20 active:scale-95"><LogIn className="w-4 h-4" /> 로그인하기</button><button onClick={() => navigate('/login')} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-border text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95"><Home className="w-4 h-4" /> 메인으로</button></div>
            </div>
        </div>
    );
};

export default Unauthorized;
