import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { AuthForm, AuthBranding } from '../components/features/auth/AuthComponents';
import { useAuth } from '../context/AuthContext';
import { getGoogleAuthUrl } from '../lib/api';
import { useState } from 'react';

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginAsGuest } = useAuth();
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGuestContinue = async () => {
    try {
      setErrorMessage(null);
      setIsGuestLoading(true);
      await loginAsGuest();
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create guest session.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  const handleGoogleContinue = () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.assign(getGoogleAuthUrl(redirectUri));
  };

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
          <AuthForm
            onContinueAsGuest={handleGuestContinue}
            onContinueWithGoogle={handleGoogleContinue}
            isGuestLoading={isGuestLoading}
            isGoogleLoading={isGoogleLoading}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </div>
  );
}
