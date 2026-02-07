import { useState } from 'react';
import { Users, TrendingUp, TrendingDown, Wallet, Plus, ArrowLeft, Bot, LayoutDashboard, MessageSquare, ScanLine } from 'lucide-react';
import { MeetingBoard } from './MeetingBoard';
import { OCRPage } from './OCRPage';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  member: string;
}

interface MeetingDashboardProps {
  onBack: () => void;
  onOpenAI: () => void;
}

export function MeetingDashboard({ onBack, onOpenAI }: MeetingDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'board' | 'ocr'>('dashboard');
  const [selectedMeeting] = useState('독서 모임');
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'income',
      category: '회비',
      amount: 50000,
      description: '2월 회비 납부',
      date: '2026-02-01',
      member: '김철수',
    },
    {
      id: '2',
      type: 'expense',
      category: '도서 구매',
      amount: 35000,
      description: '이달의 책 구매',
      date: '2026-02-03',
      member: '박영희',
    },
    {
      id: '3',
      type: 'income',
      category: '회비',
      amount: 50000,
      description: '2월 회비 납부',
      date: '2026-02-01',
      member: '이민수',
    },
    {
      id: '4',
      type: 'expense',
      category: '다과',
      amount: 25000,
      description: '모임 간식 구매',
      date: '2026-02-05',
      member: '김철수',
    },
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const tabs = [
    { id: 'dashboard' as const, label: '회비 대시보드', icon: LayoutDashboard },
    { id: 'board' as const, label: '모임 게시판', icon: MessageSquare },
    { id: 'ocr' as const, label: 'OCR', icon: ScanLine },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
                <div>
                  <h1 className="text-2xl">{selectedMeeting}</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
              <button
                onClick={onOpenAI}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity ml-2"
              >
                <Bot className="w-5 h-5" />
                AI 총무
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-muted-foreground">잔액</h3>
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-3xl mb-1">{balance.toLocaleString()}원</p>
                  <p className="text-sm text-muted-foreground">현재 모임 잔액</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-muted-foreground">총 수입</h3>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl mb-1">{totalIncome.toLocaleString()}원</p>
                  <p className="text-sm text-muted-foreground">이번 달</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-muted-foreground">총 지출</h3>
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-3xl mb-1">{totalExpense.toLocaleString()}원</p>
                  <p className="text-sm text-muted-foreground">이번 달</p>
                </div>
              </div>

              {/* Transactions Section */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2>거래 내역</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                      <Plus className="w-5 h-5" />
                      거래 추가
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {transactions.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>아직 거래 내역이 없습니다</p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm ${
                                  transaction.type === 'income'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {transaction.type === 'income' ? '수입' : '지출'}
                              </span>
                              <span>{transaction.category}</span>
                            </div>
                            <p className="text-muted-foreground mb-1">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.member} · {transaction.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-2xl ${
                                transaction.type === 'income'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {transaction.type === 'income' ? '+' : '-'}
                              {transaction.amount.toLocaleString()}원
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'board' && <MeetingBoard />}
          
          {activeTab === 'ocr' && <OCRPage />}
        </div>
      </div>
    </div>
  );
}