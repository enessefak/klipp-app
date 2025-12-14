import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

// Folder type
interface Folder {
    id: string;
    name: string;
    icon: string;
    color: string;
}

// Attachment Type type
interface AttachmentType {
    id: string;
    name: string;
    icon: string;
    color: string;
}

type PickerCallback<T> = (item: T | null) => void;

interface PickerContextType {
    // Folder picker
    folderCallback: React.MutableRefObject<PickerCallback<Folder> | null>;
    onFolderSelect: (folder: Folder | null) => void;
    setFolderCallback: (callback: PickerCallback<Folder>) => void;
    
    // Attachment Type picker
    typeCallback: React.MutableRefObject<PickerCallback<AttachmentType> | null>;
    onTypeSelect: (type: AttachmentType | null) => void;
    setTypeCallback: (callback: PickerCallback<AttachmentType>) => void;
    
    // Selection completion tracking
    selectionVersion: number;
}

const PickerContext = createContext<PickerContextType | null>(null);

export function PickerProvider({ children }: { children: React.ReactNode }) {
    const folderCallback = useRef<PickerCallback<Folder> | null>(null);
    const typeCallback = useRef<PickerCallback<AttachmentType> | null>(null);
    const [selectionVersion, setSelectionVersion] = useState(0);

    const onFolderSelect = useCallback((folder: Folder | null) => {
        if (folderCallback.current) {
            folderCallback.current(folder);
            setSelectionVersion(v => v + 1);
        }
    }, []);

    const onTypeSelect = useCallback((type: AttachmentType | null) => {
        if (typeCallback.current) {
            typeCallback.current(type);
            setSelectionVersion(v => v + 1);
        }
    }, []);

    const setFolderCallback = useCallback((callback: PickerCallback<Folder>) => {
        folderCallback.current = callback;
    }, []);

    const setTypeCallback = useCallback((callback: PickerCallback<AttachmentType>) => {
        typeCallback.current = callback;
    }, []);

    return (
        <PickerContext.Provider 
            value={{ 
                folderCallback, 
                onFolderSelect, 
                setFolderCallback,
                typeCallback,
                onTypeSelect,
                setTypeCallback,
                selectionVersion,
            }}
        >
            {children}
        </PickerContext.Provider>
    );
}

export function usePicker() {
    const context = useContext(PickerContext);
    if (!context) {
        throw new Error('usePicker must be used within a PickerProvider');
    }
    return context;
}
