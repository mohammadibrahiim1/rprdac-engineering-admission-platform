import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  forgotPassword,
  loadCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
  resetPassword,
  sendOtp,
  verifyOtp,
} from "./authThunk";
import { User } from "../admin/userPanel/types/User.types";

// Auth State ইন্টারফেস
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  authChecked: boolean;
  panelSession: any | null;
  phone: string | null;
  sessionToken: string | null;
  isPhoneVerified: boolean;
  otpVerified: boolean;
  otpExpiresAt: string | Date | null;
  loading: boolean;
  isLoggedIn: boolean;
  message: string | null;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  authChecked: false,
  panelSession: null,
  phone: null,
  sessionToken: null,
  isPhoneVerified: false,
  otpVerified: false,
  otpExpiresAt: null,
  loading: false,
  isLoggedIn: false,
  message: null,
  error: null,
};

const handlePending = (state: AuthState) => {
  state.loading = true;
  state.error = null;
  state.message = null;
};

const handleRejected = (state: AuthState, action: PayloadAction<any>) => {
  state.loading = false;
  state.error = action.payload || "Something went wrong";
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearMessage: (state: AuthState) => {
      state.message = null;
    },
    clearAuthState: (state: AuthState) => {
      state.user = null;
      state.isLoggedIn = false;
      state.authChecked = true;
      state.accessToken = null;
    },
    clearError: (state: AuthState) => {
      state.error = null;
    },
    setPhoneNumber: (state: AuthState, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setOtpExpiresAt: (
      state: AuthState,
      action: PayloadAction<string | Date | null>,
    ) => {
      state.otpExpiresAt = action.payload;
    },
    resetOtpState: (state: AuthState) => {
      state.otpVerified = false;
      state.error = null;
      state.otpExpiresAt = null;
    },
    setPanelSession: (state: AuthState, action: PayloadAction<any>) => {
      state.panelSession = action.payload;
    },
    clearPanelSession: (state: AuthState) => {
      state.panelSession = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // --- Send OTP ---
      .addCase(sendOtp.pending, handlePending)
      .addCase(sendOtp.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.otpVerified = false;
        state.phone = action.payload.phone;
        state.sessionToken = action.payload.sessionToken;
        state.otpExpiresAt = action.payload.otpExpiresAt;
        state.message = action.payload.message;
      })
      .addCase(sendOtp.rejected, handleRejected)

      // --- Verify OTP ---
      .addCase(verifyOtp.pending, handlePending)
      .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.otpVerified = true;
        state.isPhoneVerified = true;
        state.message = action.payload?.message || "Phone verified!";
      })
      .addCase(verifyOtp.rejected, handleRejected)

      // --- Register ---
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.message = action.payload.message;
        state.isPhoneVerified = false;
        state.otpVerified = false;
      })
      .addCase(register.rejected, handleRejected)

      // --- Login ---
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        console.log(action.payload);
        state.loading = false;
        state.isLoggedIn = true;
        state.authChecked = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken || null;
        state.message = action.payload.message || "Login successful!";
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        handleRejected(state, action);
        state.isLoggedIn = false;
        state.user = null;
        state.accessToken = null;
        state.authChecked = true;
      })

      // --- Refresh Access Token ---
      .addCase(refreshAccessToken.pending, (state: AuthState) => {
        state.loading = true;
      })
      .addCase(
        refreshAccessToken.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.authChecked = true;

          if (action.payload?.accessToken || action.payload?.user) {
            state.accessToken = action.payload.accessToken || state.accessToken;
            state.isLoggedIn = true;
            state.user = action.payload.user;
          } else {
            state.isLoggedIn = false;
            state.user = null;
            state.accessToken = null;
          }
        },
      )
      .addCase(refreshAccessToken.rejected, (state: AuthState) => {
        state.loading = false;
        state.authChecked = true;
        state.isLoggedIn = false;
        state.user = null;
        state.accessToken = null;
      })

      // --- Load Current User ---
      .addCase(loadCurrentUser.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loadCurrentUser.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.user = action.payload;
          state.isLoggedIn = true;
          state.authChecked = true;
          state.error = null;
        },
      )
      .addCase(loadCurrentUser.rejected, (state: AuthState) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.accessToken = null;
        state.authChecked = true;
      })

      // --- Logout ---
      .addCase(logout.fulfilled, () => ({
        ...initialState,
        authChecked: true,
      }))
      .addCase(logout.rejected, () => ({
        ...initialState,
        authChecked: true,
      }))

      // --- Forgot Password ---
      .addCase(forgotPassword.pending, handlePending)
      .addCase(
        forgotPassword.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.message = action.payload.message;
          state.sessionToken = action.payload.sessionToken;
          state.phone = action.payload.phone;
          state.otpExpiresAt = action.payload.expiresAt;
        },
      )
      .addCase(forgotPassword.rejected, handleRejected)

      // --- Reset Password ---
      .addCase(resetPassword.pending, handlePending)
      .addCase(resetPassword.fulfilled, (state: AuthState) => {
        state.loading = false;
        state.sessionToken = null;
        state.phone = null;
        state.otpVerified = false;
      })
      .addCase(resetPassword.rejected, handleRejected);
  },
});

export const {
  clearMessage,
  clearError,
  setPhoneNumber,
  setOtpExpiresAt,
  resetOtpState,
  setPanelSession,
  clearPanelSession,
  clearAuthState,
} = authSlice.actions;

export default authSlice.reducer;
