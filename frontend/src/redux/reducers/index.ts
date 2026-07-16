import { combineReducers } from "redux";
import authReducer from "./authReducer";
import adminReducer from "../admin/adminReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
