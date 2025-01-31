// App.tsx
import React, { useState } from 'react';
import { FormBuilder } from './components/form-builder/FormBuilder.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Preview } from './components/Preview.tsx';
import { FHIRExport } from './components/FHIRExport.tsx';
import { Alert } from './components/ui/alert.tsx';
import { AlertDescription } from './components/ui/alert.tsx';

// Types imported from our shared types file
import { FormItem } from './types/form';

function App() {
  const [currentView, setCurrentView] = useState<'builder' | 'preview' | 'export'>('builder');
  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleSave = (items: FormItem[]) => {
    setFormItems(items);
    setShowAlert(true);
    setAlertMessage('Form saved successfully');
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleExport = async (items: FormItem[]) => {
    setCurrentView('export');
  };

  const handlePreview = () => {
    setCurrentView('preview');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
     
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {showAlert && (
          <Alert className="mb-4">
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        {currentView === 'builder' && (
          <FormBuilder
            onSave={handleSave}
            onPreview={handlePreview}
            onExport={handleExport}
          />
        )}

        {currentView === 'preview' && (
          <Preview 
            items={formItems}
            onBack={() => setCurrentView('builder')}
          />
        )}

        {currentView === 'export' && (
          <FHIRExport
            items={formItems}
            onBack={() => setCurrentView('builder')}
          />
        )}
      </main>
    </div>
  );
}

export default App;