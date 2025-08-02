export interface UserData {
  id: string;
  email: string;
  language_preference?: 'en' | 'he';
}

export class User {
  static me = async (): Promise<UserData> => {
    return {
      id: "123",
      email: "test@example.com",
      language_preference: "en",
    };
  };

  static updateMyUserData = async (data: Partial<UserData>): Promise<void> => {
    console.log("Updating user data with:", data);
    return;
  };
}