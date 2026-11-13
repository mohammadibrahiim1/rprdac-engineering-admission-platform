/// <reference types="vite/client" />

import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../features/baseApi';
import cartSlice from '../../features/bookshop/state/cartSlice';
import staffSlice from '../features/staff/staffSlice';
import stopwatchSlice from '../features/staff/stopwatchSlice';
import studentSlice from '../features/student/studentSlice';
import breadcrumbSlice from '../features/breadcrumb/breadcrumbSlice';
import panelAccessAuthSlice from '../../features/authentication/state/panelAccessAuthSlice';
import statsSlice from '../features/visitor/visitorSlice';
import imageSlice from '../features/admin/imageSlice';
import sliderSlice from '../features/admin/sliderSlice';
import orderSlice from '../features/order/orderSlice';
import studentAuthSlice from '../../features/authentication/state/studentAuthSlice';
import filterSlice from '../features/filters/filterSlice';
import adminPanelSlice from '../../features/authentication/state/adminPanelSlice';
import notificationSlice from '../../features/notifications/state/notificationSlice';
import uiSlice from '../../features/ui/state/uiSlice';
import authSlice from '../../features/authentication/state/authSlice';

const IS_DEVTOOLS_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEVTOOLS === 'true';

// Sanitizer functions with loose typing (`any`) to avoid strict RTK action/state type conflicts
const actionSanitizer = (action: any): any => {
  if (!action) return action;

  let sanitizedAction = structuredClone(action);

  if (sanitizedAction.meta) {
    delete sanitizedAction.meta;
  }

  if (sanitizedAction.payload) {
    delete sanitizedAction.payload;
  }

  return sanitizedAction;
};

const stateSanitizer = (state: any): any => {
  if (!state) return state;
  const sanitizedState = structuredClone(state);

  if (sanitizedState.auth?.accessToken)
    sanitizedState.auth.accessToken = '<<BLOCKED>>';
  if (sanitizedState.auth?.user) sanitizedState.auth.user = '<<BLOCKED>>';

  if (sanitizedState.studentAuth?.token)
    sanitizedState.studentAuth.token = '<<BLOCKED>>';

  if (sanitizedState.panelAccessAuth?.accessToken) {
    sanitizedState.panelAccessAuth.accessToken = '<BLOCKED>';
  }

  return sanitizedState;
};

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    ui: uiSlice,
    auth: authSlice,
    studentAuth: studentAuthSlice,
    staff: staffSlice,
    stopwatch: stopwatchSlice,
    notifications: notificationSlice,
    student: studentSlice,
    breadcrumb: breadcrumbSlice,
    panelAccessAuth: panelAccessAuthSlice,
    stats: statsSlice,
    images: imageSlice,
    sliders: sliderSlice,
    cart: cartSlice,
    order: orderSlice,
    filters: filterSlice,
    adminPanel: adminPanelSlice,
  },

  devTools: IS_DEVTOOLS_ENABLED
    ? ({
        actionSanitizer,
        stateSanitizer,
        actionsDenylist: ['stopwatch/tick', 'notifications/get/pending'],
        maxAge: 30,
      } as any)
    : false,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware) as any,
});

// Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
