import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import imgRectangle39 from "../../assets/logo.png";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (username === 'admin123' && password === '123456789') {
      setError('');
      // Using window.location.replace is a "forceful" redirect 
      // It clears the cache and fixes the "Skippable" history error
      window.location.replace('/inventory');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo Section */}
      <div className="w-full max-w-[355px] mb-8">
        <div className="bg-white h-[109px] relative shadow-lg rounded-lg overflow-hidden">
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

      {/* Login Form */}
      <div className="bg-white w-full max-w-[355px] shadow-lg rounded-lg p-6">
        <form onSubmit={handleLogin} className="flex flex-col gap-10">
          <div className="text-center">
            <h1 className="font-bold text-2xl text-black">
              Admin Page
            </h1>
            {error && (
              <p className="text-red-500 text-sm mt-2 font-semibold">{error}</p>
            )}
          </div>
          
          {/* Username */}
          <div className="flex flex-col gap-1 -mt-4">
            <label 
              htmlFor="username"
              className="font-semibold text-[#571977] text-xl"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username" // Fixes the first console error
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#caabd5] h-[51px] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
              placeholder="Enter username"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label 
              htmlFor="password"
              className="font-semibold text-[#571977] text-xl"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password" // Fixes the first console error
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#caabd5] h-[51px] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
              placeholder="Enter password"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="bg-[#caabd5] h-[51px] rounded-md shadow-md font-semibold text-2xl text-white hover:bg-[#b89ac5] transition-colors active:scale-[0.98]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}