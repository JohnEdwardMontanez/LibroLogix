import { useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown, Package, Trash2, BarChart3, List } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { supabase } from '../../supabase';

// Interfaces
export interface Book {
  id: number;
  name: string;
  author: string;
  price: number;
  publish_date: string;
  status: string;
  stock_remaining: number;
  total_stock: number;
  cost_price: number;
}

export interface Transaction {
  id: string;
  book_id: number;
  book_name: string;
  action_type: string;
  quantity_changed: number;
  total_amount: number;
  created_at: string;
}

export default function SalesPage() {
  const [view, setView] = useState<'report' | 'log'>('report');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    
    // Fetch both tables at the same time
    const [txResponse, booksResponse] = await Promise.all([
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('books').select('*')
    ]);

    if (txResponse.error) console.error("Error fetching transactions:", txResponse.error);
    if (booksResponse.error) console.error("Error fetching books:", booksResponse.error);

    setTransactions(txResponse.data || []);
    setBooks(booksResponse.data || []);
    setIsLoading(false);
  }

  // Helper to format dates nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    }).format(date);
  };

  // Helper for Transaction Log icons and colors
  const getActionStyles = (action: string, quantity: number) => {
    if (action === 'RESTOCK' || action === 'INITIAL_STOCK' || quantity > 0) {
      return { icon: <TrendingUp className="w-5 h-5 text-green-600" />, bgColor: 'bg-green-100', textColor: 'text-green-700', sign: '+' };
    }
    if (action === 'DELETED') {
      return { icon: <Trash2 className="w-5 h-5 text-red-600" />, bgColor: 'bg-red-100', textColor: 'text-red-700', sign: '' };
    }
    return { icon: <TrendingDown className="w-5 h-5 text-orange-600" />, bgColor: 'bg-orange-100', textColor: 'text-orange-700', sign: '' };
  };

  // Generate the Data for the Sales Report Cards
  const reportData = books.map(book => {
    // Find all deductions (sales/manual edits) for this specific book
    const bookTxs = transactions.filter(t => t.book_id === book.id && t.quantity_changed < 0);
    
    // Calculate total quantity sold (making the negative number positive)
    const qtySold = bookTxs.reduce((sum, t) => sum + Math.abs(t.quantity_changed), 0);
    
    // Calculate Financials
    const revenue = qtySold * book.price;
    const cost = qtySold * (book.cost_price || 0); // Failsafe if cost_price is empty
    const royalty = revenue * 0.15; // Assuming 15% royalty. Change this decimal if needed!
    const netProfit = revenue - cost;

    return { ...book, qtySold, revenue, netProfit, royalty };
  }).filter(stat => stat.qtySold > 0); // Only show books that have actually sold items

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header & Tabs */}
      <header className="bg-white px-5 pt-8 pb-4 shadow-sm sticky top-0 z-40">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sales & Tracking</h1>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setView('report')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ₱{
              view === 'report' ? 'bg-white text-[#571977] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Sales Report
          </button>
          <button
            onClick={() => setView('log')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ₱{
              view === 'log' ? 'bg-white text-[#571977] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
            History Log
          </button>
        </div>
      </header>

      <div className="px-5 pt-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg animate-pulse">Loading data...</p>
          </div>
        ) : view === 'report' ? (
          
          /* =========================================
             VIEW 1: SALES REPORT CARDS 
             ========================================= */
          <>
            {reportData.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-semibold text-gray-700">No sales data yet</p>
                <p className="text-sm mt-1">Deduct stock in inventory to see reports.</p>
              </div>
            ) : (
              reportData.map((stat) => (
                <div key={stat.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  {/* Purple Header */}
                  <div className="bg-[#571977] p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-white line-clamp-1">{stat.name}</h3>
                      <p className="text-sm text-[#caabd5]">by {stat.author}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#caabd5] font-semibold">Author Royalty</p>
                      <p className="text-sm font-bold text-yellow-400">₱{stat.royalty.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="p-4 grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg p-3 text-center flex flex-col justify-center border border-gray-100">
                      <p className="text-lg font-bold text-gray-800">{stat.qtySold}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold mt-1">Qty Sold</p>
                    </div>
                    <div className="bg-[#f0e6f2] rounded-lg p-3 text-center flex flex-col justify-center border border-[#e5d4e9]">
                      <p className="text-lg font-bold text-[#571977]">₱{stat.revenue.toFixed(2)}</p>
                      <p className="text-[10px] text-[#7a4892] uppercase font-semibold mt-1">Revenue</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center flex flex-col justify-center border border-green-100">
                      <p className="text-lg font-bold text-green-700">₱{stat.netProfit.toFixed(2)}</p>
                      <p className="text-[10px] text-green-600 uppercase font-semibold mt-1">Net Profit</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (

          /* =========================================
             VIEW 2: TRANSACTION LOG 
             ========================================= */
          <>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-semibold text-gray-700">No logs found</p>
              </div>
            ) : (
              transactions.map((tx) => {
                const styles = getActionStyles(tx.action_type, tx.quantity_changed);
                return (
                  <div key={tx.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ₱{styles.bgColor}`}>
                      {styles.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{tx.book_name}</h3>
                      <p className="text-xs text-gray-500 mb-1">{formatDate(tx.created_at)}</p>
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">
                        {tx.action_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xl font-black ₱{styles.textColor}`}>
                        {styles.sign}{tx.quantity_changed}
                      </p>
                      <p className="text-xs text-gray-400 font-semibold">qty</p>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}