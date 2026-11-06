export interface LoginFormValues {
  phone: string;
  password: string;
  cfTurnstileToken?: string;
}

export interface LoginApiResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    user: {
      id: string;
      phone: string;
      role: string;
    };
  };
}
