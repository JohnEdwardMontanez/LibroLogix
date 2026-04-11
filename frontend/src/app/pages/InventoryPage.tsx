import { useState, useEffect } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { supabase } from '../../supabase'; 

export interface Book {
  id: string;
  name: string;
  author: string;
  price: number;
  publish_date: string;
  status: string;
  stock_remaining: number;
  total_stock: number;
  cost_price: number;
}

export default function InventoryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showRestockModal, setShowRestockModal] = useState(false);

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
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(book.id).includes(searchQuery)
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      const bookToDelete = books.find(b => b.id === id);
      const { error } = await supabase.from('books').delete().eq('id', id);
      
      if (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book.");
      } else {
        setBooks(books.filter(book => book.id !== id));
        
        // LOG TRANSACTION: Book Deleted
        if (bookToDelete) {
          await supabase.from('transactions').insert([{
            book_id: id,
            book_name: bookToDelete.name,
            action_type: 'DELETED',
            quantity_changed: -(bookToDelete.stock_remaining), // Log the lost inventory
            total_amount: 0
          }]);
        }
      }
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setShowAddModal(true);
  };

  const handleDetails = (book: Book) => {
    setSelectedBook(book);
    setShowDetailsModal(true);
  };

  const handleQuickRestock = (book: Book) => {
    setSelectedBook(book);
    setShowRestockModal(true);
  };

  const saveRestock = async (bookId: string, newStock: number, newTotal: number) => {
    const bookToRestock = books.find(b => b.id === bookId);
    const quantityAdded = newStock - (bookToRestock?.stock_remaining || 0);

    const { error: updateError } = await supabase
      .from('books')
      .update({ stock_remaining: newStock, total_stock: newTotal })
      .eq('id', bookId);

    if (updateError) {
      console.error("Error restocking:", updateError);
      alert("Failed to update stock.");
      return;
    }

    // LOG TRANSACTION: Book Restocked
    const { error: logError } = await supabase.from('transactions').insert([{
      book_id: bookId,
      book_name: bookToRestock?.name || 'Unknown',
      action_type: 'RESTOCK',
      quantity_changed: quantityAdded,
      total_amount: 0 
    }]);

    if (logError) console.error("Error logging restock:", logError);

    setBooks(books.map(book =>
      book.id === bookId
        ? { ...book, stock_remaining: newStock, total_stock: newTotal }
        : book
    ));
    
    setShowRestockModal(false);
    setSelectedBook(null);
  };

  const handleSaveBook = async (bookData: Book) => {
    if (editingBook) {
      // Find old book to see if stock changed manually
      const oldBook = books.find(b => b.id === bookData.id);
      const stockDiff = bookData.stock_remaining - (oldBook?.stock_remaining || 0);

      const { error } = await supabase
        .from('books')
        .update(bookData)
        .eq('id', bookData.id);

      if (!error) {
        setBooks(books.map(b => b.id === bookData.id ? bookData : b));
        
        // LOG TRANSACTION: Manual Edit (Only if stock actually changed)
        if (stockDiff !== 0) {
          await supabase.from('transactions').insert([{
            book_id: bookData.id,
            book_name: bookData.name,
            action_type: 'MANUAL_EDIT',
            quantity_changed: stockDiff,
            total_amount: 0
          }]);
        }
      } else {
        console.error("Error updating:", error);
      }
    } else {
      const { id, ...newBookData } = bookData; 
      const { data, error } = await supabase
        .from('books')
        .insert([newBookData])
        .select();

      if (!error && data) {
        const newBook = data[0];
        setBooks([...books, newBook]);

        // LOG TRANSACTION: Initial Stock Added
        await supabase.from('transactions').insert([{
          book_id: newBook.id,
          book_name: newBook.name,
          action_type: 'INITIAL_STOCK',
          quantity_changed: newBook.stock_remaining,
          total_amount: 0
        }]);
      } else {
        console.error("Error adding:", error);
      }
    }
    setShowAddModal(false);
    setEditingBook(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <header className="bg-white px-5 pt-6 pb-4 shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books by name, author or ID..."
              className="w-full h-12 pl-11 pr-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#571977] text-sm border-none"
            />
          </div>
          <button
            onClick={() => {
              setEditingBook(null);
              setShowAddModal(true);
            }}
            className="w-12 h-12 bg-[#571977] rounded-xl flex items-center justify-center shadow-md hover:bg-[#6a1e8a] transition-colors active:scale-95"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-4">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDetails={handleDetails}
            onQuickRestock={handleQuickRestock}
          />
        ))}
        
        {filteredBooks.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
            <p className="text-lg">No books found</p>
            <p className="text-sm mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddBookModal
          book={editingBook}
          onClose={() => {
            setShowAddModal(false);
            setEditingBook(null);
          }}
          onSave={handleSaveBook}
        />
      )}

      {showDetailsModal && selectedBook && (
        <DetailsModal
          book={selectedBook}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBook(null);
          }}
        />
      )}

      {showRestockModal && selectedBook && (
        <QuickRestockModal
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

function BookCard({ book, onEdit, onDelete, onDetails, onQuickRestock }: { 
  book: Book; 
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onDetails: (book: Book) => void;
  onQuickRestock: (book: Book) => void;
}) {
  const stockPercentage = book.total_stock > 0 ? (book.stock_remaining / book.total_stock) * 100 : 0;
  
  const getStockStatus = () => {
    if (stockPercentage <= 10) return { color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' };
    if (stockPercentage <= 30) return { color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' };
    return { color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' };
  };

  const status = getStockStatus();

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">{book.name}</h3>
          <p className="italic text-sm text-gray-600 mb-2">{book.author}</p>
          {/* Changed book.price to book.cost_price below to display the updated field */}
          <p className="text-2xl font-bold text-[#571977]">₱{Number(book.cost_price).toFixed(2)}</p>
        </div>
        <button 
          onClick={() => onDelete(book.id)}
          className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-red-50 rounded"
        >
          Delete
        </button>
      </div>

      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          <div className={`flex-1 ${status.bgColor} ${status.textColor} rounded-full px-4 py-2 text-center`}>
            <p className="text-xs font-semibold">In Stock</p>
            <p className="text-sm font-bold">{book.stock_remaining}</p>
          </div>
          <div className="flex-1 bg-gray-100 text-gray-700 rounded-full px-4 py-2 text-center">
            <p className="text-xs font-semibold">Capacity</p>
            <p className="text-sm font-bold">{book.total_stock}</p>
          </div>
        </div>
        
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${status.color} transition-all duration-300`}
            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">{stockPercentage.toFixed(0)}% capacity</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(book)}
          className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition-colors active:scale-95 text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onDetails(book)}
          className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition-colors active:scale-95 text-sm"
        >
          Details
        </button>
        <button
          onClick={() => onQuickRestock(book)}
          className="flex-1 bg-[#571977] text-white font-bold py-2.5 rounded-lg hover:bg-[#6a1e8a] transition-colors active:scale-95 text-sm flex items-center justify-center gap-1"
        >
          <Package className="w-4 h-4" />
          Restock
        </button>
      </div>
    </div>
  );
}

function AddBookModal({ 
  book, 
  onClose, 
  onSave 
}: { 
  book: Book | null; 
  onClose: () => void;
  onSave: (book: Book) => void;
}) {
  const [formData, setFormData] = useState<Partial<Book>>(
    book || {
      name: '',
      author: '',
      price: 0,
      publish_date: '',
      status: 'Active',
      stock_remaining: 0,
      total_stock: 0,
      cost_price: 0,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(formData as Book), 
      price: Number(formData.price) || 0, // Keeps existing price if editing, defaults to 0 if new
      total_stock: Number(formData.total_stock) || 0,
      stock_remaining: Number(formData.stock_remaining) || 0,
      cost_price: Number(formData.cost_price) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-[#571977] px-6 py-4 rounded-t-lg">
          <h2 className="font-bold text-xl text-white text-center">
            {book ? 'EDIT RECORD' : 'ADD NEW RECORD'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Book Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-12 bg-[#caabd5] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
              placeholder="Enter book name"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Author
            </label>
            <input
              type="text"
              value={formData.author || ''}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full h-12 bg-[#caabd5] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
              placeholder="Enter author name"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Cost Price
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.cost_price === 0 && !book ? '' : formData.cost_price}
              onChange={(e) => setFormData({ ...formData, cost_price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              className="w-full h-12 bg-[#caabd5] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Published Date
            </label>
            <input
              type="date"
              value={formData.publish_date || ''}
              onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
              className="w-full h-12 bg-[#caabd5] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
              placeholder="YYYY-MM-DD"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-semibold text-[#571977] text-lg block mb-1">
                Total Capacity
              </label>
              <input
                type="number"
                value={formData.total_stock === 0 && !book ? '' : formData.total_stock}
                onChange={(e) => setFormData({ ...formData, total_stock: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                className="w-full h-12 bg-[#caabd5] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
                placeholder="0"
                required
              />
            </div>

            <div className="flex-1">
              <label className="font-semibold text-[#571977] text-lg block mb-1">
                In Stock
              </label>
              <input
                type="number"
                value={formData.stock_remaining === 0 && !book ? '' : formData.stock_remaining}
                onChange={(e) => setFormData({ ...formData, stock_remaining: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                className="w-full h-12 bg-[#caabd5] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Status
            </label>
            <select
              value={formData.status || 'Active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
              className="w-full h-12 bg-[#caabd5] rounded-md shadow-md px-4 text-black focus:outline-none focus:ring-2 focus:ring-[#571977]"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#571977] h-12 rounded-md shadow-md font-bold text-lg text-white hover:bg-[#6a1e8a] transition-colors active:scale-[0.98]"
            >
              {book ? 'UPDATE' : 'ADD'}
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

function DetailsModal({ book, onClose }: { book: Book; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-[#571977] px-6 py-4 rounded-t-lg">
          <h2 className="font-bold text-xl text-white text-center">
            BOOK DETAILS
          </h2>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Book Name
            </label>
            <p className="w-full h-12 bg-gray-100 rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977] flex items-center">
              {book.name}
            </p>
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Author
            </label>
            <p className="w-full h-12 bg-gray-100 rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977] flex items-center">
              {book.author}
            </p>
          </div>

          {/* Replaced split Selling/Cost price fields with full-width Cost Price */}
          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Cost Price
            </label>
            <p className="w-full h-12 bg-gray-100 rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977] flex items-center">
              ₱{Number(book.cost_price).toFixed(2)}
            </p>
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Published Date
            </label>
            <p className="w-full h-12 bg-gray-100 rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977] flex items-center">
              {book.publish_date}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-semibold text-[#571977] text-lg block mb-1">
                Total Capacity
              </label>
              <p className="w-full h-12 bg-gray-100 rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977] flex items-center">
                {book.total_stock}
              </p>
            </div>

            <div className="flex-1">
              <label className="font-semibold text-[#571977] text-lg block mb-1">
                In Stock
              </label>
              <p className="w-full h-12 bg-gray-100 rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977] flex items-center">
                {book.stock_remaining}
              </p>
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Status
            </label>
            <p className="w-full h-12 bg-gray-100 rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977] flex items-center">
              {book.status}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border-2 border-gray-300 h-12 rounded-md shadow-md font-bold text-lg text-black hover:bg-gray-50 transition-colors active:scale-[0.98]"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickRestockModal({ book, onClose, onSave }: { book: Book; onClose: () => void; onSave: (bookId: string, newStock: number, newTotal: number) => void }) {
  const [newStock, setNewStock] = useState<number | string>(book.stock_remaining);
  const [newTotal, setNewTotal] = useState<number | string>(book.total_stock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(book.id, Number(newStock) || 0, Number(newTotal) || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-[#571977] px-6 py-4 rounded-t-lg">
          <h2 className="font-bold text-xl text-white text-center">
            QUICK RESTOCK
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Book Name
            </label>
            <p className="w-full h-12 bg-gray-100 rounded-md shadow-md px-4 text-black placeholder:text-gray-600 flex items-center">
              {book.name}
            </p>
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Author
            </label>
            <p className="w-full h-12 bg-gray-100 rounded-md shadow-md px-4 text-black placeholder:text-gray-600 flex items-center">
              {book.author}
            </p>
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Total Capacity
            </label>
            <input
              type="number"
              value={newTotal}
              onChange={(e) => setNewTotal(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full h-12 bg-[#caabd5] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-[#571977] text-lg block mb-1">
              Stock Remaining
            </label>
            <input
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full h-12 bg-[#caabd5] rounded-md shadow-md px-4 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#571977]"
              placeholder="0"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#571977] h-12 rounded-md shadow-md font-bold text-lg text-white hover:bg-[#6a1e8a] transition-colors active:scale-[0.98]"
            >
              RESTOCK
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