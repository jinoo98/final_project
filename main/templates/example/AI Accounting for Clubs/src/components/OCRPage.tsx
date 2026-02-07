import { useState, useRef } from 'react';
import { Upload, Camera, FileText, CheckCircle, XCircle } from 'lucide-react';

interface OCRResult {
  id: string;
  fileName: string;
  date: string;
  items: {
    name: string;
    amount: number;
  }[];
  total: number;
  status: 'success' | 'processing' | 'error';
}

export function OCRPage() {
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([
    {
      id: '1',
      fileName: '영수증_2026-02-05.jpg',
      date: '2026-02-05',
      items: [
        { name: '아메리카노', amount: 4500 },
        { name: '카페라떼', amount: 5000 },
        { name: '샌드위치', amount: 6500 },
      ],
      total: 16000,
      status: 'success',
    },
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Simulate OCR processing
    const newResult: OCRResult = {
      id: Date.now().toString(),
      fileName: file.name,
      date: new Date().toISOString().split('T')[0],
      items: [],
      total: 0,
      status: 'processing',
    };

    setOcrResults([newResult, ...ocrResults]);

    // Simulate processing time
    setTimeout(() => {
      const processedResult: OCRResult = {
        ...newResult,
        items: [
          { name: '상품 1', amount: 10000 },
          { name: '상품 2', amount: 15000 },
        ],
        total: 25000,
        status: 'success',
      };
      setOcrResults(prev => 
        prev.map(r => r.id === newResult.id ? processedResult : r)
      );
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleAddToTransaction = (result: OCRResult) => {
    alert('거래 내역에 추가되었습니다!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">영수증 OCR</h2>
        <p className="text-muted-foreground">
          영수증을 촬영하거나 업로드하면 자동으로 금액을 인식합니다
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-blue-50'
            : 'border-border bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="flex justify-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h3 className="mb-2">영수증을 업로드하세요</h3>
        <p className="text-muted-foreground mb-6">
          파일을 드래그하거나 버튼을 클릭하여 업로드하세요
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            파일 선택
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            사진 촬영
          </button>
        </div>
      </div>

      {/* OCR Results */}
      <div className="space-y-4">
        <h3>처리 결과</h3>
        {ocrResults.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>아직 처리된 영수증이 없습니다</p>
          </div>
        ) : (
          ocrResults.map((result) => (
            <div key={result.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="mb-1">{result.fileName}</h4>
                    <p className="text-sm text-muted-foreground">{result.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.status === 'success' && (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      완료
                    </span>
                  )}
                  {result.status === 'processing' && (
                    <span className="flex items-center gap-1 text-primary text-sm">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      처리중
                    </span>
                  )}
                  {result.status === 'error' && (
                    <span className="flex items-center gap-1 text-red-600 text-sm">
                      <XCircle className="w-4 h-4" />
                      실패
                    </span>
                  )}
                </div>
              </div>

              {result.status === 'success' && (
                <>
                  <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg">
                    {result.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-muted-foreground">{item.name}</span>
                        <span>{item.amount.toLocaleString()}원</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border flex justify-between">
                      <span>총액</span>
                      <span className="text-xl text-primary">
                        {result.total.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToTransaction(result)}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    거래 내역에 추가
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
