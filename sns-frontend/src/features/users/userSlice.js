import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../services/auth';
import { questionApi } from '../../services/questions';
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
      questionApi.util.resetApiState();
      reportApi.util.resetApiState();
      schoolApi.util.resetApiState();
    }
  },
});

export const { signin, signout } = userSlice.actions;

export default userSlice.reducer;
