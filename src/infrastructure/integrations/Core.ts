import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { storage, functions, auth } from './firebase';

interface InvokeLLMParams {
  fileUrl: string;
  schema: object;
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
  const result = await processReceipt(data);
  return result.data;
};