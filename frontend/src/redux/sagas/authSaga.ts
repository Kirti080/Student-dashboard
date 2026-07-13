import axios from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import { loginUser, registerUser } from "@/services/authService";
import { LOGIN_REQUEST, REGISTER_REQUEST } from "../types/authTypes";
import type { AuthAction } from "../types/authTypes";
import type { AuthResponse } from "@/types/auth";
import {
  loginFailure,
  loginSuccess,
  registerFailure,
  registerSuccess,
} from "../actions/authActions";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong";
}

function* loginSaga(action: Extract<AuthAction, { type: typeof LOGIN_REQUEST }>): SagaIterator {
  try {
    const data: AuthResponse = yield call(loginUser, action.payload);
    const token = data.token || null;

    if (token) {
      localStorage.setItem("token", token);
    }

    yield put(loginSuccess(data.user || null, token, data.message || "Login successful"));
  } catch (error) {
    yield put(loginFailure(getErrorMessage(error)));
  }
}

function* registerSaga(
  action: Extract<AuthAction, { type: typeof REGISTER_REQUEST }>
): SagaIterator {
  try {
    const data: AuthResponse = yield call(registerUser, action.payload);
    const token = data.token || null;

    if (token) {
      localStorage.setItem("token", token);
    }

    yield put(
      registerSuccess(data.user || null, token, data.message || "Account created")
    );
  } catch (error) {
    yield put(registerFailure(getErrorMessage(error)));
  }
}

export default function* authSaga(): SagaIterator {
  yield takeLatest(LOGIN_REQUEST, loginSaga);
  yield takeLatest(REGISTER_REQUEST, registerSaga);
}
