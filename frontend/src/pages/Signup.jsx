import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        password: '',
        confirm_password: '',
        adress: '',
        birthday: '',
        gender: ''
    });

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailChecked, setIsEmailChecked] = useState(false);
    const [isEmailAvailable, setIsEmailAvailable] = useState(false);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'email') {
            setIsEmailChecked(false);
            setIsEmailAvailable(false);
        }
    };

    const checkEmailDuplication = async () => {
        if (!formData.email) {
            alert('이메일을 입력해주세요.');
            return;
        }
        try {
            const response = await fetch('/api/check-email/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });
            const data = await response.json();
            if (response.ok) {
                setIsEmailChecked(true);
                setIsEmailAvailable(data.available);
                if (!data.available) {
                    alert('이미 사용 중인 이메일입니다.');
                }
            } else {
                alert(data.error || '이메일 중복 확인 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Email check error:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEmailChecked || !isEmailAvailable) {
            alert('이메일 중복 확인이 필요합니다.');
            return;
        }

        if (formData.password !== formData.confirm_password) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    nickname: formData.nickname,
                    password: formData.password,
                    address: formData.adress,
                    birth_date: formData.birthday,
                    gender: formData.gender
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('회원가입이 완료되었습니다. 메인 페이지로 이동합니다.');
                window.location.href = '/main';
            } else {
                alert(data.error || '회원가입 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const isPasswordMatch = formData.password && formData.confirm_password && formData.password === formData.confirm_password;

    return (
        <div className="flex min-h-screen font-sans">
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-purple-700 overflow-hidden">
                <div className={`absolute inset-0 transition-opacity duration-700 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <img src={slides[currentSlide].image} alt="Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-purple-700/80"></div>
                </div>
                <div className="relative h-full w-full flex flex-col justify-end p-12 text-white z-10">
                    <div className={`mb-8 transition-all duration-500 transform ${isAnimating ? 'translate-y-5 opacity-0' : 'translate-y-0 opacity-100'}`}>
                        <h2 className="text-4xl font-medium mb-4">{slides[currentSlide].tagline}</h2>
                        <p className="text-xl text-white/90">{slides[currentSlide].subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-6 bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-white overflow-y-auto relative">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
                    title="뒤로 가기"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="w-full max-w-md py-8">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-2">
                            <img src="/static/icon/logo.png" alt="Momo Logo" width={48} height={48} className="h-12 w-auto" />
                            <h1 className="text-3xl font-medium">Momo</h1>
                        </div>
                        <p className="text-gray-600 text-center px-4">회원가입하고 모임을 시작하세요</p>
                    </div>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">이메일</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm sm:text-base ${isEmailChecked ? (isEmailAvailable ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-300'}`}
                                    placeholder="이메일을 입력해주세요…"
                                    autoComplete="email"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={checkEmailDuplication}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                    중복 확인
                                </button>
                            </div>
                            {isEmailChecked && (
                                <p className={`text-xs mt-1 ${isEmailAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                    {isEmailAvailable ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium mb-1 text-gray-700">닉네임</label>
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm sm:text-base"
                                placeholder="닉네임을 입력해주세요…"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700">비밀번호</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm sm:text-base"
                                placeholder="비밀번호를 입력해주세요…"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirm_password" className="block text-sm font-medium mb-1 text-gray-700">비밀번호 확인</label>
                            <input
                                type="password"
                                id="confirm_password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-shadow text-sm sm:text-base ${formData.confirm_password ? (isPasswordMatch ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500') : 'border-gray-300 focus:ring-blue-500'}`}
                                placeholder="비밀번호를 한 번 더 입력해주세요…"
                                autoComplete="new-password"
                                required
                            />
                            {formData.confirm_password && (
                                <p className={`text-xs mt-1 ${isPasswordMatch ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPasswordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="adress" className="block text-sm font-medium mb-1 text-gray-700">주소</label>
                            <input
                                type="text"
                                id="adress"
                                name="adress"
                                value={formData.adress}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                placeholder="ex)OO시 OO동 까지만 입력해주세요…"
                                autoComplete="street-address"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="birthday" className="block text-sm font-medium mb-1 text-gray-700">생년월일</label>
                                <input
                                    type="date"
                                    id="birthday"
                                    name="birthday"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                    autoComplete="bday"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">성별</label>
                                <div className="flex gap-4 items-center h-[42px]">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="gender" value="M" checked={formData.gender === 'M'} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">남성</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="gender" value="F" checked={formData.gender === 'F'} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">여성</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !isEmailAvailable || !isEmailChecked}
                            className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md ${isLoading || !isEmailAvailable || !isEmailChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? '가입 중…' : '회원가입'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-600 mt-8">
                        이미 계정이 있으신가요?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">로그인</Link>
                    </p>
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">소셜 계정으로 가입하기</span></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <a href="/accounts/google/login/?process=login" className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Google 계정으로 회원가입">
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Google</span>
                        </a>
                        <a href="/accounts/naver/login/?process=login" className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: '#03C75A' }} aria-label="Naver 계정으로 회원가입">
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none"><path d="M16.273 12.845L7.376 0H0V24H7.726V11.155L16.624 24H24V0H16.273V12.845Z" fill="#FFFFFF" /></svg>
                            <span className="text-sm font-bold text-white">Naver</span>
                        </a>
                        <a href="/accounts/kakao/login/?process=login" className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors w-full" style={{ backgroundColor: '#FEE500' }} aria-label="Kakao 계정으로 회원가입">
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M12 3C6.477 3 2 6.483 2 10.783C2 13.593 3.863 16.035 6.647 17.433L5.469 21.803C5.405 22.042 5.688 22.24 5.897 22.099L11.082 18.599C11.385 18.614 11.69 18.621 12 18.621C17.523 18.621 22 15.138 22 10.838C22 6.538 17.523 3.055 12 3.055V3Z" fill="#191919" /></svg>
                            <span className="text-sm font-medium text-gray-700">Kakao</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
