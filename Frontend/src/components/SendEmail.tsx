import { useState, useContext } from 'react'; // Add useContext
import { Send } from 'lucide-react';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

export default function SendEmail() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useContext(AuthContext); // Get token from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("Sending...");
    
    if (!token) {
      setStatus("Authentication required to send email.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/send-email', { // Use /api/send-email
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the authorization header
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setStatus("Email sent successfully!");
      setMessage("");
    } catch (err: any) {
      console.error('Error sending email:', err);
      setStatus(`An error occurred: ${err.message || 'Please try again later.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Send Email Campaign
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700">
            Email Message
          </label>
          <div className="relative">
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={12}
              placeholder="Compose your email message here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm hover:bg-white/90"
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-400">
              {message.length} characters
            </div>
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={isLoading || !message.trim()}
          className="relative inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center space-x-2">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Email</span>
              </>
            )}
          </div>
        </button>
        
        {status && (
          <div className={`p-4 rounded-xl border ${
            status.includes('successfully') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : status.includes('Sending') 
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-red-50 border-red-200 text-red-800'
          } animate-pulse`}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
}