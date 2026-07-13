import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

export const LOGIN_REQUEST = "LOGIN_REQUEST" as const;
export const LOGIN_SUCCESS = "LOGIN_SUCCESS" as const;
export const LOGIN_FAILURE = "LOGIN_FAILURE" as const;

export const REGISTER_REQUEST = "REGISTER_REQUEST" as const;
export const REGISTER_SUCCESS = "REGISTER_SUCCESS" as const;
export const REGISTER_FAILURE = "REGISTER_FAILURE" as const;

export const LOGOUT = "LOGOUT" as const;
export const CLEAR_AUTH_STATUS = "CLEAR_AUTH_STATUS" as const;

export type AuthFlow = "login" | "register" | null;
export type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  status: AuthStatus;
  flow: AuthFlow;
  isAuthenticated: boolean;
};

export type AuthAction =
  | { type: typeof LOGIN_REQUEST; payload: LoginPayload }
  | {
      type: typeof LOGIN_SUCCESS;
      payload: { user: AuthUser | null; token: string | null; message: string };
    }
  | { type: typeof LOGIN_FAILURE; payload: string }
  | { type: typeof REGISTER_REQUEST; payload: RegisterPayload }
  | {
      type: typeof REGISTER_SUCCESS;
      payload: { user: AuthUser | null; token: string | null; message: string };
    }
  | { type: typeof REGISTER_FAILURE; payload: string }
  | { type: typeof LOGOUT }
  | { type: typeof CLEAR_AUTH_STATUS };
