import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Bot, X, Edit3, Sparkles, Calendar as CalendarIcon, Clock, AlignLeft, Copy, Check, Wallet, Send, Settings } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import BottomNav from '../components/BottomNav';

const Schedule = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [meetingInfo, setMeetingInfo] = useState({ name: '로딩 중…', id: '', is_owner: false, role: null });
    const [isCopied, setIsCopied] = useState(false);

    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        try {
            const response = await fetch(`/api/meetings/${id}/schedules/`);
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    };

    useEffect(() => {
        const fetchMeetingDetail = async () => {
            try {
                const response = await fetch(`/api/meetings/${id}/`);
                if (response.ok) {
                    const data = await response.json();
                    setMeetingInfo({
                        name: data.name || '이름 없음',
                        id: data.id || id,
                        is_owner: !!data.is_owner,
                        role: data.role
                    });
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    if (response.status === 403) {
                        alert(errorData.error || '접근 권한이 없습니다.');
                        navigate('/main');
                    }
                }
            } catch (error) {
                console.error('Error fetching meeting details:', error);
            }
        };

        if (id) {
            fetchMeetingDetail();
            fetchEvents();
        }
    }, [id]);

    const handleCopyInviteCode = async () => {
        try {
            await navigator.clipboard.writeText(meetingInfo.id);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            alert('초대 코드가 복사되었습니다.');
        } catch (err) {
            console.error('Failed to copy logic:', err);
        }
    };

    const [selectionModalOpen, setSelectionModalOpen] = useState(false);
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [aiInputModalOpen, setAiInputModalOpen] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [parsedAiSchedule, setParsedAiSchedule] = useState(null);
    const [yearPickerOpen, setYearPickerOpen] = useState(false);
    const [tempYear, setTempYear] = useState(new Date().getFullYear());
    const [tempMonth, setTempMonth] = useState(new Date().getMonth());

    const handleAiSubmit = async (e) => {
        e.preventDefault();
        if (!aiInput.trim()) return;

        setIsAiLoading(true);
        setAiResponse('');
        setParsedAiSchedule(null);

        try {
            const response = await fetch('/api/ask_calendar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: aiInput,
                    current_date: selectedDate
                })
            });

            if (response.ok) {
                const data = await response.json();
                try {
                    // Extract JSON from markdown code blocks if present
                    let content = data.answer.trim();
                    if (content.startsWith('```json')) {
                        content = content.replace(/^```json/, '').replace(/```$/, '').trim();
                    } else if (content.startsWith('```')) {
                        content = content.replace(/^```/, '').replace(/```$/, '').trim();
                    }

                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    const jsonStr = jsonMatch ? jsonMatch[0] : content;
                    const parsed = JSON.parse(jsonStr);
                    setParsedAiSchedule(parsed);
                    setAiResponse(parsed.display_message || parsed.description);
                } catch (e) {
                    console.error('AI JSON Parse Error:', e);
                    // If parsing fails but we have a display_message like text, show it.
                    // Otherwise, show a friendly fallback.
                    if (data.answer && !data.answer.trim().startsWith('{')) {
                        setAiResponse(data.answer);
                    } else {
                        setAiResponse("죄송합니다. 일정을 분석하는 과정에서 잠시 혼선이 있었어요. 다시 한번 말씀해 주시겠어요?");
                    }
                }
            } else {
                alert('AI 분석 중 오류가 발생했습니다.');
            }
        } catch (error) {
            alert('서버와 통신할 수 없습니다.');
        } finally {
            setIsAiLoading(false);
        }
    };



    const applyAiToCalendar = async () => {
        if (!parsedAiSchedule) {
            setManualSchedule(prev => ({
                ...prev,
                title: aiInput.length > 20 ? aiInput.substring(0, 17) + '…' : aiInput,
                description: aiResponse
            }));
            setAiInputModalOpen(false);
            setAiResponse('');
            setAiInput('');
            setManualModalOpen(true);
            return;
        }

        try {
            const response = await fetch(`/api/meetings/${id}/schedules/create/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: parsedAiSchedule.title,
                    date: parsedAiSchedule.date || selectedDate,
                    time: parsedAiSchedule.time,
                    location: parsedAiSchedule.location,
                    description: parsedAiSchedule.description,
                    type: parsedAiSchedule.type
                })
            });

            if (response.ok) {
                setAiInputModalOpen(false);
                setAiResponse('');
                setAiInput('');
                setParsedAiSchedule(null);
                alert('일정이 성공적으로 등록되었습니다.');
                fetchEvents();
            } else {
                const data = await response.json();
                alert(data.error || '일정 등록에 실패했습니다.');
            }
        } catch (error) {
            alert('서버 오류가 발생했습니다.');
        }
    };

    const [manualSchedule, setManualSchedule] = useState({
        title: '',
        category: 'meeting',
        hour: '09',
        minute: '00',
        location: '',
        description: ''
    });

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/meetings/${id}/schedules/create/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: manualSchedule.title,
                    date: selectedDate,
                    time: `${manualSchedule.hour}:${manualSchedule.minute}`,
                    location: manualSchedule.location,
                    description: manualSchedule.description,
                    type: manualSchedule.category
                })
            });

            if (response.ok) {
                setManualModalOpen(false);
                setManualSchedule({ title: '', category: 'meeting', hour: '09', minute: '00', location: '', description: '' });
                alert('일정이 추가되었습니다.');
                fetchEvents();
            } else {
                const data = await response.json();
                alert(data.error || '일정 추가에 실패했습니다.');
            }
        } catch (error) {
            alert('서버 오류가 발생했습니다.');
        }
    };

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    });
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const goToPrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
    };

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const renderCalendar = () => {
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`pad-${i}`} className="bg-gray-50 min-h-[120px]"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

            days.push(
                <div
                    key={`day-${day}`}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`bg-white min-h-[120px] p-2 relative group hover:bg-blue-50/30 cursor-pointer transition-colors border-2 ${selectedDate === dateStr ? 'border-primary' : 'border-transparent'}`}
                >
                    <div className={`text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'text-blue-600 bg-blue-100' : 'text-gray-700'}`}>
                        {day}
                    </div>
                    <div className="relative z-10">
                        {dayEvents.map(evt => (
                            <div key={evt.id}>
                                <div className={`hidden md:block text-xs px-2 py-1 rounded mb-1 truncate ${evt.type === 'money' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {evt.title}
                                </div>
                                <div className="md:hidden flex justify-center mt-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${evt.type === 'money' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="hidden md:group-hover:flex absolute inset-0 items-center justify-center bg-black/5 rounded-lg transition-colors">
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(dateStr);
                                setSelectionModalOpen(true);
                            }}
                            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all transform hover:scale-110 z-20"
                        >
                            <Plus className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-16 md:pb-0">
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/main')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3">
                                <img src="/static/icon/logo.png" alt="Momo Logo" width={40} height={40} className="h-10 w-auto" />
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold">{meetingInfo.name}</h1>
                                    <button onClick={handleCopyInviteCode} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-muted-foreground flex items-center gap-1 group relative">
                                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 group-hover:text-primary transition-colors" />}
                                        <span className="text-xs font-medium text-gray-400 hidden sm:inline">#{meetingInfo.id}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {(meetingInfo.role === 'OWNER' || meetingInfo.role === 'ADMIN') && (
                                <button
                                    onClick={() => navigate(`/meeting/${id}/admin`)}
                                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground"
                                >
                                    <Settings className="w-6 h-6" />
                                </button>
                            )}
                            <div className="hidden md:flex items-center gap-3">
                                <button className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">일정</button>
                                <button onClick={() => navigate(`/meeting/${id}/dashboard`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">회비</button>
                                <button onClick={() => navigate(`/meeting/${id}/board`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">모임 게시판</button>
                                <button onClick={() => navigate(`/meeting/${id}/ocr`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">스마트 스캔</button>
                                {(meetingInfo.role === 'OWNER' || meetingInfo.role === 'ADMIN') && (
                                    <button onClick={() => navigate(`/meeting/${id}/admin`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">관리</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 group">
                            <h2 className="text-2xl font-bold">{currentYear}년 {currentMonth + 1}월</h2>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => {
                                    setTempYear(currentYear);
                                    setTempMonth(currentMonth);
                                    setYearPickerOpen(true);
                                }}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-400 hover:text-primary active:scale-95"
                                title="날짜 이동"
                            >
                                <CalendarIcon className="w-5 h-5" />
                            </button>
                            <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={goToToday} className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 text-sm font-medium">오늘</button>
                            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-border">
                        <div className="grid grid-cols-7 border-b border-border bg-gray-50">
                            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                                <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-px bg-gray-200">{renderCalendar()}</div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                                {selectedDate.split('-')[1]}월 {selectedDate.split('-')[2]}일 일정
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectionModalOpen(true)}
                                    className="p-2 bg-primary text-white rounded-full shadow-sm active:scale-95 transition-transform"
                                    aria-label="일정 추가하기"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-muted-foreground">{events.filter(e => e.date === selectedDate).length}개</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {events.filter(e => e.date === selectedDate).length > 0 ? (
                                events.filter(e => e.date === selectedDate).map(evt => (
                                    <div key={evt.id} onClick={() => navigate(`/meeting/${id}/detail/${evt.id}`)} className="bg-white p-4 rounded-xl shadow-sm border border-border flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${evt.type === 'money' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {evt.type === 'money' ? <Wallet className="w-6 h-6" /> : <CalendarIcon className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold truncate">{evt.title}</h4>
                                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{evt.time}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{evt.desc}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center bg-white rounded-xl border border-dashed border-border">
                                    <p className="text-muted-foreground">이날은 등록된 일정이 없습니다</p>
                                    <button onClick={() => setSelectionModalOpen(true)} className="mt-2 text-primary font-medium text-sm">일정 추가하기</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selectionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center overscroll-contain">
                        <h3 className="text-lg font-bold mb-6">일정 추가</h3>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => { setSelectionModalOpen(false); setManualModalOpen(true); }} className="flex items-center justify-center gap-3 p-4 border border-border rounded-xl hover:bg-blue-50 transition-colors group">
                                <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200"><Edit3 className="w-5 h-5 text-primary" /></div>
                                <div className="text-left"><p className="font-medium">수동 기입</p><p className="text-xs text-muted-foreground">직접 상세 내용을 입력합니다.</p></div>
                            </button>
                            <button onClick={() => { setSelectionModalOpen(false); setAiInputModalOpen(true); }} className="flex items-center justify-center gap-3 p-4 border border-border rounded-xl hover:bg-purple-50 transition-colors group">
                                <div className="p-2 bg-purple-100 rounded-full group-hover:bg-purple-200"><Sparkles className="w-5 h-5 text-purple-600" /></div>
                                <div className="text-left"><p className="font-medium">AI 일정 기입</p><p className="text-xs text-muted-foreground">AI에게 말하듯 일정을 생성합니다.</p></div>
                            </button>

                        </div>
                        <button onClick={() => setSelectionModalOpen(false)} className="mt-6 text-sm text-gray-500 hover:text-gray-800">취소</button>
                    </div>
                </div>
            )}

            {manualModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 overscroll-contain">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h3 className="text-xl font-bold">일정 수동 기입</h3>
                            <button onClick={() => setManualModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="scheduleTitle" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                                <input
                                    id="scheduleTitle"
                                    name="title"
                                    type="text"
                                    required
                                    value={manualSchedule.title}
                                    onChange={(e) => setManualSchedule({ ...manualSchedule, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="일정 제목을 입력하세요…"
                                />
                            </div>
                            <div>
                                <label htmlFor="scheduleCategory" className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                                <select
                                    id="scheduleCategory"
                                    name="category"
                                    value={manualSchedule.category}
                                    onChange={(e) => setManualSchedule({ ...manualSchedule, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="meeting">정기 모임 / 회의</option>
                                    <option value="money">회비 / 정산</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="scheduleHour" className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            id="scheduleHour"
                                            name="hour"
                                            value={manualSchedule.hour}
                                            onChange={(e) => setManualSchedule({ ...manualSchedule, hour: e.target.value })}
                                            className="flex-1 px-3 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => <option key={h} value={h}>{h}시</option>)}
                                        </select>
                                        <select
                                            id="scheduleMinute"
                                            name="minute"
                                            value={manualSchedule.minute}
                                            onChange={(e) => setManualSchedule({ ...manualSchedule, minute: e.target.value })}
                                            className="flex-1 px-3 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                                        >
                                            {['00', '10', '20', '30', '40', '50'].map(m => <option key={m} value={m}>{m}분</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="scheduleLocation" className="block text-sm font-medium text-gray-700 mb-1">장소</label>
                                    <input
                                        id="scheduleLocation"
                                        name="location"
                                        type="text"
                                        value={manualSchedule.location}
                                        onChange={(e) => setManualSchedule({ ...manualSchedule, location: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                        placeholder="장소를 입력하세요…"
                                        autoComplete="street-address"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="scheduleDescription" className="block text-sm font-medium text-gray-700 mb-1">상세 설명</label>
                                <textarea
                                    id="scheduleDescription"
                                    name="description"
                                    rows="3"
                                    value={manualSchedule.description}
                                    onChange={(e) => setManualSchedule({ ...manualSchedule, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                                    placeholder="상세 내용을 입력하세요…"
                                ></textarea>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setManualModalOpen(false)} className="flex-1 py-3 border border-border text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">취소</button>
                                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md">추가하기</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {aiInputModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 overscroll-contain">
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md"><Bot className="w-7 h-7 text-white" /></div>
                                <div><h3 className="text-xl font-bold">AI 일정 도우미</h3><p className="text-sm text-purple-100 italic">말씀 한마디로 일정을 짜드려요</p></div>
                            </div>
                            <button onClick={() => { setAiInputModalOpen(false); setAiResponse(''); setAiInput(''); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-8 flex-1 flex flex-col min-h-0 bg-slate-50">
                            {!aiResponse && !isAiLoading && (
                                <div className="bg-white border border-purple-100 p-6 rounded-2xl mb-8 shadow-sm">
                                    <div className="font-bold mb-2 flex items-center gap-1 text-purple-900"><Sparkles className="w-5 h-5 text-purple-500 shrink-0" /> 모모에게 이렇게 물어보세요</div>
                                    <div className="space-y-2.5 text-[13px] text-gray-700">
                                        <p><strong>지역:</strong> 상세한 위치를 알려주세요. (예: 마포구 망원동)</p>
                                        <p><strong>시간:</strong> 구체적인 시간 (예: 2월 20일 오후 7시)</p>
                                        <p><strong>내용:</strong> 모임의 성격 (예: 등산 활동, 회식 등)</p>
                                        <p><strong>인원:</strong> 함께하는 멤버 수 (예: 4명)</p>
                                    </div>
                                </div>
                            )}
                            {isAiLoading && <div className="flex-1 flex flex-col items-center justify-center py-12"><div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" aria-label="AI 분석 중…"></div><p className="text-purple-600 font-medium animate-pulse text-lg">AI가 최적의 일정을 분석하고 있어요…</p></div>}
                            {aiResponse && (
                                <div className="flex-1 bg-white border border-purple-100 p-6 rounded-2xl mb-6 overflow-y-auto max-h-[45vh] shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <Bot className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">MOMO 비서의 제안</h4>
                                            <p className="text-[11px] text-purple-500 font-medium">실시간 검색 결과를 바탕으로 구성했습니다</p>
                                        </div>
                                    </div>

                                    {parsedAiSchedule && (
                                        <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 shadow-inner space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-[12px] font-bold text-purple-700 border border-purple-100 shadow-sm">
                                                    {parsedAiSchedule.title}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
                                                    <CalendarIcon className="w-5 h-5 text-purple-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">날짜</p>
                                                        <p className="text-[13px] font-bold text-gray-900">{parsedAiSchedule.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
                                                    <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">시간</p>
                                                        <p className="text-[13px] font-bold text-gray-900">{parsedAiSchedule.time}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {parsedAiSchedule.location && (
                                                <div className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
                                                    <Edit3 className="w-5 h-5 text-purple-600 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">추천 장소</p>
                                                        <p className="text-[13px] font-bold text-gray-900 truncate">{parsedAiSchedule.location}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="relative text-gray-700 leading-relaxed text-sm bg-purple-50/30 p-4 rounded-xl border border-dashed border-purple-200">
                                        <div className="absolute -top-3 left-4 bg-white px-2 text-[11px] font-bold text-purple-400">설명</div>
                                        {aiResponse}
                                    </div>
                                </div>
                            )}
                            <form onSubmit={handleAiSubmit} className="relative mt-auto">
                                <input type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="어떤 일정을 만들어드릴까요?" disabled={isAiLoading} className="w-full pl-6 pr-14 py-4 bg-white border-2 border-purple-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 text-base shadow-sm transition-all" />
                                <button
                                    type="submit"
                                    disabled={isAiLoading || !aiInput.trim()}
                                    className="absolute right-2 top-2 p-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 active:scale-95 disabled:bg-gray-300 transition-all shadow-lg flex items-center justify-center"
                                    aria-label="AI에게 질문 전송"
                                >
                                    <Send className="w-6 h-6" />
                                </button>
                            </form>
                            {aiResponse && (
                                <div className="mt-4 flex flex-col gap-2">
                                    <button onClick={applyAiToCalendar} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"><CalendarIcon className="w-5 h-5" /> 캘린더에 적용하기</button>
                                    <div className="flex gap-3 text-sm">
                                        <button onClick={() => { setAiResponse(''); setAiInput(''); }} className="flex-1 py-3 border border-border text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors">다시 제안받기</button>
                                        <button onClick={() => { setAiInputModalOpen(false); setAiResponse(''); setAiInput(''); }} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors">닫기</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {yearPickerOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold flex items-center gap-2 text-gray-700">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                                날짜 이동
                            </h3>
                            <button onClick={() => setYearPickerOpen(false)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4 h-[250px] mb-6">
                                {/* Year Column */}
                                <div className="flex-1 flex flex-col">
                                    <p className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">연도</p>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                        {Array.from({ length: 21 }, (_, i) => 2020 + i).map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setTempYear(year)}
                                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${year === tempYear ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'}`}
                                            >
                                                {year}년
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Month Column */}
                                <div className="flex-1 flex flex-col">
                                    <p className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">월</p>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                        {Array.from({ length: 12 }, (_, i) => i).map(month => (
                                            <button
                                                key={month}
                                                onClick={() => setTempMonth(month)}
                                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${month === tempMonth ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'}`}
                                            >
                                                {month + 1}월
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setYearPickerOpen(false)}
                                    className="flex-1 py-3 border border-border text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentDate(new Date(tempYear, tempMonth, 1));
                                        setYearPickerOpen(false);
                                    }}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
                                >
                                    이동하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button onClick={() => setIsAIModalOpen(true)} className="fixed bottom-24 md:bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-transform hover:scale-105 z-40"><Bot className="w-8 h-8" /></button>
            <AIChatModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
            <BottomNav />
        </div>
    );
};

export default Schedule;
