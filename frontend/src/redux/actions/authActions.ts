import {
  CLEAR_AUTH_STATUS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  REGISTER_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
} from "../types/authTypes";
import type { AuthAction } from "../types/authTypes";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

export const loginRequest = (payload: LoginPayload): AuthAction => ({
  type: LOGIN_REQUEST,
  payload,
});

export const loginSuccess = (
  user: AuthUser | null,
  token: string | null,
  message: string
): AuthAction => ({
  
  type: LOGIN_SUCCESS,
  payload: { user, token, message },
});

export const loginFailure = (error: string): AuthAction => ({
  type: LOGIN_FAILURE,
  payload: error,
});

export const registerRequest = (payload: RegisterPayload): AuthAction => ({
  type: REGISTER_REQUEST,
  payload,
});

export const registerSuccess = (
  user: AuthUser | null,
  token: string | null,
  message: string
): AuthAction => ({
  type: REGISTER_SUCCESS,
  payload: { user, token, message },
});

export const registerFailure = (error: string): AuthAction => ({
  type: REGISTER_FAILURE,
  payload: error,
});

export const logout = (): AuthAction => ({
  type: LOGOUT,
});

export const clearAuthStatus = (): AuthAction => ({
  type: CLEAR_AUTH_STATUS,
});
