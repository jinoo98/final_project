import { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react';

interface MyPageProps {
  onBack: () => void;
}

export function MyPage({ onBack }: MyPageProps) {
  const [userData, setUserData] = useState({
    name: '김철수',
    email: 'kimcs@example.com',
    phone: '010-1234-5678',
    joinDate: '2026-01-15',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...userData });

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                <span className="text-white text-lg">mo</span>
              </div>
              <h1 className="text-2xl">마이페이지</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="mb-2">{userData.name}</h2>
                <p className="text-muted-foreground">{userData.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <User className="w-5 h-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <label className="block mb-2">이름</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-lg">{userData.name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <label className="block mb-2">이메일</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-lg">{userData.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <label className="block mb-2">전화번호</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-lg">{userData.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <label className="block mb-2">가입일</label>
                  <p className="text-lg">{userData.joinDate}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    저장
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  프로필 수정
                </button>
              )}
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="mb-4">계정 설정</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                비밀번호 변경
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                알림 설정
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-destructive">
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
