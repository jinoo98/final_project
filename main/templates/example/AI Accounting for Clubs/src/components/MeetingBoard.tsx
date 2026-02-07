import { useState } from 'react';
import { Plus, MessageSquare, ThumbsUp, Calendar } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  likes: number;
  comments: number;
}

export function MeetingBoard() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      title: '다음 모임 장소 투표',
      content: '다음 모임 장소를 투표로 정하려고 합니다. 댓글로 의견 부탁드려요!',
      author: '김철수',
      date: '2026-02-03',
      likes: 5,
      comments: 8,
    },
    {
      id: '2',
      title: '이번 달 회비 안내',
      content: '이번 달 회비는 5만원입니다. 2월 10일까지 입금 부탁드립니다.',
      author: '박영희',
      date: '2026-02-01',
      likes: 12,
      comments: 3,
    },
    {
      id: '3',
      title: '신입 회원 환영합니다!',
      content: '이번에 새로 가입하신 회원분들 환영합니다. 잘 부탁드려요~',
      author: '이민수',
      date: '2026-01-28',
      likes: 15,
      comments: 10,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostTitle,
      content: newPostContent,
      author: '나',
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: 0,
    };
    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>모임 게시판</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          글쓰기
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <h3 className="mb-2">{post.title}</h3>
            <p className="text-muted-foreground mb-4 line-clamp-2">{post.content}</p>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>{post.author}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <h2 className="mb-6">새 게시글 작성</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label htmlFor="postTitle" className="block mb-2">
                  제목
                </label>
                <input
                  id="postTitle"
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="postContent" className="block mb-2">
                  내용
                </label>
                <textarea
                  id="postContent"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  rows={8}
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
                  작성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
