import { Spreadsheet } from './components/Spreadsheet/Spreadsheet';
import { Dashboard } from './components/Dashboard/Dashboard';
import { useState } from 'react';
import './App.css';
import React from 'react';

const App: React.FC = () => {
  const [activeDocId,setActiveDocId] = useState<string|null>(null);

  return (
    <div className="app-container">
      {activeDocId ? (
        <Spreadsheet 
          docId={activeDocId} 
          onBack={() => setActiveDocId(null)} 
          rows={1000} 
          cols={26} 
        />
      ) : (
        <Dashboard onOpenDoc={(id) => setActiveDocId(id)} />
      )}
    </div>
  );
};

export default App;