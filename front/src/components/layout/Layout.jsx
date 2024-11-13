import PropTypes from 'prop-types';
import Header from './Header';
import Footer from './Footer';
import '../../styles/layout.css';
import { useEffect } from 'react';

const Layout = ({ children }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [children]);

    return(
        <div className="layout">
            <Header />
            <main className="main-content">
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