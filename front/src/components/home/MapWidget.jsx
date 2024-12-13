import React, { useEffect, useRef, useState } from 'react';
import KakaoMapForm from '../map/KakaoMapForm';
import '../../styles/dashboard.css';

const MapWidget = () => {
    const mapContainerRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleResize = () => {
            if (window.kakao && window.kakao.maps) {
                if (window.kakao.maps.Map && mapContainerRef.current) {
                    const mapInstance = mapContainerRef.current.querySelector('[id^="map_"]');
                    if (mapInstance) {
                        window.kakao.maps.Map.relayout();
                    }
                }
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="widget-content map-widget" ref={mapContainerRef}>
            <div className="map-widget-container">
                {mounted && <KakaoMapForm />}
            </div>
        </div>
    );
};

export default MapWidget;
