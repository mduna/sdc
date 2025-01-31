// ItemEditor.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { FormItem, ValidationRule, ItemProperties } from '../../types/form.ts';


interface ItemEditorProps {
    item: FormItem;  // Using the imported type
    onSave: (item: FormItem) => void;
    onCancel: () => void;
  }

interface ItemEditorProps {
  item: FormItem;
  onSave: (item: FormItem) => void;
  onCancel: () => void;
}

export const ItemEditor: React.FC<ItemEditorProps> = ({
  item,
  onSave,
  onCancel
}) => {
  const [editedItem, setEditedItem] = useState<FormItem>({
    ...item,
    properties: item.properties || {},
    validation: item.validation || []
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'properties' | 'validation'>('basic');

  const handleSave = () => {
    if (!editedItem.text.trim()) {
      alert('Question text is required');
      return;
    }
    onSave(editedItem);
  };

  const updateProperties = (updates: Partial<ItemProperties>) => {
    setEditedItem(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        ...updates
      }
    }));
  };

  const addValidationRule = () => {
    setEditedItem(prev => ({
      ...prev,
      validation: [
        ...(prev.validation || []),
        {
          type: 'required',
          params: {},
          message: 'This field is required'
        }
      ]
    }));
  };

  const updateValidationRule = (index: number, updates: Partial<ValidationRule>) => {
    setEditedItem(prev => ({
      ...prev,
      validation: prev.validation?.map((rule, i) =>
        i === index ? { ...rule, ...updates } : rule
      )
    }));
  };

  const removeValidationRule = (index: number) => {
    setEditedItem(prev => ({
      ...prev,
      validation: prev.validation?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {item.id ? 'Edit Question' : 'New Question'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 ${
              activeTab === 'basic'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600'
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 ${
              activeTab === 'properties'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600'
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-4 py-2 ${
              activeTab === 'validation'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600'
            }`}
          >
            Validation
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Question Text
                </label>
                <input
                  type="text"
                  value={editedItem.text}
                  onChange={(e) =>
                    setEditedItem({ ...editedItem, text: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter question text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Question Type
                </label>
                <select
                  value={editedItem.type}
                  onChange={(e) =>
                    setEditedItem({
                      ...editedItem,
                      type: e.target.value as FormItem['type']
                    })
                  }
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="string">Text</option>
                  <option value="number">Number</option>
                  <option value="choice">Multiple Choice</option>
                  <option value="date">Date</option>
                  <option value="group">Group</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={editedItem.required}
                  onChange={(e) =>
                    setEditedItem({ ...editedItem, required: e.target.checked })
                  }
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="required" className="text-sm font-medium">
                  Required
                </label>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={editedItem.properties?.placeholder || ''}
                  onChange={(e) =>
                    updateProperties({ placeholder: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Enter placeholder text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Help Text
                </label>
                <input
                  type="text"
                  value={editedItem.properties?.hint || ''}
                  onChange={(e) => updateProperties({ hint: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Enter help text"
                />
              </div>

              {editedItem.type === 'choice' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Options
                  </label>
                  <div className="space-y-2">
                    {editedItem.properties?.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [
                              ...(editedItem.properties?.options || [])
                            ];
                            newOptions[index] = e.target.value;
                            updateProperties({ options: newOptions });
                          }}
                          className="flex-1 p-2 border rounded"
                        />
                        <button
                          onClick={() => {
                            const newOptions = editedItem.properties?.options?.filter(
                              (_, i) => i !== index
                            );
                            updateProperties({ options: newOptions });
                          }}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        updateProperties({
                          options: [
                            ...(editedItem.properties?.options || []),
                            ''
                          ]
                        })
                      }
                      className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-4">
              {editedItem.validation?.map((rule, index) => (
                <div key={index} className="p-4 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <select
                      value={rule.type}
                      onChange={(e) =>
                        updateValidationRule(index, { type: e.target.value })
                      }
                      className="p-2 border rounded"
                    >
                      <option value="required">Required</option>
                      <option value="minLength">Minimum Length</option>
                      <option value="maxLength">Maximum Length</option>
                      <option value="pattern">Pattern Match</option>
                    </select>
                    <button
                      onClick={() => removeValidationRule(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {rule.type !== 'required' && (
                    <input
                      type="text"
                      value={rule.params.value || ''}
                      onChange={(e) =>
                        updateValidationRule(index, {
                          params: { value: e.target.value }
                        })
                      }
                      className="w-full p-2 border rounded mt-2"
                      placeholder="Enter validation parameter"
                    />
                  )}

                  <input
                    type="text"
                    value={rule.message}
                    onChange={(e) =>
                      updateValidationRule(index, { message: e.target.value })
                    }
                    className="w-full p-2 border rounded mt-2"
                    placeholder="Error message"
                  />
                </div>
              ))}

              <button
                onClick={addValidationRule}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Validation Rule
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemEditor;