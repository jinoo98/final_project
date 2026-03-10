import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Tag, Calendar, CreditCard, FileText, Check } from 'lucide-react';

const TransactionModal = ({ isOpen, onClose, onAdd, meetingId, initialData = null }) => {
    const isEditMode = !!initialData;

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryName, setCategoryName] = useState('기타');
    const [memo, setMemo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageZoomed, setIsImageZoomed] = useState(false);

    // 확대 이미지 위치 및 드래그 상태
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || '');
                setAmount(initialData.raw_amount ? String(initialData.raw_amount) : '');
                setDate(initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]);
                setCategoryName(initialData.category_name || '기타');
                setMemo(initialData.subtitle || '');
            } else {
                setTitle('');
                setAmount('');
                setDate(new Date().toISOString().split('T')[0]);
                setCategoryName('기타');
                setMemo('');
            }
            setIsImageZoomed(false);
            setPosition({ x: 0, y: 0 });
            setScale(1);
        }
    }, [isOpen, initialData]);

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

    // 마우스 휠로 확대/축소 기능 추가
    const handleWheel = (e) => {
        if (!isImageZoomed) return;
        const delta = e.deltaY;
        setScale(prev => {
            const next = delta > 0 ? prev * 0.9 : prev * 1.1;
            return Math.min(Math.max(next, 0.5), 5); // 0.5배 ~ 5배 제한
        });
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !amount || !date || !categoryName) {
            alert('상호명(명칭), 날짜, 금액, 종류는 필수 입력 항목입니다.');
            return;
        }

        setIsSubmitting(true);
        try {
            const rawAmount = parseInt(String(amount).replace(/,/g, ''), 10) || 0;
            const type = categoryName === '회비' ? 'income' : 'expense';

            const payload = {
                type,
                title,
                amount: rawAmount,
                date,
                category_name: categoryName,
                memo
            };

            const url = isEditMode
                ? `/api/transactions/${initialData.id}/edit/`
                : `/api/meetings/${meetingId}/transactions/create/`;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                onAdd();
                onClose();
            } else {
                const error = await response.json().catch(() => ({}));
                alert(`에러: ${error.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('거래 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setAmount(value ? Number(value).toLocaleString() : '');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* 모달 헤더 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-gray-900">
                            {isEditMode ? '거래 내역 수정' : '거래 내역 추가'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* 모달 본문 */}
                <div className="overflow-y-auto flex-1 pb-4">
                    {/* 카테고리 (종류) 선택 */}
                    <div className="px-6 py-4 pt-6">
                        {/* 영수증 이미지 미리보기 (존재하는 경우) */}
                        {initialData?.receipt_url && (
                            <div className="col-span-2 mt-2">
                                <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold mb-2 text-indigo-600 bg-indigo-50">
                                    <FileText className="w-3.5 h-3.5" /> 영수증 이미지
                                </label>
                                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex justify-center p-2">
                                    <img
                                        src={`/api/receipts/${initialData.receipt_url.replace(/\\/g, '/')}`}
                                        alt="Receipt"
                                        className="max-h-64 w-auto rounded-lg shadow-sm object-contain cursor-zoom-in hover:opacity-95 transition-all duration-200"
                                        onClick={() => setIsImageZoomed(true)}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-4">
                            {/* 수입 카테고리 */}
                            <div>
                                <span className="text-xs font-bold text-green-600 mb-2 block">수입</span>
                                <div className="grid grid-cols-4 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCategoryName('회비')}
                                        className={`py-2 text-sm font-medium rounded-xl border transition-all ${categoryName === '회비'
                                            ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        회비
                                    </button>
                                </div>
                            </div>

                            {/* 지출 카테고리 */}
                            <div>
                                <span className="text-xs font-bold text-red-600 mb-2 block">지출</span>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {['식비', '활동비', '기타'].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategoryName(cat)}
                                            className={`py-2 text-sm font-medium rounded-xl border transition-all ${categoryName === cat
                                                ? 'bg-red-500 border-red-500 text-white shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 하단: 필드 입력 폼 */}
                    <div className="px-6 pb-2 grid grid-cols-2 gap-3">

                        <div className="col-span-2 sm:col-span-1 border border-gray-200 rounded-2xl p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                            <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold mb-1 cursor-pointer text-blue-600 bg-blue-50">
                                <Tag className="w-3.5 h-3.5" /> 거래 명칭
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="예: 스타벅스"
                                className="w-full text-sm font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 px-1 placeholder:font-normal placeholder:text-gray-300"
                            />
                        </div>

                        <div className="col-span-2 sm:col-span-1 border border-gray-200 rounded-2xl p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                            <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold mb-1 cursor-pointer text-green-600 bg-green-50">
                                <Calendar className="w-3.5 h-3.5" /> 날짜
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full text-sm font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 px-1 placeholder:font-normal placeholder:text-gray-300"
                            />
                        </div>

                        <div className="col-span-2 border border-gray-200 rounded-2xl p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                            <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold mb-1 cursor-pointer text-orange-600 bg-orange-50">
                                <CreditCard className="w-3.5 h-3.5" /> 합계 (원)
                            </label>
                            <input
                                type="text"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="숫자만 입력"
                                className="w-full text-sm font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 px-1 placeholder:font-normal placeholder:text-gray-300"
                            />
                        </div>

                        <div className="col-span-2 border border-gray-200 rounded-2xl p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                            <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold mb-1 cursor-pointer text-gray-600 bg-gray-100">
                                <FileText className="w-3.5 h-3.5" /> 메모 (선택, 최대 20자)
                            </label>
                            <input
                                type="text"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                maxLength={20}
                                placeholder="상세 내용을 적어주세요."
                                className="w-full text-sm font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 px-1 placeholder:font-normal placeholder:text-gray-300"
                            />
                        </div>
                    </div>
                </div>

                {/* 모달 푸터 */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-white">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 border border-border text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] py-3.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-md text-sm flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                {isEditMode ? '수정 사항 저장' : '내역 저장하기'}
                            </>
                        )}
                    </button>
                </div>

            </div>

            {/* 영수증 이미지 확대 오버레이 */}
            {isImageZoomed && initialData?.receipt_url && (
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
                                src={`/api/receipts/${initialData.receipt_url.replace(/\\/g, '/')}`}
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
        </div>
    );
};

export default TransactionModal;
