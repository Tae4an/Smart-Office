import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import '../../styles/fileList.css';

const FileListItem = ({ file, onDownload, onDelete }) => {
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

    return (
        <tr>
            <td>{file.originalFileName || file.fileName}</td>
            <td>{formatFileSize(file.fileSize)}</td>
            <td>{file.contentType}</td>
            <td>{formatDate(file.uploadTime)}</td>
            <td className="file-actions">
                <button
                    className="file-action-btn"
                    onClick={() => onDownload(file.fileName)}
                    title="다운로드"
                >
                    <Download size={20} />
                </button>
                <button
                    className="file-action-btn"
                    onClick={() => onDelete(file.fileName)}
                    title="삭제"
                >
                    <Trash2 size={20} />
                </button>
            </td>
        </tr>
    );
};

export default FileListItem;