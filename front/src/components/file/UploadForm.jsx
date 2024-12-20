import React, { useRef, useState } from 'react';
import FileUpload from './FileUpload';
import OCRUpload from './OCRUpload';
import FileList from './FileList';
import { Code, FileText } from 'lucide-react';
import '../../styles/uploadForm.css';  // 추가된 CSS import

const UploadForm = () => {
    const [activeTab, setActiveTab] = useState('files');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const fileListRef = useRef(null);

    const handleTabChange = (tab) => {
        if (tab === activeTab) return;

        setIsTransitioning(true);
        setTimeout(() => {
            setActiveTab(tab);
            setIsTransitioning(false);
        }, 300);
    };

    const handleFileUploadSuccess = () => {
        if (fileListRef.current) {
            fileListRef.current.fetchFiles();
        }
    };

    const handleOCRUploadSuccess = (file) => {
        console.log('OCR Image uploaded:', file.name);
    };

    return (
        <div className="hub-container">
            {/* 탭 네비게이션 */}
            <div className="tab-navigation">
                <nav className="flex">
                    <button
                        onClick={() => handleTabChange('files')}
                        className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
                    >
                        <span className="tab-button-icon">
                            <FileText className="w-4 h-4" />
                            Files
                        </span>
                    </button>
                    <button
                        onClick={() => handleTabChange('ocr')}
                        className={`tab-button ${activeTab === 'ocr' ? 'active' : ''}`}
                    >
                        <span className="tab-button-icon">
                            <Code className="w-4 h-4" />
                            OCR
                        </span>
                    </button>
                </nav>
            </div>

            {/* 탭 콘텐츠 */}
            <div className="hub-form">
                <div className={`tab-content ${!isTransitioning ? 'active' : ''}`}>
                    {activeTab === 'files' && (
                        <div className="upload-section">
                            <FileUpload onUploadSuccess={handleFileUploadSuccess} />
                            <div className="file-section">
                                <FileList ref={fileListRef} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'ocr' && (
                        <div className="upload-section">
                            <OCRUpload onUploadSuccess={handleOCRUploadSuccess} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadForm;