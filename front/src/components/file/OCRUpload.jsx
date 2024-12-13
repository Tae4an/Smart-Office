import React, {useCallback, useEffect, useState} from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import {uploadOCRFile} from "../../utils/gcsApi";

const OCRUpload = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState('');
    const [ocrResult, setOcrResult] = useState(null); // OCR 결과 상태 추가
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

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

            // 이미지 파일인 경우에만 미리보기 생성
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                setPreviewUrl(null); // PDF는 미리보기 없음
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

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError('');
        setOcrResult(null);
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError('');
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
                            <h3>OCR 결과</h3>
                            <div className="upload-section">
                                <div className="file-info">
                                    <span className="file-name">신뢰도:</span>
                                    <span>{(ocrResult?.data?.confidence * 100)?.toFixed(2)}%</span>
                                </div>
                                <div style={{
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre-wrap',
                                    background: 'var(--light)',
                                    padding: '1rem',
                                    borderRadius: 'var(--border-radius)',
                                    marginTop: '1rem'
                                }}>
                                    {ocrResult?.data?.text}
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
        </div>
    );
};

export default OCRUpload;