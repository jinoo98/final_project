import { useState, useEffect } from 'react';
import { User, LogOut, Plus, UserPlus, Users, Calendar, UserMinus, X, Bot, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';

// 👇 새로 추가: firebase.js에서 만들어둔 토큰 요청 함수 불러오기
import { requestFcmToken } from '../firebase';

const Main = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [meetings, setMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMeetingName, setNewMeetingName] = useState('');
    const [newMeetingDescription, setNewMeetingDescription] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const fetchMeetings = async () => {
        try {
            const response = await fetch('/api/meetings/');
            if (response.ok) {
                const data = await response.json();
                setMeetings(data.meetings || []);
            } else if (response.status === 401) {
                navigate('/login');
            } else {
                console.error('Failed to fetch meetings');
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, [navigate]);

    // 👇 새로 추가: 메인 화면이 켜질 때 알림 권한을 묻고 토큰을 가져오는 useEffect
    useEffect(() => {
        const setupFCM = async () => {
            const token = await requestFcmToken();
            if (token) {
                console.log("✅ 메인 페이지에서 토큰 수신 완료:", token);

                // 백엔드로 토큰 전송
                try {
                    const response = await fetch('/api/save-fcm-token/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: token })
                    });

                    if (response.ok) {
                        console.log("✅ 서버에 토큰 저장 성공!");
                    } else {
                        console.error("❌ 서버에 토큰 저장 실패");
                    }
                } catch (error) {
                    console.error("❌ 서버 통신 에러:", error);
                }
            }
        };

        setupFCM();
    }, []);

    const handleJoinMeeting = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/meetings/join/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invite_code: inviteCode }),
            });
            if (response.ok) {
                const data = await response.json();
                alert(data.message || '가입 신청이 완료되었습니다.');
                setIsJoinModalOpen(false);
                setInviteCode('');
                fetchMeetings();
            } else {
                const errorData = await response.json();
                alert(errorData.error || '가입 신청에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error joining meeting:', error);
            alert('오류가 발생했습니다.');
        }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/meetings/create/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newMeetingName, description: newMeetingDescription }),
            });
            if (response.ok) {
                alert('모임이 성공적으로 생성되었습니다.');
                setIsCreateModalOpen(false);
                setNewMeetingName('');
                setNewMeetingDescription('');
                fetchMeetings();
            } else {
                const errorData = await response.json();
                alert(errorData.error || '모임 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            alert('오류가 발생했습니다.');
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/logout/', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        }
        navigate('/login');
    };

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans">
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/static/icon/logo.png" alt="Momo Logo" width={40} height={40} className="h-10 w-auto" />
                            <h1 className="text-2xl font-bold">momo</h1>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => navigate('/mypage')}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm sm:text-base text-muted-foreground hover:text-black transition-colors"
                                aria-label="마이페이지로 이동"
                            >
                                <User className="w-5 h-5 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">마이페이지</span>
                            </button>
                            <button onClick={handleLogout} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm sm:text-base text-muted-foreground hover:text-black transition-colors">
                                <LogOut className="w-5 h-5 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">로그아웃</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">내 모임</h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity font-medium shadow-sm"
                                aria-label="새 모임 만들기"
                            >
                                <Plus className="w-5 h-5" /> <span className="whitespace-nowrap">모임 만들기</span>
                            </button>
                            <button
                                onClick={() => setIsJoinModalOpen(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-xl hover:bg-blue-50 transition-colors font-medium"
                                aria-label="모임 가입하기"
                            >
                                <UserPlus className="w-5 h-5" /> <span className="whitespace-nowrap">모임 가입</span>
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
                    ) : meetings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {meetings.map((meeting) => (
                                <div key={meeting.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4"><div className="flex-1"><h3 className="mb-2 font-medium text-lg">{meeting.title}</h3><p className="text-sm text-muted-foreground line-clamp-2 mb-3">{meeting.description}</p></div>{meeting.isOwner && <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">방장</span>}</div>
                                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground"><div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{meeting.members}명</span></div><div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{meeting.date}</span></div></div>
                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg"><p className="text-sm text-muted-foreground mb-1">현재 잔액</p><p className="text-xl text-primary font-bold">{meeting.balance}</p></div>
                                    <div className="flex gap-2">
                                        <button onClick={() => navigate(`/meeting/${meeting.id}/schedule`)} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium">입장</button>
                                        {!meeting.isOwner && (
                                            <button onClick={async () => { if (window.confirm('정말로 이 모임에서 탈퇴하시겠습니까?')) { try { const response = await fetch(`/api/meetings/${meeting.id}/leave/`, { method: 'POST' }); if (response.ok) { const data = await response.json(); alert(data.message); fetchMeetings(); } else { const errorData = await response.json(); alert(errorData.error || '탈퇴 처리에 실패했습니다.'); } } catch (error) { console.error('Leave error:', error); alert('오류가 발생했습니다.'); } } }} className="px-4 py-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-bold text-sm">탈퇴</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl shadow-sm"><Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" /><p className="text-xl font-medium text-gray-500">참여 중인 모임이 없습니다.</p><p className="text-muted-foreground mt-2">새로운 모임을 만들거나 가입해보세요.</p></div>
                    )}
                </div>
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="mb-6 text-xl font-medium">새 모임 만들기</h2>
                        <form className="space-y-4" onSubmit={handleCreateMeeting}>
                            <div>
                                <label htmlFor="meetingName" className="block mb-2 font-medium">모임 이름</label>
                                <input
                                    id="meetingName"
                                    name="meetingName"
                                    type="text"
                                    placeholder="예: 독서 모임…"
                                    value={newMeetingName}
                                    onChange={(e) => setNewMeetingName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    autoComplete="organization"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="meetingDescription" className="block mb-2 font-medium">모임 설명</label>
                                <textarea
                                    id="meetingDescription"
                                    name="meetingDescription"
                                    placeholder="모임에 대한 간단한 설명을 적어주세요…"
                                    rows="4"
                                    value={newMeetingDescription}
                                    onChange={(e) => setNewMeetingDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    required
                                ></textarea>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors">취소</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium">만들기</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isJoinModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="mb-6 text-xl font-medium">모임 가입하기</h2>
                        <form className="space-y-4" onSubmit={handleJoinMeeting}>
                            <div>
                                <label htmlFor="inviteCode" className="block mb-2 font-medium">초대 코드</label>
                                <input
                                    id="inviteCode"
                                    name="inviteCode"
                                    type="text"
                                    placeholder="초대 코드를 입력하세요…"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    autoComplete="off"
                                    required
                                />
                                <p className="text-sm text-muted-foreground mt-2">모임장에게 받은 초대 코드를 입력해주세요</p>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsJoinModalOpen(false)} className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors">취소</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium">가입 신청</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <button onClick={() => setIsAIModalOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-transform hover:scale-105 z-40"><Bot className="w-8 h-8" /></button>
            <AIChatModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
        </div>
    );
};

export default Main;