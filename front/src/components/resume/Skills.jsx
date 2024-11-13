import '../../styles/resume.css';

const Skills = () => {
  const professionalSkills = [
    "SEO/SEM Marketing",
    "Statistical Analysis",
    "Web Development",
    "Network Security",
    "Adobe Software Suite",
    "User Interface Design"
  ];

  const languages = [
    "HTML",
    "CSS",
    "JavaScript",
    "Python",
    "Ruby",
    "Node.js"
  ];

  return (
    <section className="skills">
      <div className="skills-container card">
        <div className="card-body">
          <div className="skills-section">
            <div className="section-header">
              <div className="icon-box">
                <i className="bi bi-tools"></i>
              </div>
              <h3 className="gradient-text">Professional Skills</h3>
            </div>

            <div className="skills-grid">
              {professionalSkills.map((skill, index) => (
                <div key={index} className="skill-item">
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="skills-section">
            <div className="section-header">
              <div className="icon-box">
                <i className="bi bi-code-slash"></i>
              </div>
              <h3 className="gradient-text">Languages</h3>
            </div>

            <div className="skills-grid">
              {languages.map((language, index) => (
                <div key={index} className="skill-item">
                  {language}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;