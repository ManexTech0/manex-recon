import React, { useState } from 'react';
import { Search, Terminal, Hexagon, Power, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalLoader } from './components/TerminalLoader';
import { ReconDashboard } from './components/ReconDashboard';
import { performReconScan } from './services/geminiService';
import { AppStatus, ReconResult } from './types';

function App() {
  const [target, setTarget] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [data, setData] = useState<ReconResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    setStatus(AppStatus.SCANNING);
    setError(null);
    setData(null);

    try {
      const result = await performReconScan(target);
      setData(result);
      setStatus(AppStatus.COMPLETE);
    } catch (err) {
      console.error(err);
      setError("CONNECTION_REFUSED: TARGET UNREACHABLE OR API ERROR.");
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setTarget('');
    setData(null);
  };

  return (
    <div className="min-h-screen font-sans text-gray-100 relative">
      
      {/* Background Grid Animation */}
      <div className="fixed inset-0 z-[-1] opacity-20" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* CRT Overlay (defined in index.html styles) */}
      <div className="fixed inset-0 z-50 pointer-events-none crt-overlay"></div>

      {/* Main Navbar */}
      <nav className="w-full border-b border-white/10 bg-black/50 backdrop-blur-sm p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
           <Hexagon className="text-neon-green" />
           <span className="font-display font-bold text-xl tracking-widest text-white">MANEX<span className="text-neon-green">RECON</span></span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-white/50">
           <span className="hidden sm:block">STATUS: {status === AppStatus.SCANNING ? <span className="text-neon-red animate-pulse">ACTIVE_SCAN</span> : <span className="text-neon-green">ONLINE</span>}</span>
           <span className="hidden sm:block">VER: 4.0.2</span>
           {status !== AppStatus.IDLE && (
             <button onClick={reset} className="hover:text-white flex items-center gap-1">
               <Power size={14} /> RESET
             </button>
           )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 relative z-10">
        
        <AnimatePresence mode="wait">
          {status === AppStatus.IDLE && (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600 tracking-tighter">
                  OSINT<span className="text-neon-green">_</span>TERMINAL
                </h1>
                <p className="text-neon-green font-mono text-sm md:text-base max-w-lg mx-auto border-l-2 border-neon-green pl-4 text-left opacity-80">
                  >> INITIALIZE RECONNAISSANCE PROTOCOLS.<br/>
                  >> ENTER DOMAIN TARGET FOR VULNERABILITY ASSESSMENT.
                </p>
              </div>

              <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-neon-green to-neon-blue rounded-sm blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-black flex items-center border border-white/20 p-2 rounded-sm">
                  <Terminal className="text-white/50 ml-3" />
                  <span className="text-neon-green font-mono ml-2 mr-1">{">"}</span>
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="ENTER_TARGET_DOMAIN (e.g., example.com)"
                    className="w-full bg-transparent border-none focus:ring-0 text-white font-mono placeholder-white/20 text-lg py-2"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    className="bg-white/10 hover:bg-neon-green hover:text-black text-white px-6 py-2 rounded-sm font-display font-bold transition-all duration-300"
                  >
                    SCAN
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {status === AppStatus.SCANNING && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[50vh]"
            >
              <TerminalLoader />
              <p className="mt-4 text-neon-green/60 font-mono text-xs animate-pulse">DO NOT CLOSE WINDOW. DECRYPTION IN PROGRESS...</p>
            </motion.div>
          )}

          {status === AppStatus.COMPLETE && data && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ReconDashboard data={data} />
            </motion.div>
          )}

          {status === AppStatus.ERROR && (
             <motion.div
               key="error"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex flex-col items-center justify-center min-h-[50vh] text-center"
             >
               <div className="text-neon-red mb-4">
                 <AlertTriangle size={64} />
               </div>
               <h2 className="text-3xl font-display text-white mb-2">SYSTEM FAILURE</h2>
               <p className="text-neon-red font-mono border border-neon-red/30 bg-neon-red/5 p-4 rounded mb-6">
                 {error}
               </p>
               <button 
                 onClick={reset}
                 className="px-6 py-3 border border-white/20 hover:border-white hover:bg-white/5 text-white font-mono transition-all"
               >
                 REBOOT_SYSTEM
               </button>
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;