import React from 'react';
import UploadForm from '../components/file/UploadForm';
import '../styles/filePage.css';

const File = () => {
    return (
        <div className="page hub-page">
            <div className="hub-container">
                <div className="file-header">
                    <h1 className="file-title">Hub</h1>
                </div>
                <UploadForm />
            </div>
        </div>
    );
};

export default File;