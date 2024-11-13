// Routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Resume = lazy(() => import('./pages/Resume'));
const Projects = lazy(() => import('./pages/Projects'));
const Contact = lazy(() => import('./pages/Contact'));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/resume" element={<Resume />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* 404 route */}
      <Route path="/404" element={
        <div className="error-page">
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for doesn't exist.</p>
        </div>
      } />
      
      {/* Redirect all unmatched routes to 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;