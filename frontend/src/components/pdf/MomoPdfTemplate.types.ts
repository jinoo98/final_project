export type TransactionType = 'income' | 'expense';

export interface Transaction {
    date: string;           // "2026-03-08"
    type: TransactionType;
    description: string;    // "정기 모임 식대"
    amount: number;         // 120000
    note?: string;          // "영수증 보관" (선택)
}

export interface MomoPdfData {
    meetingName: string;       // "한강 러닝 크루"
    reportMonth: string;       // "2026년 3월"
    issueDate: string;         // "2026년 3월 31일"
    previousBalance: number;   // 전월 이월금
    totalIncome: number;       // 당월 총 수입
    totalExpense: number;      // 당월 총 지출
    transactions: Transaction[];
    remarks?: string;          // 비고 (선택)
}
