import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import imgRectangle39 from "../../assets/logo.png";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [isLoggingIn, setIsLoggingIn] = useState(false); // New loading state
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggingIn(true); // Start the transition immediately

    // Small timeout (50ms) ensures the UI registers the click before jumping pages
    setTimeout(() => {
      if (username === 'admin123' && password === '123456789') {
        setError('');
        // Use replace: true to clear the login page from history
        navigate('/inventory', { replace: true });
      } else {
        setError('Invalid username or password.');
        setIsLoggingIn(false); // Stop loading if it fails
      }
    }, 50);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[355px] mb-8">
        <div className="bg-white h-[109px] relative shadow-lg rounded-lg overflow-hidden border border-gray-100">
           <img 
              alt="LibroLogix Logo" 
              className="absolute h-full w-full object-contain p-4" 
              src={imgRectangle39} 
            />
        </div>
      </div>

      <div className="bg-white w-full max-w-[355px] shadow-xl rounded-2xl p-6 border border-gray-50">
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-bold text-2xl text-gray-800">Admin Access</h1>
            {error && (
              <p className="text-red-500 text-sm mt-2 font-semibold animate-bounce">{error}</p>
            )}
          </div>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="font-bold text-[#571977] text-sm ml-1">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-100 h-[51px] rounded-xl px-4 text-black focus:outline-none focus:ring-2 focus:ring-[#571977] transition-all"
              placeholder="admin123"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-bold text-[#571977] text-sm ml-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-100 h-[51px] rounded-xl px-4 text-black focus:outline-none focus:ring-2 focus:ring-[#571977] transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className={`h-[55px] rounded-xl font-bold text-xl text-white shadow-lg transition-all active:scale-95 ${
              isLoggingIn ? 'bg-gray-400' : 'bg-[#571977] hover:bg-[#461460]'
            }`}
          >
            {isLoggingIn ? 'Entering...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}