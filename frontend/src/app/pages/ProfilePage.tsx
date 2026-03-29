import { useState } from 'react';
import { Menu, User, Bell, Settings, LogOut, ChevronRight, Mail, Phone, MapPin } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useNavigate } from 'react-router';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      navigate('/');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white px-5 pt-6 pb-4 shadow-sm sticky top-0 z-40">
        <h1 className="font-bold text-2xl text-gray-900 text-center">
          System Settings
        </h1>
      </header>

      {/* Statistics */}
      <div className="px-5 pb-4">
        <h3 className="font-bold text-base text-gray-900 mb-3 px-2">Quick Stats</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-3xl font-bold text-[#571977]">156</p>
            <p className="text-sm text-gray-600 mt-1">Books Managed</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-3xl font-bold text-green-600">$12,450</p>
            <p className="text-sm text-gray-600 mt-1">Monthly Sales</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-3xl font-bold text-blue-600">89</p>
            <p className="text-sm text-gray-600 mt-1">Sales Today</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-3xl font-bold text-yellow-600">23</p>
            <p className="text-sm text-gray-600 mt-1">Low Stock Alert</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="px-5 pb-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-bold text-base text-gray-900 mb-2">About LibroLogix</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Version 1.0.0 - Professional bookstore inventory management system designed for modern bookstore managers.
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-5 pb-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white font-bold py-3.5 rounded-lg hover:bg-red-600 transition-colors active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
        >
          <LogOut className="w-5 h-5" />
          LOGOUT
        </button>
      </div>

      <BottomNav />
    </div>
  );
}