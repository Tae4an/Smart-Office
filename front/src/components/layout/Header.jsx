import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import '../../styles/layout.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

    // 윈도우 리사이즈 감지
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 576) {
                setIsMenuOpen(false);
            }
            setIsMobile(window.innerWidth <= 576);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);



    return(
        <header className="header">
            <div className="header-container">
                <NavLink to="/" className="brand">
                    <span className="brand-text">Start Bootstrap</span>
                </NavLink>

                {isMobile && (
                    <button 
                        className="menu-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-expanded={isMenuOpen}
                        aria-controls="nav-menu"
                    >
                        <span className="visually-hidden">Toggle Menu</span>
                        <i className={`bi ${isMenuOpen ? 'bi-x' : 'bi-list'}`}></i>
                    </button>
                )}

                <nav id="nav-menu" className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
                    <ul className="nav-list">
                        <li className="nav-item">
                            <NavLink
                             to="/"
                             className={({ isActive }) =>
                              isActive ? 'nav-link active' : 'nav-link'
                             }
                            >
                                Home
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                             to="/resume"
                             className={({ isActive }) =>
                              isActive ? 'nav-link active' : 'nav-link'
                             }
                            >
                                Resume
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                             to="/projects"
                             className={({ isActive }) =>
                              isActive ? 'nav-link active' : 'nav-link'
                             }
                            >
                                Projects
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                             to="/contact"
                             className={({ isActive }) =>
                              isActive ? 'nav-link active' : 'nav-link'
                             }
                            >
                                Contact
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;