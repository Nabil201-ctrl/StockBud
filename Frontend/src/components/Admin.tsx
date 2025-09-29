import { useState } from 'react';
import { Users as UsersIcon, Mail, Menu, X } from 'lucide-react';
import Users from './Users';
import SendEmail from './SendEmail';

// Main Admin Component
export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'send-email', label: 'Send Email', icon: Mail }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl shadow-2xl transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300 ease-in-out border-r border-gray-200/50`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-6">
            <ul className="space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                      <span className="font-medium">{tab.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white/90 backdrop-blur-xl border-b border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin
              </h1>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-8 min-h-[calc(100vh-12rem)]">
                <div className="animate-fade-in">
                  {activeTab === 'users' && <Users />}
                  {activeTab === 'send-email' && <SendEmail />}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
