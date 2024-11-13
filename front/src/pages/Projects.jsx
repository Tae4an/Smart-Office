// Projects.jsx
import ProjectCard from '../components/projects/ProjectCard';
import { Link } from 'react-router-dom';
import '../styles/projects.css';

const Projects = () => {
  const projects = [
    {
      title: "Project Name 1",
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. 
        Eius at enim eum illum aperiam placeat esse? Mollitia omnis minima 
        saepe recusandae libero, iste ad asperiores! Explicabo commodi quo 
        itaque! Ipsam!`,
      technologies: ["React", "Node.js", "MongoDB"],
      image: "https://dummyimage.com/300x400/343a40/6c757d",
      demoUrl: "https://example.com",
      githubUrl: "https://github.com"
    },
    {
      title: "Project Name 2",
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. 
        Eius at enim eum illum aperiam placeat esse? Mollitia omnis minima 
        saepe recusandae libero, iste ad asperiores! Explicabo commodi quo 
        itaque! Ipsam!`,
      technologies: ["Vue.js", "Express", "PostgreSQL"],
      image: "https://dummyimage.com/300x400/343a40/6c757d",
      demoUrl: "https://example.com",
      githubUrl: "https://github.com"
    }
  ];

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1 className="projects-title">
          <span className="gradient-text">Projects</span>
        </h1>
      </div>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>

      <div className="projects-cta">
        <h2 className="cta-title">Let's build something together</h2>
        <Link to="/contact" className="btn btn-outline-light">
          Contact me
        </Link>
      </div>
    </div>
  );
};

export default Projects;