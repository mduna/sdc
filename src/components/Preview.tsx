// Preview.tsx
import React, { useState } from 'react';
import { ArrowLeft, Save, RefreshCcw } from 'lucide-react';
import { FormItem, ValidationRule } from '../types/form.ts';

interface PreviewProps {
  form: FormMetadata;  // Changed from items to form
  onBack: () => void;
}

interface FormResponse {
  [key: string]: any;
}

export const Preview: React.FC<PreviewProps> = ({ form, onBack }) => {
  const [responses, setResponses] = useState<FormResponse>({});
  const [errors, setErrors] = useState<FormResponse>({});

  const handleReset = () => {
    setResponses({});
    setErrors({});
  };

  const handleSave = () => {
    console.log('Form Responses:', responses);
  };

  const validateResponse = (item: FormItem, value: any): string[] => {
    const validationErrors: string[] = [];

    if (item.required && !value) {
      validationErrors.push('This field is required');
    }

    if (item.validation) {
      item.validation.forEach((rule: ValidationRule) => {
        switch (rule.type) {
          case 'minLength':
            if (value?.length < rule.params.value) {
              validationErrors.push(rule.message);
            }
            break;
          case 'maxLength':
            if (value?.length > rule.params.value) {
              validationErrors.push(rule.message);
            }
            break;
          case 'pattern':
            if (!new RegExp(rule.params.value).test(value)) {
              validationErrors.push(rule.message);
            }
            break;
        }
      });
    }

    return validationErrors;
  };

  const handleResponseChange = (item: FormItem, value: any) => {
    const newResponses = { ...responses, [item.id]: value };
    setResponses(newResponses);

    const validationErrors = validateResponse(item, value);
    if (validationErrors.length > 0) {
      setErrors(prev => ({ ...prev, [item.id]: validationErrors }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[item.id];
        return newErrors;
      });
    }
  };

  const renderFormItem = (item: FormItem) => {
    const commonProps = {
      id: item.id,
      'aria-label': item.text,
      className: `w-full p-2 border rounded-md ${
        errors[item.id] ? 'border-red-500' : 'border-gray-300'
      } focus:outline-none focus:ring-2 focus:ring-blue-500`,
      value: responses[item.id] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        handleResponseChange(item, e.target.value),
      placeholder: item.properties?.placeholder
    };

    switch (item.type) {
      case 'string':
        if (item.properties?.maxLength && item.properties.maxLength > 100) {
          return <textarea {...commonProps} rows={4} />;
        }
        return <input type="text" {...commonProps} />;

      case 'number':
        return (
          <input
            type="number"
            min={item.properties?.min}
            max={item.properties?.max}
            {...commonProps}
          />
        );

      case 'choice':
        if (item.properties?.options) {
          return item.properties.multiple ? (
            <div className="space-y-2">
              {item.properties.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={responses[item.id]?.includes(option)}
                    onChange={(e) => {
                      const currentValues = responses[item.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option);
                      handleResponseChange(item, newValues);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <select {...commonProps}>
              <option value="">Select an option</option>
              {item.properties.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return null;

      case 'date':
        return <input type="date" {...commonProps} />;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Builder
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Responses
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">{form.title}</h2>
        {form.description && (
          <p className="text-gray-600 mb-6">{form.description}</p>
        )}
        
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {form.sections.map((section) => (
            <div key={section.id} className="space-y-6">
              <div className="border-b pb-2">
                <h3 className="text-xl font-semibold">{section.title}</h3>
                {section.description && (
                  <p className="text-gray-600 mt-1">{section.description}</p>
                )}
              </div>
              
              {section.items.map((item) => (
                <div key={item.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {item.text}
                    {item.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  
                  {item.properties?.hint && (
                    <p className="text-sm text-gray-500 mb-1">
                      {item.properties.hint}
                    </p>
                  )}
                  
                  {renderFormItem(item)}
                  
                  {errors[item.id] && (
                    <div className="text-sm text-red-500 mt-1">
                      {errors[item.id].map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </form>
      </div>
    </div>
  );
};

export default Preview;