import { Link } from 'react-router-dom';
import '../../styles/layout.css';

const Footer = () => {
    return(
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="copyright">
                        <p>Copyright @ Your Website 2024</p>
                    </div>

                    <div className="footer-links">
                        <Link to="/primary" className="footer-link">
                            Primary
                        </Link>
                        <span className="separator">·</span>
                        <Link to="/terms" className="footer-link">
                            Terms
                        </Link>
                        <span className="separator">·</span>
                        <Link to="/contact" className="footer-link">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;