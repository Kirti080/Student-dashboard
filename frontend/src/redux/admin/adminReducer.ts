import { ADMIN_LIST_FAILURE, ADMIN_LIST_REQUEST, ADMIN_LIST_SUCCESS, type AdminAction, type AdminState } from "./adminTypes";

const initialState: AdminState = {
  resource: "students",
  records: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  loading: false,
  error: null,
};

export default function adminReducer(state = initialState, action: AdminAction): AdminState {
  switch (action.type) {
    case ADMIN_LIST_REQUEST:
      return { ...state, resource: action.payload.resource, loading: true, error: null };
    case ADMIN_LIST_SUCCESS:
      return { ...state, resource: action.payload.resource, records: action.payload.records, pagination: action.payload.pagination, loading: false };
    case ADMIN_LIST_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
