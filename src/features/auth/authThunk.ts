import { baseApi, baseQueryWithReauth } from "@/api/baseApi";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";

// Helper error parser for RTK Query fetchBaseQuery error structure
const getErrorMessage = (error: unknown, defaultMsg: string): string => {
  const err = error as {
    data?: { message?: string; error?: string };
    message?: string;
  };
  return err?.data?.message || err?.data?.error || err?.message || defaultMsg;
};

// Helper to format thunkAPI for baseQueryWithReauth
const getBaseQueryApi = (thunkAPI: unknown): BaseQueryApi => {
  const api = thunkAPI as {
    signal: AbortSignal;
    abort: () => void;
    dispatch: unknown;
    getState: unknown;
    extra?: unknown;
  };
  return {
    signal: api.signal,
    abort: api.abort,
    dispatch: api.dispatch as BaseQueryApi["dispatch"],
    getState: api.getState as BaseQueryApi["getState"],
    extra: api.extra,
    endpoint: "",
    type: "query",
    forced: false,
  };
};

// 1. Initialize CSRF Token & Visitor Session
export const initCsrfSession = createAsyncThunk<
  unknown,
  void,
  { rejectValue: string }
>("auth/initCsrfSession", async (_, thunkAPI) => {
  try {
    const result = await baseQueryWithReauth(
      {
        url: "/csrf/token/get",
        method: "GET",
      },
      getBaseQueryApi(thunkAPI),
      {},
    );

    if (result.error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(result.error, "CSRF Init Failed"),
      );
    }

    return result.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error, "CSRF Init Failed"));
  }
});

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (
    payload: {
      phone: string;
      turnstileToken?: string;
      purpose: string;
    },
    thunkAPI,
  ) => {
    try {
      const result = await baseQueryWithReauth(
        {
          url: "/auth/send-otp",
          method: "POST",

          body: {
            phone: payload.phone,
            purpose: payload.purpose,
            turnstileToken: payload.turnstileToken,
          },
        },
        getBaseQueryApi(thunkAPI),
        {},
      );

      if (result.error) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(result.error, "Failed to send OTP"),
        );
      }

      return result.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Failed to send OTP"),
      );
    }
  },
);

// 3. Verify OTP
export const verifyOtp = createAsyncThunk<
  unknown,
  { phone: string; otp: string; purpose: string },
  { rejectValue: string }
>("auth/verifyOtp", async (values, thunkAPI) => {
  try {
    const result = await baseQueryWithReauth(
      {
        url: "/auth/verify-otp",
        method: "POST",
        body: {
          phone: values.phone,
          otp: values.otp,
          purpose: values.purpose,
        },
      },
      getBaseQueryApi(thunkAPI),
      {},
    );

    if (result.error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(result.error, "Failed to verify OTP"),
      );
    }

    return result.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to verify OTP"),
    );
  }
});

// 4. User Registration (FormData or Object support with Turnstile)
// Register User
export const register = createAsyncThunk<
  unknown,
  {
    formData: FormData;
    turnstileToken: string;
  },
  { rejectValue: string }
>("auth/register", async (payload, thunkAPI) => {
  try {
    const result = await baseQueryWithReauth(
      {
        url: "/auth/register",
        method: "POST",
        body: payload.formData,
        headers: {
          "x-turnstile-token": payload.turnstileToken,
        },
      },
      getBaseQueryApi(thunkAPI),
      {},
    );

    if (result.error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(result.error, "Registration failed"),
      );
    }

    return result.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Registration failed"),
    );
  }
});

// 5. User Login (Supports Turnstile Token)
export const login = createAsyncThunk<
  unknown,
  { phone: string; password: string; cfTurnstileToken?: string },
  { rejectValue: string }
>("auth/login", async (values, thunkAPI) => {
  try {
    const result = await baseQueryWithReauth(
      {
        url: "/auth/login",
        method: "POST",
        body: values,
      },
      getBaseQueryApi(thunkAPI),
      {},
    );

    if (result.error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(result.error, "Login failed. Please try again."),
      );
    }

    // 2. RTK Query API cache wipe for old UI clear hoy
    thunkAPI.dispatch(baseApi.util.resetApiState());

    return result.data;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(err, "Login failed. Please try again."),
    );
  }
});

// 6. Refresh Access Token
export const refreshAccessToken = createAsyncThunk<
  unknown,
  void,
  { rejectValue: string }
>("auth/refreshAccessToken", async (_, thunkAPI) => {
  try {
    const result = await baseQueryWithReauth(
      {
        url: "/auth/refresh",
        method: "GET",
      },
      getBaseQueryApi(thunkAPI),
      {},
    );

    if (result.error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(result.error, "Authentication required."),
      );
    }

    return result.data;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(err, "Authentication required."),
    );
  }
});

// 7. Load / Refetch Current User
export const loadCurrentUser = createAsyncThunk<
  unknown,
  void,
  { rejectValue: string }
>("auth/loadCurrentUser", async (_, thunkAPI) => {
  try {
    const result = await baseQueryWithReauth(
      {
        url: "/auth/current/me",
        method: "GET",
      },
      getBaseQueryApi(thunkAPI),
      {},
    );

    if (result.error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(result.error, "Failed to load user"),
      );
    }

    const resData = result.data as {
      success?: boolean;
      user?: unknown;
      [key: string]: unknown;
    };
    if (!resData?.success || !resData?.user) {
      return thunkAPI.rejectWithValue("Invalid session response.");
    }

    return resData?.user || resData;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(err, "Failed to load user"),
    );
  }
});

// 8. Logout
export const logout = createAsyncThunk<unknown, void, { rejectValue: string }>(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const result = await baseQueryWithReauth(
        {
          url: "/auth/logout",
          method: "POST",
        },
        getBaseQueryApi(thunkAPI),
        {},
      );

      if (result.error) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(result.error, "Logout failed."),
        );
      }

      return result.data;
    } catch (err: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(err, "Logout failed."));
    }
  },
);

// 9. Forgot Password (Supports Turnstile)
export const forgotPassword = createAsyncThunk<
  { sessionToken?: string; expiresAt?: string; phone: string; message: string },
  { phone: string; turnstileToken?: string },
  { rejectValue: string }
>("auth/forgotPassword", async (payload, thunkAPI) => {
  try {
    const result = await baseQueryWithReauth(
      {
        url: "/auth/forgot-password",
        method: "POST",
        body: {
          phone: payload.phone,
          turnstileToken: payload.turnstileToken,
        },
      },
      getBaseQueryApi(thunkAPI),
      {},
    );

    if (result.error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(result.error, "Failed to process request"),
      );
    }

    const response = result.data as {
      sessionToken?: string;
      expiresAt?: string;
      phone?: string;
      message?: string;
    };
    return {
      ...(response?.sessionToken !== undefined && {
        sessionToken: response.sessionToken,
      }),
      ...(response?.expiresAt !== undefined && {
        expiresAt: response.expiresAt,
      }),
      phone: response?.phone || payload.phone,
      message: response?.message || "OTP sent for reset password",
    };
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to process request"),
    );
  }
});

// 10. Reset Password
export const resetPassword = createAsyncThunk<
  unknown,
  { otp: string; newPassword: string },
  { rejectValue: string }
>("auth/resetPassword", async (values, thunkAPI) => {
  try {
    const result = await baseQueryWithReauth(
      {
        url: "/auth/reset-password",
        method: "PATCH",
        body: {
          otp: values.otp,
          newPassword: values.newPassword,
        },
      },
      getBaseQueryApi(thunkAPI),
      {},
    );

    if (result.error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(result.error, "Failed to reset password"),
      );
    }

    return result.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to reset password"),
    );
  }
});
