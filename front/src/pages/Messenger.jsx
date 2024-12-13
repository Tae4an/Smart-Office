// Messenger page
import MessengerForm from '../components/messenger/MessengerForm';
import '../styles/pages.css';

const Messenger = () => {
  return (
    <div className="page msg-page">
      <div className="page-header">
        <h1 className="page-title">
          <span className="text-gradient">Messenger</span>
        </h1>
      </div>
      <div className="msg-container">
        <MessengerForm isWidget={false}/>
      </div>
    </div>
  );
};

export default Messenger;