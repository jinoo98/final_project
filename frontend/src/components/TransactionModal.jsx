import React, { useState } from 'react';
import { X, Plus, Minus, Calendar, Tag, CreditCard, ChevronDown } from 'lucide-react';

const TransactionModal = ({ isOpen, onClose, onAdd, meetingId }) => {
    const [type, setType] = useState('expense'); // 'income' or 'expense'
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryName, setCategoryName] = useState('기타');
    const [memo, setMemo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = {
        income: ['회비', '지원금', '이자', '기타'],
        expense: ['식비', '활동비', '장소대여', '교통비', '소모품', '기타']
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !amount || !date) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/meetings/${meetingId}/transactions/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type,
                    title,
                    amount: parseInt(amount.replace(/,/g, '')),
                    date,
                    category_name: categoryName,
                    memo
                })
            });

            if (response.ok) {
                const data = await response.json();
                onAdd(data);
                setTitle('');
                setAmount('');
                setMemo('');
                setCategoryName('기타');
                onClose();
            } else {
                const error = await response.json();
                alert(`에러: ${error.error}`);
            }
        } catch (error) {
            console.error('Error creating transaction:', error);
            alert('거래 추가 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setAmount(value ? Number(value).toLocaleString() : '');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-gray-900">거래 내역 추가</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Transaction Type Toggle */}
                        <div className="flex p-1.5 bg-gray-100 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => {
                                    setType('income');
                                    setCategoryName('회비');
                                }}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${type === 'income' ? 'bg-white text-green-600 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Plus className={`w-4 h-4 ${type === 'income' ? 'text-green-600' : 'text-gray-400'}`} />
                                수입
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setType('expense');
                                    setCategoryName('기타');
                                }}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${type === 'expense' ? 'bg-white text-red-600 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Minus className={`w-4 h-4 ${type === 'expense' ? 'text-red-600' : 'text-gray-400'}`} />
                                지출
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Title Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">거래 명칭</label>
                                <div className="relative group">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <select
                                        value={title}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setTitle(val);
                                            setCategoryName(val);
                                            // Auto-set type based on category
                                            if (val === '회비') setType('income');
                                            else setType('expense');
                                        }}
                                        className="w-full pl-12 pr-10 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium text-lg appearance-none"
                                        required
                                    >
                                        <option value="" disabled>명칭 선택</option>
                                        <option value="식비">식비</option>
                                        <option value="회비">회비</option>
                                        <option value="활동비">활동비</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">금액</label>
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        placeholder="0"
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-black text-2xl text-right"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">원</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Date Input */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">날짜</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Memo Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">메모 (선택)</label>
                                <textarea
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    placeholder="상세 내용을 적어주세요."
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium resize-none h-24"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:opacity-90 shadow-primary/30'}`}
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>추가하기</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;
