import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Plus, Bot, X, FileText, CheckCircle, Copy, Check, Settings, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import TransactionModal from '../components/TransactionModal';
import BottomNav from '../components/BottomNav';
import { BudgetGauge, CategoryDonut, TrendCombo } from '../components/FinancialChart';
import { usePdfDownload } from '../hooks/usePDFDownload';

const Dashboard = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [meetingName, setMeetingName] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [role, setRole] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [transactions, setTransactions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const monthTransactions = transactions.filter(tx => tx.date.startsWith(selectedMonth));
    const filteredTransactions = monthTransactions.filter(tx =>
        filterType === 'all' ? true : tx.type === filterType
    );

    const { downloadPdf, isGenerating } = usePdfDownload();

    const handleDownloadPdf = useCallback(() => {
        const income = monthTransactions.filter(tx => tx.type === 'income').reduce((acc, curr) => acc + curr.raw_amount, 0);
        const expense = monthTransactions.filter(tx => tx.type === 'expense').reduce((acc, curr) => acc + curr.raw_amount, 0);

        const pdfData = {
            meetingName: meetingName,
            reportMonth: selectedMonth,
            issueDate: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
            previousBalance: 0, // 현재 데이터 구조상 전월 이월금 계산 로직이 필요하면 추가
            totalIncome: income,
            totalExpense: expense,
            transactions: monthTransactions.map(tx => ({
                date: tx.date,
                type: tx.type,
                description: tx.title,
                amount: tx.raw_amount,
                note: tx.author // 비고란에 작성자 표시
            }))
        };
        downloadPdf(pdfData);
    }, [meetingName, selectedMonth, monthTransactions, downloadPdf]);

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
        fetchTransactions();
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

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`/api/meetings/${id}/transactions/`);
            if (response.ok) {
                const data = await response.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    const handleAddTransaction = () => {
        fetchTransactions();
    };

    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const handleDeleteTransaction = async () => {
        if (!selectedTransaction || !window.confirm('정말 이 거래 내역을 삭제하시겠습니까?')) return;

        try {
            const response = await fetch(`/api/transactions/${selectedTransaction.id}/delete/`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('삭제되었습니다.');
                setIsActionModalOpen(false);
                setSelectedTransaction(null);
                fetchTransactions();
            } else {
                const err = await response.json().catch(() => ({}));
                alert(`삭제 실패: ${err.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Delete error', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };


    // 사용 가능한 월 목록 추출
    const availableMonths = [...new Set(transactions.map(tx => tx.date.substring(0, 7)))].sort().reverse();
    // 현재 선택된 월이 목록에 없으면 추가 (기본값 유지용)
    if (!availableMonths.includes(selectedMonth)) {
        availableMonths.unshift(selectedMonth);
        availableMonths.sort().reverse();
    }

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
                                    <h1 className="text-xl sm:text-2xl font-bold truncate">{meetingName || '로딩 중…'}</h1>
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
                                <button className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">회비</button>
                                <button onClick={() => navigate(`/meeting/${id}/board`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">모임 게시판</button>
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <BudgetGauge
                            balance={monthTransactions.reduce((acc, curr) => acc + (curr.type === 'income' ? curr.raw_amount : -curr.raw_amount), 0)}
                            budget={monthTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.raw_amount, 0) || 150000}
                        />
                        <CategoryDonut transactions={monthTransactions} />
                        <TrendCombo transactions={monthTransactions} />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-6 border-b border-border flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 whitespace-nowrap">거래 내역</h2>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-bold text-gray-900 border-none focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                                >
                                    {availableMonths.map(month => (
                                        <option key={month} value={month}>
                                            {month.split('-')[0]}년 {month.split('-')[1]}월
                                        </option>
                                    ))}
                                </select>
                                <div className="flex items-center p-1 bg-gray-100 rounded-lg h-[38px] sm:h-auto ml-2">
                                    <button
                                        onClick={() => setFilterType('all')}
                                        className={`px-3 sm:px-4 h-full text-xs sm:text-sm font-semibold rounded-md transition-all ${filterType === 'all' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        전체
                                    </button>
                                    <button
                                        onClick={() => setFilterType('income')}
                                        className={`px-3 sm:px-4 h-full text-xs sm:text-sm font-semibold rounded-md transition-all ${filterType === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        수입
                                    </button>
                                    <button
                                        onClick={() => setFilterType('expense')}
                                        className={`px-3 sm:px-4 h-full text-xs sm:text-sm font-semibold rounded-md transition-all ${filterType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        지출
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={handleDownloadPdf}
                                    disabled={isGenerating}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 active:scale-95 transition-all shadow-md disabled:opacity-50"
                                    title="PDF 내역 다운로드"
                                >
                                    {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-5 h-5" />}
                                    <span className="hidden sm:inline">PDF 다운로드</span>
                                </button>
                                <button
                                    onClick={() => setIsTransactionModalOpen(true)}
                                    className="sm:hidden w-[38px] h-[38px] bg-primary text-white rounded-lg shadow-sm active:scale-90 transition-all flex items-center justify-center">
                                    <Plus className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsTransactionModalOpen(true)}
                                    className="hidden sm:flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md">
                                    <Plus className="w-5 h-5" /> 거래 추가
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-border">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map(tx => (
                                    <div
                                        key={tx.id}
                                        className={`p-5 md:p-8 hover:bg-gray-50 transition-colors ${(role === 'OWNER' || role === 'ADMIN' || tx.is_author) ? 'cursor-pointer' : ''}`}
                                        onClick={() => {
                                            if (role === 'OWNER' || role === 'ADMIN' || tx.is_author) {
                                                setSelectedTransaction(tx);
                                                setIsActionModalOpen(true);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1.5 md:mb-2">
                                                    <span className={`inline-flex items-center px-3 py-1 md:px-4 md:py-1.5 rounded-full text-sm md:text-base font-bold ${tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {tx.type === 'income' ? '수입' : '지출'} · {tx.category_name}
                                                    </span>
                                                    <span className="text-lg md:text-xl font-bold text-gray-900 text-pretty">{tx.title}</span>
                                                </div>
                                                <p className="text-base md:text-lg text-gray-600 mb-1.5 md:mb-2 font-medium text-pretty">{tx.subtitle}</p>
                                                <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground font-medium">
                                                    <span className="text-gray-500">{tx.author}</span>
                                                    <span>·</span>
                                                    <span>{tx.date}</span>
                                                </div>
                                            </div>
                                            <div className="text-right ml-4 md:ml-8">
                                                <p className={`text-xl md:text-3xl font-black whitespace-nowrap ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {tx.amount}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-500 font-medium text-sm md:text-base">
                                    해당하는 거래 내역이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={() => setIsAIModalOpen(true)} className="fixed bottom-24 md:bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-transform hover:scale-105 z-40"><Bot className="w-8 h-8" /></button>
            <AIChatModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => {
                    setIsTransactionModalOpen(false);
                    // 닫힐 때 선택된 내역 초기화하여 추가 모드로 돌아가게 함
                    if (!isActionModalOpen) setSelectedTransaction(null);
                }}
                onAdd={handleAddTransaction}
                meetingId={id}
                initialData={isTransactionModalOpen ? selectedTransaction : null}
            />
            {isActionModalOpen && selectedTransaction && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-900">거래 내역 관리</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setIsActionModalOpen(false);
                                    setIsTransactionModalOpen(true);
                                }}
                                className="w-full text-left px-4 py-3 text-primary font-bold hover:bg-blue-50 rounded-xl transition-colors"
                            >
                                수정하기
                            </button>
                            <button
                                onClick={handleDeleteTransaction}
                                className="w-full text-left px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
                            >
                                삭제하기
                            </button>
                            <button
                                onClick={() => {
                                    setIsActionModalOpen(false);
                                    setSelectedTransaction(null);
                                }}
                                className="w-full text-left px-4 py-3 text-gray-700 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <BottomNav />
        </div>
    );
};

export default Dashboard;
