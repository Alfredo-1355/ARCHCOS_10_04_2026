import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import AdminDashboard from './AdminDashboard.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminDashboard />
  </StrictMode>,
);
