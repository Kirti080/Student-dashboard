export type AuthUser = {
  id?: number | string;
  name?: string;
  email: string;
  phone?: string;
  program?: string;
  semester?: string;
  rollNo?: string;
  profileImage?: string;
  role?: "student" | "admin";
  isActive?: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  program: string;
  semester: string;
  rollNo: string;
  profileImage?: File | null; 

};

export type AuthResponse = {
  message: string;
  token?: string;
  user?: AuthUser;
};
