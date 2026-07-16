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
import type { AuthAction, AuthState } from "../types/authTypes";

const storedUser = (() => {
  try {
    const value = localStorage.getItem("authUser");
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem("authUser");
    return null;
  }
})();

const initialState: AuthState = {
  user: storedUser,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
  message: null,
  status: "idle",
  flow: null,
  isAuthenticated: Boolean(localStorage.getItem("token")),
};

const authReducer = (
  state: AuthState = initialState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        message: null,
        status: "loading",
        flow: "login",
      };

    case REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        message: null,
        status: "loading",
        flow: "register",
      };

    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
        message: action.payload.message,
        status: "succeeded",
        isAuthenticated: Boolean(action.payload.token),
      };

    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: null,
        status: "failed",
      };

    case CLEAR_AUTH_STATUS:
      return {
        ...state,
        error: null,
        message: null,
        status: "idle",
        flow: null,
      };

    case LOGOUT:
      localStorage.removeItem("token");
      localStorage.removeItem("authUser");
      return {
        ...initialState,
        token: null,
        isAuthenticated: false,
      };

    default:
      return state;
  }
};

export default authReducer;
