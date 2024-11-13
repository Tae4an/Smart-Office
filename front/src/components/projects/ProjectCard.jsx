// ProjectCard.jsx
import PropTypes from 'prop-types';
import '../../styles/projects.css';

const ProjectCard = ({ project }) => {
  return (
    <div className="project-card">
      <div className="project-content">
        <div className="project-info">
          <h2 className="project-title">{project.title}</h2>
          <p className="project-description">{project.description}</p>
          <div className="project-tech-stack">
            {project.technologies.map((tech, index) => (
              <span key={index} className="tech-tag">
                {tech}
              </span>
            ))}
          </div>
          <div className="project-links">
            {project.demoUrl && (
              <a 
                href={project.demoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="project-link demo-link"
              >
                <i className="bi bi-play-circle"></i>
                Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="project-link github-link"
              >
                <i className="bi bi-github"></i>
                View Code
              </a>
            )}
          </div>
        </div>
        <div className="project-image">
          {project.image ? (
            <img 
              src={project.image} 
              alt={project.title} 
              className="project-img"
            />
          ) : (
            <div className="project-img-placeholder">
              <i className="bi bi-image"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    technologies: PropTypes.arrayOf(PropTypes.string).isRequired,
    image: PropTypes.string,
    demoUrl: PropTypes.string,
    githubUrl: PropTypes.string
  }).isRequired
};

export default ProjectCard;