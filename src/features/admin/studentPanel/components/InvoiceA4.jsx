import React, { forwardRef } from 'react';
import logo from '../../../../../assets/img/log-rpr.png';

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

// ─── INVOICE CARD DESIGN (Updated to match your latest layout structure) ───────
const InvoiceCard = ({ invoice, copyType, logo }) => {
  const courseFee = invoice?.courseFee || 0;
  const admissionFee = invoice?.admissionFee || 0;
  const referenceDiscount = invoice?.referenceDiscount || 0;
  const cgpaDiscount = invoice?.cgpaDiscount || 0;
  const totalDiscountOffered = invoice?.totalDiscountOffered || 0;

  const paidAmount = invoice?.paidAmount || 0;
  const returnedAmount = invoice?.returnedAmount || 0;
  const finalDue = invoice?.finalDue || 0;

  const messServiceCharge = invoice?.messServiceCharge || 0;

  // Extract createdBy name/username/email flexibly
  const createdByName =
    typeof invoice?.createdBy === 'object' && invoice?.createdBy !== null
      ? invoice.createdBy.name ||
        invoice.createdBy.username ||
        invoice.createdBy.email ||
        'N/A'
      : invoice?.createdBy || invoice?.createdByName || 'N/A';

  // Determine Payment Status Badge
  let statusText = 'UNPAID';
  let statusBg = '#fef2f2';
  let statusColor = '#dc2626';

  if (
    finalDue === 0 &&
    (paidAmount > 0 || invoice?.invoiceType === 'payment_update')
  ) {
    statusText = 'PAID';
    statusBg = '#f0fdf4';
    statusColor = '#16a34a';
  } else if (paidAmount > 0 && finalDue > 0) {
    statusText = 'PARTIAL PAID';
    statusBg = '#fffbebe1';
    statusColor = '#d97706';
  }

  return (
    <div
      style={{
        padding: '6mm 10mm',
        boxSizing: 'border-box',
        height: '140mm',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* WATERMARK BACKGROUND LOGO */}
      {logo && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            opacity: 0.08,
            pointerEvents: 'none',
            zIndex: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={logo}
            alt="RPR Watermark"
            style={{
              width: '100%',
              maxHeight: '100mm',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* HEADER SECTION */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            borderBottom: '2px solid #1e293b',
            paddingBottom: '6px',
            marginBottom: '8px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '13pt',
                fontWeight: 800,
                margin: 0,
                color: '#0f172a',
                textTransform: 'uppercase',
              }}
            >
              RPR DUET Admission Care
            </h1>
            <p
              style={{
                fontSize: '7.5pt',
                color: '#475569',
                margin: '2px 0 0 0',
                lineHeight: 1.3,
              }}
            >
              M.A. Samad Villa, DUET Campus, Gazipur
              <br />
              Email: rpr.group2013@gmail.com | Helpline: +880 1742 590 128
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                justifyContent: 'flex-end',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  fontSize: '7.5pt',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: statusBg,
                  color: statusColor,
                  border: `1px solid ${statusColor}`,
                  textTransform: 'uppercase',
                }}
              >
                {statusText}
              </span>
              <span
                style={{
                  fontSize: '7.5pt',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#e2e8f0',
                  color: '#1e293b',
                  textTransform: 'uppercase',
                }}
              >
                {copyType}
              </span>
            </div>
            <p
              style={{
                fontSize: '11pt',
                fontWeight: 800,
                margin: 0,
                color: '#0f172a',
              }}
            >
              #{invoice?.invoiceNumber || 'N/A'}
            </p>
            <p
              style={{
                fontSize: '7.5pt',
                color: '#64748b',
                margin: '2px 0 0 0',
              }}
            >
              Date: {safeFmtDate(invoice?.paymentDate || invoice?.createdAt)}
            </p>
          </div>
        </div>

        {/* STUDENT & PAYMENT META */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 85px',
            gap: '8px',
            marginBottom: '8px',
            background: '#f8fafc',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '6pt',
                color: '#64748b',
                textTransform: 'uppercase',
                fontWeight: 700,
                margin: '0 0 2px 0',
              }}
            >
              Student Details
            </p>
            <p
              style={{
                fontSize: '8.5pt',
                fontWeight: 700,
                margin: 0,
                color: '#0f172a',
                textTransform: 'capitalize',
              }}
            >
              {invoice?.studentName || invoice?.student?.name || 'N/A'}
            </p>
            <p
              style={{ fontSize: '7pt', color: '#334155', margin: '1px 0 0 0' }}
            >
              ID:{' '}
              <strong>
                {invoice?.studentUniqueId ||
                  invoice?.student?.studentId ||
                  'N/A'}
              </strong>
              {invoice?.cgpa && ` | CGPA: ${invoice.cgpa}`}
            </p>
            <p
              style={{ fontSize: '7pt', color: '#334155', margin: '1px 0 0 0' }}
            >
              Phone: {invoice?.studentPhone || invoice?.student?.phone || 'N/A'}
            </p>
          </div>

          <div>
            <p
              style={{
                fontSize: '6pt',
                color: '#64748b',
                textTransform: 'uppercase',
                fontWeight: 700,
                margin: '0 0 2px 0',
              }}
            >
              Payment Information
            </p>
            <p style={{ fontSize: '7pt', color: '#334155', margin: 0 }}>
              Method:{' '}
              <strong style={{ textTransform: 'uppercase' }}>
                {invoice?.paymentMethod || 'Cash'}
              </strong>
            </p>
            <p
              style={{ fontSize: '7pt', color: '#334155', margin: '1px 0 0 0' }}
            >
              Type:{' '}
              <span style={{ textTransform: 'capitalize' }}>
                {invoice?.invoiceType?.replace('_', ' ') || 'Payment Update'}
              </span>
            </p>
            {invoice?.hasMessInfo && (
              <p
                style={{
                  fontSize: '7pt',
                  color: '#334155',
                  margin: '1px 0 0 0',
                }}
              >
                Mess: {invoice?.messName} (Room: {invoice?.roomNo})
              </p>
            )}
            <p
              style={{ fontSize: '7pt', color: '#334155', margin: '1px 0 0 0' }}
            >
              By:{' '}
              <span style={{ textTransform: 'capitalize' }}>
                {createdByName}
              </span>
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={
                'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=' +
                encodeURIComponent(
                  'https://rprduet.com/verify-invoice/' +
                    (invoice?.invoiceNumber || ''),
                )
              }
              alt="QR Code"
              style={{
                width: '15mm',
                height: '15mm',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
              }}
            />
          </div>
        </div>

        {/* FINANCIAL ACCOUNTS TABLE */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '8pt',
            marginBottom: '6px',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1.5px solid #0f172a',
                background: '#f1f5f9',
              }}
            >
              <th
                style={{
                  textAlign: 'left',
                  padding: '4px 6px',
                  color: '#0f172a',
                  textTransform: 'uppercase',
                }}
              >
                Fee Description / Particulars
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '4px 6px',
                  color: '#0f172a',
                  textTransform: 'uppercase',
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {courseFee > 0 && (
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '4px 6px', color: '#334155' }}>
                  Course Fee
                </td>
                <td
                  style={{
                    padding: '4px 6px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  {safeFmtBDT(courseFee)}
                </td>
              </tr>
            )}

            {admissionFee > 0 && (
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '4px 6px', color: '#334155' }}>
                  Admission Fee
                </td>
                <td
                  style={{
                    padding: '4px 6px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  {safeFmtBDT(admissionFee)}
                </td>
              </tr>
            )}

            {totalDiscountOffered > 0 && (
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '4px 6px', color: '#d97706' }}>
                  Total Discount Offered{' '}
                  {cgpaDiscount > 0 ? `(CGPA: ${safeFmtBDT(cgpaDiscount)}` : ''}
                  {referenceDiscount > 0
                    ? `, Ref: ${safeFmtBDT(referenceDiscount)}`
                    : ''}
                  )
                </td>
                <td
                  style={{
                    padding: '4px 6px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    color: '#d97706',
                    fontWeight: 600,
                  }}
                >
                  - {safeFmtBDT(totalDiscountOffered)}
                </td>
              </tr>
            )}

            {messServiceCharge > 0 && (
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '4px 6px', color: '#334155' }}>
                  Mess Service Charge ({invoice?.messName || 'Mess'})
                </td>
                <td
                  style={{
                    padding: '4px 6px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  {safeFmtBDT(messServiceCharge)}
                </td>
              </tr>
            )}

            {returnedAmount > 0 && (
              <tr
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  background: '#eff6ff',
                }}
              >
                <td
                  style={{
                    padding: '4px 6px',
                    fontWeight: 700,
                    color: '#2563eb',
                  }}
                >
                  Returned Amount / Cash Back
                </td>
                <td
                  style={{
                    padding: '4px 6px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: '#2563eb',
                  }}
                >
                  {safeFmtBDT(returnedAmount)}
                </td>
              </tr>
            )}

            <tr
              style={{
                borderBottom: '1.5px solid #16a34a',
                background: '#f0fdf4',
              }}
            >
              <td
                style={{
                  padding: '5px 6px',
                  fontWeight: 700,
                  color: '#16a34a',
                }}
              >
                Net Paid / Adjusted Amount
              </td>
              <td
                style={{
                  padding: '5px 6px',
                  textAlign: 'right',
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  color: '#16a34a',
                  fontSize: '9pt',
                }}
              >
                {safeFmtBDT(paidAmount || returnedAmount)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* SUMMARY HIGHLIGHT BOX */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '5px 10px',
            borderRadius: '6px',
            background: finalDue === 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${finalDue === 0 ? '#bbf7d0' : '#fecaca'}`,
            marginTop: '4px',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '6.5pt',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: finalDue === 0 ? '#166534' : '#991b1b',
              }}
            >
              Account Balance Status
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '7.5pt',
                color: '#334155',
                textAlign: 'left',
              }}
            >
              {finalDue === 0
                ? 'All accounts and dues are fully settled.'
                : 'Outstanding balance remaining.'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                margin: 0,
                fontSize: '6.5pt',
                textTransform: 'uppercase',
                textAlign: 'right',
                fontWeight: 700,
                color: finalDue === 0 ? '#166534' : '#991b1b',
              }}
            >
              {finalDue === 0 ? 'Status' : 'Remaining Due'}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '10pt',
                textAlign: 'right',
                fontWeight: 800,
                fontFamily: 'monospace',
                color: finalDue === 0 ? '#16a34a' : '#dc2626',
              }}
            >
              {finalDue === 0 ? 'PAID' : safeFmtBDT(finalDue)}
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER SIGNATURES */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p
          style={{
            fontSize: '7.5pt',
            color: '#9a2010',
            fontStyle: 'italic',
            margin: '0 0 4px 0',
          }}
        >
          * Payment is non-refundable. This is an official computer-generated
          receipt.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
          }}
        >
          <div style={{ textAlign: 'center', width: '120px', marginTop: '6%' }}>
            <div
              style={{
                borderBottom: '1px dashed #64748b',
                marginBottom: '2px',
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: '7.5pt',
                fontWeight: 600,
                color: '#475569',
              }}
            >
              Student Signature
            </p>
          </div>

          <div style={{ textAlign: 'center', width: '120px' }}>
            <span
              style={{ fontSize: '7.5pt', fontWeight: 600, color: '#475569' }}
            >
              ({createdByName})
            </span>
            <div
              style={{
                borderBottom: '1px dashed #64748b',
                marginBottom: '2px',
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: '7.5pt',
                fontWeight: 600,
                color: '#475569',
              }}
            >
              Authorized Signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── A4 PRINT LAYOUT ──────────────────────────────────────────────────────────
const InvoiceA4 = React.forwardRef(({ invoice, logo }, ref) => (
  <div
    ref={ref}
    style={{
      width: '210mm',
      height: '297mm',
      background: '#fff',
      boxSizing: 'border-box',
      margin: '0 auto',
      position: 'relative',
    }}
    className="shadow-md"
  >
    <InvoiceCard invoice={invoice} copyType="Student Copy" logo={logo} />

    <div
      style={{
        width: '100%',
        borderTop: '2px dashed #94a3b8',
        position: 'relative',
        margin: '2mm 0',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '-9px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          padding: '0 10px',
          fontSize: '7pt',
          color: '#64748b',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        ✂ CUT HERE FOR OFFICE COPY
      </span>
    </div>

    <InvoiceCard invoice={invoice} copyType="Office Copy" logo={logo} />
  </div>
));
InvoiceA4.displayName = 'InvoiceA4';

export default InvoiceA4;
