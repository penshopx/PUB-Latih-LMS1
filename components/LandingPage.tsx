
import React from 'react';
import { 
  Brain, Building, Globe, Cpu, CheckCircle, ArrowRight, 
  Users, Award, ShieldCheck, Link, Sparkles, TrendingUp, Network,
  AlertCircle, BarChart3, XCircle, Zap, Target, FileText
} from './ui/Icons';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">PUB-Latih AI</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Didukung oleh ASPEKINDO</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Program</a>
            <a href="#solution" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Solusi Bisnis</a>
            <a href="#ecosystem" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Ekosistem</a>
          </div>
          <button 
            onClick={onEnter}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-indigo-600 transition-all hover:scale-105 shadow-lg"
          >
            Masuk / Login
          </button>
        </div>
      </nav>

      {/* Hero Section (ATTENTION) */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-50">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-3xl -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl -ml-20 -mb-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-indigo-100 rounded-full shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Amanat PP No. 28 Tahun 2025</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Transformasi Digital <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Bisnis Konstruksi</span> Indonesia
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Platform pembelajaran terintegrasi untuk <strong>Tenaga Teknik</strong>, <strong>Manajerial Kewirausahaan</strong>, <strong>Rantai Pasok (SCM)</strong>, <strong>Strategi Tender</strong>, hingga <strong>Konstruksi Berkelanjutan (4KL)</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onEnter}
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group"
              >
                Mulai Belajar & Berbisnis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5 text-slate-500" />
                Pelajari 4KL
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Kondisi Eksisting (INTEREST) */}
      <section id="about" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                <BarChart3 className="w-4 h-4" />
                Cakupan Komprehensif
              </div>
              <h2 className="text-4xl font-bold text-slate-900">
                Lebih Dari Sekadar <br/>Pelatihan Teknis
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                PUB-Latih memahami bahwa sukses di industri konstruksi membutuhkan paduan keahlian teknik, ketajaman bisnis, manajemen rantai pasok yang efisien, dan kepatuhan terhadap standar keberlanjutan (4KL).
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-indigo-500">
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Manajemen Bisnis</h4>
                  <p className="text-sm text-slate-500">Kewirausahaan & Pengelolaan Badan Usaha</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-purple-500">
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Tender & SCM</h4>
                  <p className="text-sm text-slate-500">Rantai Pasok & Strategi Pemenangan</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-green-500">
                  <h4 className="text-lg font-bold text-slate-900 mb-1">4KL</h4>
                  <p className="text-sm text-slate-500">Kesehatan, Keselamatan, Keberlanjutan, Lingkungan</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-amber-500">
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Teknis Sipil</h4>
                  <p className="text-sm text-slate-500">Kompetensi Inti & Spesialisasi</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative">
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl rotate-3 opacity-20 blur-lg"></div>
               <img 
                 src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop" 
                 alt="Construction Site" 
                 className="relative rounded-2xl shadow-2xl border-4 border-white w-full h-auto object-cover"
               />
               <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-slate-100 max-w-xs animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <TrendingUp className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Profitabilitas</p>
                        <p className="text-slate-900 font-bold">Bisnis & Tender</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section (DESIRE) */}
      <section id="solution" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-3xl -mr-20 -mt-20"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                  <Sparkles className="w-4 h-4" />
                  Solusi Holistik
               </div>
               <h2 className="text-4xl font-bold mb-6">
                 PUB-Latih AI: <br/>
                 <span className="text-indigo-400">Pusat Keunggulan</span> Konstruksi
               </h2>
               <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                 Platform kami menghubungkan peningkatan kompetensi teknis dengan kecerdasan bisnis. Pelajari cara mengelola usaha konstruksi, memenangkan tender, dan menerapkan konstruksi hijau (4KL).
               </p>
               
               <div className="space-y-6">
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                     <Brain className="w-6 h-6 text-indigo-400" />
                   </div>
                   <div>
                     <h4 className="font-bold text-lg mb-1">Kewirausahaan & Manajemen Bisnis</h4>
                     <p className="text-sm text-slate-400">Tata kelola badan usaha, manajemen keuangan proyek, dan strategi pertumbuhan bisnis.</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                     <Link className="w-6 h-6 text-green-400" />
                   </div>
                   <div>
                     <h4 className="font-bold text-lg mb-1">Rantai Pasok & Tender</h4>
                     <p className="text-sm text-slate-400">Manajemen pengadaan material (SCM) dan teknik penyusunan dokumen tender yang kompetitif.</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                     <Globe className="w-6 h-6 text-amber-400" />
                   </div>
                   <div>
                     <h4 className="font-bold text-lg mb-1">Konstruksi Berkelanjutan (4KL)</h4>
                     <p className="text-sm text-slate-400">Standar Kesehatan, Keselamatan, Keberlanjutan, dan Lingkungan untuk masa depan.</p>
                   </div>
                 </div>
               </div>
            </div>

            <div className="flex-1 relative">
               <div className="bg-slate-800 rounded-2xl p-2 border border-slate-700 shadow-2xl">
                 <div className="bg-slate-900 rounded-xl p-6 overflow-hidden relative">
                    {/* Mock UI for AI Chat/Learning */}
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                       <div className="w-3 h-3 rounded-full bg-red-500"></div>
                       <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                       <div className="w-3 h-3 rounded-full bg-green-500"></div>
                       <span className="ml-2 text-xs text-slate-500 font-mono">Asisten PUB-Latih AI</span>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                       <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                             <Brain className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm text-slate-300 border border-slate-700">
                             Analisis strategi tender saya. Bagaimana cara meningkatkan nilai TKDN dan memenuhi standar 4KL dalam penawaran ini?
                          </div>
                       </div>
                       <div className="flex gap-3 flex-row-reverse">
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0"></div>
                          <div className="bg-indigo-600 p-3 rounded-2xl rounded-tr-none text-sm text-white">
                             Saya sarankan optimasi rantai pasok lokal untuk meningkatkan TKDN. Untuk 4KL, sertakan rencana pengelolaan limbah B3 dan sertifikasi ISO 45001. Berikut draf rencana kerjanya...
                          </div>
                       </div>
                    </div>

                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 w-2/3 animate-pulse"></div>
                    </div>
                 </div>
               </div>
               
               {/* Floating Badges */}
               <div className="absolute -top-6 -right-6 bg-white text-slate-900 p-4 rounded-xl shadow-xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Sertifikasi Bisnis
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Flow (ACTION) */}
      <section id="ecosystem" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ekosistem Terpadu</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-16">
            Kami menciptakan alur nilai yang berkelanjutan dari pelatihan teknis hingga kesuksesan bisnis.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
            
            {[
              { title: "Kompetensi Teknik", icon: Brain, desc: "Modul Sipil, Arsitek, & 4KL", step: 1 },
              { title: "Manajemen Bisnis", icon: Target, desc: "Kewirausahaan & Finansial", step: 2 },
              { title: "Rantai Pasok & Tender", icon: Network, desc: "Strategi Pengadaan & SCM", step: 3 },
              { title: "Eksekusi Proyek", icon: Award, desc: "Implementasi & Sertifikasi", step: 4 }
            ].map((item, i) => (
               <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors relative">
                     <item.icon className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                     <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                       {item.step}
                     </div>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
               </div>
            ))}
          </div>

          <div className="mt-20">
             <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-12 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                   <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap Mengembangkan Usaha Konstruksi Anda?</h2>
                   <p className="text-indigo-200 mb-8 text-lg max-w-2xl mx-auto">
                     Tingkatkan kompetensi teknik, manajerial, dan strategi bisnis Anda dalam satu platform terintegrasi.
                   </p>
                   <button 
                     onClick={onEnter}
                     className="px-10 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-xl hover:scale-105"
                   >
                     Masuk ke Dasbor
                   </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 pt-16 pb-8">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
               <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <Brain className="w-6 h-6" />
                     </div>
                     <span className="text-xl font-bold text-white">PUB-Latih AI</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">
                     Platform pengembangan usaha berkelanjutan berbasis AI untuk ekosistem jasa konstruksi Indonesia.
                  </p>
               </div>
               
               <div>
                  <h4 className="text-white font-bold mb-4">Kurikulum</h4>
                  <ul className="space-y-2 text-sm">
                     <li><a href="#" className="hover:text-indigo-400 transition-colors">Teknik Sipil & Arsitektur</a></li>
                     <li><a href="#" className="hover:text-indigo-400 transition-colors">Manajemen Bisnis</a></li>
                     <li><a href="#" className="hover:text-indigo-400 transition-colors">Tender & Rantai Pasok</a></li>
                     <li><a href="#" className="hover:text-indigo-400 transition-colors">4KL (K3L)</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-4">Sumber Daya</h4>
                  <ul className="space-y-2 text-sm">
                     <li><a href="#" className="hover:text-indigo-400 transition-colors">Panduan PP 28/2025</a></li>
                     <li><a href="#" className="hover:text-indigo-400 transition-colors">Regulasi PUPR</a></li>
                     <li><a href="#" className="hover:text-indigo-400 transition-colors">Pusat Bantuan</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-4">Kontak</h4>
                  <ul className="space-y-2 text-sm">
                     <li>info@aspekindo.or.id</li>
                     <li>Jakarta, Indonesia</li>
                  </ul>
               </div>
            </div>
            
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
               <p>&copy; {new Date().getFullYear()} ASPEKINDO. Hak Cipta Dilindungi.</p>
               <div className="flex gap-6">
                  <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
                  <a href="#" className="hover:text-white transition-colors">Syarat Layanan</a>
               </div>
            </div>
         </div>
      </footer>

    </div>
  );
};

export default LandingPage;
