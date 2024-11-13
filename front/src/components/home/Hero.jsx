import { Link } from 'react-router-dom';
import profileImage from '../../assets/profile.png';
import '../../styles/home.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-container">
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="badge">
                            <span>Design · Development · Marketing</span>
                        </div>

                        <p className="subtitle">I can help your business to</p>

                        <h1 className="title">
                            <span className="gradient-text">Get online and grow fast</span>
                        </h1>

                        <div className="hero-buttons">
                            <Link to="/resume" className="btn btn-primary">
                                Resume
                            </Link>
                            <Link to="/projects" className="btn btn-primary">
                                Projects
                            </Link>
                        </div>
                    </div>

                    <div className="hero-profile">
                        <div className="profile">
                            <img
                             src={profileImage}
                             alt="Profile"
                             className="profile-img"
                            />
                            <div className="dots dots-1">
                                <svg viewBox="0 0 191.6 1215.4">
                                    <path d="M227.7,12788.6c-105-35-200-141-222-248c-43-206,163-412,369-369c155,32,275,190,260,339c-11,105-90,213-190,262 C383.7,12801.6,289.7,12808.6,227.7,12788.6z" />
                                </svg>
                            </div>
                            <div className="dots dots-2">
                                <svg viewBox="0 0 191.6 1215.4">
                                    <path d="M227.7,12788.6c-105-35-200-141-222-248c-43-206,163-412,369-369c155,32,275,190,260,339c-11,105-90,213-190,262 C383.7,12801.6,289.7,12808.6,227.7,12788.6z" />
                                </svg>
                            </div>
                            <div className="dots dots-3">
                                <svg viewBox="0 0 191.6 1215.4">
                                    <path d="M227.7,12788.6c-105-35-200-141-222-248c-43-206,163-412,369-369c155,32,275,190,260,339c-11,105-90,213-190,262 C383.7,12801.6,289.7,12808.6,227.7,12788.6z" />
                                </svg>
                            </div>
                            <div className="dots dots-4">
                                <svg viewBox="0 0 191.6 1215.4">
                                    <path d="M227.7,12788.6c-105-35-200-141-222-248c-43-206,163-412,369-369c155,32,275,190,260,339c-11,105-90,213-190,262 C383.7,12801.6,289.7,12808.6,227.7,12788.6z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;