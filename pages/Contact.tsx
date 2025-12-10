
import React, { useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle, HelpCircle, ChevronDown, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import TrustBadges from '../components/TrustBadges';

const Contact: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

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

  const faqItems = [
      { q: "As giras são abertas ao público?", a: "Sim, nossas giras de sábado são abertas. Recomendamos chegar com 30 minutos de antecedência." },
      { q: "Preciso pagar para ser atendido?", a: "Não cobramos por consultas espirituais presenciais. Aceitamos doações voluntárias para manutenção da casa." },
      { q: "Como funciona o agendamento?", a: "Para atendimentos particulares durante a semana, é necessário agendar via formulário ou WhatsApp." },
      { q: "O que é o Clube VIP?", a: "É nossa área de membros online com conteúdos exclusivos, rituais avançados e estudos teológicos." }
  ];

  return (
    <div className="bg-[#fdfcf8] dark:bg-stone-950 min-h-screen transition-colors duration-300">
        <div className="pt-32 pb-20 container mx-auto px-6 animate-fadeIn">
            
            <div className="text-center mb-16">
                <SectionHeading subtitle="Fale Conosco" title="Entre em Contato" centered={true} />
                <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto text-lg">
                    Estamos aqui para ouvir você. Seja para tirar dúvidas, agendar um atendimento ou apenas conversar.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-lg">
                        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-2">
                            <MapPin className="text-umbanda-red"/> Onde Estamos
                        </h3>
                        <p className="text-stone-600 dark:text-stone-400 mb-2">Rua dos Orixás, 123 - Centro Norte</p>
                        <p className="text-stone-600 dark:text-stone-400 mb-4">Cuiabá - MT, 78000-000</p>
                        <div className="h-48 w-full bg-stone-200 dark:bg-stone-800 rounded-lg overflow-hidden relative">
                            {/* Placeholder Map */}
                            <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-xs">Mapa do Google</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                            <Clock className="text-umbanda-gold mb-4" size={28}/>
                            <h4 className="font-bold text-stone-900 dark:text-white mb-2">Horários</h4>
                            <p className="text-xs text-stone-500">Sábados: 18h às 22h</p>
                            <p className="text-xs text-stone-500">Seg/Qua: Agendado</p>
                        </div>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                            <Phone className="text-green-600 mb-4" size={28}/>
                            <h4 className="font-bold text-stone-900 dark:text-white mb-2">WhatsApp</h4>
                            <p className="text-xs text-stone-500">(65) 99999-9999</p>
                            <p className="text-xs text-green-600 font-bold mt-1">Online agora</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-stone-100 dark:bg-stone-900 p-8 md:p-10 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl relative">
                    <div className="absolute top-0 right-0 bg-umbanda-gold text-white text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-xl">
                        Resposta em até 24h
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-6">Envie sua mensagem</h3>
                    
                    {sent ? (
                        <div className="h-80 flex flex-col items-center justify-center text-center animate-fadeIn">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h4 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Recebemos seu Axé!</h4>
                            <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-xs mx-auto">Nossa equipe responderá o mais breve possível.</p>
                            <div className="space-y-3 w-full">
                                <Link to="/oraculo" className="block w-full py-3 bg-stone-900 text-white rounded-lg font-bold hover:bg-stone-800 transition-colors">
                                    Enquanto espera, consulte o Oráculo
                                </Link>
                                <button onClick={() => setSent(false)} className="text-stone-500 hover:text-stone-900 text-sm font-bold uppercase">
                                    Enviar nova mensagem
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Nome</label>
                                    <input name="name" required type="text" className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg p-3 text-stone-900 dark:text-white focus:border-umbanda-gold focus:outline-none transition-colors" placeholder="Seu nome" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Telefone</label>
                                    <input name="phone" required type="text" className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg p-3 text-stone-900 dark:text-white focus:border-umbanda-gold focus:outline-none transition-colors" placeholder="(xx) xxxxx-xxxx" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Assunto</label>
                                <select name="subject" className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg p-3 text-stone-900 dark:text-white focus:border-umbanda-gold focus:outline-none transition-colors">
                                    <option>Dúvida sobre Giras</option>
                                    <option>Agendamento Espiritual</option>
                                    <option>Clube VIP</option>
                                    <option>Outros</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Mensagem</label>
                                <textarea name="message" required rows={4} className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg p-3 text-stone-900 dark:text-white focus:border-umbanda-gold focus:outline-none transition-colors" placeholder="Como podemos ajudar você hoje?"></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 bg-umbanda-red hover:bg-red-800 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 disabled:opacity-70 transform hover:-translate-y-1"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {loading ? 'Enviando...' : 'Enviar Mensagem'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto mb-20">
                <h3 className="text-2xl font-serif font-bold text-center text-stone-900 dark:text-white mb-8 flex items-center justify-center gap-2">
                    <HelpCircle className="text-umbanda-gold"/> Perguntas Frequentes
                </h3>
                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                            <button 
                                onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                                className="w-full flex justify-between items-center p-5 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                            >
                                {item.q}
                                <ChevronDown className={`transform transition-transform ${activeAccordion === index ? 'rotate-180 text-umbanda-gold' : 'text-stone-400'}`} size={20}/>
                            </button>
                            {activeAccordion === index && (
                                <div className="p-5 pt-0 text-stone-600 dark:text-stone-400 text-sm leading-relaxed border-t border-stone-100 dark:border-stone-800/50">
                                    {item.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Instant Help CTA */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-10 text-center text-white relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
                <div className="relative z-10">
                    <Sparkles className="mx-auto mb-4 text-purple-300" size={40}/>
                    <h3 className="text-3xl font-serif font-bold mb-4">Precisa de uma orientação agora?</h3>
                    <p className="text-purple-200 text-lg mb-8 max-w-xl mx-auto">
                        Não espere o e-mail chegar. Consulte nosso Oráculo Digital Inteligente e receba um conselho imediato dos guias.
                    </p>
                    <Link to="/oraculo" className="inline-block px-10 py-4 bg-white text-purple-900 font-bold rounded-full hover:bg-purple-100 transition-colors shadow-lg transform hover:scale-105">
                        Consultar Oráculo Grátis
                    </Link>
                </div>
            </div>

        </div>
        <TrustBadges />
    </div>
  );
};

export default Contact;
