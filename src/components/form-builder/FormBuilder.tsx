// FormBuilder.tsx
import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { FormItem } from './FormItem.tsx';
import { ItemEditor } from './ItemEditor.tsx';
import { Preview } from '../Preview.tsx';
import { FHIRExport } from '../FHIRExport.tsx';
import { Navbar } from '../Navbar.tsx';
import { Alert, AlertDescription } from '../ui/alert.tsx';
import { FormItem as FormItemType, FormSection, FormMetadata } from '../../types/form.ts';

export const FormBuilder: React.FC = () => {
  // State declarations
  const [currentView, setCurrentView] = useState<'builder' | 'preview' | 'export'>('builder');
  const [formMetadata, setFormMetadata] = useState<FormMetadata>({
    title: 'New Form',
    description: '',
    version: '1.0',
    sections: []
  });
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<FormItemType | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Handlers
  const handleAddSection = useCallback(() => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: '',
      items: []
    };

    setFormMetadata(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  }, []);

  const handleUpdateSection = useCallback((sectionId: string, updates: Partial<FormSection>) => {
    setFormMetadata(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  }, []);

  const handleDeleteSection = useCallback((sectionId: string) => {
    setFormMetadata(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  }, []);

  const handleAddItem = useCallback((sectionId: string) => {
    const newItem: FormItemType = {
      id: `item-${Date.now()}`,
      type: 'string',
      text: 'New Question',
      required: false,
      order: 0
    };

    setFormMetadata(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      )
    }));

    setEditingItem(newItem);
    setEditingSectionId(sectionId);
  }, []);

  const handleUpdateItem = useCallback((updatedItem: FormItemType) => {
    if (!editingSectionId) return;

    setFormMetadata(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === editingSectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === updatedItem.id ? updatedItem : item
              )
            }
          : section
      )
    }));

    setEditingItem(null);
    setEditingSectionId(null);
    setShowAlert(true);
    setAlertMessage('Question updated successfully');
    setTimeout(() => setShowAlert(false), 3000);
  }, [editingSectionId]);

  const handleDeleteItem = useCallback((sectionId: string, itemId: string) => {
    setFormMetadata(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, items: section.items.filter(item => item.id !== itemId) }
          : section
      )
    }));

    if (selectedItem === itemId) setSelectedItem(null);
    if (editingItem?.id === itemId) setEditingItem(null);
  }, [selectedItem, editingItem]);

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newFormMetadata = { ...formMetadata };

    if (source.droppableId !== destination.droppableId) {
      const sourceSection = newFormMetadata.sections.find(s => s.id === source.droppableId);
      const destSection = newFormMetadata.sections.find(s => s.id === destination.droppableId);
      
      if (sourceSection && destSection) {
        const [movedItem] = sourceSection.items.splice(source.index, 1);
        destSection.items.splice(destination.index, 0, movedItem);
      }
    } else {
      const section = newFormMetadata.sections.find(s => s.id === source.droppableId);
      if (section) {
        const [movedItem] = section.items.splice(source.index, 1);
        section.items.splice(destination.index, 0, movedItem);
      }
    }

    setFormMetadata(newFormMetadata);
  }, [formMetadata]);

  const handleSave = useCallback(() => {
    setShowAlert(true);
    setAlertMessage('Form saved successfully');
    setTimeout(() => setShowAlert(false), 3000);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div className="max-w-6xl mx-auto p-4">
        {currentView === 'builder' && (
          <>
            <div className="mb-4 flex gap-2">
              <button
                onClick={handleAddSection}
                className="px-4 py-2 border border-gray-300 bg-white"
              >
                Add Section
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-gray-300 bg-white"
              >
                Save
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <input
                type="text"
                value={formMetadata.title}
                onChange={(e) => setFormMetadata(prev => ({ ...prev, title: e.target.value }))}
                className="border p-2"
                placeholder="New Form"
              />
              <input
                type="text"
                value={formMetadata.description || ''}
                onChange={(e) => setFormMetadata(prev => ({ ...prev, description: e.target.value }))}
                className="border p-2 flex-1"
                placeholder="Form Description (optional)"
              />
            </div>

            {showAlert && (
              <Alert className="mb-4 border border-gray-300">
                <AlertDescription>{alertMessage}</AlertDescription>
              </Alert>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
              {formMetadata.sections.map((section) => (
                <div key={section.id} className="mb-4 border border-gray-300 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                        className="border p-2 mb-2"
                        placeholder="Section Title"
                      />
                      <input
                        type="text"
                        value={section.description || ''}
                        onChange={(e) => handleUpdateSection(section.id, { description: e.target.value })}
                        className="border p-2 w-full"
                        placeholder="Section description (optional)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddItem(section.id)}
                        className="px-4 py-2 border border-gray-300 bg-white"
                      >
                        Add Question
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="px-4 py-2 border border-gray-300 bg-white text-red-600"
                      >
                        Delete Section
                      </button>
                    </div>
                  </div>

                  <Droppable droppableId={section.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {section.items.map((item, index) => (
                          <FormItem
                            key={item.id}
                            item={item}
                            index={index}
                            isSelected={selectedItem === item.id}
                            onSelect={setSelectedItem}
                            onDelete={(itemId) => handleDeleteItem(section.id, itemId)}
                            onEdit={setEditingItem}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </DragDropContext>
          </>
        )}

        {currentView === 'preview' && (
          <Preview
            form={formMetadata}
            onBack={() => setCurrentView('builder')}
          />
        )}

        {currentView === 'export' && (
          <FHIRExport
            form={formMetadata}
            onBack={() => setCurrentView('builder')}
          />
        )}

        {editingItem && (
          <ItemEditor
            item={editingItem}
            onSave={handleUpdateItem}
            onCancel={() => {
              setEditingItem(null);
              setEditingSectionId(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FormBuilder;