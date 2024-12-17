// CommentList.jsx
import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    Typography,
    IconButton,
    Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import '../../styles/comment.css';

const CommentList = ({ comments, onCommentDelete }) => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

    return (
        <List className="comment-list">
            {comments.map((comment) => (
                <ListItem
                    key={comment.id}
                    alignItems="flex-start"
                    className="comment-item"
                    secondaryAction={
                        userInfo.employeeId === comment.authorEmployeeId && (
                            <IconButton
                                edge="end"
                                className="delete-button"
                                onClick={() => onCommentDelete(comment.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        )
                    }
                >
                    <ListItemText
                        primary={
                            <Stack direction="row" spacing={2} alignItems="center" className="comment-header">
                                <Typography className="comment-author" component="span">
                                    {comment.authorName}
                                </Typography>
                                <Typography className="comment-date" component="span">
                                    {new Date(comment.createdAt).toLocaleString('ko-KR')}
                                </Typography>
                            </Stack>
                        }
                        secondary={
                            <Typography className="comment-content" component="p">
                                {comment.content}
                            </Typography>
                        }
                    />
                </ListItem>
            ))}
        </List>
    );
};

export default CommentList;