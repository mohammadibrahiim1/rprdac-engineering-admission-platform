import React, { forwardRef } from 'react';

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
const safeFmtBDT = (n) =>
  Number(n || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const safeFmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-BD', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const shortId = (id) => {
  if (!id) return 'N/A';
  const str = String(id);
  return str.length > 12 ? str.slice(-8) : str;
};

// ─── POS THERMAL RECEIPT PRINT ────────────────────────────────────────────────
const InvoicePOS = React.forwardRef(({ invoice }, ref) => {
  const courseFee = invoice?.courseFee || 0;
  const admissionFee = invoice?.admissionFee || 0;
  const totalDiscountOffered = invoice?.totalDiscountOffered || 0;
  const messServiceCharge = invoice?.messServiceCharge || 0;
  const paidAmount = invoice?.paidAmount || 0;
  const returnedAmount = invoice?.returnedAmount || 0;
  const finalDue = invoice?.finalDue || 0;

  // Extract createdBy name/username/email flexibly
  const createdByName =
    typeof invoice?.createdBy === 'object' && invoice?.createdBy !== null
      ? invoice.createdBy.name ||
        invoice.createdBy.username ||
        invoice.createdBy.email ||
        'N/A'
      : invoice?.createdBy || invoice?.createdByName || 'N/A';

  const qrData = encodeURIComponent(
    `https://rprduet.com/verify-invoice/${invoice?.invoiceNumber || invoice?._id || ''}`,
  );

  return (
    <div
      ref={ref}
      style={{
        width: '80mm',
        padding: '5mm 4mm',
        background: '#fff',
        boxSizing: 'border-box',
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '9pt',
        color: '#000',
        lineHeight: '1.2',
      }}
      className="mx-auto border border-gray-200"
    >
      {/* HEADER */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '3mm',
          borderBottom: '1px solid #000',
          paddingBottom: '2.5mm',
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '10pt' }}>
          RPR DUET - Admission Care
        </p>
        <p style={{ margin: '1mm 0 0', fontSize: '8.5pt' }}>
          Phone: +880 1742 590 128
        </p>
        <p style={{ margin: '0.5mm 0 0', fontSize: '7pt' }}>
          Gazipur Campus, Bangladesh
        </p>
      </div>

      {/* META */}
      <div style={{ marginBottom: '2mm', fontSize: '8.5pt' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1mm',
          }}
        >
          <span>Invoice:</span>
          <strong>#{shortId(invoice?.invoiceNumber)}</strong>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1mm',
          }}
        >
          <span>Date:</span>
          <span>{safeFmtDate(invoice?.paymentDate || invoice?.createdAt)}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1mm',
          }}
        >
          <span>By:</span>
          <span style={{ textTransform: 'capitalize' }}>{createdByName}</span>
        </div>
        <div style={{ borderBottom: '1px dotted #888', margin: '1.5mm 0' }} />
        <p style={{ margin: '0 0 1mm 0', textTransform: 'capitalize' }}>
          <strong>Student:</strong>{' '}
          {invoice?.studentName || invoice?.student?.name || 'N/A'}
        </p>
        <p style={{ margin: '0 0 1mm 0' }}>
          <strong>ID:</strong>{' '}
          {invoice?.studentUniqueId || invoice?.student?.studentId || 'N/A'}
        </p>
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '2.5mm 0' }} />

      {/* BREAKDOWN */}
      <div style={{ fontSize: '8.5pt' }}>
        {courseFee > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1mm',
            }}
          >
            <span>Course Fee:</span>
            <span>{safeFmtBDT(courseFee)}</span>
          </div>
        )}

        {admissionFee > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1mm',
            }}
          >
            <span>Admission Fee:</span>
            <span>{safeFmtBDT(admissionFee)}</span>
          </div>
        )}

        {totalDiscountOffered > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1mm',
            }}
          >
            <span>Total Discount:</span>
            <span>- {safeFmtBDT(totalDiscountOffered)}</span>
          </div>
        )}

        {messServiceCharge > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1mm',
            }}
          >
            <span>Mess Charge:</span>
            <span>{safeFmtBDT(messServiceCharge)}</span>
          </div>
        )}

        {returnedAmount > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1mm',
            }}
          >
            <span>Returned Amount:</span>
            <span>{safeFmtBDT(returnedAmount)}</span>
          </div>
        )}

        <div style={{ borderBottom: '1px dotted #888', margin: '1.5mm 0' }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1mm',
            fontWeight: 'bold',
          }}
        >
          <span>PAID / ADJUSTED:</span>
          <span>{safeFmtBDT(paidAmount || returnedAmount)}</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1mm',
            fontWeight: 'bold',
          }}
        >
          <span>REMAINING DUE:</span>
          <span>{finalDue === 0 ? '0 (PAID)' : safeFmtBDT(finalDue)}</span>
        </div>

        <div
          style={{
            border: '1px solid #000',
            padding: '2mm',
            marginTop: '2.5mm',
            textAlign: 'center',
            backgroundColor: '#fafafa',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '7pt',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
            }}
          >
            PAYMENT STATUS
          </p>
          <p
            style={{
              margin: '0.5mm 0 0',
              fontWeight: 'bold',
              fontSize: '10pt',
            }}
          >
            {finalDue === 0 ? 'FULLY PAID' : 'PARTIAL PAYMENT'}
          </p>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '3mm 0' }} />

      {/* FOOTER + QR */}
      <div style={{ textAlign: 'center', fontSize: '8pt' }}>
        <p style={{ margin: '0 0 1mm', fontWeight: 'bold' }}>Thank You!</p>
        <p style={{ margin: 0, color: '#333' }}>Non-refundable receipt.</p>

        <div
          style={{
            marginTop: '2.5mm',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`}
            alt="QR Code"
            style={{ width: '16mm', height: '16mm' }}
          />
          <span style={{ fontSize: '6pt', color: '#555', marginTop: '1mm' }}>
            Scan to Verify
          </span>
        </div>
      </div>
    </div>
  );
});
InvoicePOS.displayName = 'InvoicePOS';

export default InvoicePOS;
