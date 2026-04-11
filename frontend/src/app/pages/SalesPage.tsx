import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Trash2, BarChart3, List, MinusCircle, Plus } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { supabase } from '../../supabase';

// Interfaces
export interface Book {
  id: number;
  name: string;
  author: string;
  price?: number; 
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

  // --- STATES FOR SLIDER MODAL ---
  const [showSlider, setShowSlider] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [saleQty, setSaleQty] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const [txResponse, booksResponse] = await Promise.all([
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('books').select('*')
    ]);
    setTransactions(txResponse.data || []);
    setBooks(booksResponse.data || []);
    setIsLoading(false);
  }

  // --- HANDLER FOR STOCK DEFLATION ---
  const handleSale = async () => {
    if (!selectedBook) return;

    const newStock = selectedBook.stock_remaining - saleQty;
    const totalSalesPrice = saleQty * (Number(selectedBook.cost_price) || 0);

    // 1. Update the Book table
    const { error: bookError } = await supabase
      .from('books')
      .update({ stock_remaining: newStock })
      .eq('id', selectedBook.id);

    // 2. Add to Transactions table
    const { error: txError } = await supabase
      .from('transactions')
      .insert([{
        book_id: selectedBook.id,
        book_name: selectedBook.name,
        action_type: 'SALE',
        quantity_changed: -saleQty, // Negative for deflation
        total_amount: totalSalesPrice
      }]);

    if (!bookError && !txError) {
      setShowSlider(false);
      setSaleQty(1);
      fetchData(); // Refresh list
    } else {
      console.error("Sale transaction failed", bookError, txError);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    }).format(date);
  };

  const getActionStyles = (action: string, quantity: number) => {
    if (action === 'RESTOCK' || action === 'INITIAL_STOCK' || quantity > 0) {
      return { icon: <TrendingUp className="w-5 h-5 text-green-600" />, bgColor: 'bg-green-100', textColor: 'text-green-700', sign: '+' };
    }
    if (action === 'DELETED') {
      return { icon: <Trash2 className="w-5 h-5 text-red-600" />, bgColor: 'bg-red-100', textColor: 'text-red-700', sign: '' };
    }
    return { icon: <TrendingDown className="w-5 h-5 text-orange-600" />, bgColor: 'bg-orange-100', textColor: 'text-orange-700', sign: '' };
  };

  const reportData = books.map(book => {
    // Only calculate actual sales (ignoring 'DELETED' or manual negative edits)
    const bookTxs = transactions.filter(t => t.book_id === book.id && t.action_type === 'SALE');
    const qtySold = bookTxs.reduce((sum, t) => sum + Math.abs(t.quantity_changed), 0);
    
    // THE NEW MATH
    const revenue = qtySold * (Number(book.cost_price) || 0);
    const materialsCost = revenue * 0.50; // 50% subtracted for materials
    const royalty = revenue * 0.15; // 15% subtracted for the author
    const netProfit = revenue - materialsCost - royalty; // Equivalent company profit
    
    return { ...book, qtySold, revenue, materialsCost, netProfit, royalty };
  }).filter(stat => stat.qtySold > 0);

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <header className="bg-white px-5 pt-8 pb-4 shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Sales & Tracking</h1>
          {/* Floating Action Button for Sale */}
          <button 
            onClick={() => setShowSlider(true)}
            className="bg-[#571977] text-white p-2 rounded-full shadow-lg active:scale-90 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setView('report')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              view === 'report' ? 'bg-white text-[#571977] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Sales Report
          </button>
          <button
            onClick={() => setView('log')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${
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
          <div className="text-center py-12 text-gray-500"><p className="text-lg animate-pulse">Loading...</p></div>
        ) : view === 'report' ? (
          <>
            {reportData.map((stat) => (
              <div key={stat.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="bg-[#571977] p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-white line-clamp-1">{stat.name}</h3>
                    <p className="text-sm text-[#caabd5]">by {stat.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#caabd5] font-semibold">Author Cut</p>
                    <p className="text-sm font-bold text-yellow-400">₱{stat.royalty.toFixed(2)}</p>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-lg p-3 text-center flex flex-col justify-center">
                    <p className="text-lg font-bold text-gray-800">{stat.qtySold}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Qty Sold</p>
                  </div>
                  <div className="bg-[#f0e6f2] rounded-lg p-3 text-center flex flex-col justify-center">
                    <p className="text-lg font-bold text-[#571977]">₱{stat.revenue.toFixed(2)}</p>
                    <p className="text-[10px] text-[#7a4892] uppercase font-semibold leading-tight">Revenue<br/><span className="text-[8px] opacity-75">(-₱{stat.materialsCost.toFixed(2)} Mat.)</span></p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center flex flex-col justify-center">
                    <p className="text-lg font-bold text-green-700">₱{stat.netProfit.toFixed(2)}</p>
                    <p className="text-[10px] text-green-600 uppercase font-semibold">Company Profit</p>
                  </div>
                </div>
              </div>
            ))}
            
            {reportData.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                <p className="text-lg">No sales data yet</p>
              </div>
            )}
          </>
        ) : (
          /* LOG VIEW */
          transactions.map((tx) => {
            const styles = getActionStyles(tx.action_type, tx.quantity_changed);
            return (
              <div key={tx.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.bgColor}`}>{styles.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{tx.book_name}</h3>
                  <p className="text-xs text-gray-500">{formatDate(tx.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${styles.textColor}`}>{styles.sign}{tx.quantity_changed}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

{/* =========================================
    Stock Deflation Slider Modal
    ========================================= */}
{showSlider && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white w-[95%] max-w-md rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] relative">
      
      <div className="flex justify-between items-center sticky top-0 bg-white pb-2">
        <h2 className="text-xl font-bold text-gray-800">Deflate Stock (Sale)</h2>
        <button onClick={() => setShowSlider(false)} className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors">✕</button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-[#571977] uppercase tracking-widest ml-1">Select Product</label>
        <select 
          className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none appearance-none font-medium text-gray-700"
          onChange={(e) => {
            const book = books.find(b => b.id === parseInt(e.target.value));
            setSelectedBook(book || null);
            setSaleQty(1);
          }}
        >
          <option value="">Choose a book...</option>
          {books.map(b => (
            <option key={b.id} value={b.id} disabled={b.stock_remaining <= 0}>
              {b.name} ({b.stock_remaining} left)
            </option>
          ))}
        </select>
      </div>

      {selectedBook && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-end bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Quantity Sold</p>
              <p className="text-4xl font-black text-[#571977]">{saleQty}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₱{(saleQty * (Number(selectedBook.cost_price) || 0)).toFixed(2)}</p>
            </div>
          </div>
          
          <div className="px-2">
            <input 
              type="range"
              min="1"
              max={selectedBook.stock_remaining}
              value={saleQty}
              onChange={(e) => setSaleQty(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#571977]"
              style={{
                background: `linear-gradient(to right, #571977 ${
                  ((saleQty - 1) / (selectedBook.stock_remaining - 1 || 1)) * 100
                }%, #e5e7eb ${
                  ((saleQty - 1) / (selectedBook.stock_remaining - 1 || 1)) * 100
                }%)`
              }}
            />
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">1</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Max: {selectedBook.stock_remaining}</span>
            </div>
          </div>

          <button 
            onClick={handleSale}
            className="w-full bg-[#571977] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-purple-200 active:scale-[0.97] transition-all flex items-center justify-center gap-3"
          >
            <MinusCircle className="w-6 h-6" />
            CONFIRM SALE
          </button>
        </div>
      )}
    </div>
  </div>
)}

      <BottomNav />
    </div>
  );
}