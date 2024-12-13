// Routes.jsx
import {Routes, Route, Navigate} from 'react-router-dom';
import {lazy} from 'react';
import Layout from './components/layout/Layout';
import { CalendarProvider } from './context/CalendarContext';

// Lazy load pages
const Login = lazy(() => import('./components/login/LoginForm'));
const PasswordChange = lazy(() => import('./components/login/PasswordChangeForm'));
const Home = lazy(() => import('./pages/Home'));
const Calendar = lazy(() => import ('./pages/Calendar'));
const Messenger = lazy(() => import ('./pages/Messenger'));
const File = lazy(() => import ('./pages/File'));
const Meeting = lazy(() => import ('./pages/Meeting'));
const MeetingRoom = lazy(() => import('./pages/MeetingRoom'));
const KakaoMap = lazy(() => import('./pages/KakaoMap'));

const AppRoutes = () => {
    return (
        <CalendarProvider>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/password-change" element={<PasswordChange />} />

            {/* Protected routes with Layout */}
            <Route element={<Layout/>}>
                <Route path="/home" element={<Home/>}/>
                <Route path="/calendar" element={<Calendar/>}/>
                <Route path="/messenger" element={<Messenger/>}/>
                <Route path="/file" element={<File/>}/>
                <Route path="/meeting" element={<Meeting/>}/>
                <Route path="/meetingRoom" element={<MeetingRoom/>}/>
                <Route path="/map" element={<KakaoMap/>}/>
            </Route>

                {/* Error routes */}
                <Route path="/404" element={
                    <div className="error-page">
                        <h1>404 - Page Not Found</h1>
                        <p>The page you are looking for doesn't exist.</p>
                    </div>
                }/>

                <Route path="*" element={<Navigate to="/404" replace/>}/>
            </Routes>
        </CalendarProvider>
    );
};

export default AppRoutes;