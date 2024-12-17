// KakaoMap page
import KakaoMapForm from '../components/map/KakaoMapForm';
import '../styles/pages.css';

const KakaoMap = () => {
    return (
        <div className="page map-page">
            <div className="map-container">
                <KakaoMapForm />
            </div>
        </div>
    );
};

export default KakaoMap;