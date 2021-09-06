import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/users/userSlice';
import { authApi } from './services/auth';
import { formApi } from './services/forms';
import { reportApi } from './services/report';
import { schoolApi } from './services/school';


// const logger = store => next => action => {
//   console.group(action.type);
//   console.info('Dispatching:', action);
//   let result = next(action);
//   console.log('Next State:', store.getState());
//   console.groupEnd();
//   return result;
// }

export default configureStore({
  reducer: {
    user: userReducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [formApi.reducerPath]: formApi.reducer,
    [schoolApi.reducerPath]: schoolApi.reducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(
    // logger,
    reportApi.middleware,
    formApi.middleware,
    authApi.middleware,
    schoolApi.middleware),
});
