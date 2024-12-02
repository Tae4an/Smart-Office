import { NavLink, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import '../../styles/layout.css';

const Header = ({ setIsMenuOpen }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // 로그아웃 로직
            // const response = await fetch('/logout', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type' : 'application/json'
            //     }
            // });

            // if (!response.ok) {
            //     throw new Error('로그아웃 처리 중 오류가 발생했습니다.');
            // }
            
            // 로컬 스토리지에서 인증 관련 데이터 제거
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // 로그아웃 후 로그인 페이지로 리다이렉트
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    };

    return(
        <header className="header">
            <div className="header-container">
                <NavLink to="/home" className="brand">
                    <span className="brand-text">Dashboard</span>
                </NavLink>
                <div className="header-right">
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>로그아웃</span>
                    </button>
                    <button
                        className="menu-toggle"
                        onClick={() => setIsMenuOpen(prev => !prev)}
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    setIsMenuOpen: PropTypes.func.isRequired
}

export default Header;