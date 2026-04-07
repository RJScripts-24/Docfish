import { useState } from 'react';
import { motion } from 'motion/react';
import { AuthForm, AuthBranding } from '../components/AuthComponents';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-teal-500 via-green-500 to-emerald-500 relative overflow-hidden"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl" />
        
        <AuthBranding />
      </motion.div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 min-h-screen">
        <div className="w-full max-w-md">
          <AuthForm mode={mode} onToggleMode={toggleMode} />
        </div>
      </div>
    </div>
  );
}