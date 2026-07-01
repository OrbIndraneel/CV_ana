import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Menu, 
  X, 
  ArrowUp, 
  Sparkles, 
  PanelLeft, 
  ChevronLeft, 
  ChevronRight, 
  Monitor, 
  RotateCw, 
  Share, 
  Plus, 
  Copy, 
  LayoutDashboard,
  Files,
  Briefcase,
  Sliders,
  Search,
  CheckCircle2,
  Grid
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Scaled Dashboard Mockup Wrapper
export const ScaledDashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && innerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const targetWidth = 896; // design width
        const newScale = Math.min(containerWidth / targetWidth, 1);
        setScale(newScale);
        setHeight(innerRef.current.offsetHeight * newScale);
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const timer = setTimeout(handleResize, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ height: height || 'auto', overflow: 'hidden' }} className="w-full relative">
      <div
        ref={innerRef}
        style={{
          width: 896,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="absolute top-0 left-0"
      >
        {children}
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGetStarted();
  };

  return (
    <section 
      style={{ 
        backgroundImage: 'url("https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260611_133301_d5f2a94a-b22e-4e4a-a6b6-eacdddf1f5b0.png&w=1280&q=85")' 
      }}
      className="relative min-h-[100svh] overflow-hidden bg-cover bg-center flex flex-col font-sans"
    >
      {/* 1. Navbar */}
      <nav className="animate-fade-down relative z-20 px-5 sm:px-8 lg:px-10 py-4 sm:py-5 flex items-center justify-between">
        {/* Logo Left */}
        <a href="/" className="flex items-center gap-2 group">
          <Logo iconSize={36} logoColorClass="text-indigo-650 group-hover:text-indigo-550" />
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
            PRO
          </span>
        </a>

        {/* Nav Links Center (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={onGetStarted} className="flex items-center gap-1 text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
            Toolkit
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={onGetStarted} className="text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
            Plans
          </button>
          <button onClick={onGetStarted} className="text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
            FAQ
          </button>
        </div>

        {/* CTA + Hamburger Right */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onGetStarted}
            className="bg-gray-900 text-white text-[13px] font-semibold px-4 sm:px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            Get Started
          </button>
          
          {/* Hamburger (Mobile) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full text-gray-900 hover:bg-gray-900/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="absolute left-4 right-4 top-full mt-2 rounded-2xl bg-white/80 backdrop-blur-xl ring-1 ring-gray-200 px-5 py-3 animate-fade-up z-30 shadow-xl">
            <button 
              onClick={() => { setIsMobileMenuOpen(false); onGetStarted(); }}
              className="w-full text-left py-3 text-[15px] font-semibold text-gray-700 hover:text-gray-900 border-b border-gray-100 flex items-center justify-between cursor-pointer"
            >
              Toolkit <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); onGetStarted(); }}
              className="w-full text-left py-3 text-[15px] font-semibold text-gray-700 hover:text-gray-900 border-b border-gray-100 cursor-pointer"
            >
              Plans
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); onGetStarted(); }}
              className="w-full text-left py-3 text-[15px] font-semibold text-gray-700 hover:text-gray-900 last:border-b-0 cursor-pointer"
            >
              FAQ
            </button>
          </div>
        )}
      </nav>

      {/* Spacer between Navbar and Hero Content */}
      <div className="flex-1 min-h-8 sm:min-h-12 lg:min-h-16 shrink-0" />

      {/* 2. Hero Content (Centered) */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
        {/* Headline */}
        <h1 className="text-gray-900 font-normal leading-[1.05] tracking-tight text-[40px] min-[400px]:text-[44px] sm:text-6xl lg:text-7xl xl:text-[80px]">
          <span className="block animate-fade-up">Screen candidates.</span>
          <span className="block animate-fade-up [animation-delay:100ms] font-semibold bg-gradient-to-r from-gray-900 to-indigo-650 bg-clip-text text-transparent">With AI precision.</span>
        </h1>

        {/* Search Bar Form */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="animate-fade-up [animation-delay:220ms] mt-5 sm:mt-6 w-full max-w-xl"
        >
          <div className="flex items-center gap-3 rounded-full bg-white/60 backdrop-blur-md ring-1 ring-gray-200/80 pl-5 pr-1.5 py-1.5 focus-within:ring-gray-400 focus-within:bg-white/90 transition-all shadow-md">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input 
              type="text" 
              required
              placeholder="Paste a job description to discover top matching resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 outline-none py-2"
            />
            <button 
              type="submit"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-900 hover:bg-indigo-600 text-white hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center justify-center cursor-pointer"
              aria-label="Search"
            >
              <ArrowUp className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </form>

        {/* Description */}
        <p className="animate-fade-up [animation-delay:340ms] mt-4 sm:mt-5 text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md">
          Automate resume screening, extract core skills, <br />
          and rank talent instantly with <Sparkles className="inline w-4 h-4 -mt-1 text-yellow-500 fill-yellow-500" /> advanced NLP.
        </p>

        {/* CTA Actions */}
        <div className="animate-fade-up [animation-delay:460ms] mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={onGetStarted}
            className="bg-gray-900 hover:bg-indigo-600 text-white text-sm font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            Start Sourcing Free
          </button>
          <button 
            onClick={onGetStarted}
            className="text-gray-700 text-sm font-semibold px-6 py-3 rounded-full ring-1 ring-gray-300 hover:bg-gray-150 transition-colors active:scale-98 bg-white/40 backdrop-blur-sm cursor-pointer"
          >
            View Demo
          </button>
        </div>
      </div>

      {/* Spacer between Hero Content and Dashboard */}
      <div className="flex-1 min-h-10 sm:min-h-12 lg:min-h-16 shrink-0" />

      {/* 3. Dashboard Mockup (Below Hero Content) */}
      <div className="animate-hero-rise [animation-delay:620ms] relative z-0 w-[92%] sm:w-[84%] lg:w-[72%] max-w-4xl mx-auto shrink-0 -mb-10 sm:-mb-20 lg:-mb-32">
        <ScaledDashboard>
          {/* Dashboard Window Chrome */}
          <div className="rounded-t-2xl overflow-hidden bg-[#1a1a1c] shadow-[0_-20px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10 text-left h-[520px] flex flex-col">
            
            {/* Title Bar */}
            <div className="bg-[#242427] border-b border-white/5 px-4 py-2.5 flex items-center justify-between select-none">
              {/* Left Side: Traffic lights & navigation buttons */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                
                <div className="flex items-center gap-2 text-white/40 ml-2">
                  <PanelLeft className="w-3.5 h-3.5 cursor-pointer hover:text-white/60" />
                  <ChevronLeft className="w-3.5 h-3.5 cursor-pointer hover:text-white/60" />
                  <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                </div>
              </div>

              {/* Center Address Bar */}
              <div className="flex-1 max-w-md mx-6">
                <div className="bg-[#1a1a1c] rounded-md px-6 py-1 text-[10px] text-white/60 flex items-center justify-center gap-1.5 border border-white/5">
                  <Monitor className="w-3 h-3 text-white/40" />
                  <span>cvdada.com</span>
                </div>
              </div>

              {/* Right Side Browser Buttons */}
              <div className="flex items-center gap-3 text-white/40">
                <RotateCw className="w-3.5 h-3.5 cursor-pointer hover:text-white/60" />
                <Share className="w-3.5 h-3.5 cursor-pointer hover:text-white/60" />
                <Plus className="w-3.5 h-3.5 cursor-pointer hover:text-white/60" />
                <Copy className="w-3.5 h-3.5 cursor-pointer hover:text-white/60" />
              </div>
            </div>

            {/* Main Window Layout */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* 3.1 Sidebar (22% width, 197px) */}
              <div className="w-[197px] border-r border-white/5 bg-[#1e1e21] px-3 py-3.5 flex flex-col justify-between select-none">
                <div className="space-y-6">
                  {/* Top Brand Header */}
                  <div className="flex items-center justify-between px-1 text-white/70">
                    <div className="flex items-center gap-1.5">
                      <Logo showText={false} iconSize={18} logoColorClass="text-indigo-400" />
                      <span className="text-[10px] font-bold tracking-tight">CV Dada</span>
                    </div>
                    <Grid className="w-3.5 h-3.5 text-white/30 cursor-pointer hover:text-white/50" />
                  </div>

                  {/* Workspace Indicator */}
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/5 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-white/[0.08] transition-all">
                    <div className="w-4.5 h-4.5 rounded bg-indigo-600 flex items-center justify-center text-[9px] text-white font-extrabold shadow-sm shrink-0">
                      CD
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-white/80 font-medium truncate leading-none">My Resumes</p>
                      <p className="text-[8px] text-white/40 mt-0.5 leading-none">Active Directory</p>
                    </div>
                  </div>

                  {/* Navigation list */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.04] text-white/90 text-[10px] font-medium cursor-pointer">
                      <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/60 hover:text-white/80 hover:bg-white/[0.02] text-[10px] font-medium cursor-pointer transition-all">
                      <Files className="w-3.5 h-3.5" />
                      <span>Resumes</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/60 hover:text-white/80 hover:bg-white/[0.02] text-[10px] font-medium cursor-pointer transition-all">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Job Openings</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/60 hover:text-white/80 hover:bg-white/[0.02] text-[10px] font-medium cursor-pointer transition-all">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Compatibility</span>
                    </div>
                  </div>

                  {/* Recent Resumes */}
                  <div className="space-y-2">
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block px-2">Recent Resumes</span>
                    <div className="space-y-1">
                      {[
                        'alexander_lead_react.pdf',
                        'jane_doe_swe_resume.pdf',
                        'john_smith_pm_lead.pdf',
                        'sarah_data_scientist.pdf'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-2 py-1 rounded hover:bg-white/[0.02] cursor-pointer group transition-all">
                          <span className="text-[9px] text-white/60 group-hover:text-white/80 truncate max-w-[130px]">{item}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]/70 shrink-0 shadow-sm" title="Ready to Scan" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profile Widget */}
                <div className="border-t border-white/5 pt-3 flex items-center gap-2 px-1 text-white/50">
                  <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-[8px] font-bold text-white flex items-center justify-center">
                    RO
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-white/70 leading-none font-semibold truncate">Recruitment Officer</p>
                    <span className="text-[7px] text-white/40 leading-none">Free Tier</span>
                  </div>
                </div>
              </div>

              {/* 3.2 Main Content Area (78% width, 699px) */}
              <div className="flex-1 bg-[#1a1a1c] p-6 flex flex-col overflow-y-auto space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-extrabold text-white shrink-0 shadow-sm">
                      CD
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white leading-none">Sourcing Dashboard</h2>
                      <p className="text-[10px] text-white/45 mt-0.5">cvdada.com/dashboard</p>
                    </div>
                  </div>

                  <button 
                    onClick={onGetStarted}
                    className="h-8 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Scan Resume
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 divide-x divide-white/5 rounded-xl bg-white/[0.03] ring-1 ring-white/5 p-4 select-none">
                  <div>
                    <span className="text-xl font-semibold text-white leading-none">62</span>
                    <span className="text-[8px] tracking-wider text-white/35 mt-1 block uppercase font-bold">Scans Run</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-xl font-semibold text-white leading-none">84%</span>
                    <span className="text-[8px] tracking-wider text-white/35 mt-1 block uppercase font-bold">Avg Score</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-xl font-semibold text-white leading-none">12</span>
                    <span className="text-[8px] tracking-wider text-white/35 mt-1 block uppercase font-bold">Revisions</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-xl font-semibold text-white leading-none">92%</span>
                    <span className="text-[8px] tracking-wider text-white/35 mt-1 block uppercase font-bold">Match Rate</span>
                  </div>
                </div>

                {/* Subject Cards */}
                <div className="grid grid-cols-3 gap-4 select-none">
                  {[
                    { title: 'Formatting Audit', score: '95% Score', icon: Files, color: 'text-indigo-400 bg-indigo-500/10' },
                    { title: 'Semantic Overlap', score: '68% Score', icon: Sliders, color: 'text-amber-400 bg-amber-500/10' },
                    { title: 'Bullet Grader', score: '84% Score', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' }
                  ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div key={i} className="rounded-xl bg-white/[0.02] hover:bg-white/[0.04] ring-1 ring-white/5 p-4 flex flex-col justify-between h-28 cursor-pointer transition-all">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-bold text-white/80">{card.title}</span>
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${card.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block">Quality metric</span>
                          <span className="text-[9px] font-semibold text-white/80 mt-0.5 block">{card.score}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Scan History */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between select-none">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Scan History</span>
                    <span className="text-[9px] text-indigo-400 cursor-pointer hover:underline">View all reports</span>
                  </div>

                  <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/5 overflow-hidden">
                    <table className="w-full text-left border-collapse text-[9px]">
                      <thead>
                        <tr className="bg-white/[0.03] border-b border-white/5 text-white/35 font-bold uppercase select-none">
                          <th className="py-2 px-3">Candidate File</th>
                          <th className="py-2 px-3 text-right">Target Role</th>
                          <th className="py-2 px-3 text-right">Compatibility</th>
                          <th className="py-2 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/70">
                        {[
                          { file: 'alexander_lead_react.pdf', role: 'Senior Frontend Engineer', score: '88/100', status: 'Complete', statusColor: 'text-[#28c840]/80 bg-[#28c840]/10' },
                          { file: 'jane_doe_swe_resume.pdf', role: 'Software Engineer II', score: '92/100', status: 'Complete', statusColor: 'text-[#28c840]/80 bg-[#28c840]/10' },
                          { file: 'john_smith_pm_lead.pdf', role: 'Product Manager', score: '74/100', status: 'Complete', statusColor: 'text-[#28c840]/80 bg-[#28c840]/10' },
                          { file: 'sarah_data_scientist.pdf', role: 'Data Scientist', score: '81/100', status: 'Scanning', statusColor: 'text-[#febc2e]/80 bg-[#febc2e]/10 animate-pulse' },
                          { file: 'dave_designer_cv.pdf', role: 'UI/UX Designer', score: '65/100', status: 'Complete', statusColor: 'text-[#28c840]/80 bg-[#28c840]/10' }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.01] transition-colors cursor-pointer">
                            <td className="py-2 px-3 font-medium text-white/80 max-w-[280px] truncate">{row.file}</td>
                            <td className="py-2 px-3 text-right font-medium text-white/60">{row.role}</td>
                            <td className="py-2 px-3 text-right font-medium text-white/60">{row.score}</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${row.statusColor}`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScaledDashboard>
      </div>

      {/* 4. Grass Overlay sits at the absolute bottom */}
      <img 
        src="https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1781191264/grass_eam204.png"
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 z-10 w-full select-none"
      />
    </section>
  );
};
