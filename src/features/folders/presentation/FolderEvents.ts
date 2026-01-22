type FolderEventListener = (folderId: string) => void;

class FolderEventsManager {
    private deleteListeners: FolderEventListener[] = [];
    private createListeners: FolderEventListener[] = [];

    subscribeToDelete(listener: FolderEventListener) {
        this.deleteListeners.push(listener);
        return () => {
            this.deleteListeners = this.deleteListeners.filter(l => l !== listener);
        };
    }

    emitDelete(folderId: string) {
        this.deleteListeners.forEach(listener => listener(folderId));
    }

    subscribeToCreate(listener: FolderEventListener) {
        this.createListeners.push(listener);
        return () => {
            this.createListeners = this.createListeners.filter(l => l !== listener);
        };
    }

    emitCreate(folderId: string) {
        this.createListeners.forEach(listener => listener(folderId));
    }
}

export const FolderEvents = new FolderEventsManager();
