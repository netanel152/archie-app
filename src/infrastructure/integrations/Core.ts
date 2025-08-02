import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { storage, functions, auth } from './firebase';

// Define a more specific type for the LLM invocation parameters
interface InvokeLLMParams {
  prompt: string;
  file_urls?: string[]; // Make file_urls optional for text-only prompts
  response_json_schema: object;
  add_context_from_internet?: boolean; // FIX: Add the missing optional property here
}

export const UploadFile = async ({ file }: { file: File }): Promise<{ file_url: string }> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated for file upload.");

  const storageRef = ref(storage, `receipts/${userId}/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return { file_url: await getDownloadURL(snapshot.ref) };
};

export const InvokeLLM = async (data: InvokeLLMParams): Promise<any> => {
  const processReceipt = httpsCallable(functions, 'processReceipt'); // Assumes a generic function name

  // Construct the payload for the backend function
  const payload: any = {
    prompt: data.prompt,
    schema: data.response_json_schema
  };

  if (data.file_urls && data.file_urls.length > 0) {
    payload.fileUrl = data.file_urls[0];
  }

  if (data.add_context_from_internet) {
    payload.addContextFromInternet = data.add_context_from_internet;
  }

  const result = await processReceipt(payload);
  return result.data;
};
