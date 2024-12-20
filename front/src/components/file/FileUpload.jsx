import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { uploadFile } from '../../utils/gcsApi';
import '../../styles/fileUpload.css';

const FileUpload = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            const response = await uploadFile(selectedFile);
            onUploadSuccess(response.data);
            setUploadProgress(0);
            setSelectedFile(null);
            setPreviewUrl(null);
            setError('');
        } catch (error) {
            console.error('Upload failed:', error);
            setError(error.message || '파일 업로드에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        setError('');
    };

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // 파일 크기 체크
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
            } else {
                setPreviewUrl(null);
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/gif': ['.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'text/plain': ['.txt'],
            'application/zip': ['.zip'],
            'application/x-zip-compressed': ['.zip'],
            'application/x-rar-compressed': ['.rar']
        },
        multiple: false
    });

    // 파일 타입에 따른 아이콘이나 텍스트 표시를 위한 헬퍼 함수
    const getFileTypeDisplay = (file) => {
        if (!file) return '';
        if (file.type.startsWith('image/')) return '이미지';
        if (file.type.includes('pdf')) return 'PDF';
        if (file.type.includes('word')) return 'Word';
        if (file.type.includes('excel') || file.type.includes('spreadsheet')) return 'Excel';
        if (file.type.includes('powerpoint') || file.type.includes('presentation')) return 'PowerPoint';
        if (file.type.includes('zip') || file.type.includes('rar')) return '압축파일';
        if (file.type === 'text/plain') return '텍스트';
        return '파일';
    };

    return (
        <div className="w-full">
            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={`upload-dropzone ${isDragActive ? 'active' : ''}`}
                >
                    <input {...getInputProps()} />
                    <Upload size={48} className="upload-icon" />
                    <h3 className="text-lg font-semibold mb-2">
                        {isDragActive ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 선택'}
                    </h3>
                    <p className="upload-hint">
                        지원 형식: 이미지(JPG, PNG, GIF), 문서(PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT), 압축파일(ZIP, RAR)
                        <br />최대 10MB
                    </p>
                </div>
            ) : (
                <div className="selected-file">
                    {previewUrl && (
                        <div className="file-preview">
                            <img
                                src={previewUrl}
                                alt="파일 미리보기"
                                className="preview-image"
                            />
                        </div>
                    )}
                    <div className="file-info">
                        <span className="file-name">{getFileTypeDisplay(selectedFile)}:</span>
                        <span>{selectedFile.name}</span>
                        <span className="file-size">({formatFileSize(selectedFile.size)})</span>
                    </div>
                    <div className="file-actions">
                        <button
                            onClick={handleUpload}
                            className="upload-btn"
                        >
                            업로드
                        </button>
                        <button
                            onClick={handleCancel}
                            className="cancel-btn"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}
            {error && <div className="error-message">{error}</div>}
            {uploadProgress > 0 && (
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                    />
                    <div className="text-center text-sm text-gray-500 mt-1">
                        {uploadProgress}%
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;