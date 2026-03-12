import React from 'react';
import {
    Document, Page, View, Text, StyleSheet, Font
} from '@react-pdf/renderer';

// 폰트 등록 (Noto Sans KR)
Font.register({
    family: 'NotoSansKR',
    fonts: [
        { src: 'https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Regular.woff2', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Bold.woff2', fontWeight: 700 },
    ],
});

// 색상 팔레트
const C = {
    black: '#111111',
    darkGray: '#444444',
    midGray: '#888888',
    lightGray: '#F2F2F2',
    border: '#CCCCCC',
    accent: '#2C2C2C',
    white: '#FFFFFF',
};

const styles = StyleSheet.create({
    page: {
        fontFamily: 'NotoSansKR',
        fontSize: 9,
        color: C.black,
        paddingTop: 18,
        paddingBottom: 18,
        paddingHorizontal: 20,
        backgroundColor: C.white,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    meetingName: { fontSize: 20, fontWeight: 700, color: C.black },
    issueDate: { fontSize: 8, color: C.midGray },
    reportMonth: { fontSize: 10, color: C.darkGray, marginTop: 3 },
    dividerBold: { borderBottomWidth: 1.2, borderBottomColor: C.accent, marginTop: 5, marginBottom: 10 },
    sectionHeader: { fontSize: 9, fontWeight: 700, color: C.darkGray, marginBottom: 5 },
    summaryRow: { flexDirection: 'row', marginBottom: 14 },
    summaryCard: {
        flex: 1,
        backgroundColor: C.lightGray,
        padding: 10,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: C.border,
        marginRight: 1,
    },
    summaryCardLast: { marginRight: 0 },
    summaryCardAccent: { backgroundColor: '#E8E8E8' },
    summaryLabel: { fontSize: 7.5, color: C.midGray, fontWeight: 700, marginBottom: 4 },
    summaryValue: { fontSize: 13, fontWeight: 700, color: C.black },
    summaryValueAccent: { color: C.accent },
    tableHeader: { flexDirection: 'row', backgroundColor: C.accent, paddingVertical: 7 },
    tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 0.3, borderBottomColor: C.border },
    tableRowEven: { backgroundColor: C.lightGray },
    thText: { color: C.white, fontWeight: 700, fontSize: 8, textAlign: 'center' },
    tdText: { color: C.black, fontSize: 8.5 },
    tdRight: { color: C.darkGray, fontSize: 8.5, textAlign: 'right' },
    tdExpense: { color: C.black, fontSize: 8.5, fontWeight: 700, textAlign: 'right' },
    tdCenter: { color: C.black, fontSize: 8.5, textAlign: 'center' },
    colDate: { width: '13%', paddingHorizontal: 4 },
    colType: { width: '9%', paddingHorizontal: 4 },
    colDesc: { width: '40%', paddingHorizontal: 4 },
    colAmount: { width: '20%', paddingHorizontal: 4 },
    colNote: { width: '18%', paddingHorizontal: 4 },
    tableBorder: { borderWidth: 0.5, borderColor: C.border },
    dividerThin: { borderBottomWidth: 0.5, borderBottomColor: C.border, marginVertical: 8 },
    remarksText: { fontSize: 8, color: C.midGray, lineHeight: 1.6 },
    footer: { borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 6, marginTop: 'auto' },
    footerText: { fontSize: 7.5, color: C.midGray, textAlign: 'center' },
});

const fmtWon = (n) => n.toLocaleString('ko-KR');

const MomoPdfTemplate = ({ data }) => {
    const finalBalance = data.previousBalance + data.totalIncome - data.totalExpense;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <Text style={styles.meetingName}>{data.meetingName}</Text>
                    <Text style={styles.issueDate}>발행일: {data.issueDate}</Text>
                </View>
                <Text style={styles.reportMonth}>{data.reportMonth} 회비 내역서</Text>
                <View style={styles.dividerBold} />

                <Text style={styles.sectionHeader}>■ 수입/지출 요약</Text>
                <View style={styles.summaryRow}>
                    {[
                        { label: '전월 이월금', value: data.previousBalance, accent: false },
                        { label: '당월 총 수입', value: data.totalIncome, accent: false },
                        { label: '당월 총 지출', value: data.totalExpense, accent: false },
                        { label: '최종 잔액', value: finalBalance, accent: true },
                    ].map((item, i, arr) => (
                        <View
                            key={i}
                            style={[
                                styles.summaryCard,
                                item.accent && styles.summaryCardAccent,
                                i === arr.length - 1 && styles.summaryCardLast,
                            ]}
                        >
                            <Text style={styles.summaryLabel}>{item.label}</Text>
                            <Text style={[styles.summaryValue, item.accent && styles.summaryValueAccent]}>
                                {fmtWon(item.value)}원
                            </Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionHeader}>■ 상세 내역</Text>
                <View style={styles.tableBorder}>
                    <View style={styles.tableHeader}>
                        {['날짜', '구분', '내역', '금액(원)', '비고'].map((h, i) => (
                            <View key={i} style={[
                                styles.colDate,
                                i === 1 && styles.colType,
                                i === 2 && styles.colDesc,
                                i === 3 && styles.colAmount,
                                i === 4 && styles.colNote,
                            ]}>
                                <Text style={styles.thText}>{h}</Text>
                            </View>
                        ))}
                    </View>

                    {data.transactions.map((tx, i) => (
                        <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowEven]}>
                            <View style={styles.colDate}>
                                <Text style={styles.tdCenter}>{tx.date.slice(5)}</Text>
                            </View>
                            <View style={styles.colType}>
                                <Text style={styles.tdCenter}>{tx.type === 'income' ? '수입' : '지출'}</Text>
                            </View>
                            <View style={styles.colDesc}>
                                <Text style={styles.tdText}>{tx.description}</Text>
                            </View>
                            <View style={styles.colAmount}>
                                <Text style={tx.type === 'income' ? styles.tdRight : styles.tdExpense}>
                                    {tx.type === 'income' ? '+' : '−'} {fmtWon(tx.amount)}
                                </Text>
                            </View>
                            <View style={styles.colNote}>
                                <Text style={styles.tdCenter}>{tx.note ?? ''}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {data.remarks && (
                    <>
                        <View style={styles.dividerThin} />
                        <Text style={styles.sectionHeader}>■ 비고</Text>
                        <Text style={styles.remarksText}>{data.remarks}</Text>
                    </>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Momo — My Meetings에서 생성됨  |  본 문서는 자동 생성된 회비 내역서입니다.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default MomoPdfTemplate;
