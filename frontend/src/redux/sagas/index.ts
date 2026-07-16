import { all, call } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import authSaga from "./authSaga";
import adminSaga from "../admin/adminSaga";

export default function* rootSaga(): SagaIterator {
  yield all([call(authSaga), call(adminSaga)]);
}
