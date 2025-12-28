import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const LOG_STEPS = [
  "INITIALIZING MANEX KERNEL v4.0.2...",
  "ESTABLISHING SECURE HANDSHAKE...",
  "BYPASSING PERIMETER FIREWALL...",
  "PROXY CHAIN: [192.168.X.X] -> [10.0.X.X] -> TARGET",
  "RESOLVING DNS RECORDS...",
  "ENUMERATING SUBDOMAINS...",
  "SCANNING PORT RANGE 1-1024...",
  "DETECTED OPEN PORTS: 80, 443, 8080...",
  "FINGERPRINTING SERVER HEADERS...",
  "QUERYING GLOBAL CVE DATABASE...",
  "CORRELATING THREAT INTELLIGENCE...",
  "ANALYZING SSL/TLS CERTIFICATES...",
  "CHECKING DARK WEB EXPOSURE...",
  "COMPILING FINAL REPORT...",
];

export const TerminalLoader: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < LOG_STEPS.length) {
        setLogs(prev => [...prev, LOG_STEPS[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800); // Add a new line every 800ms

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 bg-black/80 border border-neon-green/30 rounded-sm p-4 font-mono text-sm relative overflow-hidden shadow-[0_0_20px_rgba(0,255,65,0.1)]">
      {/* Scanline effect specifically for the terminal */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,65,0.05)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
      
      <div className="flex items-center gap-2 mb-4 border-b border-neon-green/20 pb-2">
        <div className="w-3 h-3 rounded-full bg-neon-red animate-pulse"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-neon-green"></div>
        <span className="text-neon-green/50 ml-2 text-xs tracking-widest">SYSTEM_PROCESS::PID_9924</span>
      </div>

      <div ref={scrollRef} className="h-64 overflow-y-auto space-y-1 scrollbar-hide">
        {logs.map((log, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-neon-green"
          >
            <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
            <span className="font-bold">{">"}</span> {log}
          </motion.div>
        ))}
        <div className="animate-pulse text-neon-green">_</div>
      </div>
    </div>
  );
};