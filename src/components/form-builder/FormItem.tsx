// FormItem.tsx
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Trash2, Edit, MoveVertical, Settings, AlertCircle } from 'lucide-react';
import { FormItem as FormItemType, ValidationRule } from '../../types/form.ts';


interface FormItemProps {
    item: FormItemType;  // Using the imported type
    index: number;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (item: FormItemType) => void;
}
  
interface FormItemProps {
  item: FormItemType;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: FormItemType) => void;
}

export const FormItem: React.FC<FormItemProps> = ({
  item,
  index,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'string':
        return '';
      case 'number':
        return '123';
      case 'choice':
        return '☐';
      case 'date':
        return '📅';
      case 'group':
        return '⚏';
      default:
        return 'Aa';
    }
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`
            p-4 border rounded-lg bg-white shadow-sm
            ${isSelected ? 'border-blue-500' : 'border-gray-200'}
            ${snapshot.isDragging ? 'shadow-lg' : ''}
          `}
        >
          <div className="flex items-center gap-4">
            <div {...provided.dragHandleProps} className="cursor-move">
              <MoveVertical className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {getTypeIcon(item.type)}
                </span>
                <span className="font-medium">{item.text}</span>
                {item.required && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              
              {item.validation && item.validation.length > 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  {item.validation.length} validation rule(s)
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-gray-600 hover:text-blue-500 rounded transition-colors"
                title="Edit question"
              >
                <Edit className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onSelect(item.id)}
                className="p-2 text-gray-600 hover:text-purple-500 rounded transition-colors"
                title="Question settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 text-gray-600 hover:text-red-500 rounded transition-colors"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {item.children && item.children.length > 0 && (
            <div className="mt-4 pl-8 border-l-2 border-gray-100">
              {item.children.map((child, childIndex) => (
                <FormItem
                  key={child.id}
                  item={child}
                  index={childIndex}
                  isSelected={isSelected}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
