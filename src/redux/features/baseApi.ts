/// <reference types="vite/client" />

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchArgs, BaseQueryFn } from '@reduxjs/toolkit/query/react';

// Central tag types
export const TAG_TYPES = [
  'Panels',
  'PanelAccess',
  'SingleAdmitCard',
  'Student',
  'Invoices',
  'Department',
  'Subjects',
  'Subject',
  'Students',
  'StudentPayment',
  'StudentAnnouncement',
  'StudentAnnouncements',
  'Announcements',
  'AdmitCard',
  'Transactions',
  'StudentActivityLogs',
  'Courses',
  'Topic',
  'Chapter',
] as const;

// Base query for opaque session authentication
export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  // Send httpOnly session cookies automatically
  credentials: 'include',

  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');

    const getCookieValue = (name: string) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    // CSRF protection
    const xsrfToken = getCookieValue('XSRF-TOKEN');

    if (xsrfToken) {
      headers.set('x-xsrf-token', String(xsrfToken));
    }

    return headers;
  },
});

// Temporary compatibility alias.
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  unknown
> = baseQuery;

// RTK Query API
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery,
  tagTypes: [...TAG_TYPES],
  endpoints: () => ({}),
});
