import { GoogleGenAI, Type } from "@google/genai";
import { ReconResult } from "../types";

// Schema definition for strict JSON output
const reconSchema = {
  type: Type.OBJECT,
  properties: {
    target: { type: Type.STRING, description: "The domain or IP scanned" },
    securityScore: { type: Type.NUMBER, description: "A calculated security score from 0 to 100 based on findings (100 is secure)" },
    summary: { type: Type.STRING, description: "A brief executive summary of the security posture" },
    techStack: {
      type: Type.OBJECT,
      properties: {
        server: { type: Type.STRING, description: "Web server detected (e.g., Nginx, Apache)" },
        frameworks: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "List of frameworks or libraries detected (e.g., React, Django)" 
        },
        cms: { type: Type.STRING, description: "CMS detected if any (e.g., WordPress)" }
      }
    },
    openPorts: { 
      type: Type.ARRAY, 
      items: { type: Type.NUMBER },
      description: "Commonly associated open ports based on tech stack (e.g., 80, 443, 22)"
    },
    vulnerabilities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "CVE ID or Vulnerability Name" },
          severity: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
          description: { type: Type.STRING }
        }
      }
    },
    dnsIssues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Potential DNS misconfigurations (e.g. missing SPF/DMARC)"
    },
    subdomains: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of discovered subdomains (e.g., mail.target.com, dev.target.com)"
    }
  },
  required: ["target", "securityScore", "summary", "techStack", "vulnerabilities", "subdomains"]
};

export const performReconScan = async (target: string): Promise<ReconResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-pro-preview for best reasoning and search capabilities
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a strict Passive OSINT reconnaissance scan on the target: "${target}".
      
      CRITICAL INSTRUCTION: Do NOT hallucinate data. Only return information found via Google Search.
      
      Use the Google Search tool to find:
      1. **Subdomain Enumeration**: Look for public subdomains (e.g., 'site:${target}', 'mail.${target}', 'dev.${target}', 'api.${target}').
      2. **Tech Stack Fingerprinting**: Identify servers, CMS, and frameworks based on job listings, technical documentation, or HTTP header discussions found online.
      3. **Vulnerability Assessment**: Cross-reference the discovered tech stack versions with the CVE database. Only report specific CVEs if the specific vulnerable version is likely present or generally associated with the target's configuration.
      4. **Data Breaches**: Check if the domain has been mentioned in major public breaches (e.g., 'haveibeenpwned', news reports).
      5. **Network**: Infer likely open ports based on the services found (e.g., if an FTP server is mentioned, list port 21).
      
      Based on this public information, calculate a Security Score (0-100).
      
      Format the output strictly according to the requested JSON schema.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: reconSchema,
        thinkingConfig: { thinkingBudget: 2048 } // Allow some thinking for complex correlation
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const result = JSON.parse(text) as ReconResult;
    
    // Extract grounding metadata as required
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      const sources = chunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: any) => typeof uri === 'string');
      
      if (sources.length > 0) {
        result.sources = [...new Set(sources)] as string[];
      }
    }

    return result;

  } catch (error) {
    console.error("Recon failed:", error);
    throw error;
  }
};