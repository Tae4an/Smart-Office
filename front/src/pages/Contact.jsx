import ContactForm from '../components/contact/ContactForm';

const Contact = () => {
  return (
    <div className="page contact-page">
      <div className="container">
        <div className="bg-light rounded-4 py-5 px-4 px-md-5">
          <div className="text-center mb-5">
            <div className="feature bg-gradient-primary-to-secondary text-white rounded-3 mb-3">
              <i className="bi bi-envelope"></i>
            </div>
            <h1 className="fw-bolder">Get in touch</h1>
            <p className="lead fw-normal text-muted mb-0">Let's work together!</p>
          </div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default Contact;