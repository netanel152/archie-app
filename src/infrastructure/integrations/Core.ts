import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { auth, storage, functions } from './firebase';

// Define a more specific type for the LLM invocation parameters
interface InvokeLLMParams {
  prompt: string;
  file_urls: string[];
  response_json_schema: object;
}

export const UploadFile = async ({ file }: { file: File }): Promise<{ file_url: string }> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated for file upload.");

  const storageRef = ref(storage, `receipts/${userId}/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return { file_url: await getDownloadURL(snapshot.ref) };
};

export const InvokeLLM = async (data: InvokeLLMParams): Promise<any> => {
  const processReceipt = httpsCallable(functions, 'processReceipt');

  const result = await processReceipt({
    fileUrl: data.file_urls[0],
    schema: data.response_json_schema
  });
  return result.data;
};