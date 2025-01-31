// Navbar.tsx
import React from 'react';

interface NavbarProps {
  currentView: 'builder' | 'preview' | 'export';
  onViewChange: (view: 'builder' | 'preview' | 'export') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-xl font-bold py-4">FHIR Questionnaire Builder</h1>
        <div className="flex">
          <button
            onClick={() => onViewChange('builder')}
            className={`px-4 py-2 ${currentView === 'builder' ? 'bg-gray-200' : ''}`}
          >
            Builder
          </button>
          <button
            onClick={() => onViewChange('preview')}
            className={`px-4 py-2 ${currentView === 'preview' ? 'bg-gray-200' : ''}`}
          >
            Preview
          </button>
          <button
            onClick={() => onViewChange('export')}
            className={`px-4 py-2 ${currentView === 'export' ? 'bg-gray-200' : ''}`}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};