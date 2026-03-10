import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Upload, FileText, CheckCircle, Bot, X, RotateCcw, Copy, Check, Settings, AlertCircle, Store, Hash, Calendar, CreditCard, ScanLine } from 'lucide-react';
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

    // 확대 이미지 위치 및 드래그 상태
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);

    const handleMouseDown = (e) => {
        if (!isImageZoomed) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        if (!isImageZoomed) return;
        const delta = e.deltaY;
        setScale(prev => {
            const next = delta > 0 ? prev * 0.9 : prev * 1.1;
            return Math.min(Math.max(next, 0.5), 5);
        });
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
    const [editableResult, setEditableResult] = useState(null); // 수정 가능한 상태 추가
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    useEffect(() => {
        if (isResultModalOpen) {
            setIsImageZoomed(false);
            setPosition({ x: 0, y: 0 });
            setScale(1);
        }
    }, [isResultModalOpen]);

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
                setEditableResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancelImage = () => {
        setSelectedImage(null);
        setSelectedFile(null);
        setUploadStatus('idle');
        setUploadResult(null);
        setEditableResult(null);
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
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Upload failed');
            }

            const data = await response.json();
            setUploadResult(data);
            // 초기값을 복사하여 수정 가능한 상태로 설정
            setEditableResult({
                storeName: data['상호명'] || '',
                businessNum: data['사업자번호'] || '',
                date: data['날짜'] || new Date().toISOString().slice(0, 10),
                amount: data['합계'] ? data['합계'].replace(/[^0-9]/g, '') : '', // 숫자만 추출
            });
            setUploadStatus('success');
            setIsResultModalOpen(true);
        } catch (error) {
            console.error('OCR error:', error);
            setUploadStatus('error');
            alert(`인식 실패: ${error.message}`);
        }
    };

    const handleFieldChange = (field, value) => {
        setEditableResult(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddTransaction = async () => {
        if (!editableResult) return;

        if (
            !editableResult.storeName || String(editableResult.storeName).trim().toLowerCase() === 'null' ||
            !editableResult.date || String(editableResult.date).trim().toLowerCase() === 'null' ||
            !editableResult.amount || String(editableResult.amount).trim().toLowerCase() === 'null' ||
            !editableResult.category || String(editableResult.category).trim().toLowerCase() === 'null'
        ) {
            alert('사업자 번호를 제외한 항목에 null 값이 있어 저장할 수 없습니다.');
            return;
        }

        const amount = editableResult.amount ? parseInt(editableResult.amount, 10) : 0;
        const title = editableResult.storeName || '영수증 인식';
        const date = editableResult.date || new Date().toISOString().slice(0, 10);
        let type = 'EXPENSE';
        if (editableResult.category === '회비') {
            type = 'INCOME';
        }

        try {
            let res;
            if (selectedFile) {
                const formData = new FormData();
                formData.append('amount', amount);
                formData.append('title', title);
                formData.append('date', date);
                formData.append('type', type.toLowerCase());
                formData.append('category_name', editableResult.category);
                formData.append('receipt_image', selectedFile);

                res = await fetch(`/api/meetings/${id}/transactions/create/`, {
                    method: 'POST',
                    body: formData,
                });
            } else {
                res = await fetch(`/api/meetings/${id}/transactions/create/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount,
                        title,
                        date,
                        type: type.toLowerCase(),
                        category_name: editableResult.category
                    }),
                });
            }

            if (!res.ok) throw new Error('거래 내역 저장 실패');
            alert('거래 내역에 추가되었습니다!');
            setIsResultModalOpen(false);
            // 성공 후 입력 상태 초기화
            handleCancelImage();
        } catch (err) {
            alert(`실패: ${err.message}`);
        }
    };

    const fields = editableResult ? [
        { id: 'storeName', label: '상호명', value: editableResult.storeName, icon: Store, color: 'text-blue-600 bg-blue-50', placeholder: '상호명을 입력하세요' },
        { id: 'businessNum', label: '사업자번호', value: editableResult.businessNum, icon: Hash, color: 'text-purple-600 bg-purple-50', placeholder: '예: 123-45-67890' },
        { id: 'date', label: '날짜', value: editableResult.date, icon: Calendar, color: 'text-green-600 bg-green-50', placeholder: 'YYYY-MM-DD', type: 'date' },
        { id: 'amount', label: '합계 (원)', value: editableResult.amount, icon: CreditCard, color: 'text-orange-600 bg-orange-50', placeholder: '숫자만 입력', type: 'number' },
    ] : [];

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-16 md:pb-0">
            {/* ── 헤더 ── */}
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/main')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="메인 페이지로 돌아가기">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3">
                                <img src="/static/icon/logo.png" alt="Momo Logo" width={40} height={40} className="h-10 w-auto" />
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold">{meetingName || '로딩 중…'}</h1>
                                    <button onClick={handleCopyInviteCode} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-muted-foreground flex items-center gap-1 group" aria-label="초대 코드 복사">
                                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 group-hover:text-primary transition-colors" />}
                                        <span className="text-xs font-medium text-gray-400 hidden sm:inline">#{id}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {(role === 'OWNER' || role === 'ADMIN') && (
                                <button onClick={() => navigate(`/meeting/${id}/admin`)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground" aria-label="모임 관리 설정">
                                    <Settings className="w-6 h-6" />
                                </button>
                            )}
                            <div className="hidden md:flex items-center gap-3">
                                <button onClick={() => navigate(`/meeting/${id}/schedule`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">일정</button>
                                <button onClick={() => navigate(`/meeting/${id}/dashboard`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">회비</button>
                                <button onClick={() => navigate(`/meeting/${id}/board`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">모임 게시판</button>
                                <button className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">스마트 스캔</button>
                                {(role === 'OWNER' || role === 'ADMIN') && (
                                    <button onClick={() => navigate(`/meeting/${id}/admin`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">관리</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── 본문 ── */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-1 text-xl font-bold">스마트 스캔</h2>
                            <p className="text-muted-foreground text-sm">영수증을 촬영하거나 업로드하면 자동으로 금액을 인식합니다.</p>
                        </div>

                        {/* 업로드 영역 */}
                        <div className="border-2 border-dashed rounded-2xl p-8 text-center transition-colors border-border bg-white relative overflow-hidden">
                            {selectedImage ? (
                                <div className="space-y-5">
                                    <div className="relative inline-block w-full max-w-sm mx-auto">
                                        <img src={selectedImage} alt="Receipt Preview" className="rounded-xl shadow-md max-h-[350px] w-full object-contain bg-gray-50" />
                                        <button
                                            onClick={handleCancelImage}
                                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                            aria-label="이미지 취소"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate max-w-xs mx-auto">{selectedFile?.name}</p>
                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={() => fileInputRef.current.click()}
                                            disabled={uploadStatus === 'uploading'}
                                            className="px-4 py-2 border border-border text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            다시 선택
                                        </button>
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploadStatus === 'uploading'}
                                            className={`px-6 py-2 bg-primary text-white rounded-lg transition-all font-medium flex items-center gap-2 shadow-md
                                                ${uploadStatus === 'uploading' ? 'opacity-70 cursor-wait' : 'hover:opacity-90 hover:scale-[1.02]'}`}
                                        >
                                            {uploadStatus === 'uploading' ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    AI 인식 중…
                                                </>
                                            ) : (
                                                <>
                                                    <ScanLine className="w-4 h-4" />
                                                    인식 시작하기
                                                </>
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
                                    <h3 className="mb-2 font-semibold text-gray-700">영수증을 업로드하세요</h3>
                                    <p className="text-muted-foreground text-sm mb-6">파일을 선택하거나 사진을 직접 촬영하세요.</p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => fileInputRef.current.click()}
                                            className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-medium shadow-sm"
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
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                OCR 결과 수정 모달
            ══════════════════════════════════════ */}
            {isResultModalOpen && editableResult && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">

                        {/* 모달 헤더 */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <h3 className="text-lg font-bold text-gray-900">결과 확인 및 수정</h3>
                            </div>
                            <button
                                onClick={() => setIsResultModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                aria-label="모달 닫기"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* 모달 본문: 스크롤 가능 */}
                        <div className="overflow-y-auto flex-1">
                            {/* 상단: 이미지 */}
                            <div className="bg-gray-50 px-6 py-5 flex items-center justify-center">
                                <img
                                    src={selectedImage}
                                    alt="영수증 이미지"
                                    className="max-h-56 w-auto max-w-full rounded-2xl shadow-md object-contain cursor-zoom-in hover:opacity-95 transition-all duration-200"
                                    onClick={() => setIsImageZoomed(true)}
                                />
                            </div>

                            {/* 안내 문구 */}
                            <div className="px-6 pt-4 pb-2">
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    AI가 인식한 결과입니다. 틀린 내용이 있다면 직접 수정해주세요.
                                </p>
                            </div>

                            {/* 카테고리 (종류) 선택 */}
                            <div className="px-6 py-2">
                                <div className="grid grid-cols-3 gap-2">
                                    {['식비', '활동비', '기타'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => handleFieldChange('category', cat)}
                                            className={`py-2 text-sm font-medium rounded-xl border transition-all ${editableResult.category === cat
                                                ? 'bg-primary border-primary text-white shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 하단: 필드 입력 폼 */}
                            <div className="px-6 pb-2 grid grid-cols-2 gap-3">
                                {fields.map(({ id: fieldId, label, value, icon: Icon, color, type, placeholder }) => (
                                    <div key={fieldId} className="col-span-2 sm:col-span-1 border border-gray-200 rounded-2xl p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                                        <label htmlFor={fieldId} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold mb-1 cursor-pointer ${color}`}>
                                            <Icon className="w-3.5 h-3.5" />
                                            {label}
                                        </label>
                                        <input
                                            id={fieldId}
                                            type={type || 'text'}
                                            value={value}
                                            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                                            placeholder={placeholder}
                                            className="w-full text-sm font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 px-1 placeholder:font-normal placeholder:text-gray-300"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* OCR 원문 (접기/펼치기) */}
                            {uploadResult?.ocr_raw && (
                                <div className="px-6 pb-4 pt-2">
                                    <details className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                                        <summary className="px-4 py-3 cursor-pointer text-xs text-gray-500 font-medium select-none hover:bg-gray-100 transition-colors">
                                            OCR 원본 텍스트 보기
                                        </summary>
                                        <pre className="px-4 pb-4 text-[11px] text-gray-600 whitespace-pre-wrap break-words">{uploadResult.ocr_raw}</pre>
                                    </details>
                                </div>
                            )}
                        </div>

                        {/* 모달 푸터: 버튼 */}
                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-white">
                            <button
                                onClick={() => setIsResultModalOpen(false)}
                                className="flex-1 py-3.5 border border-border text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAddTransaction}
                                className="flex-[2] py-3.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-md text-sm flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                내역 저장하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI 플로팅 버튼 */}
            <button
                onClick={() => setIsAIModalOpen(true)}
                className="fixed bottom-24 md:bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-transform hover:scale-105 z-40"
                aria-label="AI 챗봇 열기"
            >
                <Bot className="w-8 h-8" />
            </button>

            {/* 영수증 이미지 확대 오버레이 */}
            {isImageZoomed && selectedImage && (
                <div
                    className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-300"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <div
                        className="relative w-full h-full flex items-center justify-center select-none"
                        onClick={(e) => {
                            if (!isDragging && position.x === 0 && position.y === 0) {
                                setIsImageZoomed(false);
                            }
                        }}
                    >
                        <div
                            className="transition-transform duration-75 shadow-2xl"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                cursor: isDragging ? 'grabbing' : 'grab'
                            }}
                            onMouseDown={handleMouseDown}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage}
                                alt="Enlarged Receipt"
                                className="max-w-[90vw] max-h-[90vh] object-contain pointer-events-none rounded-sm"
                            />
                        </div>

                        {/* 닫기 버튼 */}
                        <button
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[80]"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsImageZoomed(false);
                            }}
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* 조작 설명 팁 */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white/80 text-xs rounded-full backdrop-blur-md pointer-events-none">
                            드래그로 이동 • 휠로 확대/축소 • 클릭하여 닫기
                        </div>
                    </div>
                </div>
            )}

            <AIChatModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
            <BottomNav />
        </div>
    );
};

export default OCR;
