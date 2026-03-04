import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, ThumbsUp, Calendar, Plus, Bot, X, Image as ImageIcon, LayoutGrid, List, Trash2, Copy, Check, Settings, Pin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import BottomNav from '../components/BottomNav';

const Board = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostDate, setNewPostDate] = useState(new Date().toISOString().split('T')[0]);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImages, setNewPostImages] = useState([]); // Array of { file, preview }
    const [isNotice, setIsNotice] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [viewType, setViewType] = useState('gallery'); // 'gallery' or 'list'
    const [posts, setPosts] = useState([]);
    const [meetingName, setMeetingName] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [role, setRole] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [replyTo, setReplyTo] = useState(null); // { id, author }
    const itemsPerPage = 15;

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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
        fetchMeetingDetail();
    }, [id]);

    const fetchMeetingDetail = async () => {
        try {
            const response = await fetch(`/api/meetings/${id}/`);
            if (response.ok) {
                const data = await response.json();
                setMeetingName(data.name);
                setIsOwner(!!data.is_owner);
                setRole(data.role);
            }
        } catch (error) {
            console.error("Error fetching meeting detail:", error);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await fetch(`/api/meetings/${id}/posts/`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setIsLoading(false);
            setCurrentPage(1);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (newPostImages.length + files.length > 10) {
            alert('사진은 최대 10장까지 업로드할 수 있습니다.');
            return;
        }

        const newEntries = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setNewPostImages(prev => [...prev, ...newEntries]);
    };

    const removeImage = (index) => {
        setNewPostImages(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        let uploadedImageUrls = [];

        for (const item of newPostImages) {
            const formData = new FormData();
            formData.append('image', item.file);
            try {
                const uploadRes = await fetch(`/api/meetings/${id}/posts/upload/`, { method: 'POST', body: formData });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    uploadedImageUrls.push(uploadData.imageUrl);
                }
            } catch (error) {
                console.error("Image upload failed:", error);
            }
        }

        try {
            const response = await fetch(`/api/meetings/${id}/posts/create/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newPostTitle,
                    content: newPostContent,
                    date: newPostDate,
                    imageUrls: uploadedImageUrls,
                    imageUrl: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null,
                    isNotice: isNotice
                })
            });

            if (response.ok) {
                setNewPostTitle('');
                setNewPostDate(new Date().toISOString().split('T')[0]);
                setNewPostContent('');
                setNewPostImages([]);
                setIsNotice(false);
                setShowCreateModal(false);
                fetchPosts();
            } else {
                const err = await response.json();
                alert(err.error || '포스트 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error("Post creation failed:", error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    const handleLike = async (postId, e) => {
        if (e) e.stopPropagation();
        try {
            const response = await fetch(`/api/posts/${postId}/like/`, { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                setPosts(posts.map(post => post.id === postId ? { ...post, isLiked: data.liked, likes: data.likes_count } : post));
            }
        } catch (error) {
            console.error("Like failed:", error);
        }
    };

    const handleTogglePin = async (postId, e) => {
        if (e) e.stopPropagation();
        try {
            const response = await fetch(`/api/posts/${postId}/pin/`, { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                setPosts(posts.map(post => post.id === postId ? { ...post, isPinned: data.pinned } : post));
                if (selectedPost && selectedPost.id === postId) {
                    setSelectedPost({ ...selectedPost, isPinned: data.pinned });
                }
            } else {
                const err = await response.json();
                alert(err.error || '고정 처리에 실패했습니다.');
            }
        } catch (error) {
            console.error("Pin failed:", error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const response = await fetch(`/api/posts/${selectedPost.id}/comment/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: newComment,
                    parentId: replyTo?.id
                })
            });
            if (response.ok) {
                const commentObj = await response.json();
                setPosts(posts.map(post => {
                    if (post.id === selectedPost.id) {
                        const updatedPost = { ...post, comments: post.comments + 1, commentsList: [...post.commentsList, commentObj] };
                        setSelectedPost(updatedPost);
                        return updatedPost;
                    }
                    return post;
                }));
                setNewComment('');
                setReplyTo(null);
            }
        } catch (error) {
            console.error("Comment failed:", error);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
        try {
            const response = await fetch(`/api/posts/${postId}/delete/`, { method: 'DELETE' });
            if (response.ok) {
                alert("게시글이 삭제되었습니다.");
                setSelectedPost(null);
                fetchPosts();
            } else {
                const data = await response.json();
                alert(data.error || "삭제에 실패했습니다.");
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("서버 오류가 발생했습니다.");
        }
    };

    const currentSelectedPost = posts.find(p => p.id === selectedPost?.id);

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-16 md:pb-0">
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/main')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="메인 페이지로 돌아가기"><ArrowLeft className="w-6 h-6" /></button>
                            <div className="flex items-center gap-3">
                                <img src="/static/icon/logo.png" alt="Momo Logo" width={40} height={40} className="h-10 w-auto" />
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold">{meetingName || '로딩 중…'}</h1>
                                    <button onClick={handleCopyInviteCode} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-muted-foreground flex items-center gap-1 group relative" aria-label="초대 코드 복사">
                                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 group-hover:text-primary transition-colors" />}
                                        <span className="text-xs font-medium text-gray-400 hidden sm:inline">#{id}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {(role === 'OWNER' || role === 'ADMIN') && (
                                <button
                                    onClick={() => navigate(`/meeting/${id}/admin`)}
                                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground"
                                    aria-label="모임 관리 설정"
                                >
                                    <Settings className="w-6 h-6" />
                                </button>
                            )}
                            <div className="hidden md:flex items-center gap-3">
                                <button onClick={() => navigate(`/meeting/${id}/schedule`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">일정</button>
                                <button onClick={() => navigate(`/meeting/${id}/dashboard`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">회비</button>
                                <button className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">모임 게시판</button>
                                <button onClick={() => navigate(`/meeting/${id}/ocr`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">스마트 스캔</button>
                                {(role === 'OWNER' || role === 'ADMIN') && (
                                    <button onClick={() => navigate(`/meeting/${id}/admin`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">관리</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <h2 className="text-xl font-bold">모임 게시판</h2>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button onClick={() => setViewType('gallery')} className={`px-3 py-1.5 rounded-md transition-all ${viewType === 'gallery' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-gray-900'}`}><LayoutGrid className="w-5 h-5" /></button>
                                    <button onClick={() => setViewType('list')} className={`px-3 py-1.5 rounded-md transition-all ${viewType === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-gray-900'}`}><List className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-sm"><Plus className="w-5 h-5" /> 글쓰기</button>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200"><div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" aria-label="게시글 불러오는 중…"></div><p className="text-muted-foreground">게시글을 불러오고 있습니다…</p></div>
                        ) : (
                            <>
                                {viewType === 'list' ? (
                                    <div className="space-y-4">
                                        {[...posts]
                                            .sort((a, b) => (b.isNotice ? 1 : 0) - (a.isNotice ? 1 : 0) || (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map(post => (
                                                <div key={post.id} onClick={() => setSelectedPost(post)} className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 ${post.isNotice ? 'border-primary/20 bg-blue-50/10' : 'border-transparent'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {post.isNotice && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary text-white">공지</span>}
                                                        {post.isPinned && <Pin className="w-4 h-4 text-primary fill-current" />}
                                                        <h3 className="font-medium text-lg">{post.title}</h3>
                                                    </div>
                                                    <p className="text-muted-foreground mb-4 line-clamp-2">{post.content}</p>
                                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-4"><span>{post.author}</span><div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{post.date}</span></div></div>
                                                        <div className="flex items-center gap-4"><button onClick={(e) => handleLike(post.id, e)} className={`flex items-center gap-1 hover:text-primary transition-colors ${post.isLiked ? 'text-primary' : ''}`}><ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} /><span>{post.likes}</span></button><div className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /><span>{post.comments}</span></div></div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                                        {[...posts]
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map(post => (
                                                <div key={post.id} onClick={() => setSelectedPost(post)} className="group relative aspect-square bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all">
                                                    {post.imageUrl ? (
                                                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full p-6 flex flex-col justify-center items-center text-center bg-gray-50/50">
                                                            <h4 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">{post.title}</h4>
                                                            <p className="text-[11px] text-gray-500 line-clamp-[6] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                        <div className="flex items-center gap-3 text-white text-[10px] font-bold">
                                                            <div className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 fill-current" /><span>{post.likes}</span></div>
                                                            <div className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 fill-current" /><span>{post.comments}</span></div>
                                                        </div>
                                                        <h3 className="text-white text-xs font-bold mt-1 truncate">{post.title}</h3>
                                                    </div>
                                                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                                                        {post.isNotice && <div className="px-1.5 py-0.5 bg-primary text-white text-[9px] font-bold rounded shadow-sm">공지</div>}
                                                        {post.isPinned && <div className="p-1 bg-white/90 text-primary rounded shadow-sm"><Pin className="w-2.5 h-2.5 fill-current" /></div>}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                {posts.length > itemsPerPage && (
                                    <div className="mt-12 flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>

                                        {[...Array(Math.ceil(posts.length / itemsPerPage))].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 rounded-lg font-bold transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 text-gray-500'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(posts.length / itemsPerPage), p + 1))}
                                            disabled={currentPage === Math.ceil(posts.length / itemsPerPage)}
                                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5 rotate-180" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <button onClick={() => setIsAIModalOpen(true)} className="fixed bottom-24 md:bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-transform hover:scale-105 z-40"><Bot className="w-8 h-8" /></button>
            <AIChatModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overscroll-contain">
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-bold">새 게시글 작성</h2>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <form onSubmit={handleCreatePost} className="space-y-4">
                                    <div>
                                        <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                                        <input id="postTitle" name="title" type="text" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder="제목을 입력하세요…" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
                                    </div>
                                    <div>
                                        <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                                        <textarea id="postContent" name="content" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="내용을 입력하세요…" rows={6} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">사진 첨부 (최대 10장)</label>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary hover:bg-blue-50 cursor-pointer transition-all group">
                                                <div className="text-center">
                                                    <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-primary mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500 font-medium">사진 클릭하여 필터 ( {newPostImages.length} / 10 )</p>
                                                </div>
                                                <input type="file" multiple accept=".jpg, .jpeg, .png" onChange={handleImageChange} className="hidden" />
                                            </label>
                                            {newPostImages.length > 0 && (
                                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
                                                    {newPostImages.map((img, idx) => (
                                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                                                            <img src={img.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(idx)}
                                                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 border border-border rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-600">취소</button>
                                        <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity font-medium shadow-md">작성 완료</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                selectedPost && currentSelectedPost && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overscroll-contain">
                            <div className="flex items-center justify-between p-6 border-b border-border"><div className="flex items-center gap-2">{currentSelectedPost.isNotice && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary text-white">공지</span>}<h2 className="text-xl font-bold line-clamp-1">{currentSelectedPost.title}</h2></div><button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-6 h-6" /></button></div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="mb-6 pb-6 border-b border-border">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4"><span className="font-medium text-gray-900">{currentSelectedPost.author}</span><span>·</span><span>{currentSelectedPost.date}</span></div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {currentSelectedPost.canDelete && <button onClick={() => handleDeletePost(currentSelectedPost.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg border border-red-100"><Trash2 className="w-3.5 h-3.5" /> 게시글 삭제</button>}
                                        {(role === 'OWNER' || role === 'ADMIN') && (
                                            <button onClick={() => handleTogglePin(currentSelectedPost.id)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${currentSelectedPost.isPinned ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50 border-gray-200 text-gray-600'}`}>
                                                <Pin className={`w-3.5 h-3.5 ${currentSelectedPost.isPinned ? 'fill-current' : ''}`} />
                                                {currentSelectedPost.isPinned ? '고정 해제' : '상단 고정'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Instagram-style Image Slider */}
                                    <div className="relative group mb-6 bg-gray-50 rounded-xl overflow-hidden border border-border">
                                        <div
                                            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                                            id="image-slider"
                                            onScroll={(e) => {
                                                const scrollLeft = e.target.scrollLeft;
                                                const width = e.target.clientWidth;
                                                const index = Math.round(scrollLeft / width);
                                                const dots = document.querySelectorAll('.image-dot');
                                                dots.forEach((dot, idx) => {
                                                    dot.style.opacity = idx === index ? '1' : '0.3';
                                                    dot.style.transform = idx === index ? 'scale(1.2)' : 'scale(1)';
                                                });
                                            }}
                                        >
                                            {currentSelectedPost.imageUrls && currentSelectedPost.imageUrls.length > 0 ? (
                                                currentSelectedPost.imageUrls.map((url, idx) => (
                                                    <div key={idx} className="flex-none w-full snap-start flex items-center justify-center min-h-[300px] max-h-[500px]">
                                                        <img src={url} alt={`${currentSelectedPost.title} ${idx + 1}`} className="w-full h-full object-contain" />
                                                    </div>
                                                ))
                                            ) : currentSelectedPost.imageUrl ? (
                                                <div className="flex-none w-full snap-start flex items-center justify-center min-h-[300px] max-h-[500px]">
                                                    <img src={currentSelectedPost.imageUrl} alt={currentSelectedPost.title} className="w-full h-full object-contain" />
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Page Indicators (Dots) */}
                                        {((currentSelectedPost.imageUrls?.length || 0) > 1) && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 p-1.5 bg-black/10 rounded-full backdrop-blur-sm">
                                                {currentSelectedPost.imageUrls.map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="image-dot w-1.5 h-1.5 bg-white rounded-full transition-all duration-300"
                                                        style={{ opacity: idx === 0 ? '1' : '0.3', transform: idx === 0 ? 'scale(1.2)' : 'scale(1)' }}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Navigation Buttons (Desktop only) */}
                                        {((currentSelectedPost.imageUrls?.length || 0) > 1) && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        const slider = document.getElementById('image-slider');
                                                        slider.scrollBy({ left: -slider.clientWidth, behavior: 'smooth' });
                                                    }}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const slider = document.getElementById('image-slider');
                                                        slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
                                                >
                                                    <X className="w-4 h-4 rotate-180" /> {/* Reuse X or Arrow icon */}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{currentSelectedPost.content}</div>
                                    <div className="mt-6 flex items-center gap-4"><button onClick={() => handleLike(currentSelectedPost.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${currentSelectedPost.isLiked ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-gray-50'}`}><ThumbsUp className={`w-5 h-5 ${currentSelectedPost.isLiked ? 'fill-current' : ''}`} /><span className="font-medium">{currentSelectedPost.likes}</span></button><div className="flex items-center gap-2 text-muted-foreground"><MessageSquare className="w-5 h-5" /><span>{currentSelectedPost.comments}</span></div></div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-bold">댓글 {currentSelectedPost.comments}</h3>
                                    <div className="space-y-4">
                                        {currentSelectedPost.commentsList
                                            .filter(c => !c.parentId)
                                            .map(comment => (
                                                <div key={comment.id} className="space-y-3">
                                                    <div className="bg-gray-50 rounded-2xl p-4 shadow-sm group">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-gray-900">{comment.author}</span>
                                                                {comment.author_id === currentSelectedPost.author_id && <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">작성자</span>}
                                                            </div>
                                                            <span className="text-[11px] text-gray-400">{comment.date}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
                                                        <div className="mt-3 flex items-center gap-4">
                                                            <button
                                                                onClick={() => setReplyTo({ id: comment.id, author: comment.author })}
                                                                className="text-xs font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
                                                            >
                                                                <MessageSquare className="w-3 h-3" />
                                                                답글 달기
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Replies */}
                                                    <div className="ml-8 space-y-3 border-l-2 border-gray-100 pl-4">
                                                        {currentSelectedPost.commentsList
                                                            .filter(reply => reply.parentId === comment.id)
                                                            .map(reply => (
                                                                <div key={reply.id} className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
                                                                    <div className="flex items-center justify-between mb-1.5">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-xs text-primary">{reply.author}</span>
                                                                            {reply.author_id === currentSelectedPost.author_id && <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">작성자</span>}
                                                                        </div>
                                                                        <span className="text-[10px] text-gray-400">{reply.date}</span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-700 leading-relaxed">{reply.text}</p>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            ))}
                                        {currentSelectedPost.commentsList.length === 0 && (
                                            <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-400">첫 번째 댓글을 남겨보세요.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-border bg-white rounded-b-2xl">
                                {replyTo && (
                                    <div className="mb-3 px-4 py-2 bg-primary/5 rounded-xl flex items-center justify-between border border-primary/10 animate-in slide-in-from-bottom-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-bold text-primary">{replyTo.author}</span>
                                            <span className="text-gray-500">님에게 답글 작성 중…</span>
                                        </div>
                                        <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-primary/10 rounded-full transition-colors">
                                            <X className="w-4 h-4 text-primary" />
                                        </button>
                                    </div>
                                )}
                                <form onSubmit={handleAddComment} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={replyTo ? `${replyTo.author}님에게 답글 입력…` : "댓글을 입력하세요…"}
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    />
                                    <button type="submit" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-md">등록</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
            <BottomNav />
        </div >
    );
};

export default Board;
