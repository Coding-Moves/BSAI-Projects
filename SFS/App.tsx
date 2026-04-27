import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Upload, 
  Download, 
  FileText, 
  Key, 
  Activity, 
  ShieldAlert,
  LogOut,
  ChevronRight,
  RefreshCw,
  Share2,
  Users,
  X,
  MessageSquare,
  Send,
  Zap,
  Globe,
  Terminal,
  Trophy,
  UserPlus,
  ArrowRightLeft,
  Fingerprint,
  Mail,
  User as UserIcon,
  Search,
  AlertCircle,
  CheckSquare
} from 'lucide-react';
import { 
  generateRSAKeyPair, 
  encryptFile, 
  decryptFile, 
  decryptAesKey,
  importPublicKey,
  encryptAesKeyForRecipient,
  importPrivateKey
} from './services/cryptoService';
import { getSecurityInsights, generateAcademicReport, chatWithSecurityExpert } from './services/geminiService';
import { AuthState, EncryptedFile, AuditLog, UserAccount, ChatMessage, UserKeys } from './types';

const CodingMovesLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" className="animate-[spin_20s_linear_infinite]" />
    <path d="M30 40L50 20L70 40M30 60L50 80L70 60" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="8" fill="currentColor" />
  </svg>
);

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });
  
  const [files, setFiles] = useState<EncryptedFile[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [userDB, setUserDB] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'shared' | 'security' | 'audit' | 'report'>('files');
  const [sharingFile, setSharingFile] = useState<EncryptedFile | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [fullReport, setFullReport] = useState<string>("");
  const [userSearch, setUserSearch] = useState("");

  // Load persistence
  useEffect(() => {
    const savedLogs = localStorage.getItem('ssf_logs_v1');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    
    const savedUsers = localStorage.getItem('ssf_users_v1');
    if (savedUsers) {
      setUserDB(JSON.parse(savedUsers));
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const addLog = (action: AuditLog['action'], details: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      details,
    };
    setLogs(prev => {
      const updated = [newLog, ...prev.slice(0, 49)];
      localStorage.setItem('ssf_logs_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRegister = async (email: string, username: string, passwordHash: string) => {
    if (userDB.find(u => u.email === email)) {
      alert("Account with this email already exists.");
      return;
    }
    setLoading(true);
    try {
      const keys = await generateRSAKeyPair();
      const newUser: UserAccount = {
        email,
        username,
        passwordHash,
        publicKey: keys.exportedPublicKey,
        fullKeys: keys 
      };

      const updatedDB = [...userDB, newUser];
      setUserDB(updatedDB);
      localStorage.setItem('ssf_users_v1', JSON.stringify(updatedDB.map(({fullKeys, ...rest}) => rest)));
      
      setAuth({ 
        isAuthenticated: true, 
        user: newUser, 
        token: btoa(`${email}:${Date.now()}`) 
      });
      
      addLog('REGISTER', `User ${username} registered. Identity keys generated.`);
      
      const blob = new Blob([keys.exportedPrivateKey], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${username}_ssf_private_key.pem`;
      a.click();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (email: string, passwordHash: string) => {
    setLoading(true);
    const user = userDB.find(u => u.email === email && u.passwordHash === passwordHash);
    if (user) {
      setAuth({ 
        isAuthenticated: true, 
        user, 
        token: btoa(`${email}:${Date.now()}`) 
      });
      addLog('LOGIN', `User ${user.username} authenticated.`);
    } else {
      alert("Invalid credentials.");
    }
    setLoading(false);
  };

  const handlePrivateKeyImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !auth.user) return;
    setLoading(true);
    try {
      const text = await e.target.files[0].text();
      const privKey = await importPrivateKey(text.trim());
      const pubKey = await importPublicKey(auth.user.publicKey);
      
      setAuth(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          fullKeys: {
            privateKey: privKey,
            publicKey: pubKey,
            exportedPublicKey: auth.user!.publicKey,
            exportedPrivateKey: text.trim()
          }
        } : null
      }));
      addLog('KEY_GEN', "Private key imported. Session activated.");
      alert("Identity Activated: Encryption/Decryption enabled.");
    } catch (error) {
      console.error(error);
      alert("Invalid Private Key File.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !auth.user?.fullKeys) {
      alert("Identity not active. Please import your private key first.");
      return;
    }
    setLoading(true);
    try {
      const file = e.target.files[0];
      const encrypted = await encryptFile(file, auth.user.fullKeys.publicKey);
      
      const newFile: EncryptedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        encryptedBlob: encrypted.encryptedBlob,
        encryptedKey: encrypted.encryptedKey,
        iv: encrypted.iv,
        ownerEmail: auth.user.email,
        recipientEmail: auth.user.email
      };

      setFiles(prev => [newFile, ...prev]);
      addLog('UPLOAD', `File '${file.name}' encrypted and uploaded.`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: EncryptedFile) => {
    if (!auth.user?.fullKeys) {
      alert("Identity not active. Please import your private key.");
      return;
    }
    setLoading(true);
    try {
      const decryptedAesKeyRaw = await decryptAesKey(file.encryptedKey, auth.user.fullKeys.privateKey);
      const decryptedBlob = await decryptFile(file.encryptedBlob, decryptedAesKeyRaw, file.iv);
      
      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      addLog('DOWNLOAD', `File '${file.name}' decrypted and restored.`);
    } catch (error) {
      console.error(error);
      alert("Decryption Failed: This key pair cannot unlock this asset.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (recipient: UserAccount) => {
    if (!sharingFile || !auth.user?.fullKeys) {
      alert("Active identity required for sharing.");
      return;
    }
    setLoading(true);
    try {
      const rawAesKey = await decryptAesKey(sharingFile.encryptedKey, auth.user.fullKeys.privateKey);
      const recipientPubKey = await importPublicKey(recipient.publicKey);
      const sharedEncryptedKey = await encryptAesKeyForRecipient(rawAesKey, recipientPubKey);
      
      const sharedFile: EncryptedFile = {
        ...sharingFile,
        id: Math.random().toString(36).substr(2, 9),
        encryptedKey: sharedEncryptedKey,
        recipientEmail: recipient.email,
        sharedBy: auth.user.email,
      };
      
      setFiles(prev => [sharedFile, ...prev]);
      addLog('SHARE', `Shared access to '${sharingFile.name}' with ${recipient.email}.`);
      setSharingFile(null);
      setUserSearch("");
      alert(`Asset shared successfully with ${recipient.username}`);
    } catch (error) {
      console.error(error);
      alert("Sharing failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const reply = await chatWithSecurityExpert(history, userMsg);
      setChatMessages(prev => [...prev, { role: 'model', text: reply || "Error processing request." }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createReport = async () => {
    if (!auth.user) return;
    setLoading(true);
    try {
      const report = await generateAcademicReport(auth.user.username, files.length);
      setFullReport(report || "Failed to generate report.");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!auth.isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} loading={loading} />;
  }

  const ownedFiles = files.filter(f => f.recipientEmail === auth.user?.email && !f.sharedBy);
  const sharedWithMe = files.filter(f => f.recipientEmail === auth.user?.email && !!f.sharedBy);
  const potentialRecipients = userDB.filter(u => u.email !== auth.user?.email && (u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())));
  const isIdentityLoaded = !!auth.user?.fullKeys;

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col selection:bg-indigo-500 selection:text-white">
      <div className="bg-indigo-600 px-4 py-1.5 flex items-center justify-center gap-2">
        <CodingMovesLogo className="w-4 h-4 text-white/80" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Presented by Coding Moves</span>
      </div>

      <header className="border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
              <ShieldCheck className="text-white" size={22} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white/90">SSF <span className="text-indigo-500">Secure File System</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Client-Side Hybrid Security</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pl-6 border-l border-white/5">
            <div className="text-right">
              <p className="text-sm font-bold text-white/80">{auth.user?.username}</p>
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-tight">{auth.user?.email}</p>
            </div>
            <button 
              onClick={() => setAuth({ isAuthenticated: false, user: null, token: null })} 
              className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all border border-white/5 active:scale-95"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {!isIdentityLoaded && activeTab === 'files' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-6 animate-in slide-in-from-top-full duration-500">
           <div className="max-w-7xl mx-auto flex items-center justify-between">
             <div className="flex items-center gap-3">
               <AlertCircle className="text-amber-500" size={18} />
               <p className="text-xs font-bold text-amber-200/80">Session inactive. Import your <span className="underline">private key (.pem)</span> to unlock decryption.</p>
             </div>
             <label className="cursor-pointer bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 hover:shadow-amber-500/20">
               Import Key
               <input type="file" className="hidden" onChange={handlePrivateKeyImport} accept=".pem,.txt" />
             </label>
           </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-2.5 backdrop-blur-sm">
            <nav className="flex flex-col gap-1">
              <NavButton active={activeTab === 'files'} onClick={() => setActiveTab('files')} icon={<FileText size={18} />} label="My Storage" />
              <NavButton active={activeTab === 'shared'} onClick={() => setActiveTab('shared')} icon={<Users size={18} />} label="Shared Access" />
              <NavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<ShieldAlert size={18} />} label="Security Advisor" />
              <NavButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<Activity size={18} />} label="System Audit" />
              <div className="my-2 border-t border-white/5 mx-2" />
              <NavButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} icon={<Trophy size={18} />} label="Technical Report" />
            </nav>
          </div>
        </aside>

        <div className="lg:col-span-9 space-y-6">
          {activeTab === 'files' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center border-dashed group hover:border-indigo-500/40 transition-all hover:bg-slate-900/50 backdrop-blur-sm ${!isIdentityLoaded ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:scale-110 transition-transform">
                  <Upload className="text-indigo-400" size={36} />
                </div>
                <h2 className="text-2xl font-black text-white/90 mb-2 tracking-tight">E2EE Object Deployment</h2>
                <p className="text-slate-400 text-sm max-w-md mb-8 font-medium">Select a file to perform locally-executed RSA/AES wrapping.</p>
                <label className="cursor-pointer">
                  <span className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/30 block active:scale-95 text-base hover:scale-[1.02] hover:shadow-indigo-500/40">
                    {loading ? <RefreshCw className="animate-spin" /> : 'Choose Local Asset'}
                  </span>
                  <input type="file" className="hidden" onChange={handleUpload} disabled={loading || !isIdentityLoaded} />
                </label>
              </div>

              <FileList 
                title="Your Encrypted Storage" 
                files={ownedFiles} 
                onDownload={handleDownload} 
                onShare={setSharingFile} 
              />
            </div>
          )}

          {activeTab === 'shared' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FileList 
                title="Authorized Incoming Assets" 
                files={sharedWithMe} 
                onDownload={handleDownload} 
              />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 flex flex-col h-[600px] shadow-2xl backdrop-blur-md">
              <h3 className="text-xl font-black text-white/90 mb-6 flex items-center gap-3 uppercase tracking-widest text-sm">
                <Terminal className="text-indigo-400" size={20} /> SSF Neural Security Logic
              </h3>
              <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-700">
                      <MessageSquare size={40} className="mb-4 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">Advisor Ready</p>
                    </div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm transition-all hover:scale-[1.01] ${
                        m.role === 'user' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-200 border border-white/5'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleChat} className="p-4 bg-white/5 border-t border-white/5 flex gap-3">
                  <input 
                    type="text" placeholder="Ask about AES-256-GCM authentication tags..." 
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 font-medium placeholder:text-slate-800 transition-all focus:bg-black/60"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500 transition-all active:scale-95"><Send size={18} /></button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-slate-900/30 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="p-6 border-b border-white/5 bg-slate-900/40">
                <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.3em]">Immutable Protocol Ledger</h3>
              </div>
              <div className="max-h-[500px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {logs.map((log, idx) => (
                  <div key={log.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between font-mono text-[11px] transition-all hover:bg-white/[0.08] hover:translate-x-1 animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`font-black uppercase tracking-widest ${
                      log.action === 'SHARE' ? 'text-purple-400' :
                      log.action === 'UPLOAD' ? 'text-indigo-400' :
                      'text-slate-400'
                    }`}>{log.action}</span>
                    <span className="text-slate-300 text-right max-w-md truncate">{log.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 text-slate-800 shadow-2xl transition-all hover:shadow-indigo-500/10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black">Technical System Summary</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Generated via Gemini Engineering Engine</p>
                </div>
                <button 
                  onClick={createReport} 
                  disabled={loading} 
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
                >
                  {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : 'Compile Report'}
                </button>
              </div>
              <div className="p-10 bg-slate-50 rounded-3xl border border-slate-200 min-h-[400px] font-serif leading-relaxed text-slate-700 whitespace-pre-wrap animate-in fade-in duration-700">
                {fullReport || "The SSF system is ready to compile a detailed technical analysis."}
              </div>
            </div>
          )}
        </div>
      </main>

      {sharingFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSharingFile(null)} />
          <div className="bg-[#0f1422] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                  <Share2 className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white/90">Asset Distribution</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Select target identity for re-wrapping</p>
                </div>
              </div>
              <button onClick={() => setSharingFile(null)} className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input 
                  type="text" 
                  placeholder="Search user nodes..." 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 font-medium placeholder:text-slate-800 transition-all focus:bg-black/60"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
                {potentialRecipients.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-white/5 rounded-3xl">
                    <Users size={32} className="mx-auto mb-3 text-slate-800" />
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No target nodes discovered</p>
                  </div>
                ) : (
                  potentialRecipients.map(peer => (
                    <button 
                      key={peer.email}
                      onClick={() => handleShare(peer)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-indigo-600/10 border border-white/5 transition-all group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          {peer.username[0].toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{peer.username}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{peer.email}</p>
                        </div>
                      </div>
                      <ArrowRightLeft size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-black/50 border-t border-white/5 p-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CodingMovesLogo className="w-6 h-6 text-indigo-500/60 transition-transform hover:rotate-12" />
            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Coding Moves Engineering</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">System Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FileList: React.FC<{ 
  title: string; 
  files: EncryptedFile[]; 
  onDownload: (f: EncryptedFile) => void;
  onShare?: (f: EncryptedFile) => void;
}> = ({ title, files, onDownload, onShare }) => (
  <div className="bg-slate-900/30 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm transition-all hover:shadow-indigo-500/5">
    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
      <h3 className="text-lg font-black text-white/90">{title}</h3>
      <span className="px-3 py-1 bg-black/40 text-slate-400 text-[10px] font-black rounded-full border border-white/5">{files.length} Secure Objects</span>
    </div>
    <div className="divide-y divide-white/5">
      {files.length === 0 ? (
        <div className="p-20 text-center animate-in fade-in duration-700">
          <p className="text-slate-600 text-sm font-bold uppercase tracking-widest">No assets found.</p>
        </div>
      ) : (
        files.map((file, idx) => (
          <div key={file.id} className="p-6 flex items-center justify-between hover:bg-white/[0.03] transition-all group animate-in slide-in-from-right-4" style={{ animationDelay: `${idx * 75}ms` }}>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-black/40 group-hover:bg-indigo-500/10 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-all border border-white/5 group-hover:scale-105">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm font-bold flex items-center gap-2 text-white/90 truncate max-w-[300px]">
                  {file.name}
                  {file.sharedBy && <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-500/20 font-black">SHARED</span>}
                </p>
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tight">{(file.size / 1024).toFixed(1)} KB &bull; {new Date(file.uploadDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {onShare && !file.sharedBy && (
                <button 
                  onClick={() => onShare(file)} 
                  className="p-3 bg-white/5 text-slate-400 hover:text-indigo-400 rounded-xl border border-white/5 transition-all shadow-md active:scale-95 hover:scale-105"
                >
                  <Share2 size={18} />
                </button>
              )}
              <button 
                onClick={() => onDownload(file)} 
                className="flex items-center gap-2 text-[11px] font-black text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest hover:scale-105 hover:shadow-indigo-500/30"
              >
                <Download size={16} /> Restore
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-2xl transition-all font-black group active:scale-[0.98] ${
      active ? 'bg-indigo-600 text-white shadow-xl translate-x-1 ring-1 ring-white/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1'
    }`}
  >
    <div className={`transition-transform group-hover:rotate-12 ${active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>{icon}</div>
    <span className="text-[10px] tracking-widest uppercase">{label}</span>
  </button>
);

const AuthScreen: React.FC<{ 
  onLogin: (e: string, p: string) => void; 
  onRegister: (e: string, u: string, p: string) => void;
  loading: boolean;
}> = ({ onLogin, onRegister, loading }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') onLogin(email, password);
    else onRegister(email, username, password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050810] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      
      <div className="mb-12 text-center relative z-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CodingMovesLogo className="w-8 h-8 text-indigo-500 transition-transform hover:rotate-180 duration-700" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
            Presented by <span className="text-white hover:text-indigo-400 transition-colors">Coding Moves</span>
          </span>
        </div>
        <h1 className="text-5xl font-black text-white flex items-center justify-center gap-3 mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">SSF - Secure File System</span>
        </h1>
      </div>

      <div className="max-w-md w-full bg-[#0a0f1d] border border-white/5 rounded-[3rem] p-10 shadow-2xl text-center relative z-10 backdrop-blur-2xl ring-1 ring-white/5 transition-all hover:shadow-indigo-500/10">
        <div className="w-20 h-20 bg-white rounded-[1.8rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative overflow-hidden group hover:scale-110 transition-transform">
          <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
          <CheckSquare className="text-indigo-600 relative z-10" size={32} />
        </div>
        <h2 className="text-3xl font-black mb-10 tracking-widest text-white uppercase">Access Portal</h2>
        
        <div className="flex bg-black/40 p-2 rounded-[1.8rem] mb-10 border border-white/5">
          <button 
            type="button"
            onClick={() => setMode('login')} 
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all relative overflow-hidden group ${mode === 'login' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Authenticate
          </button>
          <button 
            type="button"
            onClick={() => setMode('register')} 
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all ${mode === 'register' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Provision Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 text-left">
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                required type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} 
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold placeholder:text-slate-800 transition-all focus:bg-black/60" 
              />
            </div>
            {mode === 'register' && (
              <div className="relative group animate-in slide-in-from-top-2">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  required type="text" placeholder="Desired Username" value={username} onChange={e => setUsername(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold placeholder:text-slate-800 transition-all focus:bg-black/60" 
                />
              </div>
            )}
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                required type="password" placeholder="Passcode" value={password} onChange={e => setPassword(e.target.value)} 
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold placeholder:text-slate-800 transition-all focus:bg-black/60" 
              />
            </div>
          </div>
          <button 
            disabled={loading} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 rounded-2xl transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 mt-6 relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <span className="relative z-10 flex items-center gap-3 uppercase tracking-widest text-xs">Verify Access Key <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>}
          </button>
        </form>
        <p className="mt-10 text-[10px] text-slate-700 italic leading-relaxed uppercase tracking-widest">Client-Side RSA-2048 Vault Protocol</p>
      </div>
    </div>
  );
};

export default App;
