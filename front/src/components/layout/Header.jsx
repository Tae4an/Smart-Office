import { useState } from "react";
import { NavLink } from "react-router-dom";
import '../../styles/layout.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return(
        <header className="header">
            <div className="header-container">
                <NavLink to="/" className="brand">
                    <span className="brand-text">Start Bootstrap</span>
                </NavLink>

                <button
                    className="menu-toggler"
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-expanded={isMenuOpen}
                    aria-controls="navMenu"
                >
                    <span className="toggler-icon"></span>
                </button>

                <nav className={`nav-menu ${isMenuOpen ? 'show' : ''}`} id="navMenu" >
                    <ul className="nav-list">
                        <li className="nav-item">
                            <NavLink to="/" className="nav-link">Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/resume" className="nav-link">Resume</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/projects" className="nav-link">Projects</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/contact" className="nav-link">Contact</NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;