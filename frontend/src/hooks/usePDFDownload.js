import { pdf } from '@react-pdf/renderer';
import React, { useCallback, useState } from 'react';
import MomoPdfTemplate from '../components/pdf/MomoPdfTemplate';

export function usePdfDownload() {
    const [isGenerating, setIsGenerating] = useState(false);

    const downloadPdf = useCallback(async (data) => {
        setIsGenerating(true);
        try {
            // PDF Blob 생성
            const blob = await pdf(
                React.createElement(MomoPdfTemplate, { data })
            ).toBlob();

            // 파일명 설정
            const safeName = data.meetingName.replace(/\s+/g, '_');
            // reportMonth 형식: "2026-03" 또는 "2026년 3월"
            let year, month;
            if (data.reportMonth.includes('년')) {
                [year, month] = data.reportMonth.replace('년 ', '-').replace('월', '').split('-');
            } else {
                [year, month] = data.reportMonth.split('-');
            }
            const fileName = `${safeName}_${year}년_${month}월_회비내역.pdf`;

            // 브라우저 다운로드 트리거
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('PDF 생성 실패:', err);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return { downloadPdf, isGenerating };
}
