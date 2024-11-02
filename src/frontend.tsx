import React { useState, useEffect } from 'react';
import { useAuth } from './components/AuthContext';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Tag, Collection, Share2 } from 'lucide-react';

const QuoteCollector = () => {
  const { user, token } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [newQuote, setNewQuote] = useState({
    text: '',
    author: '',
    book: '',
    tags: [],
    collections: [],
    note: ''
  });

  // Fetch quotes from API
  const fetchQuotes = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/quotes?search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setQuotes(data.quotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  useEffect(() => {
    if (token) fetchQuotes();
  }, [searchTerm, token]);

  const handleAddQuote = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newQuote)
      });
      const data = await response.json();
      setQuotes([data, ...quotes]);
      setShowAddQuote(false);
      setNewQuote({ text: '', author: '', book: '', tags: [], collections: [], note: '' });
    } catch (error) {
      console.error('Error adding quote:', error);
    }
  };

  return (
    <div className="min-h-screen bg-purple-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-6xl font-bold text-purple-800 mb-4 transform -rotate-2">
            Quote Collector
          </h1>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
            <Button
              onClick={() => setShowAddQuote(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus className="mr-2" /> Add Quote
            </Button>
          </div>
        </header>

        {/* Add Quote Form */}
        {showAddQuote && (
          <Card className="mb-8 p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <form onSubmit={handleAddQuote}>
              <div className="space-y-4">
                <textarea
                  placeholder="Enter your quote..."
                  value={newQuote.text}
                  onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                  className="w-full p-3 border-4 border-black"
                  rows="3"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Author"
                    value={newQuote.author}
                    onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                    className="border-4 border-black"
                  />
                  <Input
                    placeholder="Book"
                    value={newQuote.book}
                    onChange={(e) => setNewQuote({ ...newQuote, book: e.target.value })}
                    className="border-4 border-black"
                  />
                </div>
                <Input
                  placeholder="Tags (comma separated)"
                  value={newQuote.tags.join(', ')}
                  onChange={(e) => setNewQuote({ ...newQuote, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                  className="border-4 border-black"
                />
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    onClick={() => setShowAddQuote(false)}
                    className="bg-red-400 hover:bg-red-500 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-400 hover:bg-green-500 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Save Quote
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((quote) => (
            <Card
              key={quote._id}
              className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white transform hover:-rotate-1 transition-transform"
            >
              <blockquote className="text-xl mb-4">"{quote.text}"</blockquote>
              <div className="text-gray-600">
                {quote.author && <p className="font-bold">- {quote.author}</p>}
                {quote.book && <p className="text-sm italic">from {quote.book}</p>}
              </div>
              {quote.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {quote.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-200 text-purple-800 text-sm rounded-full border-2 border-purple-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-4 gap-2">
                <Button
                  size="sm"
                  className="bg-blue-400 hover:bg-blue-500 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Share2 size={16} />
                </Button>
                <Button
                  size="sm"
                  className="bg-green-400 hover:bg-green-500 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Collection size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuoteCollector;
