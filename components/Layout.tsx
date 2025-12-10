import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Flame, Instagram, Facebook, Youtube, Lock, Sun, Moon } from 'lucide-react';
import { SITE_NAME } from '../constants';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<any>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const location = useLocation();

  // Detect which pages have a Hero Image to allow transparent header
  const isHeroPage = 
    location.pathname === '/' || 
    location.pathname === '/vip' || 
    (location.pathname.startsWith('/artigos/') && location.pathname.split('/').length > 2);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [location]);

  // Theme Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (systemPrefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    const fetchSocial = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'social'));
        if (docSnap.exists()) setSocialLinks(docSnap.data());
      } catch (e) { console.error(e); }
    };
    fetchSocial();
  }, []);

  // Calculate Nav Classes based on page type and scroll state
  const getNavClasses = () => {
      // If NOT a hero page, always solid background to ensure readability
      if (!isHeroPage) {
          return "bg-[#fdfcf8]/95 dark:bg-umbanda-black/95 shadow-md py-3 text-stone-900 dark:text-white backdrop-blur-md";
      }
      // If IS a hero page, transparent at top, solid when scrolled
      if (isScrolled) {
          return "bg-[#fdfcf8]/95 dark:bg-umbanda-black/95 shadow-md py-3 text-stone-900 dark:text-white backdrop-blur-md";
      }
      return "bg-transparent py-6 text-white";
  };

  // Helper to determine if we are in "Dark Text" mode (solid background) or "Light Text" mode (transparent background)
  const isSolidNav = !isHeroPage || isScrolled;

  return (
    <div className="min-h-screen bg-[#fdfcf8] dark:bg-umbanda-black text-stone-900 dark:text-umbanda-white font-sans selection:bg-umbanda-red selection:text-white transition-colors duration-300">
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 ${getNavClasses()}`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <Flame className="w-8 h-8 text-umbanda-gold group-hover:text-umbanda-redBright transition-colors duration-300" />
            <span className={`text-2xl font-serif font-bold tracking-wider ${!isSolidNav ? 'text-white' : 'text-stone-900 dark:text-umbanda-offwhite'}`}>
              {SITE_NAME.toUpperCase()}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" isSolid={isSolidNav}>Início</NavLink>
            <NavLink to="/rituais" isSolid={isSolidNav}>Rituais</NavLink>
            <NavLink to="/artigos" isSolid={isSolidNav}>Artigos</NavLink>
            <NavLink to="/sobre" isSolid={isSolidNav}>Sobre a Casa</NavLink>
            <NavLink to="/contato" isSolid={isSolidNav}>Contato</NavLink>
            
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-full transition-colors ${isSolidNav ? 'hover:bg-stone-200 dark:hover:bg-stone-800' : 'hover:bg-white/20'}`}
              title={theme === 'dark' ? 'Mudar para Claro' : 'Mudar para Escuro'}
            >
              {theme === 'dark' ? <Sun size={20} className={isSolidNav ? 'text-stone-900 dark:text-white' : 'text-white'} /> : <Moon size={20} className={isSolidNav ? 'text-stone-900 dark:text-white' : 'text-white'} />}
            </button>

            <Link 
              to="/vip" 
              className="px-6 py-2 bg-gradient-to-r from-umbanda-red to-red-800 text-white font-bold rounded-full border border-umbanda-gold/30 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all transform hover:-translate-y-0.5 text-sm"
            >
              Clube VIP
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
                onClick={toggleTheme} 
                className={isSolidNav ? "text-umbanda-gold hover:text-stone-900 dark:hover:text-white" : "text-umbanda-gold hover:text-white"}
            >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button 
              className={isSolidNav ? "text-umbanda-gold hover:text-stone-900 dark:hover:text-white" : "text-umbanda-gold hover:text-white"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-umbanda-black border-t border-stone-200 dark:border-umbanda-red/30 shadow-2xl flex flex-col p-6 space-y-4 animate-fadeIn">
            <MobileNavLink to="/">Início</MobileNavLink>
            <MobileNavLink to="/rituais">Rituais</MobileNavLink>
            <MobileNavLink to="/artigos">Artigos</MobileNavLink>
            <MobileNavLink to="/sobre">Sobre a Casa</MobileNavLink>
            <MobileNavLink to="/contato">Contato</MobileNavLink>
            <Link 
              to="/vip" 
              className="text-center w-full py-3 mt-4 bg-umbanda-red text-white font-bold rounded-lg"
            >
              Acessar Clube VIP
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-0 min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 dark:bg-stone-950 border-t-4 border-umbanda-red pt-16 pb-8 relative overflow-hidden transition-colors duration-300">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-umbanda-red/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Flame className="w-6 h-6 text-umbanda-gold" />
                <span className="text-xl font-serif font-bold text-stone-900 dark:text-white">{SITE_NAME}</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                Um portal de luz, conhecimento e tradição. Levando o axé dos Orixás e Guias para o seu lar. Respeito, caridade e evolução.
              </p>
              <div className="flex space-x-4 pt-2">
                {socialLinks.instagram && <SocialIcon href={socialLinks.instagram} icon={<Instagram size={20} />} />}
                {socialLinks.facebook && <SocialIcon href={socialLinks.facebook} icon={<Facebook size={20} />} />}
                {socialLinks.youtube && <SocialIcon href={socialLinks.youtube} icon={<Youtube size={20} />} />}
              </div>
            </div>

            <div>
              <h4 className="text-umbanda-gold font-serif font-bold mb-4">Navegação</h4>
              <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
                <li><Link to="/rituais" className="hover:text-umbanda-redBright transition-colors">Rituais & Firmezas</Link></li>
                <li><Link to="/artigos" className="hover:text-umbanda-redBright transition-colors">Blog Espiritual</Link></li>
                <li><Link to="/sobre" className="hover:text-umbanda-redBright transition-colors">Nossa História</Link></li>
                <li><Link to="/vip" className="hover:text-umbanda-redBright transition-colors">Área de Membros</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-umbanda-gold font-serif font-bold mb-4">Atendimento</h4>
              <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
                <li>Segunda a Sexta: 19h às 22h</li>
                <li>Sábado: Giras Abertas (18h)</li>
                <li>Domingo: Fechado</li>
                <li className="pt-2 text-umbanda-redBright font-bold">Cuiabá - MT</li>
              </ul>
            </div>

            <div>
              <h4 className="text-umbanda-gold font-serif font-bold mb-4">Aviso Legal</h4>
              <p className="text-xs text-stone-500 mb-4">
                O conteúdo deste site tem caráter informativo e espiritual. Não substituímos tratamento médico ou psicológico.
              </p>
              <Link to="/politica" className="text-xs text-stone-500 hover:text-umbanda-gold underline">Política de Privacidade</Link>
            </div>
          </div>

          <div className="border-t border-stone-200 dark:border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-stone-600 dark:text-stone-600 text-sm">
              &copy; {new Date().getFullYear()} {SITE_NAME}. Saravá Umbanda. Todos os direitos reservados.
            </p>
            <Link to="/admin/login" className="mt-4 md:mt-0 flex items-center gap-2 text-xs text-stone-500 hover:text-umbanda-gold transition-colors uppercase tracking-wider font-bold">
              <Lock size={14} />
              Área Administrativa
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink: React.FC<{ to: string; children: React.ReactNode; isSolid: boolean }> = ({ to, children, isSolid }) => (
  <Link 
    to={to} 
    className={`relative text-sm font-medium tracking-wide transition-colors duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-umbanda-gold after:left-0 after:-bottom-1 after:transition-all hover:after:w-full
      ${isSolid ? 'text-stone-600 hover:text-umbanda-red dark:text-stone-300 dark:hover:text-umbanda-gold' : 'text-stone-200 hover:text-white'}
    `}
  >
    {children}
  </Link>
);

const MobileNavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className="text-lg font-serif text-stone-800 dark:text-stone-200 hover:text-umbanda-red border-b border-stone-200 dark:border-stone-800 pb-2">
    {children}
  </Link>
);

const SocialIcon: React.FC<{ icon: React.ReactNode, href: string }> = ({ icon, href }) => (
  <a href={href} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-500 hover:bg-umbanda-red hover:text-white hover:border-umbanda-red transition-all duration-300">
    {icon}
  </a>
);

export default Layout;