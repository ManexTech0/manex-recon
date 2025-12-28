export interface Vulnerability {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
}

export interface TechStack {
  server: string;
  frameworks: string[];
  cms: string;
}

export interface ReconResult {
  target: string;
  securityScore: number;
  summary: string;
  techStack: TechStack;
  openPorts: number[];
  vulnerabilities: Vulnerability[];
  dnsIssues: string[];
  subdomains: string[];
  sources?: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}