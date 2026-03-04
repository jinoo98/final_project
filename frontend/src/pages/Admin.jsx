import { useState, useEffect } from 'react';
import { usePushNotification } from '../hooks/usePushNotification';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, UserX, Clock, Users, Shield, CheckCircle, Trash2, Copy, Check, Bell } from 'lucide-react';

const Admin = () => {
    usePushNotification();
    const { id } = useParams();
    const navigate = useNavigate();
    const [pendingMembers, setPendingMembers] = useState([]);
    const [approvedMembers, setApprovedMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [meetingName, setMeetingName] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

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

    const fetchAdminData = async () => {
        try {
            const detailRes = await fetch(`/api/meetings/${id}/`);
            if (detailRes.ok) {
                const detailData = await detailRes.json();
                setMeetingName(detailData.name);
                setUserRole(detailData.role);
                setIsOwner(detailData.is_owner);

                if (detailData.role !== 'OWNER' && detailData.role !== 'ADMIN') {
                    alert('방장 또는 관리자만 접근 가능한 페이지입니다.');
                    navigate(`/meeting/${id}/schedule`);
                    return;
                }
            }

            const pendingRes = await fetch(`/api/meetings/${id}/pending/`);
            if (pendingRes.ok) {
                const pendingData = await pendingRes.json();
                setPendingMembers(pendingData);
            }

            const membersRes = await fetch(`/api/meetings/${id}/members/`);
            if (membersRes.ok) {
                const membersData = await membersRes.json();
                setApprovedMembers(membersData);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, [id, navigate]);

    const handleAction = async (memberId, action) => {
        try {
            const response = await fetch(`/api/meetings/${id}/approve/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ member_id: memberId, action })
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                if (action === 'APPROVE') {
                    const approvedMember = pendingMembers.find(m => m.member_id === memberId);
                    if (approvedMember) {
                        setApprovedMembers(prev => [...prev, { ...approvedMember, joined_at: new Date().toISOString() }]);
                    }
                }
                setPendingMembers(prev => prev.filter(m => m.member_id !== memberId));
            } else {
                const errorData = await response.json();
                alert(errorData.error || '처리에 실패했습니다.');
            }
        } catch (error) {
            console.error('Action error:', error);
            alert('오류가 발생했습니다.');
        }
    };

    const handleChangeRole = async (memberId, currentRole) => {
        const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
        const actionText = newRole === 'ADMIN' ? '관리자로 지정' : '일반 회원으로 변경';

        if (!window.confirm(`${actionText}하시겠습니까?`)) return;

        try {
            const response = await fetch(`/api/meetings/${id}/change-role/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ member_id: memberId, new_role: newRole })
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                setApprovedMembers(prev => prev.map(m =>
                    m.member_id === memberId ? { ...m, role: newRole } : m
                ));
            } else {
                const errorData = await response.json();
                alert(errorData.error || '처리에 실패했습니다.');
            }
        } catch (error) {
            console.error('Role change error:', error);
            alert('오류가 발생했습니다.');
        }
    };

    const handleDeleteMeeting = async () => {
        if (!window.confirm(`'${meetingName}' 모임을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
        try {
            const response = await fetch(`/api/meetings/${id}/delete/`, { method: 'POST' });
            if (response.ok) {
                alert('모임이 성공적으로 삭제되었습니다.');
                navigate('/main');
            } else {
                const data = await response.json();
                alert(data.error || '모임 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Delete meeting error:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-label="로딩 중…"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/main')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="메인 페이지로 돌아가기"><ArrowLeft className="w-6 h-6" /></button>
                            <div className="flex items-center gap-3">
                                <img src="/static/icon/logo.png" alt="Momo Logo" width={40} height={40} className="h-10 w-auto" />
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold">{meetingName}</h1>
                                    <button onClick={handleCopyInviteCode} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-muted-foreground flex items-center gap-1 group relative" aria-label="초대 코드 복사">
                                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 group-hover:text-primary transition-colors" />}
                                        <span className="text-xs font-medium text-gray-400">#{id}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <button onClick={() => navigate(`/meeting/${id}/schedule`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">일정</button>
                            <button onClick={() => navigate(`/meeting/${id}/dashboard`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">회비</button>
                            <button onClick={() => navigate(`/meeting/${id}/board`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">모임 게시판</button>
                            <button onClick={() => navigate(`/meeting/${id}/ocr`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">스마트 스캔</button>
                            <button className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">관리</button>
                            {isOwner && approvedMembers.length === 1 && pendingMembers.length === 0 && (
                                <button onClick={handleDeleteMeeting} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all font-bold text-sm border border-red-100 ml-2"><Trash2 className="w-4 h-4" /> 모임 삭제</button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" /> 가입 신청 대기 목록<span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">{pendingMembers.length}</span></h2>
                        </div>
                        <div className="space-y-4">
                            {pendingMembers.length > 0 ? (
                                pendingMembers.map((member) => (
                                    <div key={member.member_id} className="bg-white p-4 rounded-xl border border-border shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-gray-400" /></div><div><h3 className="font-bold">{member.user_name}</h3><p className="text-sm text-muted-foreground">{member.email}</p></div></div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAction(member.member_id, 'REJECT')} className="flex-1 sm:flex-none px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors">거절</button>
                                                <button onClick={() => handleAction(member.member_id, 'APPROVE')} className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors">승인</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (<div className="bg-white py-12 px-4 rounded-xl border border-dashed border-border text-center"><p className="text-muted-foreground text-sm">대기 중인 가입 신청이 없습니다.</p></div>)}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> 가입된 회원 목록<span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">{approvedMembers.length}</span></h2>
                        </div>
                        <div className="space-y-4">
                            {approvedMembers.length > 0 ? (
                                approvedMembers.map((member) => (
                                    <div key={member.member_id} className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Users className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold">{member.user_name}</h3>
                                                    {member.role === 'OWNER' && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">방장</span>}
                                                    {member.role === 'ADMIN' && <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">관리자</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch(`/api/meetings/${id}/notifications/send/`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                member_id: member.member_id,
                                                                type: 'FEE_REMINDER'
                                                            })
                                                        });
                                                        if (response.ok) {
                                                            alert(`${member.user_name}님에게 알림을 전송했습니다.`);
                                                        } else {
                                                            const data = await response.json();
                                                            alert(data.error || '알림 전송에 실패했습니다.');
                                                        }
                                                    } catch (error) {
                                                        console.error('Send notification error:', error);
                                                        alert('오류가 발생했습니다.');
                                                    }
                                                }}
                                                className="p-2 hover:bg-orange-50 rounded-lg text-muted-foreground hover:text-orange-500 transition-colors border border-transparent hover:border-orange-100"
                                                aria-label={`${member.user_name}님에게 알림 보내기`}
                                                title="알림 보내기"
                                            >
                                                <Bell className="w-4 h-4" />
                                            </button>
                                            {member.role !== 'OWNER' && isOwner && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleChangeRole(member.member_id, member.role)} className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${member.role === 'ADMIN' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>{member.role === 'ADMIN' ? '관리자 해제' : '관리자 지정'}</button>
                                                    <button onClick={async () => {
                                                        if (window.confirm(`${member.user_name}님에게 방장 권한을 위임하시겠습니까? 위임 후에는 관리자로 권한이 변경됩니다.`)) {
                                                            try {
                                                                const response = await fetch(`/api/meetings/${id}/change-role/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member_id: member.member_id, new_role: 'OWNER' }) });
                                                                if (response.ok) { const data = await response.json(); alert(data.message); navigate(`/meeting/${id}/schedule`); } else { const errorData = await response.json(); alert(errorData.error || '처리에 실패했습니다.'); }
                                                            } catch (error) { console.error('Delegate error:', error); alert('오류가 발생했습니다.'); }
                                                        }
                                                    }} className="px-2 py-1 bg-primary text-white rounded text-[11px] font-medium hover:opacity-90 transition-opacity">방장 위임</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (<div className="bg-white py-12 px-4 rounded-xl border border-dashed border-border text-center"><p className="text-muted-foreground text-sm">가입된 회원이 없습니다.</p></div>)}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Admin;
