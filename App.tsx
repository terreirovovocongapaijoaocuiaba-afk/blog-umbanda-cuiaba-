
import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Rituals from './pages/Rituals';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Contact from './pages/Contact';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Vip from './pages/Vip';
import Oracle from './pages/Oracle'; 

// New Autonomous Services
import ServicesHub from './pages/ServicesHub';
import DreamInterpreter from './pages/services/DreamInterpreter';
import HerbalTherapist from './pages/services/HerbalTherapist';
import OrixaCalculator from './pages/services/OrixaCalculator';
import CandleReader from './pages/services/CandleReader';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminContent from './pages/admin/AdminContent';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSEO from './pages/admin/AdminSEO';
import AdminSales from './pages/admin/AdminSales';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminWebhookSimulator from './pages/admin/AdminWebhookSimulator';
import AdminNotifications from './pages/admin/AdminNotifications';

// Providers
import { NotificationProvider } from './lib/NotificationContext';
import { NotificationToaster } from './components/NotificationCenter';

// Wrapper for Public Routes
const PublicLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <HashRouter>
        <NotificationToaster />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/rituais" element={<Rituals />} />
            <Route path="/artigos" element={<Articles />} />
            <Route path="/artigos/:id" element={<ArticleDetail />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/vip" element={<Vip />} />
            <Route path="/politica" element={<PrivacyPolicy />} />
            
            {/* Digital Products (High Income Systems) */}
            <Route path="/servicos" element={<ServicesHub />} />
            <Route path="/oraculo" element={<Oracle />} />
            <Route path="/servicos/sonhos" element={<DreamInterpreter />} />
            <Route path="/servicos/banhos" element={<HerbalTherapist />} />
            <Route path="/servicos/orixa" element={<OrixaCalculator />} />
            <Route path="/servicos/velas" element={<CandleReader />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="vendas" element={<AdminSales />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="webhook-test" element={<AdminWebhookSimulator />} />
            <Route path="notificacoes" element={<AdminNotifications />} />
            <Route path="conteudo" element={<AdminContent />} />
            <Route path="mensagens" element={<AdminMessages />} />
            <Route path="config" element={<AdminSettings />} />
            <Route path="seo" element={<AdminSEO />} />
          </Route>
        </Routes>
      </HashRouter>
    </NotificationProvider>
  );
};

export default App;
