
export type FieldType = 'text' | 'number' | 'date' | 'currency' | 'select' | 'textarea' | 'duration';

export interface FieldConfig {
    key: string;
    label: string;
    type: FieldType;
    required?: boolean;
    placeholder?: string;
    unit?: string; // For duration fields (day, month, year)
    options?: string[];
    defaultValue?: any;
    filterable?: boolean;
    filterType?: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'amount';
}


export interface GridConfig {
    gridTemplateAreas: string[];
    gap?: string;
}

export interface FieldStyle {
    mobile?: GridConfig;
    desktop?: GridConfig;
}
