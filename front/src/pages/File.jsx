import React from 'react';
import UploadForm from '../components/file/UploadForm';
import '../styles/filePage.css';

const File = () => {
    return (
        <div className="page hub-page">
            <div className="hub-container">
                <UploadForm />
            </div>
        </div>
    );
};

export default File;