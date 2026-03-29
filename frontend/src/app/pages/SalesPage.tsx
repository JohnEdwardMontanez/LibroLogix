import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { supabase } from '../../supabase';

// Use the exact same interface from your Inventory
export interface Book {
  id: number; // BigInt in Supabase usually comes back as a number
  name: string;
  author: string;
  price: number;
  publish_date: string;
  status: string;
  stock_remaining: number;
  total_stock: number;
  cost_price: number;
}

interface CartItem {
  book: Book;
  quantity: number;
}

export default function SalesPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch books when the page loads
  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('status', 'Active'); // Only show active books on the sales page!
      
    if (error) {
      console.error("Error fetching books:", error);
    } else {
      setBooks(data || []);
    }
  }

  // Filter books based on search
  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cart Functions
  const addToCart = (book: Book) => {
    if (book.stock_remaining <= 0) {
      alert("This book is out of stock!");
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.book.id === book.id);
      
      if (existingItem) {
        // Don't let them add more than what's in stock
        if (existingItem.quantity >= book.stock_remaining) {
          alert(`Only ${book.stock_remaining} copies available in stock.`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { book, quantity: 1 }];
    });
  };

  const updateQuantity = (bookId: number, delta: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.book.id === bookId) {
        const newQuantity = item.quantity + delta;
        // Keep quantity between 1 and the max stock available
        if (newQuantity > 0 && newQuantity <= item.book.stock_remaining) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (bookId: number) => {
    setCart(prevCart => prevCart.filter(item => item.book.id !== bookId));
  };

  // Calculate Totals
  const totalAmount = cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);

  // THE MAGIC HAPPENS HERE: Processing the Sale
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      // Loop through every item in the cart to process them
      for (const item of cart) {
        const newStock = item.book.stock_remaining - item.quantity;

        // 1. Deduct the stock from the books table
        const { error: updateError } = await supabase
          .from('books')
          .update({ stock_remaining: newStock })
          .eq('id', item.book.id);

        if (updateError) {
          console.error(`Error updating stock for ${item.book.name}:`, updateError);
          continue; // If update fails, skip logging and move to the next item
        }

        // 2. Write the receipt to the transactions ledger!
        const { error: logError } = await supabase
          .from('transactions')
          .insert([{
            book_id: item.book.id,
            book_name: item.book.name,
            action_type: 'SALE',
            quantity_changed: -item.quantity, // Negative because stock is leaving
            total_amount: item.book.price * item.quantity // Money made
          }]);

        if (logError) {
          console.error(`Error logging transaction for ${item.book.name}:`, logError);
        }
      }

      // 3. Clear the cart and refresh the inventory
      alert("Sale completed successfully! 🎉");
      setCart([]);
      await fetchBooks();

    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Something went wrong during checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 flex flex-col md:flex-row">
      
      {/* LEFT SIDE: Inventory Selection */}
      <div className="flex-1 px-5 pt-6 flex flex-col h-full">
        {/* Header & Search */}
        <div className="mb-6 sticky top-0 bg-gray-50 z-10 pb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Point of Sale</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books to sell..."
              className="w-full h-12 pl-11 pr-4 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#571977] text-sm border-none"
            />
          </div>
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 overflow-y-auto">
          {filteredBooks.map((book) => (
            <div 
              key={book.id} 
              onClick={() => addToCart(book)}
              className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-transform active:scale-95 hover:shadow-lg border-2 ${book.stock_remaining <= 0 ? 'opacity-60 border-gray-200' : 'border-transparent hover:border-[#caabd5]'}`}
            >
              <h3 className="font-bold text-gray-900 line-clamp-1">{book.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{book.author}</p>
              
              <div className="flex justify-between items-end mt-4">
                <p className="text-lg font-bold text-[#571977]">${Number(book.price).toFixed(2)}</p>
                <div className={`text-xs font-bold px-2 py-1 rounded-md ${book.stock_remaining > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {book.stock_remaining > 0 ? `Stock: ${book.stock_remaining}` : 'Out of Stock'}
                </div>
              </div>
            </div>
          ))}
          
          {filteredBooks.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl">
              <p className="text-lg">No active books found</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Current Cart */}
      <div className="w-full md:w-96 bg-white shadow-xl md:shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] flex flex-col sticky top-0 md:h-screen">
        <div className="p-5 bg-[#571977] text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Current Sale
          </h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.book.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 pr-2">{item.book.name}</h4>
                  <button onClick={() => removeFromCart(item.book.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="font-bold text-[#571977]">${(item.book.price * item.quantity).toFixed(2)}</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.book.id, -1)}
                      className="w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.book.id, 1)}
                      className="w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary */}
        <div className="p-5 bg-white border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-semibold">Total</span>
            <span className="text-2xl font-bold text-[#571977]">${totalAmount.toFixed(2)}</span>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className={`w-full h-14 rounded-xl font-bold text-lg text-white transition-all shadow-md flex justify-center items-center ${
              cart.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-[#571977] hover:bg-[#6a1e8a] active:scale-[0.98]'
            }`}
          >
            {isProcessing ? 'PROCESSING...' : 'CHECKOUT'}
          </button>
        </div>
        
        {/* Spacer for bottom nav on mobile */}
        <div className="h-20 md:hidden"></div>
      </div>

      <BottomNav />
    </div>
  );
}