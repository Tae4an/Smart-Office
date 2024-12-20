import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Download, Trash2, File, FileText, Image, Archive } from 'lucide-react';
import { getUserFileList, downloadFile, deleteFile } from '../../utils/gcsApi';
import '../../styles/fileList.css';

const FileList = forwardRef((props, ref) => {
    const [files, setFiles] = useState([]);

    const fetchFiles = async () => {
        try {
            const response = await getUserFileList();
            setFiles(response.data);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        }
    };

    useImperativeHandle(ref, () => ({
        fetchFiles
    }));

    useEffect(() => {
        fetchFiles();
    }, []);

    const getFileIcon = (contentType) => {
        if (contentType.startsWith('image/')) {
            return <Image className="w-5 h-5 text-blue-500" />;
        } else if (contentType.includes('pdf') || contentType.includes('document')) {
            return <FileText className="w-5 h-5 text-red-500" />;
        } else if (contentType.includes('zip') || contentType.includes('rar')) {
            return <Archive className="w-5 h-5 text-yellow-500" />;
        }
        return <File className="w-5 h-5 text-gray-500" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownload = async (fileName) => {
        try {
            await downloadFile(fileName);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleDelete = async (fileName) => {
        try {
            await deleteFile(fileName);
            fetchFiles();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    return (
        <div className="file-section">
            <div className="file-section-header">
                <div className="text-sm text-gray-600">
                    지원 형식: 이미지(JPG, PNG, GIF), 문서(PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT), 압축파일(ZIP, RAR)
                    <br />
                    최대 10MB
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="file-table">
                    <thead>
                    <tr>
                        <th>파일명</th>
                        <th>크기</th>
                        <th>타입</th>
                        <th>업로드 일자</th>
                        <th>작업</th>
                    </tr>
                    </thead>
                    <tbody>
                    {files.map((file) => (
                        <tr key={file.fileName}>
                            <td>
                                <div className="flex items-center">
                                    {getFileIcon(file.contentType)}
                                    <span className="ml-2">{file.originalFileName || file.fileName}</span>
                                </div>
                            </td>
                            <td>{formatFileSize(file.fileSize)}</td>
                            <td>{file.contentType}</td>
                            <td>{formatDate(file.uploadTime)}</td>
                            <td>
                                <div className="file-actions">
                                    <button
                                        onClick={() => handleDownload(file.fileName)}
                                        className="file-action-btn"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.fileName)}
                                        className="file-action-btn"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {files.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center">
                                업로드된 파일이 없습니다.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

FileList.displayName = 'FileList';

export default FileList;