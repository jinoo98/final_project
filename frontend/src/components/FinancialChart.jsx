import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineController,
    BarController,
} from 'chart.js';
import { Doughnut, Chart } from 'react-chartjs-2';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    LineController,
    BarController,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// 1. Budget Gauge Chart (Semi-circle)
export const BudgetGauge = ({ balance, budget = 150000 }) => {
    const percentage = Math.round((balance / budget) * 100);

    // 신호등 로직: 소진율에 따른 색상 결정
    const getTrafficLightColor = () => {
        if (percentage <= 15) return 'text-red-500'; // 15% 이하: 빨간불
        if (percentage <= 30) return 'text-yellow-500'; // 16% ~ 30%: 노란불
        return 'text-green-500'; // 나머지: 초록불
    };

    const data = {
        datasets: [{
            data: [balance, Math.max(0, budget - balance)],
            backgroundColor: ['#3B82F6', '#E5E7EB'],
            borderWidth: 0,
            circumference: 180,
            rotation: -90,
            cutout: '80%',
        }]
    };

    const options = {
        aspectRatio: 1.5,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: (context) => {
                        const label = context.dataIndex === 0 ? '현재 잔액' : '남은 예산';
                        const value = context.raw;
                        return ` ${label}: ${new Intl.NumberFormat('ko-KR').format(value)}원`;
                    }
                }
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">이번 달 예산 및 잔액</h3>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 shadow-sm transition-all`}>
                    <Circle className={`w-3.5 h-3.5 fill-current ${getTrafficLightColor()} animate-pulse`} />
                    <span className="text-[11px] font-bold text-gray-500 tracking-tight">상태</span>
                </div>
            </div>
            <div className="relative flex-1 flex items-center justify-center">
                <Doughnut data={data} options={options} />
                <div className="absolute top-[60%] flex flex-col items-center">
                    <span className="text-3xl font-bold text-gray-900">{Math.min(percentage, 100)}%</span>
                    <span className="text-sm text-gray-400 font-medium">소진율</span>
                </div>
            </div>
            <div className="mt-4 flex justify-between text-sm font-bold text-gray-500">
                <span>0원</span>
                <span>{new Intl.NumberFormat('ko-KR').format(budget)}원</span>
            </div>
        </div>
    );
};

// 2. Category Donut Chart
export const CategoryDonut = ({ transactions = [] }) => {
    // Group transactions by category_name for expenses
    const categoryData = transactions
        .filter(tx => tx.type === 'expense')
        .reduce((acc, tx) => {
            const name = tx.category_name || '기타';
            acc[name] = (acc[name] || 0) + tx.raw_amount;
            return acc;
        }, {});

    const labels = Object.keys(categoryData);
    const dataValues = Object.values(categoryData);

    const hasData = labels.length > 0;

    const data = {
        labels: hasData ? labels : ['지출 없음'],
        datasets: [{
            data: hasData ? dataValues : [1],
            backgroundColor: ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#F472B6'],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 15
        }]
    };

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    padding: 20,
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: 'Pretendard'
                    },
                    color: '#374151'
                }
            },
            tooltip: {
                padding: 12,
                bodyFont: { size: 14 },
                callbacks: {
                    label: (context) => {
                        const value = context.raw;
                        return hasData ? ` ${new Intl.NumberFormat('ko-KR').format(value)}원` : ' 내역이 없습니다.';
                    }
                }
            }
        },
        cutout: '60%'
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-6">카테고리 별 지출 비중</h3>
            <div className="flex-1 min-h-[250px] relative">
                <Doughnut data={data} options={options} />
            </div>
        </div>
    );
};

// 3. Member Unpaid Semi-Gauge
export const MemberUnpaidGauge = ({ unpaidMembers = 3, totalMembers = 20 }) => {
    const unpaidAmount = 45000;
    const unpaidRate = Math.round((unpaidMembers / totalMembers) * 100);

    const data = {
        datasets: [{
            data: [unpaidRate, 100 - unpaidRate],
            backgroundColor: ['#F87171', '#E5E7EB'],
            borderWidth: 0,
            circumference: 180,
            rotation: -90,
            cutout: '80%',
        }]
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-6">회원 미납 총액 및 현황</h3>
            <div className="relative flex-1 flex items-center justify-center">
                <Doughnut data={data} options={{ aspectRatio: 1.5, plugins: { legend: { display: false } } }} />
                <div className="absolute top-[60%] flex flex-col items-center">
                    <span className="text-2xl font-bold text-red-500">{new Intl.NumberFormat('ko-KR').format(unpaidAmount)}원</span>
                    <span className="text-sm text-gray-400 font-medium">{unpaidMembers}명 미납 중</span>
                </div>
            </div>
        </div>
    );
};

// 4. Monthly Trend Combo Chart
export const TrendCombo = ({ transactions = [] }) => {
    const [viewDate, setViewDate] = React.useState(new Date());

    const goToPrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const goToNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const goToCurrentMonth = () => setViewDate(new Date());

    // Calculate monthly data
    const getMonthlyData = () => {
        const sortedTx = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Group by YYYY-MM
        const monthlyStats = {};
        let cumulativeBalance = 0;

        sortedTx.forEach(tx => {
            const date = new Date(tx.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyStats[key]) {
                monthlyStats[key] = { expense: 0, balance: 0 };
            }

            const amount = tx.raw_amount;
            if (tx.type === 'income') {
                cumulativeBalance += amount;
            } else {
                cumulativeBalance -= amount;
                monthlyStats[key].expense += amount;
            }
            monthlyStats[key].balance = cumulativeBalance;
        });

        // Get labels for recent 3 months (or from first transaction to current)
        const labels = [];
        const balanceData = [];
        const expenseData = [];

        // Show last 3 months based on viewDate
        for (let i = 2; i >= 0; i--) {
            const d = new Date(viewDate.getFullYear(), viewDate.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            labels.push(`${d.getMonth() + 1}월`);

            // If we don't have data for this month, use the last available balance
            if (monthlyStats[key]) {
                balanceData.push(monthlyStats[key].balance);
                expenseData.push(monthlyStats[key].expense);
            } else {
                // Find the latest balance before this month
                const keys = Object.keys(monthlyStats).filter(k => k < key).sort();
                const lastKey = keys[keys.length - 1];
                balanceData.push(lastKey ? monthlyStats[lastKey].balance : 0);
                expenseData.push(0);
            }
        }

        return { labels, balanceData, expenseData };
    };

    const { labels, balanceData, expenseData } = getMonthlyData();

    const data = {
        labels,
        datasets: [
            {
                type: 'line',
                label: '총 잔액',
                borderColor: '#3B82F6',
                borderWidth: 4,
                pointBackgroundColor: '#3B82F6',
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: false,
                data: balanceData,
                yAxisID: 'y1',
                tension: 0.4
            },
            {
                type: 'bar',
                label: '월별 지출',
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                hoverBackgroundColor: 'rgba(239, 68, 68, 0.8)',
                data: expenseData,
                borderRadius: 8,
                yAxisID: 'y',
                barPercentage: 0.6
            }
        ]
    };

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 20,
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                padding: 12,
                bodyFont: { size: 14 },
                callbacks: {
                    label: (context) => {
                        return ` ${context.dataset.label}: ${new Intl.NumberFormat('ko-KR').format(context.raw)}원`;
                    }
                }
            }
        },
        scales: {
            y: {
                display: false,
                beginAtZero: true,
            },
            y1: {
                display: false,
                beginAtZero: true,
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: 10
                }
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">{viewDate.getFullYear()}년 잔액 및 지출 추이</h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={goToPrevMonth}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToCurrentMonth}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        현재
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="flex-1 min-h-[250px]">
                <Chart type='bar' data={data} options={options} />
            </div>
        </div>
    );
};
