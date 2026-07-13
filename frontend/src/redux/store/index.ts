import { applyMiddleware, legacy_createStore as createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import rootReducer from "../reducers";
import rootSaga from "../sagas";

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer,
  undefined,
  applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(rootSaga);

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;

export default store;
