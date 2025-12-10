import React, { useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Contact: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      createdAt: serverTimestamp(),
      read: false
    };

    try {
      await addDoc(collection(db, 'messages'), data);
      setSent(true);
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar mensagem", error);
      alert("Ocorreu um erro ao enviar sua mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Info */}
        <div>
          <SectionHeading subtitle="Fale Conosco" title="Entre em Contato" centered={false} />
          <p className="text-stone-400 mb-10 leading-relaxed text-lg">
            Nossa casa está de portas abertas para acolher você. Seja para tirar dúvidas, agendar um atendimento espiritual ou participar de nossas giras.
          </p>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded bg-umbanda-red/10 text-umbanda-red flex items-center justify-center flex-shrink-0">
                <MapPin />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Localização</h4>
                <p className="text-stone-400">Rua dos Orixás, 123 - Centro Norte</p>
                <p className="text-stone-400">Cuiabá - MT, 78000-000</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded bg-umbanda-red/10 text-umbanda-red flex items-center justify-center flex-shrink-0">
                <Clock />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Horários de Gira</h4>
                <p className="text-stone-400">Sábados: Abertura às 18h</p>
                <p className="text-stone-400">Atendimentos: Seg e Qua (Agendado)</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded bg-umbanda-red/10 text-umbanda-red flex items-center justify-center flex-shrink-0">
                <Phone />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Whatsapp</h4>
                <p className="text-stone-400">(65) 99999-9999</p>
                <p className="text-stone-500 text-sm">Apenas mensagens</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800 shadow-xl">
          <h3 className="text-2xl font-serif font-bold text-white mb-6">Envie sua mensagem</h3>
          
          {sent ? (
            <div className="h-64 flex flex-col items-center justify-center text-center animate-fadeIn">
              <div className="w-16 h-16 bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Mensagem Enviada!</h4>
              <p className="text-stone-400 mb-6">Nossa curimba responderá em breve.</p>
              <button onClick={() => setSent(false)} className="text-umbanda-gold hover:underline text-sm font-bold uppercase">
                Enviar nova mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Nome Completo</label>
                  <input name="name" required type="text" className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Telefone</label>
                  <input name="phone" required type="text" className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Assunto</label>
                <select name="subject" className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none transition-colors">
                  <option>Dúvida sobre Giras</option>
                  <option>Agendamento</option>
                  <option>Clube VIP</option>
                  <option>Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Mensagem</label>
                <textarea name="message" required rows={4} className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none transition-colors"></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-umbanda-red hover:bg-red-800 text-white font-bold rounded transition-colors shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Contact;