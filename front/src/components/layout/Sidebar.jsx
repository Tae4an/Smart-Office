import { NavLink } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState } from 'react';
import '../../styles/layout.css';

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
    const menuItems = [
        { path: "/home", label: "Home", icon: "fas fa-home" },
        { path: "/calendar", label: "Calendar", icon: "fas fa-calendar" },
        { path: "/messenger", label: "Messenger", icon: "fas fa-comment" },
        { path: "/file", label: "File", icon: "fas fa-file" },
        { path: "/meeting", label: "Meeting", icon: "fas fa-video" },
        { path: "/map", label: "Map", icon: "fas fa-map-marked-alt" }
    ];

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
                        {menuItems.map((item) => (
                            <li key={item.path} className="nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    end={item.path === '/'}
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