import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useNavigate } from 'react-router';
import { supabase } from '../../supabase';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // State to hold our calculated dashboard metrics
  const [stats, setStats] = useState({
    booksManaged: 0,
    monthlySales: 0,
    salesToday: 0,
    lowStock: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    setIsLoading(true);

    try {
      // 1. Fetch all books and transactions simultaneously
      const [booksResponse, txResponse] = await Promise.all([
        supabase.from('books').select('*'),
        supabase.from('transactions').select('*')
      ]);

      if (booksResponse.error) throw booksResponse.error;
      if (txResponse.error) throw txResponse.error;

      const books = booksResponse.data || [];
      const transactions = txResponse.data || [];

      // 2. Calculate Dates for filtering
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // 3. Process Book Stats
      const totalBooks = books.length;
      // Let's define "Low Stock" as 5 or fewer copies remaining
      const lowStockCount = books.filter(book => book.stock_remaining <= 5).length;

      // 4. Process Transaction Stats
      let revenueThisMonth = 0;
      let itemsSoldToday = 0;

      transactions.forEach(tx => {
        // Only look at SALE actions
        if (tx.action_type === 'SALE') {
          const txDate = new Date(tx.created_at);

          // If the transaction happened this month, add to Monthly Sales revenue
          if (txDate >= startOfMonth) {
            revenueThisMonth += Number(tx.total_amount || 0);
          }

          // If the transaction happened today, add to Sales Today count
          if (txDate >= startOfDay) {
            itemsSoldToday += Math.abs(tx.quantity_changed);
          }
        }
      });

      // 5. Update the state with our real numbers!
      setStats({
        booksManaged: totalBooks,
        monthlySales: revenueThisMonth,
        salesToday: itemsSoldToday,
        lowStock: lowStockCount
      });

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      navigate('/');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white px-5 pt-8 pb-6 shadow-sm sticky top-0 z-40">
        <h1 className="font-bold text-2xl text-gray-900">
          System Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Real-time store overview</p>
      </header>

      {/* Statistics */}
      <div className="px-5 pt-6 pb-4">
        <h3 className="font-bold text-base text-gray-900 mb-3 px-2">Quick Stats</h3>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 animate-pulse">
            Loading your dashboard...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-3xl font-black text-[#571977]">{stats.booksManaged}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase mt-1">Books Managed</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-3xl font-black text-green-600">${stats.monthlySales.toFixed(2)}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase mt-1">Monthly Sales</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-3xl font-black text-blue-600">{stats.salesToday}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase mt-1">Books Sold Today</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-3xl font-black text-yellow-600">{stats.lowStock}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase mt-1">Low Stock Alerts</p>
            </div>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="px-5 pb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-base text-gray-900 mb-2">About LibroLogix</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Version 1.0.0 - Professional bookstore inventory management system designed for modern bookstore managers.
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-5 pb-4 mt-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-xl hover:bg-red-100 transition-colors active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm border border-red-100"
        >
          <LogOut className="w-5 h-5" />
          SECURE LOGOUT
        </button>
      </div>

      <BottomNav />
    </div>
  );
}