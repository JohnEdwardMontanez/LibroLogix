import { useState, useEffect } from 'react';
import { Menu, Search, AlertTriangle, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { supabase } from '../../supabase'; // Adjust path if needed

// FIXED: Interface now matches Supabase database columns (snake_case)
export interface Book {
  id: string;
  name: string;
  author: string;
  price: number;
  stock_remaining: number;
  total_stock: number;
}

export default function StockPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    const { data, error } = await supabase.from('books').select('*');
    if (error) {
      console.error("Error fetching books:", error);
    } else {
      setBooks(data || []);
    }
  }

  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // FIXED: Calculations now use stock_remaining and total_stock
  const lowStockBooks = books.filter(b => (Number(b.stock_remaining) / Number(b.total_stock)) <= 0.3);
  const criticalStockBooks = books.filter(b => (Number(b.stock_remaining) / Number(b.total_stock)) <= 0.1);
  const totalStockValue = books.reduce((sum, book) => sum + (Number(book.stock_remaining) * Number(book.price)), 0);

  const handleRestock = (book: Book) => {
    setSelectedBook(book);
    setShowRestockModal(true);
  };

  const saveRestock = async (bookId: string, newStock: number, newTotal: number) => {
    // FIXED: Supabase update object uses snake_case
    const { error } = await supabase
      .from('books')
      .update({ stock_remaining: newStock, total_stock: newTotal })
      .eq('id', bookId);

    if (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock in database.");
    } else {
      setBooks(books.map(book =>
        book.id === bookId
          ? { ...book, stock_remaining: newStock, total_stock: newTotal }
          : book
      ));
      setShowRestockModal(false);
      setSelectedBook(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <header className="bg-[#caabd5] h-16 flex items-center justify-between px-4 sticky top-0 z-40">
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Menu className="w-7 h-7 text-black" />
        </button>
        <h1 className="font-bold text-2xl text-white">
          STOCK MANAGEMENT
        </h1>
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Search className="w-6 h-6 text-black" />
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-5 pt-4 pb-3 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="w-full h-12 pl-11 pr-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#571977] text-sm"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-5 py-4 bg-white mb-2">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 shadow-md">
            <AlertTriangle className="w-5 h-5 text-white mb-1" />
            <p className="text-2xl font-bold text-white">{criticalStockBooks.length}</p>
            <p className="text-xs text-red-100">Critical</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 shadow-md">
            <TrendingDown className="w-5 h-5 text-white mb-1" />
            <p className="text-2xl font-bold text-white">{lowStockBooks.length}</p>
            <p className="text-xs text-yellow-100">Low Stock</p>
          </div>
          
          <div className="bg-gradient-to-br from-[#571977] to-[#6a1e8a] rounded-lg p-3 shadow-md">
            <Package className="w-5 h-5 text-white mb-1" />
            <p className="text-2xl font-bold text-white">{books.length}</p>
            <p className="text-xs text-purple-200">Total Books</p>
          </div>
        </div>

        <div className="mt-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-100 mb-1">Total Stock Value</p>
              <p className="text-2xl font-bold text-white">₱{totalStockValue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="px-5 space-y-3">
        {filteredBooks.map((book) => (
          <StockCard
            key={book.id}
            book={book}
            onRestock={handleRestock}
          />
        ))}
        
        {filteredBooks.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            <p className="text-lg">No books found</p>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      {showRestockModal && selectedBook && (
        <RestockModal
          book={selectedBook}
          onClose={() => {
            setShowRestockModal(false);
            setSelectedBook(null);
          }}
          onSave={saveRestock}
        />
      )}

      <BottomNav />
    </div>
  );
}

function StockCard({ book, onRestock }: { book: Book; onRestock: (book: Book) => void }) {
  // FIXED: Variables now read correctly from Supabase data
  const stockRemaining = Number(book.stock_remaining || 0);
  const totalStock = Number(book.total_stock || 0);
  const price = Number(book.price || 0);
  
  const stockPercentage = totalStock > 0 ? (stockRemaining / totalStock) * 100 : 0;
  
  const getStockStatus = () => {
    if (stockPercentage <= 10) return { level: 'critical', textColor: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-300' };
    if (stockPercentage <= 30) return { level: 'low', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' };
    return { level: 'normal', textColor: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-300' };
  };

  const status = getStockStatus();

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${status.borderColor}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-base text-gray-900 mb-1">{book.name}</h3>
            <p className="text-sm text-gray-600">{book.author}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bgColor} ${status.textColor} border ${status.borderColor}`}>
            {status.level.toUpperCase()}
          </span>
        </div>

        {/* Stock Details - Progress Bar Removed! */}
        <div className="grid grid-cols-2 gap-3 mb-3 mt-2">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Remaining</p>
            {/* The text color of the Remaining stock now dynamically changes! */}
            <p className={`text-xl font-black ${status.textColor}`}>{stockRemaining}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Total Stock</p>
            <p className="text-lg font-bold text-gray-900">{totalStock}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Price</p>
            <p className="text-base font-bold text-[#571977]">₱{price.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Stock Value</p>
            <p className="text-base font-bold text-green-600">₱{(stockRemaining * price).toFixed(2)}</p>
          </div>
        </div>

        <button
          onClick={() => onRestock(book)}
          className="w-full bg-[#571977] text-white font-bold py-2.5 rounded-lg hover:bg-[#6a1e8a] transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          Change Stock Value
        </button>
      </div>
    </div>
  );
}

function RestockModal({ 
  book, 
  onClose, 
  onSave 
}: { 
  book: Book; 
  onClose: () => void;
  onSave: (bookId: string, newStock: number, newTotal: number) => void;
}) {
  const [restockAmount, setRestockAmount] = useState(0);
  // FIXED: Variable names read correctly
  const [newTotal, setNewTotal] = useState(Number(book.total_stock));
  
  const currentStock = Number(book.stock_remaining);
  const newStockLevel = currentStock + restockAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(book.id, newStockLevel, newTotal);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="bg-[#571977] px-6 py-4 rounded-t-lg">
          <h2 className="font-bold text-xl text-white text-center">
            RESTOCK BOOK
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-base text-gray-900 mb-1">{book.name}</h3>
            <p className="text-sm text-gray-600">{book.author}</p>
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-base block mb-2">
              Current Stock: <span className="text-gray-900">{currentStock}</span>
            </label>
            <label className="font-semibold text-[#571977] text-base block mb-1">
              Add Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={restockAmount}
              onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
              className="w-full h-12 bg-[#caabd5] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
              placeholder="Enter quantity to add"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-base block mb-1">
              New Total Stock Capacity
            </label>
            <input
              type="number"
              min={newStockLevel}
              value={newTotal}
              onChange={(e) => setNewTotal(parseInt(e.target.value) || Number(book.total_stock))}
              className="w-full h-12 bg-[#caabd5] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
              placeholder="Enter new total capacity"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">New Stock Level:</span> {newStockLevel}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">New Total Capacity:</span> {newTotal}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#571977] h-12 rounded-md shadow-md font-bold text-lg text-white hover:bg-[#6a1e8a] transition-colors active:scale-[0.98]"
            >
              CONFIRM
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border-2 border-gray-300 h-12 rounded-md shadow-md font-bold text-lg text-black hover:bg-gray-50 transition-colors active:scale-[0.98]"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}