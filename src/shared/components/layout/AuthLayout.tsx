import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden gradient-mesh">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-[100px] pointer-events-none" />

      {/* Auth Card wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glass p-8 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl relative z-10 flex flex-col"
        style={{ width: '450px', maxWidth: '100%' }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-center mb-6">
          <img src="/nobglogo.png" alt="Devronic Logo" className="h-20 object-contain" />
        </div>

        {/* Content */}
        <div className="w-full">{children}</div>
      </motion.div>
    </div>
  );
}
