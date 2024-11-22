// 메인 화면
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import '../styles/pages.css'

const Home = () => {
  return (
    <div className="page home-page">
      <Hero />
      <About />
    </div>
  );
};

export default Home;