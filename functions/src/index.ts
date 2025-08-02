// Import from the Firebase Admin SDK and Firebase Functions SDK
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Import the Google Generative AI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Firebase Admin SDK - this runs in a trusted server environment
initializeApp();
const db = getFirestore(); // 'db' is initialized for future use (e.g., logging)
const storage = getStorage();

// Initialize the Gemini AI Client. Ensure GEMINI_API_KEY is set in your function's environment variables.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Define the Callable Cloud Function
export const processReceipt = onCall(async (request) => {
  // 1. Authentication Check (handled automatically by onCall)
  if (!request.auth) {
    logger.error("Function called by unauthenticated user.");
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const userId = request.auth.uid;
  const { fileUrl, schema } = request.data;

  if (!fileUrl || !schema) {
    logger.error("Invalid arguments", { fileUrl: !!fileUrl, schema: !!schema });
    throw new HttpsError("invalid-argument", "Missing fileUrl or schema in request data.");
  }

  logger.info(`Processing receipt for user ${userId} with URL: ${fileUrl}`);

  try {
    // 2. Get a reference to the storage bucket from the Admin SDK
    const bucket = storage.bucket();

    // Extract the file path from the GCS URL provided by the client
    const filePath = decodeURIComponent(fileUrl.split('/o/')[1].split('?')[0]);
    const file = bucket.file(filePath);

    // Download the file into a buffer
    const [buffer] = await file.download();

    // 3. Call the Gemini API with the image data
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Analyze the receipt image. Extract data according to the provided JSON schema. The receipt may be in Hebrew or English. Infer the category from the product name. If a field is not found, return null.`;

    const result = await model.generateContent([
      prompt,
      JSON.stringify(schema),
      { inlineData: { data: buffer.toString("base64"), mimeType: "image/jpeg" } }
    ]);

    const extractedData = JSON.parse(result.response.text());
    logger.info("Successfully extracted data from Gemini for user:", { userId, extractedData });

    // 4. Return the extracted data to the client
    // The 'onCall' handler automatically wraps this in a 'data' object on the client-side
    return extractedData;

  } catch (error) {
    logger.error("Internal error processing receipt for user:", { userId, error });
    throw new HttpsError("internal", "Failed to process receipt with AI.", error);
  }
});