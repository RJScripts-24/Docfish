import { motion } from 'motion/react';
import { Lock, CheckCircle2, Fish } from 'lucide-react';
import { Link } from 'react-router';

interface AuthFormProps {
  onContinueWithGoogle: () => void;
  onContinueAsGuest: () => void;
  isGoogleLoading?: boolean;
  isGuestLoading?: boolean;
  errorMessage?: string | null;
}

export function AuthForm({
  onContinueWithGoogle,
  onContinueAsGuest,
  isGoogleLoading = false,
  isGuestLoading = false,
  errorMessage,
}: AuthFormProps) {
  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Start using Docfish
        </h1>
        <p className="text-gray-600">
          Sign in or continue as a guest to start automating your document workflows.
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10"
      >
        {/* Social Login */}
        <button
          onClick={onContinueWithGoogle}
          disabled={isGoogleLoading || isGuestLoading}
          className="w-full py-3.5 bg-white border-2 border-black rounded-[6px] hover:bg-gray-50 transition-all flex items-center justify-center gap-3 font-bold text-gray-700 shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
        </button>

        {/* Continue as Guest */}
        <button
          onClick={onContinueAsGuest}
          disabled={isGoogleLoading || isGuestLoading}
          className="df-btn-secondary w-full py-3.5 text-base shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGuestLoading ? 'Creating guest workspace...' : 'Continue as Guest'}
        </button>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-500">
          <Lock className="w-4 h-4" />
          <span>No credit card required to start</span>
        </div>
      </motion.div>
    </div>
  );
}

export function AuthBranding() {
  return (
    <div className="relative flex flex-col justify-center p-12 text-white">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-12">
        <Fish className="w-8 h-8 text-white" />
        <span className="text-2xl font-bold">Docfish</span>
      </Link>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-bold mb-4 leading-tight">
          Turn messy documents into structured data.
        </h2>
        <p className="text-lg text-white/80 mb-12 max-w-md">
          Docfish uses AI to extract, validate, and organize invoice data — saving hours of manual work.
        </p>

        {/* Feature Highlights */}
        <div className="space-y-4">
          {[
            'AI Extraction',
            'Validation Engine',
            'Structured Output',
          ].map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="font-medium">{feature}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 right-20 bg-white/10 backdrop-blur-sm p-4 rounded-2xl"
        animate={{ y: [0, -15, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-xs font-mono text-white/90">invoice_number</div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 right-32 bg-white/10 backdrop-blur-sm p-4 rounded-2xl"
        animate={{ y: [0, 15, 0], rotate: [2, -2, 2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-xs font-mono text-white/90">{"{ JSON }"}</div>
      </motion.div>
    </div>
  );
}
