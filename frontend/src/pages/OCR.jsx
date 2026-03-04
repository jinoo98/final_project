import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Upload, FileText, CheckCircle, Bot, X, RotateCcw, Copy, Check, Settings } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import BottomNav from '../components/BottomNav';

const OCR = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [meetingName, setMeetingName] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [role, setRole] = useState(null);
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

    useEffect(() => {
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

    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
    const [uploadResult, setUploadResult] = useState(null);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
                setUploadStatus('idle');
                setUploadResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancelImage = () => {
        setSelectedImage(null);
        setSelectedFile(null);
        setUploadStatus('idle');
        setUploadResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploadStatus('uploading');
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch(`/api/meeting/${id}/ocr/upload/`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setUploadResult(data);
            setUploadStatus('success');
            console.log('Upload success:', data);
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            alert('업로드에 실패했습니다.');
        }
    };

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-16 md:pb-0">
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/main')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="메인 페이지로 돌아가기">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src="/static/icon/logo.png" alt="Momo Logo" width={40} height={40} className="h-10 w-auto" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold">{meetingName || '로딩 중…'}</h1>
                                    <button
                                        onClick={handleCopyInviteCode}
                                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-muted-foreground flex items-center gap-1 group relative"
                                        aria-label="초대 코드 복사"
                                        title="초대 코드 복사"
                                    >
                                        {isCopied ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 group-hover:text-primary transition-colors" />
                                        )}
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
                                <button onClick={() => navigate(`/meeting/${id}/schedule`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">
                                    일정
                                </button>
                                <button onClick={() => navigate(`/meeting/${id}/dashboard`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">
                                    회비
                                </button>
                                <button onClick={() => navigate(`/meeting/${id}/board`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">
                                    모임 게시판
                                </button>
                                <button className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">
                                    스마트 스캔
                                </button>
                                {(role === 'OWNER' || role === 'ADMIN') && (
                                    <button
                                        onClick={() => navigate(`/meeting/${id}/admin`)}
                                        className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium"
                                    >
                                        관리
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-2 text-xl font-medium">스마트 스캔</h2>
                            <p className="text-muted-foreground">영수증을 촬영하거나 업로드하면 자동으로 금액을 인식합니다.</p>
                        </div>

                        {/* Upload Area */}
                        <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors border-border bg-white cursor-pointer hover:bg-blue-50 relative overflow-hidden">
                            {selectedImage ? (
                                <div className="space-y-4">
                                    <div className="relative inline-block w-full max-w-md">
                                        <img src={selectedImage} alt="Receipt Preview" className="rounded-lg shadow-md max-h-[400px] mx-auto object-contain bg-gray-50" />
                                        <button
                                            onClick={handleCancelImage}
                                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={() => fileInputRef.current.click()}
                                            className="px-4 py-2 border border-border text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium"
                                            disabled={uploadStatus === 'uploading'}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            다시 선택
                                        </button>
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploadStatus === 'uploading'}
                                            className={`px-6 py-2 bg-primary text-white rounded-lg transition-all font-medium flex items-center gap-2
                                                ${uploadStatus === 'uploading' ? 'opacity-70 cursor-wait' : 'hover:opacity-90'}
                                            `}
                                        >
                                            {uploadStatus === 'uploading' ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-label="업로드 중…"></div>
                                                    업로드 중…
                                                </>
                                            ) : (
                                                '인식 시작하기'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-primary" />
                                        </div>
                                    </div>

                                    <h3 className="mb-2 font-medium">영수증을 업로드하세요</h3>
                                    <p className="text-muted-foreground mb-6">파일을 선택하거나 사진을 직접 촬영하세요.</p>

                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => fileInputRef.current.click()}
                                            className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
                                        >
                                            <Upload className="w-5 h-5" />
                                            파일 선택
                                        </button>
                                        <button
                                            onClick={() => cameraInputRef.current.click()}
                                            className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <Camera className="w-5 h-5" />
                                            사진 촬영
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Hidden Inputs */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <input
                                type="file"
                                ref={cameraInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                            />
                        </div>

                        {/* Example Result */}
                        {uploadStatus === 'success' && uploadResult && (
                            <div className="space-y-4 animate-fade-in">
                                <h3 className="text-lg font-medium">처리 결과</h3>
                                <div className="bg-white rounded-xl p-6 shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="mb-1 font-medium">{uploadResult.filename}</h4>
                                                <p className="text-sm text-muted-foreground">업로드 완료</p>
                                            </div>
                                        </div>
                                        <span className="flex items-center gap-1 text-green-600 text-sm">
                                            <CheckCircle className="w-4 h-4" />
                                            완료
                                        </span>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg text-center text-muted-foreground mb-4">
                                        OCR 분석 결과가 여기에 표시됩니다. (현재는 업로드만 구현됨)
                                    </div>
                                    <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
                                        거래 내역에 추가
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button onClick={() => setIsAIModalOpen(true)} className="fixed bottom-24 md:bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-transform hover:scale-105 z-40">
                <Bot className="w-8 h-8" />
            </button>

            {/* AI Modal */}
            <AIChatModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
            <BottomNav />
        </div>
    );
};

export default OCR;
