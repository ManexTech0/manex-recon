import React from 'react';
import { ReconResult, Vulnerability } from '../types';
import { Shield, Server, AlertTriangle, Globe, Download, Activity, Lock, Unlock, Link as LinkIcon, Network } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  data: ReconResult;
}

const Card: React.FC<{ children: React.ReactNode; className?: string; title: string; icon: React.ReactNode }> = ({ children, className = "", title, icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-panel/60 backdrop-blur-md border border-white/10 p-6 relative overflow-hidden group hover:border-neon-green/40 transition-colors duration-300 ${className}`}
  >
    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
      {icon}
    </div>
    <h3 className="text-neon-green font-display text-sm tracking-widest mb-4 flex items-center gap-2">
      {icon} {title}
    </h3>
    {children}
  </motion.div>
);

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  
  let color = "text-neon-red";
  if (score > 50) color = "text-yellow-500";
  if (score > 80) color = "text-neon-green";

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-white/5"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r="40"
          cx="64"
          cy="64"
        />
        <circle
          className={`${color} transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="40"
          cx="64"
          cy="64"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-display font-bold ${color}`}>{score}</span>
        <span className="text-[10px] text-white/50 uppercase">Secured</span>
      </div>
    </div>
  );
};

export const ReconDashboard: React.FC<Props> = ({ data }) => {
  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MANEX_RECON_${data.target}_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-4 mb-8"
      >
        <div>
          <h1 className="text-4xl font-display text-white mb-2">TARGET ACQUIRED: <span className="text-neon-green">{data.target}</span></h1>
          <p className="text-white/60 font-mono text-sm max-w-2xl">{data.summary}</p>
        </div>
        <button 
          onClick={downloadReport}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-neon-green/10 border border-neon-green/50 text-neon-green px-4 py-2 font-mono text-sm hover:bg-neon-green hover:text-black transition-all"
        >
          <Download size={16} /> EXPORT_DATA
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Security Score */}
        <Card title="THREAT_LEVEL" icon={<Shield size={18} />} className="md:col-span-1 flex flex-col items-center justify-center bg-black/40">
          <ScoreGauge score={data.securityScore} />
        </Card>

        {/* Tech Stack */}
        <Card title="TECH_STACK" icon={<Server size={18} />} className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4 font-mono text-sm">
            <div>
              <p className="text-white/40 text-xs mb-1">SERVER</p>
              <p className="text-white border-l-2 border-neon-blue pl-2">{data.techStack.server || "UNKNOWN"}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">CMS</p>
              <p className="text-white border-l-2 border-neon-blue pl-2">{data.techStack.cms || "CUSTOM/NONE"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-white/40 text-xs mb-1">FRAMEWORKS</p>
              <div className="flex flex-wrap gap-2">
                {data.techStack.frameworks.map((fw, i) => (
                  <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 text-neon-blue text-xs rounded-sm">
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Ports */}
        <Card title="OPEN_PORTS" icon={<Activity size={18} />} className="md:col-span-1">
          <div className="flex flex-wrap gap-2">
             {data.openPorts.length > 0 ? (
               data.openPorts.map((port) => (
                 <div key={port} className="flex flex-col items-center justify-center p-2 bg-neon-red/10 border border-neon-red/30 w-16 h-16">
                    <span className="text-neon-red font-bold font-display">{port}</span>
                    <span className="text-[10px] text-neon-red/70">TCP</span>
                 </div>
               ))
             ) : (
               <span className="text-white/50 font-mono italic">No standard ports exposed publicly.</span>
             )}
          </div>
        </Card>

        {/* Subdomains */}
        <Card title="NETWORK_TOPOLOGY / SUBDOMAINS" icon={<Network size={18} />} className="md:col-span-2 border-neon-blue/30">
           {data.subdomains && data.subdomains.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
               {data.subdomains.map((sub, i) => (
                 <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-sm border-l-2 border-neon-blue">
                    <Globe size={12} className="text-white/50"/>
                    <span className="text-xs font-mono text-neon-blue truncate">{sub}</span>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-white/30 font-mono text-sm italic">No public subdomains enumerated via passive search.</p>
           )}
        </Card>

        {/* DNS Issues */}
        <Card title="DNS_CONFIG" icon={<Globe size={18} />} className="md:col-span-2 border-yellow-500/30">
          {data.dnsIssues && data.dnsIssues.length > 0 ? (
             <ul className="space-y-2 font-mono text-sm text-yellow-500">
                {data.dnsIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-1 flex-shrink-0" /> {issue}
                  </li>
                ))}
             </ul>
          ) : (
             <p className="text-white/30 font-mono text-sm italic">No critical DNS misconfigurations detected.</p>
          )}
        </Card>

        {/* Vulnerabilities */}
        <Card title="VULNERABILITY_FEED" icon={<AlertTriangle size={18} />} className="md:col-span-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead className="text-white/40 text-xs border-b border-white/10">
                <tr>
                  <th className="pb-3 pl-2">SEVERITY</th>
                  <th className="pb-3">ID / CVE</th>
                  <th className="pb-3">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.vulnerabilities.length > 0 ? (
                  data.vulnerabilities.map((vuln, i) => (
                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2">
                        <span className={`
                          px-2 py-1 text-xs font-bold rounded-sm
                          ${vuln.severity === 'CRITICAL' ? 'bg-neon-red text-black' : 
                            vuln.severity === 'HIGH' ? 'bg-orange-600 text-white' : 
                            'bg-yellow-500/20 text-yellow-500'}
                        `}>
                          {vuln.severity}
                        </span>
                      </td>
                      <td className="py-4 text-white font-bold group-hover:text-neon-green transition-colors">
                        {vuln.id}
                      </td>
                      <td className="py-4 text-white/70 max-w-xl">
                        {vuln.description}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-white/30 italic">
                      <Lock size={24} className="mx-auto mb-2 opacity-50" />
                      SYSTEM SECURE. NO PUBLIC CVEs DETECTED.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Sources */}
        {data.sources && data.sources.length > 0 && (
          <Card title="INTELLIGENCE_SOURCES" icon={<LinkIcon size={18} />} className="md:col-span-4 border-neon-blue/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-mono text-neon-blue hover:text-white truncate p-2 bg-white/5 rounded-sm hover:bg-white/10 transition-colors"
                >
                  <Globe size={12} className="flex-shrink-0" />
                  <span className="truncate">{source}</span>
                </a>
              ))}
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};