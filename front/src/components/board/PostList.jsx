import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import {
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    TablePagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { BoardAPI } from '../../utils/boardApi';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import '../../styles/postList.css';

const PostList = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [boardName, setBoardName] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    // 게시판 ID에 따른 이름 매핑
    const boardNames = {
        '1': '인사팀',
        '2': '개발팀',
        '3': '마케팅팀',
        '4': '재무팀',
        '5': '영업팀',
        '6': '총무팀',
        '7': '보안팀',
        '8': '법무팀'
    };

    useEffect(() => {
        setBoardName(boardNames[boardId] || '');
    }, [boardId]);

    const columns = [
        {
            field: 'id',
            headerName: '번호',
            width: 90,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'title',
            headerName: '제목',
            width: 400,
            renderCell: (params) => (
                <Box
                    className="post-title-cell"
                    onClick={() => navigate(`/boards/${boardId}/posts/${params.row.id}`)}
                >
                    {params.value}
                </Box>
            )
        },
        {
            field: 'authorName',
            headerName: '작성자',
            width: 150,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'createdAt',
            headerName: '작성일',
            width: 200,
            headerAlign: 'center',
            align: 'center',
            valueFormatter: (params) => {
                try {
                    const date = new Date(params);
                    if (isNaN(date.getTime())) return '-';

                    return date.toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }).replace(/\./g, '-').replace('시', ':');
                } catch (error) {
                    console.error('날짜 포맷팅 에러:', error);
                    return '-';
                }
            }
        }
    ];
    const fetchPosts = async () => {
        setLoading(true);
        try {
            let response;
            if (searchKeyword) {
                response = await BoardAPI.searchPosts(
                    boardId,
                    searchKeyword,
                    searchType,
                    page,
                    pageSize
                );
            } else {
                response = await BoardAPI.getBoardPosts(
                    boardId,
                    page,
                    pageSize
                );
            }
            console.log('서버 응답:', response.data); // 서버에서 오는 데이터 확인
            setPosts(response.data.content);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error('게시글을 불러오는데 실패했습니다:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPosts();
    }, [boardId, page, pageSize, searchKeyword, searchType]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setPage(0);
        await fetchPosts();
    };

    const handleCreatePost = () => {
        navigate(`/boards/${boardId}/posts/new`);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (event) => {
        setPageSize(parseInt(event.target.value, 5));
        setPage(0);
    };

    return (
        <div className="post-list-page">
            <div className="post-list-container">
                <div className="board-header">
                    <Typography variant="h4" component="h1" className="board-title">
                        {boardName} 게시판
                    </Typography>
                </div>

                <div className="search-bar-container">
                    <form onSubmit={handleSearch} className="search-form">
                        <FormControl className="search-select">
                            <InputLabel>검색 조건</InputLabel>
                            <Select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                size="small"
                                label="검색 조건"
                            >
                                <MenuItem value="all">전체</MenuItem>
                                <MenuItem value="title">제목</MenuItem>
                                <MenuItem value="content">내용</MenuItem>
                                <MenuItem value="author">작성자</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            className="search-input"
                            size="small"
                            variant="outlined"
                            placeholder="검색어를 입력하세요"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton className="search-button" type="submit">
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </form>
                    <Button
                        className="write-button"
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreatePost}
                    >
                        글쓰기
                    </Button>
                </div>

                <div className="data-grid-container">
                    <DataGrid
                        rows={posts}
                        columns={columns}
                        pagination
                        paginationModel={{
                            page,
                            pageSize,
                        }}
                        onPaginationModelChange={(model) => {
                            setPage(model.page);
                            setPageSize(model.pageSize);
                        }}
                        pageSizeOptions={[5, 10, 20, 50]}
                        rowCount={totalElements}
                        paginationMode="server"
                        loading={loading}
                        localeText={{
                            ...koKR,
                            MuiTablePagination: {
                                labelDisplayedRows: ({ from, to, count }) =>
                                    `전체 ${count}개 중 ${from}-${to}`,
                                labelRowsPerPage: '페이지당 행 수:',
                            },
                        }}
                        components={{
                            Pagination: (props) => (
                                <Box className="pagination-container">
                                    <TablePagination
                                        component="div"
                                        count={totalElements}
                                        page={page}
                                        onPageChange={handlePageChange}
                                        rowsPerPage={pageSize}
                                        onRowsPerPageChange={handlePageSizeChange}
                                        labelRowsPerPage="페이지당 게시글 수"
                                        labelDisplayedRows={({ from, to, count }) =>
                                            `${from}-${to} / 총 ${count}개`
                                        }
                                        rowsPerPageOptions={[5, 10, 20, 50]}
                                    />
                                </Box>
                            ),
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PostList;