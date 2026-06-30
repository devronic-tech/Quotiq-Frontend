import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
}

const sizeStyles = {
  sm: { width: '384px', maxWidth: 'calc(100vw - 32px)' },
  md: { width: '480px', maxWidth: 'calc(100vw - 32px)' },
  lg: { width: '512px', maxWidth: 'calc(100vw - 32px)' },
  xl: { width: '672px', maxWidth: 'calc(100vw - 32px)' },
  full: { width: 'calc(100vw - 32px)', height: 'calc(100vh - 32px)', margin: '16px' },
};

export default function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: any) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const modalJSX = (
    <AnimatePresence>
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-sm"
            style={{ zIndex: -1 }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-2xl flex flex-col"
            style={{
              ...sizeStyles[size],
              backgroundColor: '#ffffff', // Clean white
              color: '#0f172a', // Dark slate text
              border: '1px solid #e2e8f0', // Soft gray border Slate 200
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              flexShrink: 0,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              {title ? (
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 cursor-pointer"
                style={{ background: 'transparent', border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#ffffff', color: '#334155' }}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalJSX, document.body);
}
