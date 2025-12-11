import { useState, useEffect } from 'react';
import { Download, Send, X, FileText, Search, BookOpen, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * CONFIGURATION & MOCK DATA
 * Toggle USE_MOCK_DATA to false to use the real Node.js backend.
 */
const USE_MOCK_DATA = false;
const API_BASE_URL = 'http://localhost:5000/api';

const MOCK_PAPERS = [
  { _id: '1', title: 'Data Structures Final', course: 'CS101', year: 2023 },
  { _id: '2', title: 'Algorithms Midterm', course: 'CS202', year: 2022 },
  { _id: '3', title: 'Database Systems', course: 'CS305', year: 2023 },
  { _id: '4', title: 'Operating Systems', course: 'CS401', year: 2021 },
  { _id: '5', title: 'Linear Algebra', course: 'MATH201', year: 2023 },
  { _id: '6', title: 'Software Engineering', course: 'SE300', year: 2022 },
];

/**
 * --- SERVICE LAYER (api.js) ---
 * Handles API calls to the backend or returns mock data.
 */
const apiService = {
  fetchPapers: async () => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_PAPERS), 600));
    }
    const response = await fetch(`${API_BASE_URL}/papers`);
    return response.json();
  },

  sendWhatsApp: async (paperId, phoneNumber) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true, message: 'Mock sent successfully!' }), 1500);
      });
    }
    const response = await fetch(`${API_BASE_URL}/papers/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paperId, phoneNumber }),
    });
    return response.json();
  },
  
  getDownloadUrl: (paperId) => {
     if (USE_MOCK_DATA) return '#';
     return `${API_BASE_URL}/papers/download/${paperId}`;
  }
};

/**
 * --- COMPONENT: WhatsAppModal ---
 * client/src/components/WhatsAppModal.jsx
 */
const WhatsAppModal = ({ isOpen, onClose, paper, onSubmit }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await onSubmit(paper._id, phone);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus(null);
        setPhone('');
      }, 2000);
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="bg-green-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Send size={20} /> Send to WhatsApp
          </h3>
          <button onClick={onClose} className="hover:bg-green-700 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Enter your phone number (with country code) to receive <strong>{paper?.title}</strong> via WhatsApp.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="e.g., 254712345678"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || status === 'success'}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all flex justify-center items-center gap-2
                ${status === 'success' ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'}
                ${loading ? 'opacity-75 cursor-wait' : ''}
              `}
            >
              {loading ? (
                <span className="animate-pulse">Sending...</span>
              ) : status === 'success' ? (
                <>Sent <CheckCircle size={18} /></>
              ) : (
                'Send Document'
              )}
            </button>

            {status === 'error' && (
              <p className="text-red-500 text-sm text-center mt-2 flex items-center justify-center gap-1">
                <AlertCircle size={14}/> Failed to send. Try again.
              </p>
            )}
          </form>
        </div>
        <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 text-center">
          Powered by Gakenge
        </div>
      </div>
    </div>
  );
};

/**
 * --- COMPONENT: PaperCard ---
 * client/src/components/PaperCard.jsx
 */
const PaperCard = ({ paper, onOpenWhatsApp }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col h-full group">
      <div className="p-5 flex-grow">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <FileText size={24} />
          </div>
          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {paper.year}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight line-clamp-2">
          {paper.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
          <span className="flex items-center gap-1"><BookOpen size={14} /> {paper.course}</span>
        </div>
      </div>

      <div className="p-4 border-t border-gray-50 grid grid-cols-2 gap-3 bg-gray-50/50 rounded-b-xl">
        <a 
          href={apiService.getDownloadUrl(paper._id)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Download size={16} /> PDF
        </a>
        <button
          onClick={() => onOpenWhatsApp(paper)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Send size={16} /> WhatsApp
        </button>
      </div>
    </div>
  );
};

/**
 * --- MAIN PAGE: HomePage ---
 * client/src/pages/HomePage.jsx
 */
const HomePage = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    try {
      setLoading(true);
      const data = await apiService.fetchPapers();
      setPapers(data);
    } catch (error) {
      console.error("Failed to load papers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = (paper) => {
    setSelectedPaper(paper);
    setIsModalOpen(true);
  };

  const handleWhatsAppSubmit = async (paperId, phoneNumber) => {
    await apiService.sendWhatsApp(paperId, phoneNumber);
  };

  const filteredPapers = papers.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
               <BookOpen size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">MadeFamiliar</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
            <span>Server Status: {USE_MOCK_DATA ? 'Mocking Data' : 'Live'}</span>
          </div>
        </div>
      </header>

      {/* Hero / Search */}
      <div className="bg-indigo-600 text-white py-12 px-4 mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Find Your Past Papers</h2>
          <p className="text-indigo-100 mb-8">Access exam past papers instantly via PDF download or WhatsApp delivery.</p>
          
          <div className="relative max-w-lg mx-auto">
            <input 
              type="text" 
              placeholder="Search by course code or title..." 
              className="w-full py-3 pl-12 pr-4 rounded-full text-gray-800 shadow-lg outline-none focus:ring-4 focus:ring-indigo-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {searchTerm ? 'Search Results' : 'Recent Uploads'}
              </h2>
              <span className="text-sm text-gray-500">{filteredPapers.length} papers found</span>
            </div>

            {filteredPapers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPapers.map(paper => (
                  <PaperCard 
                    key={paper._id} 
                    paper={paper} 
                    onOpenWhatsApp={handleWhatsAppClick} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No papers found matching "{searchTerm}"</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Made Familiar. Created by Gakenge with Love 💖. All rights reserved.</p>
        </div>
      </footer>

      {/* Modal */}
      <WhatsAppModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        paper={selectedPaper}
        onSubmit={handleWhatsAppSubmit}
      />
    </div>
  );
};

// Main Entry Point
export default function App() {
  return <HomePage />;
}