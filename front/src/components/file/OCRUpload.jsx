import React, {useCallback, useEffect, useState} from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { uploadOCRFile } from "../../utils/gcsApi";
import OCRResultList from './OCRResultList';
import '../../styles/ocrUpload.css';
import {saveOCRResult} from "../../utils/ocrApi";

const OCRUpload = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState('');
    const [ocrResult, setOcrResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [saveOptions, setSaveOptions] = useState({
        saveOCR: false,
        saveAnalysis: false
    });

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.size > 10 * 1024 * 1024) {
                setError('파일 크기가 10MB를 초과합니다.');
                return;
            }
            setSelectedFile(file);
            setError('');

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                setPreviewUrl(null);
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'application/pdf': ['.pdf']
        },
        multiple: false
    });

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsLoading(true);
        try {
            const response = await uploadOCRFile(selectedFile);
            console.log('OCR Response:', response);
            if (response && response.status === 'success') {
                setOcrResult(response);
                onUploadSuccess && onUploadSuccess(response);
                setError('');
            } else {
                setError('OCR 처리에 실패했습니다.');
            }
        } catch (error) {
            console.error('OCR Upload failed:', error);
            setError(error.message || 'OCR 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const saveData = {
                fileName: selectedFile.name,
                ocrText: saveOptions.saveOCR ? ocrResult.data.text : null,
                analysisText: saveOptions.saveAnalysis ? ocrResult.analysis : null,
                confidence: ocrResult.data.confidence
            };

            // API 호출
            const response = await saveOCRResult(saveData);

            if (response.success) {
                alert('저장되었습니다.');
                // 결과 리스트 새로고침
                if (window.ocrResultList) {
                    window.ocrResultList.fetchResults();
                }
            }
        } catch (error) {
            setError('저장 중 오류가 발생했습니다.');
            console.error('Save failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError('');
        setOcrResult(null);
        setSaveOptions({
            saveOCR: false,
            saveAnalysis: false
        });
    };

    const handleToggleView = () => {
        setShowAnalysis(!showAnalysis);
    };

    useEffect(() => {
        console.log('OCR Result updated:', ocrResult);
    }, [ocrResult]);

    return (
        <div className="hub-container">
            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={`upload-dropzone ${isDragActive ? 'active' : ''}`}
                >
                    <input {...getInputProps()} />
                    <ImageIcon size={48} className="upload-icon" />
                    <h3>
                        {isDragActive ? '파일을 여기에 놓으세요' : '이미지나 PDF를 드래그하거나 클릭하여 선택'}
                    </h3>
                    <p className="upload-hint">
                        지원 형식: JPG, PNG, PDF<br />최대 10MB
                    </p>
                </div>
            ) : (
                <div className="upload-section">
                    {isLoading && (
                        <>
                            <div className="modal-backdrop" />
                            <div className="loading-modal">
                                <div className="loading-spinner"></div>
                                <div className="loading-text">OCR 분석 중...</div>
                                <div style={{fontSize: '0.9rem', color: '#666', marginTop: '0.5rem'}}>
                                    잠시만 기다려주세요
                                </div>
                            </div>
                        </>
                    )}
                    
                    <div className="selected-file">
                        {previewUrl && (
                            <div className="file-preview">
                                <img
                                    src={previewUrl}
                                    alt="OCR 이미지 미리보기"
                                    className="preview-image"
                                />
                            </div>
                        )}
                        <div className="file-info">
                            <span className="file-name">선택된 파일:</span>
                            <span>{selectedFile.name}</span>
                            <span className="file-size">({formatFileSize(selectedFile.size)})</span>
                        </div>
                    </div>

                    {!ocrResult && (
                        <div className="file-actions">
                            <button
                                onClick={handleUpload}
                                disabled={isLoading}
                                className="upload-btn"
                            >
                                {isLoading ? "처리 중..." : "OCR 시작"}
                            </button>
                            <button
                                onClick={handleReset}
                                className="cancel-btn"
                            >
                                취소
                            </button>
                        </div>
                    )}

                    {ocrResult?.status === 'success' && (
                        <div className="file-section">
                            <div className="result-header">
                                <h3>분석 결과</h3>
                                <div className="result-actions">
                                    {/* 저장 옵션 */}
                                    <div className="save-options">
                                        <label className="save-option">
                                            <input
                                                type="checkbox"
                                                checked={saveOptions.saveOCR}
                                                onChange={(e) => setSaveOptions({
                                                    ...saveOptions,
                                                    saveOCR: e.target.checked
                                                })}
                                            />
                                            <span>OCR 텍스트 저장</span>
                                        </label>
                                        <label className="save-option">
                                            <input
                                                type="checkbox"
                                                checked={saveOptions.saveAnalysis}
                                                onChange={(e) => setSaveOptions({
                                                    ...saveOptions,
                                                    saveAnalysis: e.target.checked
                                                })}
                                            />
                                            <span>AI 분석 저장</span>
                                        </label>
                                        <button
                                            className="save-button"
                                            onClick={handleSave}
                                            disabled={!saveOptions.saveOCR && !saveOptions.saveAnalysis || isLoading}
                                        >
                                            <Save size={16} />
                                            {isLoading ? '저장 중...' : '저장하기'}
                                        </button>
                                    </div>

                                    {/* 토글 버튼 */}
                                    <button
                                        onClick={handleToggleView}
                                        className="toggle-button"
                                    >
                                        {showAnalysis ? (
                                            <>
                                                <ToggleRight className="toggle-icon" />
                                                OCR 텍스트 보기
                                            </>
                                        ) : (
                                            <>
                                                <ToggleLeft className="toggle-icon" />
                                                AI 분석 보기
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="upload-section">
                                <div className="result-section">
                                    {!showAnalysis ? (
                                        // OCR 텍스트 결과
                                        <>
                                            <h4 className="section-title">OCR 텍스트 추출</h4>
                                            <div className="file-info">
                                                <span className="file-name">신뢰도:</span>
                                                <span>{(ocrResult?.data?.confidence * 100)?.toFixed(2)}%</span>
                                            </div>
                                            <div className="text-content">
                                                {ocrResult?.data?.text}
                                            </div>
                                        </>
                                    ) : (
                                        // AI 분석 결과
                                        <>
                                            <h4 className="section-title">AI 문서 분석</h4>
                                            <div className="analysis-content">
                                               <pre className="analysis-text">
                                                   {ocrResult?.analysis}
                                               </pre>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={handleReset}
                                    className="upload-btn"
                                    style={{ marginTop: '1rem', width: '100%' }}
                                >
                                    새로운 이미지 업로드
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {error && <div className="error-message">{error}</div>}

            {/* OCR 결과 리스트 */}
            <OCRResultList />
        </div>
    );
};

export default OCRUpload;