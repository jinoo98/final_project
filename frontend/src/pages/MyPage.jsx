import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, MapPin, UserCheck, Lock, Bell, Settings, Trash2, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState({
        email: '',
        nickname: '',
        adress: '',
        birthday: '',
        gender: ''
    });

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile/');
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            } else if (response.status === 401) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/profile/update/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            if (response.ok) {
                setIsEditing(false);
                alert('프로필이 저장되었습니다.');
            } else {
                const data = await response.json();
                alert(data.error || '저장 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            const response = await fetch('/api/profile/change-password/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: passwordData.currentPassword, new_password: passwordData.newPassword }),
            });
            if (response.ok) {
                alert('비밀번호가 성공적으로 변경되었습니다.');
                setIsPasswordModalOpen(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const data = await response.json();
                alert(data.error || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('Password change error:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    const confirmDeleteAccount = async (e) => {
        e.preventDefault();
        if (!deletePassword) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        if (window.confirm('정말 계정을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없으며 가입된 모든 모임에서 탈퇴 처리됩니다.')) {
            try {
                const response = await fetch('/api/profile/delete/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: deletePassword })
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message || '계정 삭제가 완료되었습니다. 그동안 이용해주셔서 감사합니다.');
                    navigate('/login');
                } else {
                    alert(data.error || '계정 삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('Delete account error:', error);
                alert('처리에 실패했습니다.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="로딩 중…"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/main')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="메인 페이지로 돌아가기"><ArrowLeft className="w-6 h-6" /></button>
                        <div className="flex items-center gap-3">
                            <img src="/static/icon/logo.png" alt="Momo Logo" width={40} height={40} className="h-10 w-auto" />
                            <h1 className="text-2xl font-bold">마이페이지</h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pb-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6 border border-gray-100">
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                            <div className="relative group"><div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden shadow-inner"><User className="w-12 h-12 text-white" /></div></div>
                            <div><h2 className="mb-2 text-2xl font-bold">{profile.nickname}</h2><p className="text-gray-500 font-medium">{profile.email}</p></div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4"><div className="p-2 bg-gray-50 rounded-lg"><User className="w-5 h-5 text-gray-400" /></div><div className="flex-1"><label htmlFor="nickname" className="block mb-2 text-sm font-bold text-gray-700">닉네임</label>{!isEditing ? (<p className="text-lg text-gray-900 font-medium">{profile.nickname}</p>) : (<input id="nickname" type="text" value={profile.nickname} onChange={(e) => setProfile({ ...profile, nickname: e.target.value })} className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" autoComplete="username" />)}</div></div>
                            <div className="flex items-start gap-4 opacity-70"><div className="p-2 bg-gray-50 rounded-lg"><Mail className="w-5 h-5 text-gray-400" /></div><div className="flex-1"><label className="block mb-2 text-sm font-bold text-gray-700">이메일</label><p className="text-lg text-gray-500 font-medium">{profile.email}</p></div></div>
                            <div className="flex items-start gap-4"><div className="p-2 bg-gray-50 rounded-lg"><MapPin className="w-5 h-5 text-gray-400" /></div><div className="flex-1"><label htmlFor="adress" className="block mb-2 text-sm font-bold text-gray-700">주소</label>{!isEditing ? (<p className="text-lg text-gray-900 font-medium">{profile.adress || '입력된 주소가 없습니다.'}</p>) : (<input id="adress" type="text" value={profile.adress} onChange={(e) => setProfile({ ...profile, adress: e.target.value })} placeholder="ex)OO시 OO동까지만 입력해주세요." className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" autoComplete="street-address" />)}</div></div>
                            <div className="flex items-start gap-4"><div className="p-2 bg-gray-50 rounded-lg"><Calendar className="w-5 h-5 text-gray-400" /></div><div className="flex-1"><label htmlFor="birthday" className="block mb-2 text-sm font-bold text-gray-700">생년월일</label>{!isEditing ? (<p className="text-lg text-gray-900 font-medium">{profile.birthday || '입력된 생년월일이 없습니다.'}</p>) : (<input id="birthday" type="date" value={profile.birthday} onChange={(e) => setProfile({ ...profile, birthday: e.target.value })} className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" autoComplete="bday" />)}</div></div>
                            <div className="flex items-start gap-4"><div className="p-2 bg-gray-50 rounded-lg"><UserCheck className="w-5 h-5 text-gray-400" /></div><div className="flex-1"><label className="block mb-2 text-sm font-bold text-gray-700">성별</label>{!isEditing ? (<p className="text-lg text-gray-900 font-medium">{profile.gender === 'M' ? '남성' : profile.gender === 'F' ? '여성' : '선택 안함'}</p>) : (<div className="flex gap-6 items-center h-[45px]"><label className="flex items-center gap-2 cursor-pointer group"><input type="radio" name="gender" value="M" checked={profile.gender === 'M'} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300" /><span className="text-base font-medium group-hover:text-blue-600 transition-colors">남성</span></label><label className="flex items-center gap-2 cursor-pointer group"><input type="radio" name="gender" value="F" checked={profile.gender === 'F'} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300" /><span className="text-base font-medium group-hover:text-blue-600 transition-colors">여성</span></label></div>)}</div></div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-100 flex gap-3">
                            {!isEditing ? (<button onClick={() => setIsEditing(true)} className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-md hover:shadow-lg transform active:scale-[0.98]">프로필 수정하기</button>) : (<><button onClick={() => setIsEditing(false)} className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-600">취소</button><button onClick={handleSave} className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-md hover:shadow-lg transform active:scale-[0.98]">변경 완료</button></>)}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                        <h3 className="mb-6 text-xl font-bold flex items-center gap-2">계정 관리 현황</h3>
                        <div className="grid grid-cols-1 gap-1">
                            <button onClick={() => setIsPasswordModalOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-all group border border-transparent hover:border-blue-100"><div className="flex items-center gap-4"><div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors"><Lock className="w-4 h-4 text-gray-500 group-hover:text-blue-600" /></div><span className="font-bold text-gray-700 group-hover:text-blue-700">비밀번호 변경</span></div><ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" /></button>
                            <button onClick={() => alert('알림 설정 페이지로 이동합니다. (준비 중)')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-all group border border-transparent hover:border-blue-100"><div className="flex items-center gap-4"><div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors"><Bell className="w-4 h-4 text-gray-500 group-hover:text-blue-600" /></div><span className="font-bold text-gray-700 group-hover:text-blue-700">알림 설정</span></div><ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" /></button>
                            <button onClick={() => setIsDeleteModalOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition-all group border border-transparent hover:border-red-100"><div className="flex items-center gap-4"><div className="p-2 bg-red-50 rounded-lg group-hover:bg-white transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></div><span className="font-bold text-red-500">계정 삭제</span></div><ChevronRight className="w-4 h-4 text-red-200 group-hover:text-red-400 group-hover:translate-x-1 transition-all" /></button>
                        </div>
                    </div>
                </div>
            </div>

            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 overscroll-contain">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Lock className="w-5 h-5 text-blue-600" /> 비밀번호 변경</h3><button onClick={() => setIsPasswordModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="비밀번호 변경 창 닫기"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                            <div><label htmlFor="currentPassword" name="currentPassword" className="block text-sm font-bold text-gray-700 mb-1.5">현재 비밀번호</label><input id="currentPassword" name="currentPassword" type="password" required value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} placeholder="현재 비밀번호를 입력해주세요…" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" autoComplete="current-password" /></div>
                            <div><label htmlFor="newPassword" name="newPassword" className="block text-sm font-bold text-gray-700 mb-1.5">새 비밀번호</label><input id="newPassword" name="newPassword" type="password" required value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="새 비밀번호를 입력해주세요…" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" autoComplete="new-password" /></div>
                            <div><label htmlFor="confirmPassword" name="confirmPassword" className="block text-sm font-bold text-gray-700 mb-1.5">새 비밀번호 확인</label><input id="confirmPassword" name="confirmPassword" type="password" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} placeholder="새 비밀번호를 한 번 더 입력해주세요…" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" autoComplete="new-password" /></div>
                            <div className="pt-4 flex gap-3"><button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-gray-600 transition-colors">취소</button><button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-md hover:shadow-lg transition-all transform active:scale-[0.98]">변경하기</button></div>
                        </form>
                    </div>
                </div>
            )}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 overscroll-contain">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50"><h3 className="text-xl font-bold text-red-600 flex items-center gap-2"><Trash2 className="w-5 h-5" /> 계정 삭제 확인</h3><button onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); }} className="p-2 hover:bg-white/50 rounded-lg transition-colors" aria-label="계정 삭제 확인 창 닫기"><X className="w-6 h-6 text-gray-400" /></button></div>
                        <form onSubmit={confirmDeleteAccount} className="p-6 space-y-4">
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">계정을 삭제하시려면 <span className="font-bold text-red-500">현재 비밀번호</span>를 입력해주세요.<br />삭제 후에는 모든 데이터가 소멸되며 복구할 수 없습니다.</p>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">비밀번호 확인</label><input type="password" required value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="비밀번호를 입력해주세요…" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-base" /></div>
                            <div className="pt-4 flex gap-3"><button type="button" onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); }} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-gray-600 transition-colors">취소</button><button type="submit" className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-md hover:shadow-lg transition-all transform active:scale-[0.98]">탈퇴하기</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPage;
