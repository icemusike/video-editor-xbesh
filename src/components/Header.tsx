import React from 'react';
import { Video, Settings, User, Save, FolderOpen } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-dark-900 border-b border-dark-700 shadow-dark">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-2 rounded-lg">
            <Video className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            VideoAI Creator
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="btn-ghost p-2 rounded-lg has-tooltip">
            <Save className="h-5 w-5" />
            <span className="tooltip mt-10 -ml-12 px-2 py-1 rounded bg-dark-800 text-xs">Save Project</span>
          </button>
          <button className="btn-ghost p-2 rounded-lg has-tooltip">
            <FolderOpen className="h-5 w-5" />
            <span className="tooltip mt-10 -ml-12 px-2 py-1 rounded bg-dark-800 text-xs">Open Project</span>
          </button>
          <button className="btn-ghost p-2 rounded-lg has-tooltip">
            <Settings className="h-5 w-5" />
            <span className="tooltip mt-10 -ml-12 px-2 py-1 rounded bg-dark-800 text-xs">Settings</span>
          </button>
          <button className="ml-2 flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 px-3 py-1.5 rounded-lg transition-colors">
            <User className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium">Sign In</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
