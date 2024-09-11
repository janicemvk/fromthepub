import { login } from '../../services/api';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const loginUser = (email, password) => async (dispatch) => {
  try {
    const response = await login(email, password);
    localStorage.setItem('token', response.data.token);
    dispatch({ type: LOGIN_SUCCESS, payload: response.data.user });
  } catch (error) {
    dispatch({ type: LOGIN_FAILURE, payload: error.message });
  }
};