import React from 'react';
import SectionHeading from '../components/SectionHeading';
import { Shield, Lock, Eye } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="pt-32 pb-20 container mx-auto px-6 animate-fadeIn">
      <SectionHeading subtitle="Transparência e Respeito" title="Política de Privacidade" centered={false} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8 text-stone-300 leading-relaxed">
          <div className="bg-stone-900 p-8 rounded-xl border border-stone-800">
            <h3 className="text-xl font-serif font-bold text-white mb-4">1. O Respeito aos seus Dados</h3>
            <p className="mb-4">
              No <strong>Umbanda Cuiabá</strong>, tratamos seus dados com o mesmo respeito que tratamos nossos fundamentos. Esta política descreve como coletamos, usamos e protegemos as informações pessoais que você nos fornece ao usar nosso site.
            </p>
            <p>
              Ao utilizar nossos serviços, como o agendamento de consultas ou a inscrição no Clube VIP, você concorda com a coleta e uso de informações de acordo com esta política.
            </p>
          </div>

          <div className="bg-stone-900 p-8 rounded-xl border border-stone-800">
            <h3 className="text-xl font-serif font-bold text-white mb-4">2. Coleta de Informações</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Dados Pessoais:</strong> Nome, e-mail e telefone fornecidos voluntariamente nos formulários de contato ou newsletter.</li>
              <li><strong>Dados de Navegação:</strong> Endereço IP, tipo de navegador e páginas visitadas (Cookies) para melhorar a experiência do usuário.</li>
              <li><strong>Informações Espirituais:</strong> Dados compartilhados em pedidos de oração ou agendamentos são mantidos em sigilo absoluto pela curimba administrativa.</li>
            </ul>
          </div>

          <div className="bg-stone-900 p-8 rounded-xl border border-stone-800">
            <h3 className="text-xl font-serif font-bold text-white mb-4">3. Uso das Informações</h3>
            <p>
              Utilizamos seus dados para:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Enviar confirmações de agendamento de giras e atendimentos.</li>
              <li>Entregar conteúdos exclusivos do Clube VIP (caso inscrito).</li>
              <li>Melhorar a performance e segurança do nosso portal.</li>
            </ul>
            <p className="mt-4 text-umbanda-gold">
              * Jamais vendemos ou compartilhamos seus dados com terceiros para fins de marketing.
            </p>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-stone-900/50 p-6 rounded-xl border border-stone-800">
            <div className="w-12 h-12 bg-umbanda-red/20 text-umbanda-red rounded-full flex items-center justify-center mb-4">
              <Shield size={24} />
            </div>
            <h4 className="font-bold text-white mb-2">Segurança Garantida</h4>
            <p className="text-sm text-stone-400">
              Utilizamos criptografia SSL para proteger a transmissão de seus dados.
            </p>
          </div>

          <div className="bg-stone-900/50 p-6 rounded-xl border border-stone-800">
            <div className="w-12 h-12 bg-umbanda-gold/20 text-umbanda-gold rounded-full flex items-center justify-center mb-4">
              <Lock size={24} />
            </div>
            <h4 className="font-bold text-white mb-2">Sigilo Espiritual</h4>
            <p className="text-sm text-stone-400">
              Tudo o que é conversado em atendimento ou enviado via formulário é mantido sob sigilo de terreiro.
            </p>
          </div>

          <div className="bg-stone-900/50 p-6 rounded-xl border border-stone-800">
            <div className="w-12 h-12 bg-stone-700/50 text-stone-300 rounded-full flex items-center justify-center mb-4">
              <Eye size={24} />
            </div>
            <h4 className="font-bold text-white mb-2">Seus Direitos</h4>
            <p className="text-sm text-stone-400">
              Você pode solicitar a exclusão de seus dados a qualquer momento enviando um e-mail para contato@umbandacuiaba.com.br.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;