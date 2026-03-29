import { useState, useEffect } from 'react';
import { Search, TrendingUp, DollarSign, ShoppingCart, BookOpen } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { supabase } from '../../supabase';

export interface Book {
  id: string;
  name: string;
  author: string;
  price: number;
  total_stock: number;
  stock_remaining: number;
}

export default function SalesPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInventoryForSales();
  }, []);

  async function fetchInventoryForSales() {
    const { data, error } = await supabase.from('books').select('*');
    if (error) {
      console.error("Error fetching inventory for sales:", error);
    } else {
      setBooks(data || []);
    }
  }

  // 1. The Realistic Formulas
  const salesData = books.map(book => {
    const itemsSold = Math.max(0, book.total_stock - book.stock_remaining);
    
    // Total money coming in
    const revenue = itemsSold * (book.price || 0);
    
    // Deductions based on your real-world percentages
    const authorCut = revenue * 0.15; // 15% to Author
    const materialCost = revenue * 0.50; // 50% for Materials
    const otherCosts = revenue * 0.05; // 5% for Others
    
    // What you actually keep!
    const totalDeductions = authorCut + materialCost + otherCosts;
    const profit = revenue - totalDeductions; 

    return {
      ...book,
      itemsSold,
      revenue,
      authorCut,
      profit
    };
  }).filter(item => item.itemsSold > 0); 

  const filteredSales = salesData.filter(sale =>
    sale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = salesData.reduce((sum, item) => sum + item.profit, 0);
  const totalBooksSold = salesData.reduce((sum, item) => sum + item.itemsSold, 0);
  const averageProfit = salesData.length > 0 ? totalProfit / salesData.length : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white px-5 pt-6 pb-4 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-bold text-2xl text-gray-900">
            Sales Reports
          </h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sold books..."
            className="w-full h-12 pl-11 pr-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#571977] text-sm border-none"
          />
        </div>
      </header>

      {/* Performance Cards */}
      <div className="px-5 py-4 bg-white mb-2 shadow-sm">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gradient-to-br from-[#571977] to-[#6a1e8a] rounded-lg p-4 shadow-md">
            <DollarSign className="w-6 h-6 text-white mb-1" />
            <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-purple-200">Gross Revenue</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 shadow-md">
            <TrendingUp className="w-6 h-6 text-white mb-1" />
            <p className="text-2xl font-bold text-white">${totalProfit.toFixed(2)}</p>
            <p className="text-xs text-green-100">Net Profit (30%)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 shadow-md">
            <ShoppingCart className="w-6 h-6 text-white mb-1" />
            <p className="text-2xl font-bold text-white">{totalBooksSold}</p>
            <p className="text-xs text-blue-100">Total Books Sold</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 shadow-md">
            <TrendingUp className="w-6 h-6 text-white mb-1" />
            <p className="text-2xl font-bold text-white">${averageProfit.toFixed(2)}</p>
            <p className="text-xs text-yellow-100">Avg Profit per Title</p>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="px-5 space-y-3 pt-4">
        {filteredSales.map((sale) => (
          <SaleCard
            key={sale.id}
            sale={sale}
          />
        ))}
        
        {filteredSales.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-lg font-semibold text-gray-700">No sales yet!</p>
            <p className="text-sm mt-1">Once you sell books in your inventory,<br/>they will appear here automatically.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// 2. Updated Card to show the Author Royalty cut
function SaleCard({ sale }: { sale: any }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-[#571977] px-4 py-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-[15px] text-white">{sale.name}</h3>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-purple-200">by {sale.author}</p>
          {/* Now showing exactly what the author earned! */}
          <p className="text-xs font-bold text-yellow-300">Author Royalty: ${Number(sale.authorCut).toFixed(2)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Sales Stats - Three boxes */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="bg-gray-100 rounded-lg h-[43px] flex items-center justify-center mb-1 shadow-sm">
              <p className="text-sm font-bold text-gray-800">{sale.itemsSold}</p>
            </div>
            <p className="text-xs text-center text-gray-600 font-medium">Qty Sold</p>
          </div>
          <div>
            <div className="bg-[#caabd5] rounded-lg h-[43px] flex items-center justify-center mb-1 shadow-sm">
              <p className="text-sm font-bold text-[#571977]">${Number(sale.revenue).toFixed(2)}</p>
            </div>
            <p className="text-xs text-center text-gray-600 font-medium">Revenue</p>
          </div>
          <div>
            <div className="bg-green-100 rounded-lg h-[43px] flex items-center justify-center mb-1 shadow-sm">
              <p className="text-sm font-bold text-green-700">${Number(sale.profit).toFixed(2)}</p>
            </div>
            <p className="text-xs text-center text-gray-600 font-medium">Net Profit</p>
          </div>
        </div>
      </div>
    </div>
  );
}