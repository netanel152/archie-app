import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, storage } from '../../infrastructure/integrations/firebase';

export const UploadFile = async ({ file }: { file: File }): Promise<{ file_url: string }> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated for file upload.");

  const storageRef = ref(storage, `receipts/${userId}/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return { file_url: await getDownloadURL(snapshot.ref) };
};

export const InvokeLLM = async (data: { prompt: string, file_urls: string[] }): Promise<any> => {
  const functions = getFunctions();
  const processReceipt = httpsCallable(functions, 'processReceipt'); // Name of our backend function

  const result = await processReceipt({ fileUrl: data.file_urls[0] });
  return result.data;
};