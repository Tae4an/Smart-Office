import axiosInstance from './axiosInstance';

export const BoardAPI = {
    getAllBoards: () => axiosInstance.get('/boards/all'),
    getBoardsByDepartment: (departmentCode) => axiosInstance.get(`/boards/department/${departmentCode}`),

    getBoardPosts: (boardId, page = 0, size = 10) =>
        axiosInstance.get(`/posts/${boardId}`, {
            params: {
                page,
                size
            }
        }),
    searchPosts: (boardId, keyword, searchType = 'all', page = 0, size = 10) =>
        axiosInstance.get(`/posts/${boardId}`, {
            params: {
                keyword,
                searchType,
                page,
                size
            }
        }),
    getPostDetail: (postId) => axiosInstance.get(`/posts/detail/${postId}`),

    createPost: (postData, attachments) => {
        const formData = new FormData();
        formData.append('postData', new Blob([JSON.stringify(postData)], { type: 'application/json' }));

        if (attachments) {
            attachments.forEach(file => {
                formData.append('attachments', file);
            });
        }

        return axiosInstance.post('/posts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    updatePost: (postId, formData) => axiosInstance.put(`/posts/${postId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),
    deletePost: (postId) => axiosInstance.delete(`/posts/${postId}`),
    getPostAttachments: (postId) => axiosInstance.get(`/posts/${postId}/attachments`),
    deletePostAttachment: (postId, fileId) =>
        axiosInstance.delete(`/posts/${postId}/attachments/${fileId}`),
    downloadAttachment: (postId, fileId) =>
        axiosInstance.get(`/posts/${postId}/attachments/${fileId}/download`, {
            responseType: 'blob',
            headers: {
                'Accept': 'application/octet-stream'
            }
        }),

    getComments: (postId) => axiosInstance.get(`/comments/${postId}`),
    createComment: (commentData) => axiosInstance.post('/comments', commentData),
    deleteComment: (commentId) => axiosInstance.delete(`/comments/${commentId}`),
};