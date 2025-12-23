import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export class FileDownloadService {
    /**
     * Download file to cache and return local URI
     */
    static async downloadFile(url: string, filename: string): Promise<string | null> {
        try {
            // Get token
            const token = typeof OpenAPI.TOKEN === 'function' ? await OpenAPI.TOKEN({} as any) : OpenAPI.TOKEN;

            // Prepare local path
            const dir = FileSystem.cacheDirectory + 'downloads/';
            await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

            const destination = dir + filename;

            // Download with headers
            const { uri } = await FileSystem.downloadAsync(
                url,
                destination,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );

            return uri;
        } catch (error) {
            console.error('Download failed:', error);
            return null;
        }
    }

    /**
     * Download and share/save file
     */
    static async downloadAndShare(url: string, filename: string): Promise<boolean> {
        try {
            const uri = await this.downloadFile(url, filename);
            if (!uri) return false;

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    UTI: 'public.data', // generic
                    mimeType: 'application/octet-stream', // fallback
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Share failed:', error);
            return false;
        }
    }
}
