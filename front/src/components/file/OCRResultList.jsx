// OCRResultList.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Brain, Download, Trash2 } from 'lucide-react';
import { getOCRResults, downloadOCRResult, deleteOCRResult } from '../../utils/ocrApi';
import '../../styles/ocrResult.css'
const OCRResultList = () => {
    const [results, setResults] = useState([]); // 빈 배열로 초기화
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const [error, setError] = useState(null); // 에러 상태 추가

    const fetchResults = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getOCRResults();
            setResults(Array.isArray(response) ? response : []); // 응답이 배열인지 확인
        } catch (error) {
            console.error('Failed to fetch OCR results:', error);
            setError('결과를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownload = async (id) => {
        try {
            await downloadOCRResult(id);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };


    const handleDelete = async (id) => {
        try {
            await deleteOCRResult(id);
            fetchResults(); // 삭제 후 목록 새로고침
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };
    if (loading) {
        return <div className="text-center py-4">로딩 중...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    return (
        <div className="ocr-result-section">
            <h3 className="section-title">저장된 OCR/분석 결과</h3>
            <div className="overflow-x-auto">
                <table className="result-table">
                    <thead>
                    <tr>
                        <th>파일명</th>
                        <th>저장 유형</th>
                        <th>신뢰도</th>
                        <th>저장 일자</th>
                        <th>작업</th>
                    </tr>
                    </thead>
                    <tbody>
                    {results.length > 0 ? (
                        results.map((result) => (
                            <tr key={result.id}>
                                <td>{result.fileName}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        {result.hasOCR && (
                                            <span className="type-badge ocr">
                                                    <FileText size={14} />
                                                    OCR
                                                </span>
                                        )}
                                        {result.hasAnalysis && (
                                            <span className="type-badge analysis">
                                                    <Brain size={14} />
                                                    분석
                                                </span>
                                        )}
                                    </div>
                                </td>
                                <td>{result.confidence ? `${(result.confidence * 100).toFixed(2)}%` : '-'}</td>
                                <td>{formatDate(result.createdAt)}</td>
                                <td>
                                    <div className="result-actions">
                                        <button
                                            onClick={() => handleDownload(result.id)}
                                            className="action-btn"
                                            title="다운로드"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(result.id)}
                                            className="action-btn delete"
                                            title="삭제"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-4">
                                저장된 결과가 없습니다.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OCRResultList;