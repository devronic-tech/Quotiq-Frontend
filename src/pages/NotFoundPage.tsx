import Button from '@/shared/components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden gradient-mesh text-center">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-red-500/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-violet-500/5 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 relative z-10 max-w-md"
      >
        <h1 className="text-8xl font-black text-slate-800 tracking-wider">404</h1>
        <div>
          <h2 className="text-lg font-bold text-slate-200">Page Not Found</h2>
          <p className="text-xs text-slate-500 max-w-[320px] mx-auto leading-relaxed mt-2">
            The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft size={14} />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Home size={14} />}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
