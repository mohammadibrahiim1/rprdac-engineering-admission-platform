import React from 'react';

export const BillingPreviewCard = ({ preview }) => {
  return (
    <div
      style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
      }}
    >
      <h4 style={{ marginTop: 0, color: '#495057' }}>
        📊 Live Pipeline Preview (Estimated)
      </h4>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          fontSize: '14px',
        }}
      >
        <div>Reference Discount:</div>
        <div style={{ fontWeight: 'bold', textAlign: 'right' }}>
          {preview.referenceDiscount} TK
        </div>

        <div>CGPA Discount:</div>
        <div style={{ fontWeight: 'bold', textAlign: 'right' }}>
          {preview.cgpaDiscount} TK
        </div>

        <div>Net Discount (Adjusted):</div>
        <div
          style={{
            fontWeight: 'bold',
            textAlign: 'right',
            color: preview.netDiscount > 0 ? '#28a745' : '#6c757d',
          }}
        >
          {preview.netDiscount} TK
        </div>

        <div
          style={{
            borderTop: '1px solid #dee2e6',
            paddingTop: '8px',
            fontWeight: 'bold',
          }}
        >
          Total After Discount:
        </div>
        <div
          style={{
            borderTop: '1px solid #dee2e6',
            paddingTop: '8px',
            fontWeight: 'bold',
            textAlign: 'right',
            color: '#007bff',
            fontSize: '16px',
          }}
        >
          {preview?.totalAfterDiscount} TK
        </div>
      </div>
    </div>
  );
};
