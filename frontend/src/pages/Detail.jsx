import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, AlignLeft, Users, Bot, X, MessageSquare, Plus, Trash2, Edit3, Settings, Check, Copy } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import BottomNav from '../components/BottomNav';

const Detail = () => {
    const navigate = useNavigate();
    const { id, eventId } = useParams();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);
    const [meetingInfo, setMeetingInfo] = useState({ name: '', id: '', role: null }); // meetingName 대신 meetingInfo 사용
    const [isCopied, setIsCopied] = useState(false); // 초대코드 복사 상태 추가
    const [scheduleDetail, setScheduleDetail] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isAttending, setIsAttending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedSchedule, setEditedSchedule] = useState({
        title: '',
        date: '',
        hour: '09',
        minute: '00',
        location: '',
        description: '',
        type: 'meeting'
    });
    const [filterStatus, setFilterStatus] = useState('YES'); // 'YES', 'NO'

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/meetings/${id}/schedules/${eventId}/update/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editedSchedule.title,
                    date: editedSchedule.date,
                    time: `${editedSchedule.hour}:${editedSchedule.minute}`,
                    location: editedSchedule.location,
                    description: editedSchedule.description,
                    type: editedSchedule.type
                })
            });

            if (response.ok) {
                alert("일정이 수정되었습니다.");
                setIsEditModalOpen(false);
                fetchData();
            } else {
                const data = await response.json();
                alert(data.error || "수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("Error updating schedule:", error);
            alert("서버 오류가 발생했습니다.");
        }
    };

    const handleCopyInviteCode = async () => {
        try {
            await navigator.clipboard.writeText(id);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            alert('초대 코드가 복사되었습니다.');
        } catch (err) {
            console.error('Failed to copy logic:', err);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const meetingRes = await fetch(`/api/meetings/${id}/`);
            if (meetingRes.ok) {
                const meetingData = await meetingRes.json();
                setMeetingInfo({
                    name: meetingData.name || '이름 없음',
                    id: meetingData.id || id,
                    role: meetingData.role
                });
            }

            const scheduleRes = await fetch(`/api/meetings/${id}/schedules/${eventId}/`);
            if (scheduleRes.ok) {
                const scheduleData = await scheduleRes.json();
                setScheduleDetail(scheduleData);
            }

            const attendRes = await fetch(`/api/meetings/${id}/schedules/${eventId}/attendance/`);
            if (attendRes.ok) {
                const attendData = await attendRes.json();
                setParticipants(attendData.participants || []);
                setIsAttending(!!attendData.isAttending);
            }
        } catch (error) {
            console.error("Error fetching detail data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id && eventId) {
            fetchData();
        }
    }, [id, eventId]);

    const handleToggleAttendance = async (status) => {
        try {
            const response = await fetch(`/api/meetings/${id}/schedules/${eventId}/attendance/toggle/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                const attendRes = await fetch(`/api/meetings/${id}/schedules/${eventId}/attendance/`);
                if (attendRes.ok) {
                    const attendData = await attendRes.json();
                    setParticipants(attendData.participants || []);
                    setIsAttending(!!attendData.isAttending);
                }
                alert(status === 'YES' ? "참석 처리되었습니다." : "불참 처리되었습니다.");
            }
        } catch (error) {
            console.error("Error toggling attendance:", error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("정말로 이 일정을 삭제하시겠습니까?")) return;
        try {
            const response = await fetch(`/api/meetings/${id}/schedules/${eventId}/delete/`, { method: 'DELETE' });
            if (response.ok) {
                alert("일정이 삭제되었습니다.");
                navigate(`/meeting/${id}/schedule`);
            } else {
                const data = await response.json();
                alert(data.error || "삭제에 실패했습니다.");
            }
        } catch (error) {
            console.error("Error deleting schedule:", error);
            alert("서버 오류가 발생했습니다.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!scheduleDetail) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <p className="text-xl font-bold mb-4">일정을 찾을 수 없습니다.</p>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-primary text-white rounded-lg">뒤로 가기</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-16 md:pb-0">
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(`/meeting/${id}/schedule`)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3">
                                <img src="/static/icon/logo.png" alt="Momo Logo" width={40} height={40} className="h-10 w-auto" />
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold">{meetingInfo.name || '로딩 중...'}</h1>
                                    <button onClick={handleCopyInviteCode} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-muted-foreground flex items-center gap-1 group relative">
                                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 group-hover:text-primary transition-colors" />}
                                        <span className="text-xs font-medium text-gray-400 hidden sm:inline">#{id}</span>
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
                                <button onClick={() => navigate(`/meeting/${id}/schedule`)} className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">일정</button>
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
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-8 mb-8">
                        <div className="flex items-start justify-between mb-6">
                            <h2 className="text-3xl font-bold">{scheduleDetail.title}</h2>
                            <div className="flex items-center gap-1">
                                {scheduleDetail.canEdit && (
                                    <button
                                        onClick={() => { setEditedSchedule({ title: scheduleDetail.title, date: scheduleDetail.date, hour: scheduleDetail.time.split(':')[0], minute: scheduleDetail.time.split(':')[1], location: scheduleDetail.location || '', description: scheduleDetail.description || '', type: scheduleDetail.type }); setIsEditModalOpen(true); }}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                                        aria-label="일정 수정"
                                        title="일정 수정"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </button>
                                )}
                                {scheduleDetail.canDelete && (
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        aria-label="일정 삭제"
                                        title="일정 삭제"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary"><CalendarIcon className="w-5 h-5" /></div>
                                <div><p className="text-sm text-muted-foreground">날짜</p><p className="font-medium">{scheduleDetail.date}</p></div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary"><Clock className="w-5 h-5" /></div>
                                <div><p className="text-sm text-muted-foreground">시간</p><p className="font-medium">{scheduleDetail.time}</p></div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary"><MapPin className="w-5 h-5" /></div>
                                <div><p className="text-sm text-muted-foreground">장소</p><p className="font-medium">{scheduleDetail.location || '정보 없음'}</p></div>
                            </div>
                        </div>
                        <div className="border-t border-border pt-6 mb-8">
                            <h3 className="flex items-center gap-2 font-medium mb-3 text-gray-900"><AlignLeft className="w-5 h-5 text-primary" /> 상세 설명</h3>
                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">{scheduleDetail.description || '상세 내용이 없습니다.'}</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => handleToggleAttendance('YES')} disabled={isAttending} className={`flex-1 py-3 rounded-xl font-medium transition-all ${isAttending ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-primary text-white hover:opacity-90 active:scale-95'}`}>{isAttending ? '참석 확정됨' : '참석하기'}</button>
                            <button onClick={() => handleToggleAttendance('NO')} disabled={!isAttending} className={`flex-1 py-3 border rounded-xl font-medium transition-all ${!isAttending ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' : 'border-border text-gray-600 hover:bg-gray-50 active:scale-95'}`}>불참하기</button>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                <span className="whitespace-nowrap">참석 명단 ({participants.filter(p => p.status === filterStatus).length}명)</span>
                            </h3>
                            <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                                <button
                                    onClick={() => setFilterStatus('YES')}
                                    className={`px-3 py-1.5 rounded-md text-sm transition-all ${filterStatus === 'YES' ? 'bg-white shadow-sm text-primary font-bold' : 'text-muted-foreground hover:text-gray-900'}`}
                                >
                                    참석
                                </button>
                                <button
                                    onClick={() => setFilterStatus('NO')}
                                    className={`px-3 py-1.5 rounded-md text-sm transition-all ${filterStatus === 'NO' ? 'bg-white shadow-sm text-primary font-bold' : 'text-muted-foreground hover:text-gray-900'}`}
                                >
                                    불참
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {participants
                                .filter(p => p.status === filterStatus)
                                .map(p => (
                                    <div key={p.id} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-transparent hover:border-primary transition-colors cursor-pointer group">
                                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold mb-2 transition-colors ${p.status === 'YES' ? 'bg-blue-100 border-blue-200 text-primary' :
                                            'bg-red-50 border-red-100 text-red-500'
                                            }`}>
                                            {p.name[0]}
                                        </div>
                                        <p className="font-medium text-sm mb-1">{p.name}</p>
                                        <div className="flex flex-col items-center">
                                            {p.status === 'YES' ? (
                                                <>
                                                    <p className="text-sm font-bold text-green-600">참석 확정</p>
                                                    <p className="text-sm text-gray-400 font-medium">{p.date || '-'}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-bold text-red-500">불참</p>
                                                    <p className="text-sm text-gray-400 font-medium">{p.date || '미응답'}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={() => setIsAIModalOpen(true)} className="fixed bottom-24 md:bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-transform hover:scale-105 z-40"><Bot className="w-8 h-8" /></button>
            <AIChatModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-border flex items-center justify-between"><h3 className="text-xl font-bold">일정 수정</h3><button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-6 h-6" /></button></div>
                        <form onSubmit={handleUpdateSchedule} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                                <input id="editTitle" name="title" type="text" required value={editedSchedule.title} onChange={(e) => setEditedSchedule({ ...editedSchedule, title: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
                            </div>
                            <div>
                                <label htmlFor="editType" className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                                <select id="editType" name="type" value={editedSchedule.type} onChange={(e) => setEditedSchedule({ ...editedSchedule, type: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none">
                                    <option value="meeting">🛠 정기 모임 / 회의</option>
                                    <option value="money">💰 회비 / 정산</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="editDate" className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                                    <input id="editDate" name="date" type="date" required value={editedSchedule.date} onChange={(e) => setEditedSchedule({ ...editedSchedule, date: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="editHour" className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                                    <div className="flex items-center gap-1">
                                        <select id="editHour" name="hour" value={editedSchedule.hour} onChange={(e) => setEditedSchedule({ ...editedSchedule, hour: e.target.value })} className="flex-1 px-2 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm">
                                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (<option key={h} value={h}>{h}시</option>))}
                                        </select>
                                        <select id="editMinute" name="minute" value={editedSchedule.minute} onChange={(e) => setEditedSchedule({ ...editedSchedule, minute: e.target.value })} className="flex-1 px-2 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm">
                                            {['00', '10', '20', '30', '40', '50'].map(m => (<option key={m} value={m}>{m}분</option>))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="editLocation" className="block text-sm font-medium text-gray-700 mb-1">장소</label>
                                <input id="editLocation" name="location" type="text" value={editedSchedule.location} onChange={(e) => setEditedSchedule({ ...editedSchedule, location: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" placeholder="장소를 입력하세요…" />
                            </div>
                            <div>
                                <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">상세 설명</label>
                                <textarea id="editDescription" name="description" rows="3" value={editedSchedule.description} onChange={(e) => setEditedSchedule({ ...editedSchedule, description: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none" placeholder="상세 내용을 입력하세요…"></textarea>
                            </div>
                            <div className="pt-4 flex gap-3"><button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 border border-border text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">취소</button><button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md">수정 완료</button></div>
                        </form>
                    </div>
                </div>
            )}
            <BottomNav />
        </div>
    );
};

export default Detail;
