import PropTypes from 'prop-types';
import Header from './Header';
import Footer from './Footer';
import '../../styles/layout.css';
import { useEffect, useState } from 'react';

const Layout = ({ children }) => {
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
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}/>
            <main className={`main-content ${isMenuOpen ? 'menu-open' : ''}`}>
                <div className="page-container">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;