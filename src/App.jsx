import { Routes, Route, Navigate } from 'react-router-dom';
import LinkGenerator from './pages/LinkGenerator';
import FillForm from './pages/FillForm';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LinkGenerator />} />
      <Route path="/preencher" element={<FillForm />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
