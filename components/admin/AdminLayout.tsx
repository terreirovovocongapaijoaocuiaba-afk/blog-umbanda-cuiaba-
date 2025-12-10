import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, LogOut, Flame, Settings, BarChart } from 'lucide-react';
import { SITE_NAME } from '../../constants';

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

        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link 
            to="/admin/dashboard" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('dashboard') ? 'bg-umbanda-red/10 dark:bg-umbanda-red/20 text-umbanda-redBright' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Visão Geral</span>
          </Link>

          <Link 
            to="/admin/conteudo" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('conteudo') ? 'bg-umbanda-red/10 dark:bg-umbanda-red/20 text-umbanda-redBright' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white'}`}
          >
            <FileText size={20} />
            <span className="font-medium">Conteúdo</span>
          </Link>

          <Link 
            to="/admin/mensagens" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('mensagens') ? 'bg-umbanda-red/10 dark:bg-umbanda-red/20 text-umbanda-redBright' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white'}`}
          >
            <MessageSquare size={20} />
            <span className="font-medium">Mensagens</span>
          </Link>

          <Link 
            to="/admin/seo" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('seo') ? 'bg-umbanda-red/10 dark:bg-umbanda-red/20 text-umbanda-redBright' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white'}`}
          >
            <BarChart size={20} />
            <span className="font-medium">SEO & Performance</span>
          </Link>

          <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-800">
             <Link 
              to="/admin/config" 
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              <Settings size={20} />
              <span className="font-medium">Configurações</span>
            </Link>
          </div>
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
        {/* Mobile Header Placeholder */}
        <header className="md:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-4 flex justify-between items-center sticky top-0 z-20">
            <span className="font-serif font-bold text-stone-900 dark:text-white">PAINEL AXÉ</span>
            <button onClick={handleLogout} className="text-stone-500 dark:text-stone-400"><LogOut size={20}/></button>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;