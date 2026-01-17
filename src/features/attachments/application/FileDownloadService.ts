import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export class FileDownloadService {
    /**
     * Download file to cache and return local URI
     */
    static async downloadFile(url: string, filename: string): Promise<string | null> {
        // Get token
        const token = typeof OpenAPI.TOKEN === 'function' ? await OpenAPI.TOKEN({} as any) : OpenAPI.TOKEN;

        if (Platform.OS === 'web') {
            const response = await fetch(url, {
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (!response.ok) {
                let errorMessage = 'Download failed';
                let errorBody: any = {};
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                    errorBody = errorData;
                } catch (e) {
                    // ignore json parse error
                }
                const error: any = new Error(errorMessage);
                error.body = errorBody;
                throw error;
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            // On web we just return the blob URL, standard "cache" concept applies differently
            return blobUrl;
        }

        // Prepare local path
        const dir = FileSystem.cacheDirectory + 'downloads/';
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

        const destination = dir + filename;

        // Download with headers
        const downloadResult = await FileSystem.downloadAsync(
            url,
            destination,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
        );

        if (downloadResult.status >= 400) {
            let errorMessage = 'Download failed';
            let errorBody: any = {};
            try {
                const errorContent = await FileSystem.readAsStringAsync(downloadResult.uri);
                const errorData = JSON.parse(errorContent);
                errorMessage = errorData.message || errorData.error || errorMessage;
                errorBody = errorData;
                // Clean up error file
                await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true });
            } catch (e) {
                // ignore
            }

            const error: any = new Error(errorMessage);
            error.body = errorBody;
            throw error;
        }

        return downloadResult.uri;
    }

    /**
     * Download and share/save file
     */
    static async downloadAndShare(url: string, filename: string): Promise<boolean> {
        const uri = await this.downloadFile(url, filename);
        if (!uri) return false;

        if (Platform.OS === 'web') {
            const link = document.createElement('a');
            link.href = uri; // which is blobUrl
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(uri);
            return true;
        }

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                UTI: 'public.data', // generic
                mimeType: 'application/octet-stream', // fallback
            });
            return true;
        }
        return false;
    }
}
