import axios from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import { fetchAdminPage, type PageResponse } from "@/services/adminService";
import { ADMIN_LIST_FAILURE, ADMIN_LIST_REQUEST, ADMIN_LIST_SUCCESS, type AdminAction } from "./adminTypes";

function* load(action: Extract<AdminAction, { type: typeof ADMIN_LIST_REQUEST }>): SagaIterator {
  try {
    const response: PageResponse = yield call(fetchAdminPage, action.payload.resource, action.payload.query);
    yield put({ type: ADMIN_LIST_SUCCESS, payload: { resource: action.payload.resource, records: response.data, pagination: response.pagination } });
  } catch (error) {
    const message = axios.isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message || error.message
      : "Unable to load records";
    yield put({ type: ADMIN_LIST_FAILURE, payload: message });
  }
}

export default function* adminSaga(): SagaIterator {
  yield takeLatest(ADMIN_LIST_REQUEST, load);
}
