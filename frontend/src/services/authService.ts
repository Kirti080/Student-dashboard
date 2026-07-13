import axiosConfig from "@/api/axiosConfig";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth";

export const loginUser = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const response = await axiosConfig.post<AuthResponse>("/auth/login", payload);
  return response.data;
};

export const registerUser = async (
  payload: RegisterPayload
): Promise<AuthResponse> => {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("phone", payload.phone);
  formData.append("program", payload.program);
  formData.append("semester", payload.semester);
  formData.append("rollNo", payload.rollNo);

  if (payload.profileImage) {
    formData.append("profileImage", payload.profileImage);
  }

  const response = await axiosConfig.post<AuthResponse>("/auth/register", formData);
  return response.data;
};
