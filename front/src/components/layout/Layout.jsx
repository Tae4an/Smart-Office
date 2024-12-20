import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import backgroundImage from '../../assets/backgroundImage.jpg';
import '../../styles/layout.css';

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'visible';
        }
        return () => {
            document.body.style.overflow = 'visible';
        };
    }, [isMenuOpen]);

    return(
        <div className="layout">
            <Header setIsMenuOpen={setIsMenuOpen} />
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <main className="main-content">
                <div className="page-container">
                    <Outlet />
                </div>
            </main>
            <BottomNav />
            <Footer />
            {/* 모바일에서 사이드바가 열릴 때 오버레이 추가 */}
            {isMenuOpen && (
                <div
                    className={`sidebar-overlay ${isMenuOpen ? 'show' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;