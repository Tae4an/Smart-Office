// pages/Calendar.jsx
import CalendarForm from '../components/calendar/CalendarForm';
import '../styles/pages.css';

const Calendar = () => {
  return (
    <div className="page calendar-page">
      <div className="calendar-container">
        <CalendarForm />
      </div>
    </div>
  );
};

export default Calendar;