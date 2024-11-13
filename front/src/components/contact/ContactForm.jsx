// ContactForm.jsx
import { useState } from 'react';
import '../../styles/contact.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    error: false
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Here you would typically send the form data to your server
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus({ success: true, error: false });
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      
      setTimeout(() => {
        setSubmitStatus({ success: false, error: false });
      }, 5000);
    } catch (error) {
      setSubmitStatus({ success: false, error: true });
      
      setTimeout(() => {
        setSubmitStatus({ success: false, error: false });
      }, 5000);
    }
  };

  return (
    <section className="contact">
      <div className="contact-container">
        <div className="contact-header">
          <div className="icon-feature">
            <i className="bi bi-envelope"></i>
          </div>
          <h2 className="contact-title">Get in touch</h2>
          <p className="contact-subtitle">Let's work together!</p>
        </div>

        <div className="form-wrapper">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Full name"
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Email address"
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="Phone number"
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={`form-input form-textarea ${errors.message ? 'error' : ''}`}
                  placeholder="Message"
                  rows="4"
                ></textarea>
                {errors.message && <div className="error-message">{errors.message}</div>}
              </div>
            </div>

            {submitStatus.success && (
              <div className="success-message">
                Message sent successfully!
              </div>
            )}

            {submitStatus.error && (
              <div className="error-message submit-error">
                Error sending message. Please try again.
              </div>
            )}

            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;