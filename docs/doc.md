# Role
Act as a Senior React Native Architect. We are building the "Klipp" app using **Expo Router**, **TypeScript**, and **Clean Architecture**.

# Context & API Definition
We have a custom backend API. The full OpenAPI definition is in the file: @docs/swagger.json (READ THIS FILE CAREFULLY).

**Key Architectural Rules:**
1.  **Backend:** Custom API (`https://klipp-api.orjinfinity.net`).
2.  **Auth:** JWT Bearer Token (handled via `expo-secure-store` and Axios interceptors).
3.  **Storage Logic (Crucial):** - We use a **3-step upload process** for images (Receipts):
    1. `POST /receipts/` (Create metadata).
    2. `POST /images/presigned-url` (Get R2 upload URL).
    3. Upload file directly to R2 (PUT).
    4. `POST /images/` (Link URL to receipt).
4.  **OCR:** On-Device logic using `@react-native-ml-kit/text-recognition`.

# Task: Generate the Infrastructure Layer
Based on the `@docs/swagger.json` definitions, please generate the following files in order:

1.  **`src/core/entities/Receipt.ts`**: Define the TypeScript interface matching the API schema exactly.
2.  **`src/infrastructure/api/apiClient.ts`**: Create the Axios instance.
    - Add a request interceptor to inject the `Bearer` token from SecureStore.
    - Handle 401 errors (logout flow).
3.  **`src/infrastructure/services/ReceiptService.ts`**: 
    - Implement the **3-step image upload logic** described above.
    - This service should handle the interaction between the API and the file upload.
4.  **`src/infrastructure/repositories/ReceiptRepository.ts`**: 
    - Implement `createReceipt(data, imageUri)`.
    - Use `OCRService` (stub it for now) to parse data if needed.
    - Call `ReceiptService` to handle the upload transaction.

Please start by analyzing the `@docs/swagger.json` file and then write the code for `src/core/entities/Receipt.ts`.