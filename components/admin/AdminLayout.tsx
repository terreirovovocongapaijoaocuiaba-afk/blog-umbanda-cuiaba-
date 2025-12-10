
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, LogOut, Flame, Settings, BarChart, DollarSign, Activity, Radio, Bell } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logic to clear auth would go here
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="flex h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-200 font-sans overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-black border-r border-stone-200 dark:border-stone-800 flex flex-col hidden md:flex transition-colors duration-300">
        <div className="p-6 flex items-center space-x-2 border-b border-stone-200 dark:border-stone-800">
          <Flame className="w-6 h-6 text-umbanda-gold" />
          <span className="font-serif font-bold text-stone-900 dark:text-white tracking-wider">PAINEL AXÉ</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          
          <div className="px-4 py-2 text-[10px] font-bold uppercase text-stone-400">Gestão</div>
          <Link to="/admin/dashboard" className={`nav-item ${isActive('dashboard') ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> <span>Visão Geral</span>
          </Link>
          <Link to="/admin/vendas" className={`nav-item ${isActive('vendas') ? 'active' : ''}`}>
            <DollarSign size={18} /> <span>Vendas & Kiwify</span>
          </Link>
          <Link to="/admin/analytics" className={`nav-item ${isActive('analytics') ? 'active' : ''}`}>
            <Activity size={18} /> <span>Analytics & Funil</span>
          </Link>
          <Link to="/admin/notificacoes" className={`nav-item ${isActive('notificacoes') ? 'active' : ''}`}>
            <Bell size={18} /> <span>Engajamento Push</span>
          </Link>

          <div className="px-4 py-2 mt-4 text-[10px] font-bold uppercase text-stone-400">Conteúdo</div>
          <Link to="/admin/conteudo" className={`nav-item ${isActive('conteudo') ? 'active' : ''}`}>
            <FileText size={18} /> <span>CMS (Blog/Rituais)</span>
          </Link>
          <Link to="/admin/mensagens" className={`nav-item ${isActive('mensagens') ? 'active' : ''}`}>
            <MessageSquare size={18} /> <span>Mensagens</span>
          </Link>
          <Link to="/admin/seo" className={`nav-item ${isActive('seo') ? 'active' : ''}`}>
            <BarChart size={18} /> <span>SEO Master</span>
          </Link>

          <div className="px-4 py-2 mt-4 text-[10px] font-bold uppercase text-stone-400">Sistema</div>
          <Link to="/admin/webhook-test" className={`nav-item ${isActive('webhook') ? 'active' : ''}`}>
            <Radio size={18} /> <span>Simulador Webhook</span>
          </Link>
          <Link to="/admin/config" className={`nav-item ${isActive('config') ? 'active' : ''}`}>
            <Settings size={18} /> <span>Configurações</span>
          </Link>

        </nav>

        <div className="p-4 border-t border-stone-200 dark:border-stone-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-stone-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-stone-50 dark:bg-stone-950 relative transition-colors duration-300">
        <header className="md:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-4 flex justify-between items-center sticky top-0 z-20">
            <span className="font-serif font-bold text-stone-900 dark:text-white">PAINEL AXÉ</span>
            <button onClick={handleLogout} className="text-stone-500 dark:text-stone-400"><LogOut size={20}/></button>
        </header>

        <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      <style>{`
        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            border-radius: 8px;
            color: #78716c;
            transition: all 0.2s;
            font-weight: 500;
            font-size: 0.9rem;
        }
        .dark .nav-item { color: #a8a29e; }
        
        .nav-item:hover {
            background: rgba(0,0,0,0.05);
            color: #1c1917;
        }
        .dark .nav-item:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }

        .nav-item.active {
            background: rgba(220, 38, 38, 0.1);
            color: #dc2626;
        }
        .dark .nav-item.active {
            background: rgba(220, 38, 38, 0.2);
            color: #fca5a5;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
