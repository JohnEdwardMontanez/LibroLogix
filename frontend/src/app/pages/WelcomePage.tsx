import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import imgRectangle39 from "../../assets/logo.png";
import { BookOpen } from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-gradient-to-br from-[#571977] via-[#6a1e8a] to-[#571977] min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Logo Container */}
      <div className="w-full max-w-[320px] mb-8 relative z-10 animate-fadeIn">
        <div className="bg-white h-[140px] relative shadow-2xl rounded-2xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 overflow-hidden">
              <img 
                alt="LibroLogix Logo" 
                className="absolute h-[161.13%] left-[2.3%] max-w-none top-[-25.21%] w-full object-cover" 
                src={imgRectangle39} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Name */}
      <div className="text-center mb-8 relative z-10 animate-fadeIn delay-300">
        <h1 className="font-bold text-4xl text-white mb-2 tracking-wide">
          LibroLogix
        </h1>
        <p className="text-lg text-white/90 font-light">
          Bookstore Inventory Management
        </p>
      </div>

      {/* Icon */}
      <div className="mb-12 animate-bounce-slow relative z-10">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Loading indicator */}
      <div className="relative z-10 animate-fadeIn delay-500">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center px-6 z-10">
        <p className="text-white/70 text-sm">
          Professional Stock Management System
        </p>
        <p className="text-white/50 text-xs mt-2">
          Version 1.0.0 • © 2025
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-700 {
          animation-delay: 700ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
