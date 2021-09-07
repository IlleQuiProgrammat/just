import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../services/auth';
import { formApi } from '../../services/forms';
import { reportApi } from '../../services/report';
import { schoolApi } from '../../services/school';

const initialState = {
  signedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signin: state => {
      state.signedIn = true;
    },
    signout: state => {
      state.signedIn = false;
      authApi.util.resetApiState();
      formApi.util.resetApiState();
      reportApi.util.resetApiState();
      schoolApi.util.resetApiState();
      localStorage.clear();
    }
  },
});

export const { signin, signout } = userSlice.actions;

export default userSlice.reducer;
