import '../../styles/resume.css';

const Experience = () => {
  const experienceData = [
    {
      period: "2019 - Present",
      position: "Web Developer",
      company: "Stark Industries",
      location: "Los Angeles, CA",
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. 
        Delectus laudantium, voluptatem quis repellendus eaque sit animi illo 
        ipsam amet officiis corporis sed aliquam non voluptate corrupti excepturi 
        maxime porro fuga.`
    },
    {
      period: "2017 - 2019",
      position: "SEM Specialist",
      company: "Wayne Enterprises",
      location: "Gotham City, NY",
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. 
        Delectus laudantium, voluptatem quis repellendus eaque sit animi illo 
        ipsam amet officiis corporis sed aliquam non voluptate corrupti excepturi 
        maxime porro fuga.`
    }
  ];

  return (
    <section className="experience">
      <div className="section-header">
        <h2 className="section-title text-primary">Experience</h2>
        <button className="btn btn-primary download-btn">
          <i className="bi bi-download"></i>
          Download Resume
        </button>
      </div>

      <div className="experience-list">
        {experienceData.map((exp, index) => (
          <div key={index} className="experience-item card">
            <div className="card-body">
              <div className="timeline-info">
                <div className="period text-primary">{exp.period}</div>
                <div className="job-info">
                  <h3 className="position">{exp.position}</h3>
                  <div className="company">{exp.company}</div>
                  <div className="location">{exp.location}</div>
                </div>
              </div>
              <p className="description">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;