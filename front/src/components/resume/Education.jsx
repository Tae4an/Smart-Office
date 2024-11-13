import '../../styles/resume.css'

const Education = () => {
    const educationData = [
        {
            period: "2015 - 2017",
            school: "Barnett College",
            location: "Fairfield, NY",
            degree: "Master's",
            field: "Web Development",
            description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                Delectus laudantium, voluptatem quis repellendus eaque sit animi illo 
                ipsam amet officiis corporis sed aliquam non voluptate corrupti excepturi 
                maxime porro fuga.`
        },
        {
            period: "2011 - 2015",
            school: "ULA",
            location: "Los Angeles, CA",
            degree: "Undergraduate",
            field: "Computer Science",
            description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. 
              Delectus laudantium, voluptatem quis repellendus eaque sit animi illo 
              ipsam amet officiis corporis sed aliquam non voluptate corrupti excepturi 
              maxime porro fuga.`
          }
    ];

    return (
        <section className="education">
            <h2 className="section-title text-secondary">Education</h2>

            <div className="education-list">
                {educationData.map((edu,index) => (
                    <div key={index} className="education-item card">
                        <div className="card-body">
                            <div className="timeline-info">
                                <div className="period">{edu.period}</div>
                                <div className="school-info">
                                    <h3 className="school">{edu.school}</h3>
                                    <div className="location">{edu.location}</div>
                                </div>
                                <div className="degree-info">
                                    <div className="degree">{edu.degree}</div>
                                    <div className="field">{edu.field}</div>
                                </div>
                            </div>
                            <p className="description">{edu.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Education;