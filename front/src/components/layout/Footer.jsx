import { Link } from 'react-router-dom';
import '../../styles/layout.css';

const Footer = () => {
    return(
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="copyright">
                        Copyright @ Smart-Office
                    </div>

                    <div className="footer-links">
                        <a 
                            href="https://github.com/Tae4an/Smart-Office" 
                            className="footer-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;