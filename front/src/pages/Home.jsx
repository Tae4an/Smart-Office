import Hero from '../components/home/Hero';
import About from '../components/home/About';

const Home = () => {
  return (
    <div className="page home-page">
      <Hero />
      <About />
      <section className="py-5 bg-gradient-primary-to-secondary text-white">
        <div className="container px-5">
          <div className="text-center">
            <h2 className="display-4 fw-bolder">Let's build something together</h2>
            <a className="btn btn-outline-light btn-lg px-5 py-3 fs-6 fw-bolder" href="contact.html">
              Contact me
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;