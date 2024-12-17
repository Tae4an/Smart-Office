// components/layout/Sidebar.js
import {NavLink} from "react-router-dom";
import PropTypes from 'prop-types';
import {useState} from 'react';
import {BoardAPI} from '../../utils/boardApi';
import '../../styles/layout.css';

const Sidebar = ({isMenuOpen, setIsMenuOpen}) => {
    const [boards, setBoards] = useState([]);
    const [isBoardOpen, setIsBoardOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const boardList = [
        {id: 1, name: '인사팀', description: '인사팀 공지사항 게시판'},
        {id: 2, name: '개발팀', description: '개발팀 업무 게시판'},
        {id: 3, name: '마케팅팀', description: '마케팅팀 소식 게시판'},
        {id: 4, name: '재무팀', description: '재무팀 공지사항 게시판'},
        {id: 5, name: '영업팀', description: '영업팀 업무 게시판'},
        {id: 6, name: '총무팀', description: '총무팀 공지사항 게시판'},
        {id: 7, name: '보안팀', description: '보안팀 공지사항 게시판'},
        {id: 8, name: '법무팀', description: '법무팀 공지사항 게시판'}
    ];

    const menuItems = [
        {path: "/home", label: "Home", icon: "fas fa-home"},
        {path: "/calendar", label: "Calendar", icon: "fas fa-calendar"},
        {path: "/messenger", label: "Messenger", icon: "fas fa-comment"},
        {path: "/file", label: "File", icon: "fas fa-file"},
        {path: "/meeting", label: "Meeting", icon: "fas fa-video"},
        {path: "/map", label: "Map", icon: "fas fa-map-marked-alt"}
    ];

    const toggleBoardMenu = () => {
        setIsBoardOpen(!isBoardOpen);
    };


    return (
        <>
            <aside className={`sidebar ${isMenuOpen ? 'show' : ''}`}>
                <div className="sidebar-header">
                    <NavLink to="/home" className="brand">
                        <span className="brand-text">Dashboard</span>
                    </NavLink>
                </div>
                <nav className="nav-menu">
                    <ul className="nav-list">
                        {/* Home 메뉴 */}
                        <li className="nav-item">
                            <NavLink
                                to="/home"
                                className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                                end
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <i className="fas fa-home"></i>
                                <span>Home</span>
                            </NavLink>
                        </li>

                        {/* 게시판 메뉴 - Home 바로 다음에 위치 */}
                        <li className="nav-item">
                            <div
                                className={`nav-link board-toggle ${isBoardOpen ? 'active' : ''}`}
                                onClick={toggleBoardMenu}
                            >
                                <i className="fas fa-list"></i>
                                <span>Board</span>
                                <i className={`fas fa-chevron-${isBoardOpen ? 'up' : 'down'} board-arrow`}></i>
                            </div>
                            <ul className={`board-submenu ${isBoardOpen ? 'open' : ''}`}>
                                {boardList.map((board) => (
                                    <li key={board.id} className="board-submenu-item">
                                        <NavLink
                                            to={`/boards/${board.id}`}
                                            className={({isActive}) => `board-link ${isActive ? 'active' : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <span>{board.name}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </li>

                        {/* 나머지 메뉴 아이템들 */}
                        {menuItems.slice(1).map((item) => (
                            <li key={item.path} className="nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <i className={item.icon}></i>
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <div
                className={`sidebar-overlay ${isMenuOpen ? 'show' : ''}`}
                onClick={() => setIsMenuOpen(false)}
            />
        </>
    );
};

Sidebar.propTypes = {
    isMenuOpen: PropTypes.bool.isRequired,
    setIsMenuOpen: PropTypes.func.isRequired
};

export default Sidebar;