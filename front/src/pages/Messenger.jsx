// Messenger page
import MessengerForm from '../components/messenger/MessengerForm';
import '../styles/pages.css';

const Messenger = () => {
  return (
    <div className="page msg-page">
      <div className="msg-container">
        <MessengerForm isWidget={false}/>
      </div>
    </div>
  );
};

export default Messenger;