# Mobile API Client Post-Generation Patch

## Sorun

OpenAPI code generator ile mobil API client oluşturulduğunda, axios'un `responseType` ayarı otomatik olarak yapılmaz. Export endpoint'leri için binary response handling gerekebilir.

## Çözüm

Otomatik patch script'i oluşturuldu: `scripts/patch-api-client.js`

### Nasıl Çalışır?

1. **API Generate**: `npm run generate-api` komutu çalıştırıldığında:
   - Önce OpenAPI generator çalışır ve API client'ı oluşturur
   - Ardından otomatik olarak `patch-api-client.js` script'i çalışır
   - Script, `src/infrastructure/api/generated/core/request.ts` dosyasını patch'ler

2. **Patch İçeriği**: 
   - `sendRequest` fonksiyonuna `responseType` konfigürasyonu ekler
   - Export endpoint'leri için `blob` response type kullanır
   - Diğer endpoint'ler için `json` response type kullanır

### Kullanım

```bash
# API'yi yeniden generate et (patch otomatik uygulanır)
npm run generate-api
```

### Manuel Patch (Gerekirse)

Eğer script hata verirse veya manuel patch gerekirse:

```bash
node scripts/patch-api-client.js
```

### Patch Detayları

Script aşağıdaki değişikliği otomatik olarak uygular:

**Öncesi:**
```typescript
const requestConfig: AxiosRequestConfig = {
    url,
    headers,
    data: body ?? formData,
    method: options.method,
    withCredentials: config.WITH_CREDENTIALS,
    withXSRFToken: config.CREDENTIALS === 'include' ? config.WITH_CREDENTIALS : false,
    cancelToken: source.token,
};
```

**Sonrası:**
```typescript
const requestConfig: AxiosRequestConfig = {
    url,
    headers,
    data: body ?? formData,
    method: options.method,
    withCredentials: config.WITH_CREDENTIALS,
    withXSRFToken: config.CREDENTIALS === 'include' ? config.WITH_CREDENTIALS : false,
    cancelToken: source.token,
    // Set responseType for binary files (Excel, PDF, etc.)
    responseType: options.url.includes('/export/') ? 'blob' : 'json',
};
```

## Notlar

- Script idempotent'tir - aynı patch'i birden fazla kez uygulamaya çalışmaz
- Patch zaten uygulanmışsa "already patched" mesajı verir ve atlar
- Hata durumunda exit code 1 döner ve hata mesajı gösterir
- Mobil uygulamada export işlemi `FileDownloadService` üzerinden yapıldığı için bu patch ek bir güvenlik katmanıdır
