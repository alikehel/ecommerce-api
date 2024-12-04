import { createRouter } from "@/lib/create-app";

import { uploadKYCDocumentsHandler, uploadKYCDocumentsRoute } from "./routes/upload-kyc-documents";

export const kycRouter = createRouter().openapi(uploadKYCDocumentsRoute, uploadKYCDocumentsHandler);
