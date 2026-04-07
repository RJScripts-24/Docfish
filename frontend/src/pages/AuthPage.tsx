import { useState } from 'react';
import { motion } from 'motion/react';
import { AuthForm, AuthBranding } from '../components/features/auth/AuthComponents';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative overflow-hidden"
        style={{ backgroundColor: 'var(--df-navy)' }}
      >
        {/* Background Decorative Elements */}
        <div className="df-geo-shape circle-1" />
        <div className="df-geo-shape diamond-1" />
        
        <AuthBranding />
      </motion.div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 min-h-screen bg-[#F9FAFB]">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}