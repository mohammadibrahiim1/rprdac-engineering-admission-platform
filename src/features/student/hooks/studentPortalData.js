import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetStudentExamResultQuery } from '../../meritlist/services/meritApi';
import { useGetStudentInvoiceByIDQuery } from '../../admin/studentPanel/services/api/studentInvoiceApi';

export const useStudentPortalData = () => {
  const { student } = useSelector((state) => state?.studentAuth);
  const studentId = student?._id;

  const money = (amount) =>
    `${Number(amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'BDT' })}`;

  // ==========================================
  // 1. INVOICE QUERY & STATES
  // ==========================================
  const {
    data: invoiceApiResponse,
    isLoading: isInvoiceLoading,
    isFetching: isInvoiceFetching,
    error: invoiceError,
    refetch: refetchInvoices,
  } = useGetStudentInvoiceByIDQuery(studentId, {
    skip: !studentId,
  });

  const studentInvoices = invoiceApiResponse?.data || [];
  const isInvoiceError = !!invoiceError;
  const invoiceErrorMessage =
    invoiceError?.data?.message || 'Failed to load invoices.';

  // ==========================================
  // 2. EXAM RESULT QUERY & STATES
  // ==========================================
  const {
    data: examApiResponse,
    isLoading: isExamLoading,
    isFetching: isExamFetching,
    error: examError,
    refetch: refetchExamResult,
  } = useGetStudentExamResultQuery(undefined, {
    skip: !studentId,
  });

  const examData = examApiResponse?.data || examApiResponse || [];
  const isExamError = !!examError;
  const examErrorMessage =
    examError?.data?.message || 'Failed to load exam results.';

  // ==========================================
  // 3. STUDENT INFO & LOGGING
  // ==========================================
  const studentInfo = student || {};

  // ==========================================
  // 4. RETURN CLEAN OBJECT WITH SEPARATED STATES
  // ==========================================
  return {
    studentInfo,
    money,

    // --- Invoice Data & States ---
    studentInvoices,
    invoiceApiResponse,
    isInvoiceLoading,
    isInvoiceFetching,
    isInvoiceError,
    invoiceErrorMessage,
    refetchInvoices,

    // --- Exam Data & States ---
    examData,
    examApiResponse,
    isExamLoading,
    isExamFetching,
    isExamError,
    examErrorMessage,
    refetchExamResult,
  };
};
