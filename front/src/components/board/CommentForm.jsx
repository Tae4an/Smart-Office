// CommentForm.jsx
import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Stack
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import '../../styles/comment.css';

const CommentForm = ({ postId, onCommentSubmit }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            await onCommentSubmit({
                postId,
                content: content.trim()
            });
            setContent('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} className="comment-form">
            <Stack direction="row" spacing={2}>
                <TextField
                    className="comment-input"
                    fullWidth
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="댓글을 입력하세요"
                    size="small"
                    disabled={loading}
                    multiline
                    maxRows={4}
                />
                <Button
                    type="submit"
                    className="submit-button"
                    endIcon={<SendIcon />}
                    disabled={loading || !content.trim()}
                >
                    등록
                </Button>
            </Stack>
        </Box>
    );
};

export default CommentForm;