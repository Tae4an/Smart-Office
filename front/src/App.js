import { Suspense } from 'react';
import Layout from './components/layout/Layout';
import AppRoutes from './Routes';
import './styles/global.css';
import './styles/pages.css';

function App() {
  return (
      <Suspense fallback={
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      }>
        <Layout>
          <AppRoutes />
        </Layout>
      </Suspense>
  );
}

export default App;