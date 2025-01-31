// FHIRExport.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Clipboard, Check, Code } from 'lucide-react';
import { FormItem, FormMetadata } from '../types/form';

interface FHIRExportProps {
  form: FormMetadata;  // Change to accept the complete form
  onBack: () => void;
}

interface FHIRQuestionnaire {
  resourceType: 'Questionnaire';
  id: string;
  url?: string;
  version?: string;
  name: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  date: string;
  publisher?: string;
  item: FHIRQuestionnaireItem[];
}

interface FHIRQuestionnaireItem {
  linkId: string;
  text: string;
  type: 'string' | 'integer' | 'choice' | 'date' | 'group';
  required?: boolean;
  repeats?: boolean;
  answerOption?: Array<{
    valueString?: string;
    valueCoding?: {
      code: string;
      display: string;
    };
  }>;
}

export const FHIRExport: React.FC<FHIRExportProps> = ({ form, onBack }) => {
  const [fhirQuestionnaire, setFhirQuestionnaire] = useState<FHIRQuestionnaire | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');

  useEffect(() => {
    const questionnaire = convertToFHIR(form);
    setFhirQuestionnaire(questionnaire);
  }, [form]);

  const convertToFHIR = (formData: FormMetadata): FHIRQuestionnaire => {
    // Convert sections to FHIR group items
    const items: FHIRQuestionnaireItem[] = formData.sections.map(section => ({
      linkId: section.id,
      text: section.title,
      type: 'group',
      item: section.items.map(convertItemToFHIR)
    }));

    return {
      resourceType: 'Questionnaire',
      id: generateUUID(),
      name: formData.title.toLowerCase().replace(/\s+/g, '-'),
      title: formData.title,
      status: 'draft',
      date: new Date().toISOString(),
      version: formData.version,
      item: items
    };
  };

  const convertItemToFHIR = (item: FormItem): FHIRQuestionnaireItem => {
    const fhirItem: FHIRQuestionnaireItem = {
      linkId: item.id,
      text: item.text,
      type: mapTypeToFHIR(item.type),
      required: item.required
    };

    // Handle choice options
    if (item.type === 'choice' && item.properties?.options) {
      fhirItem.answerOption = item.properties.options.map(option => ({
        valueString: option
      }));
      if (item.properties.multiple) {
        fhirItem.repeats = true;
      }
    }

    return fhirItem;
  };

  const mapTypeToFHIR = (type: string): FHIRQuestionnaireItem['type'] => {
    const typeMap: Record<string, FHIRQuestionnaireItem['type']> = {
      string: 'string',
      number: 'integer',
      choice: 'choice',
      date: 'date',
      group: 'group'
    };
    return typeMap[type] || 'string';
  };

  const handleCopyToClipboard = async () => {
    if (fhirQuestionnaire) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(fhirQuestionnaire, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleDownload = () => {
    if (fhirQuestionnaire) {
      const blob = new Blob([JSON.stringify(fhirQuestionnaire, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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
            onClick={handleCopyToClipboard}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Clipboard className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Download JSON
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 ${
              activeTab === 'preview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-2 ${
              activeTab === 'raw'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Raw JSON
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'preview' ? (
            <div className="space-y-4">
              {fhirQuestionnaire?.item.map((item, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="font-medium">{item.text}</h3>
                  {item.item && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.item.map((subItem, subIndex) => (
                        <div key={subIndex} className="text-sm">
                          <div className="font-medium">{subItem.text}</div>
                          <div className="text-gray-500">
                            Type: {subItem.type}
                            {subItem.required && ' (Required)'}
                          </div>
                          {subItem.answerOption && (
                            <div className="ml-4">
                              Options:
                              <ul className="list-disc list-inside">
                                {subItem.answerOption.map((option, i) => (
                                  <li key={i}>{option.valueString}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
              {JSON.stringify(fhirQuestionnaire, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default FHIRExport;