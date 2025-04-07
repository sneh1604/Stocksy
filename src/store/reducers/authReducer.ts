import { AuthActionTypes } from '../types';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN:
      return {
        ...state,
        user: action.payload,
        error: null,
      };
    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        error: null,
      };
    case AuthActionTypes.LOGIN_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;