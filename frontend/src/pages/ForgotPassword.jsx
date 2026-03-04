import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const slides = [
        {
            image: "https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzAyMzM1NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            tagline: "일정 관리",
            subtitle: "모임의 일정을 한눈에 확인하세요"
        },
        {
            image: "https://images.unsplash.com/photo-1573166953836-06864dc70a21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjZXNzZnVsJTIwYnVzaW5lc3MlMjBwZW9wbGV8ZW58MXx8fHwxNzcwMjIzNzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080",
            tagline: "회비 대시보드",
            subtitle: "회비의 지출을 한눈에 확인하세요"
        },
        {
            image: "https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBwcm9kdWN0aXZpdHklMjBvZmZpY2V8ZW58MXx8fHwxNzcwMTk4NzY4fDA&ixlib=rb-4.1.0&q=80&w=1080",
            tagline: "현금 영수증 OCR",
            subtitle: "영수증을 업로드하고 자동으로 지출 내역을 기록하세요"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
                setIsAnimating(false);
            }, 500);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <div className="flex min-h-screen font-sans">
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-purple-700 overflow-hidden">
                <div className={`absolute inset-0 transition-opacity duration-700 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}><img src={slides[currentSlide].image} alt="Background" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-purple-700/80"></div></div>
                <div className="relative h-full w-full flex flex-col justify-end p-12 text-white z-10"><div className={`mb-8 transition-all duration-500 transform ${isAnimating ? 'translate-y-5 opacity-0' : 'translate-y-0 opacity-100'}`}><h2 className="text-4xl font-medium mb-4">{slides[currentSlide].tagline}</h2><p className="text-xl text-white/90">{slides[currentSlide].subtitle}</p></div><div className="flex gap-2">{slides.map((_, index) => (<button key={index} onClick={() => setCurrentSlide(index)} className={`h-1 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-6 bg-white/40 hover:bg-white/60'}`} />))}</div></div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
                    title="뒤로 가기"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="w-full max-w-md">
                    <div className="mb-8"><h1 className="text-3xl font-medium mb-2">비밀번호 찾기</h1><p className="text-gray-600">가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p></div>
                    <form className="space-y-6"><div><label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">이메일</label><input type="email" id="email" name="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="example@email.com" required /></div><button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md">비밀번호 재설정 이메일 보내기</button></form>
                    <div className="text-center mt-8"><Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">로그인으로 돌아가기</Link></div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
