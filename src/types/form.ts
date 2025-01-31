// src/types/form.ts
export interface FormItem {
  id: string;
  type: 'string' | 'number' | 'choice' | 'group' | 'date';
  text: string;
  required: boolean;
  order: number;
  validation?: ValidationRule[];
  properties?: ItemProperties;
  children?: FormItem[];
}
  
export interface ValidationRule {
    type: string;
    params: any;
    message: string;
  }


export interface FormSection {
  id: string;
  title: string;
  description?: string;
  items: FormItem[];
}

export interface FormMetadata {
  title: string;
  description?: string;
  version?: string;
  sections: FormSection[];
}


export interface ItemProperties {
    placeholder?: string;
    hint?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    options?: string[];
    multiple?: boolean;
}
  
  // src/types/events.ts
  export type FormBuilderEvent = 
    | { type: 'ADD_ITEM'; payload: Partial<FormItem> }
    | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<FormItem> } }
    | { type: 'DELETE_ITEM'; payload: { id: string } }
    | { type: 'MOVE_ITEM'; payload: { itemId: string; sourceIndex: number; destinationIndex: number } };