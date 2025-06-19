
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MenuEditorPage from './pages/MenuEditorPage';
import NewOrderPage from './pages/NewOrderPage';
import OrderHistoryPage from './pages/OrderHistoryPage';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/new-order" replace />} />
        <Route path="/new-order" element={<NewOrderPage />} />
        <Route path="/menu-editor" element={<MenuEditorPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
