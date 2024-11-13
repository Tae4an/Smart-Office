import '../../styles/home.css';

const About = () => {
    return(
        <section className="about">
            <div className="about-container">
                <div className="about-content">
                    <h2 className="about-title">
                        <span className="gradient-text">About Me</span>
                    </h2>

                    <div className="about-text">
                        <h3 className="about-name">
                            My name is Start Bootstrap and I help brands grow.
                        </h3>

                        <p className="about-description">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. 
                            Fugit dolorum itaque qui unde quisquam consequatur autem. 
                            Eveniet quasi nobis aliquid cumque officiis sed rem iure 
                            ipsa! Praesentium ratione atque dolorem?
                        </p>

                        <div className="social-links">
                            <a href="#!" className="social-link gradient-text">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#!" className="social-link gradient-text">
                                <i className="fab fa-linkedin-in"></i>
                            </a>
                            <a href="#!" className="social-link gradient-text">
                                <i className="fab fa-github"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;