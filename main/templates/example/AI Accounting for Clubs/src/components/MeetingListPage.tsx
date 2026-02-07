import { useState } from 'react';
import { Plus, Users, Calendar, Settings, LogOut, Search, UserPlus, UserMinus } from 'lucide-react';

interface Meeting {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  balance: number;
  createdAt: string;
  isOwner: boolean;
  isMember: boolean;
}

interface MeetingListPageProps {
  onSelectMeeting: (meetingId: string) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export function MeetingListPage({ onSelectMeeting, onOpenSettings, onLogout }: MeetingListPageProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMeetingName, setNewMeetingName] = useState('');
  const [newMeetingDescription, setNewMeetingDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      name: '독서 모임',
      description: '매주 토요일 책을 읽고 토론하는 모임입니다',
      memberCount: 8,
      balance: 40000,
      createdAt: '2026-01-15',
      isOwner: true,
      isMember: true,
    },
    {
      id: '2',
      name: '등산 동호회',
      description: '주말마다 함께 산을 오르는 동호회',
      memberCount: 12,
      balance: 150000,
      createdAt: '2026-01-20',
      isOwner: false,
      isMember: true,
    },
    {
      id: '3',
      name: '스터디 그룹',
      description: '프로그래밍 스터디 그룹',
      memberCount: 5,
      balance: 25000,
      createdAt: '2026-02-01',
      isOwner: false,
      isMember: true,
    },
  ]);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      name: newMeetingName,
      description: newMeetingDescription,
      memberCount: 1,
      balance: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isOwner: true,
      isMember: true,
    };
    setMeetings([...meetings, newMeeting]);
    setNewMeetingName('');
    setNewMeetingDescription('');
    setShowCreateModal(false);
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock join functionality
    alert(`모임 코드 "${joinCode}"로 가입 요청을 보냈습니다.`);
    setJoinCode('');
    setShowJoinModal(false);
  };

  const handleLeaveMeeting = (meetingId: string) => {
    if (confirm('정말로 이 모임에서 탈퇴하시겠습니까?')) {
      setMeetings(meetings.filter(m => m.id !== meetingId));
    }
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                <span className="text-white text-lg">mo</span>
              </div>
              <h1 className="text-2xl">momo</h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="w-5 h-5" />
                설정
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-5 h-5" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title and Actions */}
          <div className="mb-8">
            <h2 className="mb-6">내 모임</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="모임 검색..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                모임 만들기
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                모임 가입
              </button>
            </div>
          </div>

          {/* Meetings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeetings.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {searchTerm ? '검색 결과가 없습니다' : '아직 가입한 모임이 없습니다'}
                </p>
              </div>
            ) : (
              filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="mb-2">{meeting.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {meeting.description}
                      </p>
                    </div>
                    {meeting.isOwner && (
                      <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                        방장
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{meeting.memberCount}명</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{meeting.createdAt}</span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">현재 잔액</p>
                    <p className="text-xl text-primary">
                      {meeting.balance.toLocaleString()}원
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectMeeting(meeting.id)}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                      입장
                    </button>
                    {!meeting.isOwner && (
                      <button
                        onClick={() => handleLeaveMeeting(meeting.id)}
                        className="px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <UserMinus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="mb-6">새 모임 만들기</h2>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label htmlFor="meetingName" className="block mb-2">
                  모임 이름
                </label>
                <input
                  id="meetingName"
                  type="text"
                  value={newMeetingName}
                  onChange={(e) => setNewMeetingName(e.target.value)}
                  placeholder="예: 독서 모임"
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="meetingDescription" className="block mb-2">
                  모임 설명
                </label>
                <textarea
                  id="meetingDescription"
                  value={newMeetingDescription}
                  onChange={(e) => setNewMeetingDescription(e.target.value)}
                  placeholder="모임에 대해 간단히 설명해주세요"
                  rows={4}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  만들기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Meeting Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="mb-6">모임 가입하기</h2>
            <form onSubmit={handleJoinMeeting} className="space-y-4">
              <div>
                <label htmlFor="joinCode" className="block mb-2">
                  초대 코드
                </label>
                <input
                  id="joinCode"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="초대 코드를 입력하세요"
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-sm text-muted-foreground mt-2">
                  모임장에게 받은 초대 코드를 입력해주세요
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  가입하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
