import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { 
  FileText, Sparkles, Database, Layers, RefreshCw, Send, CheckCircle2, 
  ArrowRight, Users, MessageSquare, Ticket, FileSpreadsheet, Play,
  TrendingUp, DollarSign, Calendar, ShieldAlert, Check, Clock, UserCheck, ChevronRight
} from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind Class Merging
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Recharts Dummy Data
const pipelineData = [
  { name: 'Jan', value: 12000 },
  { name: 'Feb', value: 19000 },
  { name: 'Mar', value: 32000 },
  { name: 'Apr', value: 45000 },
  { name: 'May', value: 68000 },
  { name: 'Jun', value: 94000 },
];

const revenueData = [
  { name: 'Week 1', value: 4000 },
  { name: 'Week 2', value: 9500 },
  { name: 'Week 3', value: 12000 },
  { name: 'Week 4', value: 18500 },
];

// Floating 3D Objects component
function FloatingDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Translucent Cube */}
      <motion.div 
        animate={{ 
          y: [-10, 10, -10],
          rotate: [0, 360],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[8%] w-16 h-16 border-2 border-dashed border-[#5B7CFF]/30 rounded-xl backdrop-blur-[1px]"
      />
      
      {/* Gradient Sphere */}
      <motion.div 
        animate={{ 
          y: [15, -15, 15],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] right-[5%] w-24 h-24 rounded-full bg-gradient-to-tr from-[#004ac6]/10 to-[#7A5CFF]/15 blur-sm"
      />
      
      {/* Glass Diamond */}
      <motion.div 
        animate={{ 
          rotateY: [0, 360],
          y: [-5, 5, -5]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[25%] left-[6%] w-12 h-12 bg-white/20 border border-white/40 shadow-lg backdrop-blur-md rounded-md transform rotate-45"
      />
      
      {/* Orbit Rings */}
      <div className="absolute top-[60%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] border border-[#E7EAF3]/60 rounded-full opacity-40 pointer-events-none" />
      <div className="absolute top-[60%] left-[50%] -translate-x-1/2 w-[1100px] h-[1100px] border border-[#E7EAF3]/30 rounded-full opacity-30 pointer-events-none" />

      {/* Background Soft Glows */}
      <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-[#BFD7FF]/15 rounded-full blur-[120px]" />
      <div className="absolute top-[50%] right-[10%] w-[600px] h-[600px] bg-[#E7E4FF]/20 rounded-full blur-[140px]" />
      <div className="absolute bottom-[10%] left-[15%] w-[450px] h-[450px] bg-[#F5F7FF]/25 rounded-full blur-[100px]" />
    </div>
  );
}

export function Section2() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax / 3D Tilt calculations for Block 1 Dashboard
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXVal = (e.clientX - rect.left) / width - 0.5;
    const mouseYVal = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(mouseXVal);
    mouseY.set(mouseYVal);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Block 2 list triggering
  const [listRef, listInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const featureList = [
    "AI Quote Generation",
    "Team Collaboration",
    "Version History",
    "Approval Workflow",
    "Invoice Conversion",
    "Smart Follow-ups"
  ];

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-[#ffffff] py-32 px-6 overflow-hidden border-t border-[#E7EAF3] font-['Inter']"
    >
      {/* Decorative 3D & background items */}
      <FloatingDecorations />

      <div className="relative max-w-[1500px] mx-auto z-10 space-y-48">
        
        {/* ========================================================================= */}
        {/* BLOCK 1: Left Copy, Right Interactive Mock Dashboard                      */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Text content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 space-y-8 pr-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#004ac6] bg-[#004ac6]/10 font-['Plus_Jakarta_Sans']">
              <Sparkles className="w-3.5 h-3.5" /> Unified Platform
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#141b2b] font-['Plus_Jakarta_Sans'] leading-[1.1]">
              One workspace. <br />
              Every quote. <br />
              Every client. <br />
              Every project.
            </h2>
            <p className="text-lg text-[#434655] font-normal leading-relaxed max-w-xl">
              Generate quotations, collaborate with your team, manage clients, convert quotes into invoices and monitor projects without switching tools.
            </p>
            <div className="pt-2">
              <motion.a 
                href="#learn-more"
                whileHover={{ x: 5 }}
                className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[#004ac6] hover:text-[#003ea8]"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>

          {/* Right Floating Interactive Dashboard Mock */}
          <div className="lg:col-span-7 flex justify-center items-center relative">
            
            {/* Soft background radial glow */}
            <div className="absolute inset-0 bg-radial-gradient from-[#BFD7FF]/35 to-transparent blur-[120px] opacity-75 pointer-events-none rounded-full" />
            
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative w-full max-w-[680px] bg-white/70 border border-[#E7EAF3] rounded-[32px] shadow-[0_32px_64px_-16px_rgba(20,27,43,0.06)] backdrop-blur-2xl p-6 sm:p-8 cursor-pointer select-none"
            >
              
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-[#E7EAF3] pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#004ac6] flex items-center justify-center text-white font-['Plus_Jakarta_Sans'] font-bold">Q</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#141b2b] font-['Plus_Jakarta_Sans']">Acme Corp Project</h4>
                    <span className="text-xs text-[#737686]">Pipeline: Proposal phase</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-100/60 border border-emerald-200">
                    Active
                  </span>
                  <div className="w-8 h-8 rounded-full border border-[#E7EAF3] bg-[#fafbff] flex items-center justify-center text-xs text-[#434655] font-semibold">
                    JD
                  </div>
                </div>
              </div>

              {/* Grid content inside Dashboard mock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Quotation List widget */}
                <div className="bg-white/80 border border-[#E7EAF3] rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#141b2b] font-['Plus_Jakarta_Sans']">Draft Quotation</span>
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">Pending</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#737686]">Web Dev Quote</span>
                      <span className="font-semibold text-[#141b2b]">$8,500</span>
                    </div>
                    <div className="w-full bg-[#E7EAF3] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[70%]" />
                    </div>
                  </div>
                </div>

                {/* Pipeline Stats widget */}
                <div className="bg-white/80 border border-[#E7EAF3] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#141b2b] font-['Plus_Jakarta_Sans']">Pipeline Value</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-[#141b2b] tracking-tight">
                      $<CountUp end={94000} duration={3} separator="," enableScrollSpy />
                    </span>
                    <p className="text-[10px] text-[#737686] mt-0.5">+14% compared to last month</p>
                  </div>
                </div>

                {/* Recharts Revenue Area Chart Widget */}
                <div className="bg-white/80 border border-[#E7EAF3] rounded-2xl p-4 shadow-sm sm:col-span-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-[#141b2b] font-['Plus_Jakarta_Sans']">Monthly Growth</span>
                      <p className="text-[10px] text-[#737686]">Forecast & conversions</p>
                    </div>
                    <span className="text-xs font-semibold text-[#004ac6]">$48,200 converted</span>
                  </div>
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={pipelineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#004ac6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#004ac6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#737686" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke="#737686" fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#004ac6" strokeWidth={2} fillOpacity={1} fill="url(#colorPipeline)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Client & Task */}
                <div className="bg-white/80 border border-[#E7EAF3] rounded-2xl p-4 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-[#141b2b] font-['Plus_Jakarta_Sans']">Recent Client</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">BC</div>
                    <div>
                      <p className="text-xs font-semibold text-[#141b2b]">BetaCorp Inc.</p>
                      <p className="text-[9px] text-[#737686]">Singapore</p>
                    </div>
                  </div>
                </div>

                {/* Approval Request widget */}
                <div className="bg-white/80 border border-[#E7EAF3] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-[#141b2b] font-['Plus_Jakarta_Sans']">Approval Requests</span>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-[#434655]">Proposal #2409</span>
                    <button className="bg-[#004ac6] text-white px-2.5 py-1 rounded-lg text-[10px] font-medium hover:bg-[#003ea8]">Approve</button>
                  </div>
                </div>

              </div>

              {/* FLOATING SUB-COMPONENTS (3D layering) */}
              
              {/* Floating Spark Icon */}
              <motion.div 
                style={{ zIndex: 30, x: tiltX, y: tiltY }}
                className="absolute -top-6 -right-6 w-14 h-14 bg-gradient-to-tr from-[#004ac6] to-[#7A5CFF] rounded-2xl shadow-[0_12px_24px_rgba(0,74,198,0.25)] flex items-center justify-center text-white"
              >
                <Sparkles className="w-6 h-6 animate-pulse" />
              </motion.div>

              {/* Floating PDF Icon */}
              <motion.div 
                style={{ zIndex: 30, x: useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig), y: useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), springConfig) }}
                className="absolute -bottom-8 -left-6 bg-white border border-[#E7EAF3] rounded-2xl p-3 shadow-lg flex items-center gap-2 pointer-events-none"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#141b2b]">Invoice_Draft.pdf</p>
                  <p className="text-[8px] text-[#737686]">1.2 MB · Ready</p>
                </div>
              </motion.div>

              {/* Floating AI Assistant Bubble */}
              <motion.div 
                style={{ zIndex: 40, x: useSpring(useTransform(mouseX, [-0.5, 0.5], [30, -30]), springConfig), y: useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), springConfig) }}
                className="absolute -right-12 bottom-12 bg-white/95 border border-[#E7EAF3] rounded-2xl p-4 shadow-xl max-w-[180px] space-y-2 pointer-events-none backdrop-blur-md"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#004ac6]" />
                  <span className="text-[9px] font-bold uppercase text-[#004ac6] tracking-wider">AI Copilot</span>
                </div>
                <p className="text-[10px] text-[#434655] leading-normal font-medium">
                  "Convert this quotation to an invoice with standard 15-day payment term?"
                </p>
              </motion.div>
              
            </motion.div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* BLOCK 2: Split Layout - Left Flowchart Glass Card, Right Copy             */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center pt-16">
          
          {/* Left Flowchart Glass Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 flex justify-center lg:justify-start"
          >
            <div className="w-full max-w-[620px] bg-white/70 border border-[#E7EAF3] rounded-[32px] p-8 shadow-[0_24px_48px_rgba(20,27,43,0.03)] backdrop-blur-xl relative overflow-hidden">
              
              {/* Subtle line background glow */}
              <div className="absolute top-0 bottom-0 left-[34px] w-[2px] bg-gradient-to-b from-[#004ac6]/40 via-[#5B7CFF]/30 to-[#7A5CFF]/10 z-0 pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <h4 className="text-xs font-bold text-[#737686] uppercase tracking-widest font-['Plus_Jakarta_Sans'] pb-2">Integrated Lifecycle</h4>
                
                {/* Steps */}
                {[
                  { step: "Lead Capture", desc: "Incoming lead mapped and scored", time: "Instant", icon: Database, color: "from-blue-500 to-[#004ac6]" },
                  { step: "AI Proposal", desc: "Automated quotation generated", time: "5s", icon: Sparkles, color: "from-[#004ac6] to-[#5B7CFF]" },
                  { step: "Smart Approval", desc: "Client signature & checkoff", time: "Real-time", icon: CheckCircle2, color: "from-[#5B7CFF] to-[#7A5CFF]" },
                  { step: "Invoice Conversion", desc: "Auto-bills and localized tax", time: "1-Click", icon: FileText, color: "from-[#7A5CFF] to-purple-500" },
                  { step: "Payment Gateway", desc: "Direct client clearing & deposit", time: "Secured", icon: DollarSign, color: "from-purple-500 to-indigo-500" },
                  { step: "Project Pipeline", desc: "Initiate timelines and assigns devs", time: "Sync", icon: Layers, color: "from-indigo-500 to-[#004ac6]" }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: 8 }}
                      className="group flex gap-4 items-center bg-white/50 border border-[#E7EAF3]/70 hover:border-[#004ac6]/30 rounded-2xl p-3.5 shadow-sm transition-all duration-300 relative cursor-pointer"
                    >
                      {/* Connection node */}
                      <div className="absolute left-[-26px] w-[10px] h-[10px] rounded-full border-2 border-white bg-[#004ac6] group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(0,74,198,0.5)]" />
                      
                      {/* Step Icon */}
                      <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-tr text-white flex items-center justify-center shadow-md shadow-blue-500/10", item.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h5 className="text-sm font-bold text-[#141b2b] group-hover:text-[#004ac6] transition-colors">{item.step}</h5>
                          <span className="text-[10px] text-[#737686] font-medium">{item.time}</span>
                        </div>
                        <p className="text-xs text-[#737686] truncate">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#737686] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  );
                })}
              </div>

            </div>
          </motion.div>

          {/* Right Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 space-y-8 lg:pl-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#004ac6] bg-[#004ac6]/10 font-['Plus_Jakarta_Sans']">
              <Layers className="w-3.5 h-3.5" /> Built for modern businesses
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#141b2b] font-['Plus_Jakarta_Sans'] leading-[1.15]">
              Everything happens in one workflow.
            </h2>
            <p className="text-lg text-[#434655] leading-relaxed">
              Forget switching between Excel, WhatsApp, Email, Drive and PDF editors. Quotiq keeps every interaction connected.
            </p>

            {/* Staggered Features List on Scroll */}
            <div ref={listRef} className="grid grid-cols-2 gap-y-4 gap-x-6 pt-2">
              {featureList.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={listInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[#004ac6]/10 flex items-center justify-center text-[#004ac6]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-[#141b2b]">{feature}</span>
                </motion.div>
              ))}
            </div>

          </motion.div>
          
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 3: Interactive Workspace Showcase - Left Browser, Right AI Panel    */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center pt-16">
          
          {/* Left: Large Browser Window Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-8 flex justify-center"
          >
            <div className="w-full max-w-[850px] bg-white border border-[#E7EAF3] rounded-[30px] shadow-[0_48px_96px_-24px_rgba(20,27,43,0.08)] overflow-hidden">
              
              {/* Browser Window Header Controls */}
              <div className="bg-[#fafbff] border-b border-[#E7EAF3] py-4 px-6 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex items-center gap-2 bg-white border border-[#E7EAF3] px-16 py-1 rounded-lg text-[10px] text-[#737686] font-mono">
                  app.quotiq.com/projects/acme-web
                </div>
                <div className="w-12 h-2" /> {/* Spacer */}
              </div>

              {/* Main Workspace Split Layout */}
              <div className="flex min-h-[440px] divide-x divide-[#E7EAF3]">
                
                {/* Sidebar Mock */}
                <aside className="w-48 bg-[#fafbff] p-4 flex flex-col gap-6 select-none shrink-0 hidden sm:flex">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-[#737686] uppercase tracking-wider px-2">Navigation</span>
                    {[
                      { label: "Dashboard", icon: Layers, active: false },
                      { label: "CRM", icon: Users, active: true },
                      { label: "Clients", icon: UserCheck, active: false },
                      { label: "Quotations", icon: FileText, active: false },
                      { label: "Invoices", icon: FileSpreadsheet, active: false },
                      { label: "Projects", icon: Clock, active: false },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div 
                          key={index}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors",
                            item.active 
                              ? "bg-[#004ac6] text-white" 
                              : "text-[#434655] hover:bg-[#E7EAF3]/40"
                          )}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {item.label}
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-[#737686] uppercase tracking-wider px-2">Collaborators</span>
                    <div className="flex -space-x-1.5 p-2">
                      {['JD', 'AM', 'SL', 'RK'].map((user, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-white bg-indigo-500 text-[8px] font-bold text-white flex items-center justify-center">
                          {user}
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>

                {/* Main Content Area Mock */}
                <main className="flex-1 p-6 space-y-6 overflow-hidden">
                  
                  {/* Title Bar */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-base font-bold text-[#141b2b] font-['Plus_Jakarta_Sans']">CRM Analytics</h4>
                      <p className="text-[10px] text-[#737686]">Project: Website Redesign Phase 2</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      ✓ Up-to-date
                    </span>
                  </div>

                  {/* Grid widgets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Recharts Bar Chart (Funnel representation) */}
                    <div className="bg-white border border-[#E7EAF3] rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#141b2b] font-['Plus_Jakarta_Sans']">Conversion Funnel</span>
                        <span className="text-[10px] text-indigo-600 font-bold">84%</span>
                      </div>
                      <div className="h-[90px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                            <XAxis dataKey="name" fontSize={8} stroke="#737686" tickLine={false} axisLine={false} />
                            <YAxis fontSize={8} stroke="#737686" tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#004ac6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Team Activity and Progress */}
                    <div className="bg-white border border-[#E7EAF3] rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#141b2b] font-['Plus_Jakarta_Sans']">Project Milestones</span>
                        <p className="text-[9px] text-[#737686] mt-0.5">Delivery timeline: 20 days left</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span className="text-[#434655]">Website Design</span>
                          <span className="text-[#004ac6]">100%</span>
                        </div>
                        <div className="w-full bg-[#E7EAF3] h-2 rounded-full overflow-hidden">
                          <div className="bg-[#004ac6] h-full w-full" />
                        </div>
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span className="text-[#434655]">API Dev</span>
                          <span className="text-amber-500">65%</span>
                        </div>
                        <div className="w-full bg-[#E7EAF3] h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-[65%]" />
                        </div>
                      </div>
                    </div>

                    {/* Approval Queue & Notification snippet */}
                    <div className="bg-[#fafbff] border border-[#E7EAF3] rounded-2xl p-4 shadow-sm sm:col-span-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#141b2b]">Pending Approval: Invoice #INV-1092</p>
                          <p className="text-[9px] text-[#737686]">Amount: $12,400 due to Altamash</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-white border border-[#E7EAF3] text-[#434655] px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-gray-50">Reject</button>
                        <button className="bg-[#004ac6] text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-[#003ea8]">Approve</button>
                      </div>
                    </div>

                  </div>

                </main>
              </div>

            </div>
          </motion.div>

          {/* Right: Floating Information Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#004ac6] bg-[#004ac6]/10 font-['Plus_Jakarta_Sans']">
                <Sparkles className="w-3.5 h-3.5" /> AI Autopilot
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight text-[#141b2b] font-['Plus_Jakarta_Sans'] leading-[1.15]">
                AI that works while you work.
              </h2>
              <p className="text-[#434655] leading-relaxed">
                Seamless intelligence integrated right inside your CRM stack. Quotiq performs behind-the-scenes checks, triggers auto-billing cycles, and syncs task lists automatically.
              </p>
            </div>

            {/* Event Stack Cards */}
            <div className="space-y-4">
              {[
                { title: "Auto Reminder", desc: "Follow up with Acme Corp", meta: "Tomorrow 9:00 AM", status: "Scheduled", icon: Calendar, bg: "bg-indigo-50", text: "text-indigo-600" },
                { title: "Proposal Ready", desc: "Waiting for Approval from Altamash", meta: "Contract generated", status: "Action Required", icon: FileText, bg: "bg-amber-50", text: "text-amber-600" },
                { title: "Invoice Paid", desc: "₹1,85,000 received successfully", meta: "Acme Web Portal", status: "Completed", icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
                { title: "Project Started", desc: "Website Redesign & deploy", meta: "Assigned: Design & Dev", status: "Active", icon: Layers, bg: "bg-blue-50", text: "text-blue-600" }
              ].map((card, key) => {
                const CardIcon = card.icon;
                return (
                  <motion.div 
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    className="flex gap-4 p-4 bg-white/70 border border-[#E7EAF3] rounded-2xl shadow-sm backdrop-blur-md cursor-pointer hover:border-[#004ac6]/30 transition-all duration-300"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", card.bg, card.text, "border-current/10")}>
                      <CardIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-[#141b2b]">{card.title}</span>
                        <span className="text-[9px] text-[#737686] font-medium">{card.meta}</span>
                      </div>
                      <p className="text-xs text-[#737686] mt-0.5">{card.desc}</p>
                      <span className={cn("inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-2 border border-current/10", card.bg, card.text)}>
                        {card.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </motion.div>
          
        </section>

      </div>
    </div>
  );
}
