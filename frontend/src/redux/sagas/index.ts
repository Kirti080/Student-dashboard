import { all, call } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import authSaga from "./authSaga";

export default function* rootSaga(): SagaIterator {
  yield all([call(authSaga)]);
}
