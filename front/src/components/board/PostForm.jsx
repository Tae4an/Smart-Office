import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Stack,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { BoardAPI } from '../../utils/boardApi';
import '../../styles/postForm.css';

const PostForm = () => {
    const navigate = useNavigate();
    const { boardId, postId } = useParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        boardId: boardId
    });
    const [files, setFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);

    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) return;

            try {
                const [postResponse, filesResponse] = await Promise.all([
                    BoardAPI.getPostDetail(postId),
                    BoardAPI.getPostAttachments(postId)
                ]);

                const { title, content } = postResponse.data;
                setFormData(prev => ({
                    ...prev,
                    title,
                    content
                }));
                setExistingFiles(filesResponse.data);
            } catch (error) {
                console.error('데이터 로드 실패:', error);
                alert('데이터를 불러오는데 실패했습니다.');
                navigate(`/boards/${boardId}`);
            }
        };

        fetchPost();
    }, [postId, boardId, navigate]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const handleFileDelete = (indexToDelete) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToDelete));
    };

    const handleExistingFileDelete = async (fileId) => {
        try {
            await BoardAPI.deletePostAttachment(postId, fileId);
            setExistingFiles(prev => prev.filter(file => file.id !== fileId));
        } catch (error) {
            console.error('파일 삭제 실패:', error);
            alert('파일 삭제에 실패했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formDataWithFiles = new FormData();
        formDataWithFiles.append('title', formData.title);
        formDataWithFiles.append('content', formData.content);
        formDataWithFiles.append('boardId', boardId);

        files.forEach(file => {
            formDataWithFiles.append('attachments', file);
        });

        try {
            if (postId) {
                await BoardAPI.updatePost(postId, formDataWithFiles);
            } else {
                await BoardAPI.createPost(formData, files);
            }
            navigate(`/boards/${boardId}`);
        } catch (error) {
            console.error('게시글 저장 실패:', error);
            alert('게시글 저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBack = () => {
        navigate(`/boards/${boardId}`);
    };

    return (
        <div className="post-form-page">
            <div className="post-form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-header">
                        <IconButton
                            onClick={handleBack}
                            className="back-button"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography
                            variant="h5"
                            component="h1"
                            className="form-title"
                            sx={{ flexGrow: 1 }}
                        >
                            {postId ? '게시글 수정' : '새 게시글 작성'}
                        </Typography>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={loading}
                            className="save-button"
                        >
                            {postId ? '수정' : '저장'}
                        </Button>
                    </div>

                    <div className="form-content">
                        <Stack spacing={3}>
                            <TextField
                                className="title-input"
                                name="title"
                                label="제목"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                fullWidth
                                variant="outlined"
                            />
                            <TextField
                                className="content-input"
                                name="content"
                                label="내용"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                fullWidth
                                multiline
                                rows={15}
                                variant="outlined"
                            />
                        </Stack>

                        <div className="file-section">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                id="file-input"
                            />
                            <label htmlFor="file-input">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<AttachFileIcon />}
                                    className="attach-button"
                                >
                                    파일 첨부
                                </Button>
                            </label>

                            {existingFiles.length > 0 && (
                                <List className="file-list">
                                    <Typography variant="subtitle2" className="file-list-title">
                                        기존 첨부 파일
                                    </Typography>
                                    {existingFiles.map((file) => (
                                        <ListItem
                                            key={file.id}
                                            className="file-item"
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleExistingFileDelete(file.id)}
                                                    className="delete-button"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemIcon>
                                                <InsertDriveFileIcon className="file-icon" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={file.originalFileName}
                                                secondary={`${(file.fileSize / 1024 / 1024).toFixed(2)} MB`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}

                            {files.length > 0 && (
                                <List className="file-list">
                                    <Typography variant="subtitle2" className="file-list-title">
                                        새로 첨부한 파일
                                    </Typography>
                                    {files.map((file, index) => (
                                        <ListItem
                                            key={index}
                                            className="file-item"
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleFileDelete(index)}
                                                    className="delete-button"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemIcon>
                                                <InsertDriveFileIcon className="file-icon" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={file.name}
                                                secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostForm;