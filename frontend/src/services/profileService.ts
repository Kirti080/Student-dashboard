import axiosConfig from "@/api/axiosConfig";

export type Profile = {
  id?: string | number;
  name: string;
  email: string;
  phone: string;
  program: string;
  semester: string;
  rollNo: string;
  profileImage?: string;
};

type ProfileResponse = {
  message?: string;
  profile: Profile;
};

export const getProfile = async (): Promise<Profile> => {
  const response = await axiosConfig.get<ProfileResponse>("/profile");
  return response.data.profile;
};

export const updateProfile = async (payload: Profile): Promise<ProfileResponse> => {
  const response = await axiosConfig.put<ProfileResponse>("/profile", payload);
  return response.data;
};

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
  const response = await axiosConfig.put<{ message: string }>("/profile/password", payload);
  return response.data;
};
