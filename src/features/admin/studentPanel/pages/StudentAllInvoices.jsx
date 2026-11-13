import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Printer,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  X,
  Receipt,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Calendar,
  CreditCard,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { PiInvoice } from "react-icons/pi";
import { useStudentInvoices } from "../hooks/useStudentInvoices";

import logo from "../../../../../assets/img/log-rpr.png";

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
const fmtBDT = (n) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(n || 0);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const shortId = (id = "") => (id.length > 12 ? `${id.slice(0, 8)}…` : id);

const safeFmtDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const safeFmtBDT = (amt) => {
  const val = Number(amt) || 0;
  return `৳${val.toLocaleString("en-BD")}`;
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS = {
  paid: {
    label: "Paid",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    Icon: Check,
  },
  partial: {
    label: "Partial",
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    Icon: Clock,
  },
  pending: {
    label: "Pending",
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    Icon: AlertCircle,
  },
};

// ─── SMALL UI COMPONENTS (all at module level) ────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function MetricCard({ label, value, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 shadow-sm rounded"
    >
      <div
        className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon size={14} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
          {label}
        </p>
        <p className="text-sm font-bold text-gray-800 truncate font-sans">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

function SelectionCell({ isSelected, onToggle }) {
  return (
    <button
      type="button"
      className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
        isSelected
          ? "bg-indigo-600 border-indigo-600"
          : "border-gray-300 hover:border-indigo-400"
      }`}
      onClick={onToggle}
    >
      {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
    </button>
  );
}

function SelectionHeader({ allRowsSelected, onToggle }) {
  return (
    <button
      type="button"
      className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
        allRowsSelected
          ? "bg-indigo-600 border-indigo-600"
          : "border-gray-300 hover:border-indigo-400"
      }`}
      onClick={onToggle}
    >
      {allRowsSelected && (
        <Check size={10} className="text-white" strokeWidth={3} />
      )}
    </button>
  );
}

function EmptyState({ search }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-2xl">
        <Receipt size={24} className="text-gray-300" />
      </div>
      <p className="text-xs text-gray-700">
        {search ? `No results for "${search}"` : "No invoices available"}
      </p>
    </div>
  );
}

// ─── INVOICE CARD DESIGN (Updated to match your latest layout structure) ───────
const InvoiceCard = ({ invoice, copyType }) => {
  const courseFee = invoice?.courseFee || 0;
  const admissionFee = invoice?.admissionFee || 0;
  const referenceDiscount = invoice?.referenceDiscount || 0;
  const cgpaDiscount = invoice?.cgpaDiscount || 0;
  const netDiscount = invoice?.netDiscount || 0;
  const totalDiscountOffered = invoice?.totalDiscountOffered || 0;

  const admissionFeePaid = invoice?.admissionFeePaid || 0;
  const messServiceChargePaid = invoice?.messServiceChargePaid || 0;
  const paidAmount = invoice?.paidAmount || 0;
  const previousDue = invoice?.previousDue || 0;
  const deductedFromDue = invoice?.deductedFromDue || 0;
  const returnedAmount = invoice?.returnedAmount || 0;

  const admissionFeeDue = invoice?.admissionFeeDue || 0;
  const messServiceChargeDue = invoice?.messServiceChargeDue || 0;
  const finalDue = invoice?.finalDue || 0;

  const messServiceCharge = invoice?.messServiceCharge || 0;

  // Extract createdBy name/username/email flexibly
  const createdByName =
    typeof invoice?.createdBy === "object" && invoice?.createdBy !== null
      ? invoice.createdBy.name ||
        invoice.createdBy.username ||
        invoice.createdBy.email ||
        "N/A"
      : invoice?.createdBy || invoice?.createdByName || "N/A";

  // Determine Payment Status Badge
  let statusText = "UNPAID";
  let statusBg = "#fef2f2";
  let statusColor = "#dc2626";

  if (
    finalDue === 0 &&
    (paidAmount > 0 || invoice?.invoiceType === "payment_update")
  ) {
    statusText = "PAID";
    statusBg = "#f0fdf4";
    statusColor = "#16a34a";
  } else if (paidAmount > 0 && finalDue > 0) {
    statusText = "PARTIAL PAID";
    statusBg = "#fffbebe1";
    statusColor = "#d97706";
  }

  return (
    <div
      style={{
        padding: "6mm 10mm",
        boxSizing: "border-box",
        height: "140mm",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* WATERMARK BACKGROUND LOGO */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          opacity: 0.08,
          pointerEvents: "none",
          zIndex: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={logo}
          alt="RPR Watermark"
          style={{
            width: "100%",
            maxHeight: "100mm",
            objectFit: "contain",
          }}
        />
      </div>

      {/* HEADER SECTION */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            borderBottom: "2px solid #1e293b",
            paddingBottom: "6px",
            marginBottom: "8px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "13pt",
                fontWeight: 800,
                margin: 0,
                color: "#0f172a",
                textTransform: "uppercase",
              }}
            >
              RPR DUET Admission Care
            </h1>
            <p
              style={{
                fontSize: "7.5pt",
                color: "#475569",
                margin: "2px 0 0 0",
                lineHeight: 1.3,
              }}
            >
              M.A. Samad Villa, DUET Campus, Gazipur
              <br />
              Email: rpr.group2013@gmail.com | Helpline: +880 1742 590 128
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                gap: "6px",
                justifyContent: "flex-end",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "7.5pt",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: statusBg,
                  color: statusColor,
                  border: `1px solid ${statusColor}`,
                  textTransform: "uppercase",
                }}
              >
                {statusText}
              </span>
              <span
                style={{
                  fontSize: "7.5pt",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: "#e2e8f0",
                  color: "#1e293b",
                  textTransform: "uppercase",
                }}
              >
                {copyType}
              </span>
            </div>
            <p
              style={{
                fontSize: "11pt",
                fontWeight: 800,
                margin: 0,
                color: "#0f172a",
              }}
            >
              #{invoice?.invoiceNumber || "N/A"}
            </p>
            <p
              style={{
                fontSize: "7.5pt",
                color: "#64748b",
                margin: "2px 0 0 0",
              }}
            >
              Date: {safeFmtDate(invoice?.paymentDate || invoice?.createdAt)}
            </p>
          </div>
        </div>

        {/* STUDENT & PAYMENT META */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 85px",
            gap: "8px",
            marginBottom: "8px",
            background: "#f8fafc",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "6pt",
                color: "#64748b",
                textTransform: "uppercase",
                fontWeight: 700,
                margin: "0 0 2px 0",
              }}
            >
              Student Details
            </p>
            <p
              style={{
                fontSize: "8.5pt",
                fontWeight: 700,
                margin: 0,
                color: "#0f172a",
                textTransform: "capitalize",
              }}
            >
              {invoice?.studentName || invoice?.student?.name || "N/A"}
            </p>
            <p
              style={{ fontSize: "7pt", color: "#334155", margin: "1px 0 0 0" }}
            >
              ID:{" "}
              <strong>
                {invoice?.studentUniqueId ||
                  invoice?.student?.studentId ||
                  "N/A"}
              </strong>
              {invoice?.cgpa && ` | CGPA: ${invoice.cgpa}`}
            </p>
            <p
              style={{ fontSize: "7pt", color: "#334155", margin: "1px 0 0 0" }}
            >
              Phone: {invoice?.studentPhone || invoice?.student?.phone || "N/A"}
            </p>
          </div>

          <div>
            <p
              style={{
                fontSize: "6pt",
                color: "#64748b",
                textTransform: "uppercase",
                fontWeight: 700,
                margin: "0 0 2px 0",
              }}
            >
              Payment Information
            </p>
            <p style={{ fontSize: "7pt", color: "#334155", margin: 0 }}>
              Method:{" "}
              <strong style={{ textTransform: "uppercase" }}>
                {invoice?.paymentMethod || "Cash"}
              </strong>
            </p>
            <p
              style={{ fontSize: "7pt", color: "#334155", margin: "1px 0 0 0" }}
            >
              Type:{" "}
              <span style={{ textTransform: "capitalize" }}>
                {invoice?.invoiceType?.replace("_", " ") || "Payment Update"}
              </span>
            </p>
            {invoice?.hasMessInfo && (
              <p
                style={{
                  fontSize: "7pt",
                  color: "#334155",
                  margin: "1px 0 0 0",
                }}
              >
                Mess: {invoice?.messName} (Room: {invoice?.roomNo})
              </p>
            )}
            <p
              style={{ fontSize: "7pt", color: "#334155", margin: "1px 0 0 0" }}
            >
              By:{" "}
              <span style={{ textTransform: "capitalize" }}>
                {createdByName}
              </span>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={
                "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=" +
                encodeURIComponent(
                  "https://rprduet.com/verify-invoice/" +
                    (invoice?.invoiceNumber || ""),
                )
              }
              alt="QR Code"
              style={{
                width: "15mm",
                height: "15mm",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
              }}
            />
          </div>
        </div>

        {/* FINANCIAL ACCOUNTS TABLE */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "8pt",
            marginBottom: "6px",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1.5px solid #0f172a",
                background: "#f1f5f9",
              }}
            >
              <th
                style={{
                  textAlign: "left",
                  padding: "4px 6px",
                  color: "#0f172a",
                  textTransform: "uppercase",
                }}
              >
                Fee Description / Particulars
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "4px 6px",
                  color: "#0f172a",
                  textTransform: "uppercase",
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {courseFee > 0 && (
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "4px 6px", color: "#334155" }}>
                  Course Fee
                </td>
                <td
                  style={{
                    padding: "4px 6px",
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontWeight: 600,
                  }}
                >
                  {safeFmtBDT(courseFee)}
                </td>
              </tr>
            )}

            {admissionFee > 0 && (
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "4px 6px", color: "#334155" }}>
                  Admission Fee
                </td>
                <td
                  style={{
                    padding: "4px 6px",
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontWeight: 600,
                  }}
                >
                  {safeFmtBDT(admissionFee)}
                </td>
              </tr>
            )}

            {totalDiscountOffered > 0 && (
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "4px 6px", color: "#d97706" }}>
                  Total Discount Offered{" "}
                  {cgpaDiscount > 0 ? `(CGPA: ${safeFmtBDT(cgpaDiscount)}` : ""}
                  {referenceDiscount > 0
                    ? `, Ref: ${safeFmtBDT(referenceDiscount)}`
                    : ""}
                  )
                </td>
                <td
                  style={{
                    padding: "4px 6px",
                    textAlign: "right",
                    fontFamily: "monospace",
                    color: "#d97706",
                    fontWeight: 600,
                  }}
                >
                  - {safeFmtBDT(totalDiscountOffered)}
                </td>
              </tr>
            )}

            {messServiceCharge > 0 && (
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "4px 6px", color: "#334155" }}>
                  Mess Service Charge ({invoice?.messName || "Mess"})
                </td>
                <td
                  style={{
                    padding: "4px 6px",
                    textAlign: "right",
                    fontFamily: "monospace",
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
                  borderBottom: "1px solid #e2e8f0",
                  background: "#eff6ff",
                }}
              >
                <td
                  style={{
                    padding: "4px 6px",
                    fontWeight: 700,
                    color: "#2563eb",
                  }}
                >
                  Returned Amount / Cash Back
                </td>
                <td
                  style={{
                    padding: "4px 6px",
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "#2563eb",
                  }}
                >
                  {safeFmtBDT(returnedAmount)}
                </td>
              </tr>
            )}

            <tr
              style={{
                borderBottom: "1.5px solid #16a34a",
                background: "#f0fdf4",
              }}
            >
              <td
                style={{
                  padding: "5px 6px",
                  fontWeight: 700,
                  color: "#16a34a",
                }}
              >
                Net Paid / Adjusted Amount
              </td>
              <td
                style={{
                  padding: "5px 6px",
                  textAlign: "right",
                  fontFamily: "monospace",
                  fontWeight: 800,
                  color: "#16a34a",
                  fontSize: "9pt",
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
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "5px 10px",
            borderRadius: "6px",
            background: finalDue === 0 ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${finalDue === 0 ? "#bbf7d0" : "#fecaca"}`,
            marginTop: "4px",
            boxSizing: "border-box",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "6.5pt",
                textTransform: "uppercase",
                fontWeight: 700,
                color: finalDue === 0 ? "#166534" : "#991b1b",
              }}
            >
              Account Balance Status
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "7.5pt",
                color: "#334155",
                textAlign: "left",
              }}
            >
              {finalDue === 0
                ? "All accounts and dues are fully settled."
                : "Outstanding balance remaining."}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                margin: 0,
                fontSize: "6.5pt",
                textTransform: "uppercase",
                textAlign: "right",
                fontWeight: 700,
                color: finalDue === 0 ? "#166534" : "#991b1b",
              }}
            >
              {finalDue === 0 ? "Status" : "Remaining Due"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "10pt",
                textAlign: "right",
                fontWeight: 800,
                fontFamily: "monospace",
                color: finalDue === 0 ? "#16a34a" : "#dc2626",
              }}
            >
              {finalDue === 0 ? "PAID" : safeFmtBDT(finalDue)}
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER SIGNATURES */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <p
          style={{
            fontSize: "7.5pt",
            color: "#9a2010",
            fontStyle: "italic",
            margin: "0 0 4px 0",
          }}
        >
          * Payment is non-refundable. This is an official computer-generated
          receipt.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
          }}
        >
          <div style={{ textAlign: "center", width: "120px", marginTop: "6%" }}>
            <div
              style={{
                borderBottom: "1px dashed #64748b",
                marginBottom: "2px",
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: "7.5pt",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              Student Signature
            </p>
          </div>

          <div style={{ textAlign: "center", width: "120px" }}>
            <span
              style={{ fontSize: "7.5pt", fontWeight: 600, color: "#475569" }}
            >
              ({createdByName})
            </span>
            <div
              style={{
                borderBottom: "1px dashed #64748b",
                marginBottom: "2px",
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: "7.5pt",
                fontWeight: 600,
                color: "#475569",
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
const A4FullPrint = React.forwardRef(({ invoice }, ref) => (
  <div
    ref={ref}
    style={{
      width: "210mm",
      height: "297mm",
      background: "#fff",
      boxSizing: "border-box",
      margin: "0 auto",
      position: "relative",
    }}
    className="shadow-md"
  >
    <InvoiceCard invoice={invoice} copyType="Student Copy" />

    <div
      style={{
        width: "100%",
        borderTop: "2px dashed #94a3b8",
        position: "relative",
        margin: "2mm 0",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "-9px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fff",
          padding: "0 10px",
          fontSize: "7pt",
          color: "#64748b",
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}
      >
        ✂ CUT HERE FOR OFFICE COPY
      </span>
    </div>

    <InvoiceCard invoice={invoice} copyType="Office Copy" />
  </div>
));
A4FullPrint.displayName = "A4FullPrint";

// ─── POS THERMAL RECEIPT PRINT ────────────────────────────────────────────────
const POSPrint = React.forwardRef(({ invoice }, ref) => {
  const courseFee = invoice?.courseFee || 0;
  const admissionFee = invoice?.admissionFee || 0;
  const totalDiscountOffered = invoice?.totalDiscountOffered || 0;
  const messServiceCharge = invoice?.messServiceCharge || 0;
  const paidAmount = invoice?.paidAmount || 0;
  const returnedAmount = invoice?.returnedAmount || 0;
  const finalDue = invoice?.finalDue || 0;

  const createdByName =
    typeof invoice?.createdBy === "object" && invoice?.createdBy !== null
      ? invoice.createdBy.name ||
        invoice.createdBy.username ||
        invoice.createdBy.email ||
        "N/A"
      : invoice?.createdBy || invoice?.createdByName || "N/A";

  const qrData = encodeURIComponent(
    `https://rprduet.com/verify-invoice/${invoice?.invoiceNumber || invoice?._id || ""}`,
  );

  return (
    <div
      ref={ref}
      style={{
        width: "80mm",
        padding: "5mm 4mm",
        background: "#fff",
        boxSizing: "border-box",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "9pt",
        color: "#000",
        lineHeight: "1.2",
      }}
      className="mx-auto border border-gray-200"
    >
      {/* HEADER */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "3mm",
          borderBottom: "1px solid #000",
          paddingBottom: "2.5mm",
        }}
      >
        <p style={{ margin: 0, fontWeight: "bold", fontSize: "10pt" }}>
          RPR DUET - Admission Care
        </p>
        <p style={{ margin: "1mm 0 0", fontSize: "8.5pt" }}>
          Phone: +880 1742 590 128
        </p>
        <p style={{ margin: "0.5mm 0 0", fontSize: "7pt" }}>
          Gazipur Campus, Bangladesh
        </p>
      </div>

      {/* META */}
      <div style={{ marginBottom: "2mm", fontSize: "8.5pt" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1mm",
          }}
        >
          <span>Invoice:</span>
          <strong>#{shortId(invoice?.invoiceNumber)}</strong>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1mm",
          }}
        >
          <span>Date:</span>
          <span>{safeFmtDate(invoice?.paymentDate || invoice?.createdAt)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1mm",
          }}
        >
          <span>By:</span>
          <span style={{ textTransform: "capitalize" }}>{createdByName}</span>
        </div>
        <div style={{ borderBottom: "1px dotted #888", margin: "1.5mm 0" }} />
        <p style={{ margin: "0 0 1mm 0", textTransform: "capitalize" }}>
          <strong>Student:</strong>{" "}
          {invoice?.studentName || invoice?.student?.name || "N/A"}
        </p>
        <p style={{ margin: "0 0 1mm 0" }}>
          <strong>ID:</strong>{" "}
          {invoice?.studentUniqueId || invoice?.student?.studentId || "N/A"}
        </p>
      </div>

      <div style={{ borderBottom: "1px dashed #000", margin: "2.5mm 0" }} />

      {/* BREAKDOWN */}
      <div style={{ fontSize: "8.5pt" }}>
        {courseFee > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1mm",
            }}
          >
            <span>Course Fee:</span>
            <span>{safeFmtBDT(courseFee)}</span>
          </div>
        )}

        {admissionFee > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1mm",
            }}
          >
            <span>Admission Fee:</span>
            <span>{safeFmtBDT(admissionFee)}</span>
          </div>
        )}

        {totalDiscountOffered > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1mm",
            }}
          >
            <span>Total Discount:</span>
            <span>- {safeFmtBDT(totalDiscountOffered)}</span>
          </div>
        )}

        {messServiceCharge > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1mm",
            }}
          >
            <span>Mess Charge:</span>
            <span>{safeFmtBDT(messServiceCharge)}</span>
          </div>
        )}

        {returnedAmount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1mm",
            }}
          >
            <span>Returned Amount:</span>
            <span>{safeFmtBDT(returnedAmount)}</span>
          </div>
        )}

        <div style={{ borderBottom: "1px dotted #888", margin: "1.5mm 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1mm",
            fontWeight: "bold",
          }}
        >
          <span>PAID / ADJUSTED:</span>
          <span>{safeFmtBDT(paidAmount || returnedAmount)}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1mm",
            fontWeight: "bold",
          }}
        >
          <span>REMAINING DUE:</span>
          <span>{finalDue === 0 ? "0 (PAID)" : safeFmtBDT(finalDue)}</span>
        </div>

        <div
          style={{
            border: "1px solid #000",
            padding: "2mm",
            marginTop: "2.5mm",
            textAlign: "center",
            backgroundColor: "#fafafa",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "7pt",
              fontWeight: "bold",
              letterSpacing: "0.05em",
            }}
          >
            PAYMENT STATUS
          </p>
          <p
            style={{
              margin: "0.5mm 0 0",
              fontWeight: "bold",
              fontSize: "10pt",
            }}
          >
            {finalDue === 0 ? "FULLY PAID" : "PARTIAL PAYMENT"}
          </p>
        </div>
      </div>

      <div style={{ borderBottom: "1px dashed #000", margin: "3mm 0" }} />

      {/* FOOTER + QR */}
      <div style={{ textAlign: "center", fontSize: "8pt" }}>
        <p style={{ margin: "0 0 1mm", fontWeight: "bold" }}>Thank You!</p>
        <p style={{ margin: 0, color: "#333" }}>Non-refundable receipt.</p>

        <div
          style={{
            marginTop: "2.5mm",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`}
            alt="QR Code"
            style={{ width: "16mm", height: "16mm" }}
          />
          <span style={{ fontSize: "6pt", color: "#555", marginTop: "1mm" }}>
            Scan to Verify
          </span>
        </div>
      </div>
    </div>
  );
});
POSPrint.displayName = "POSPrint";

// ─── PRINT MODAL ──────────────────────────────────────────────────────────────
export function PrintModal({ invoice, onClose }) {
  const [printType, setPrintType] = useState("a4full");
  const printRef = useRef();

  const handlePrint = () => {
    const win = window.open("", "", "width=900,height=700");
    const content = printRef.current.innerHTML;
    const pageCss =
      printType === "a4full"
        ? "@page { size: A4 portrait; margin: 0; }"
        : "@page { size: 80mm 200mm; margin: 0; }";

    const styles = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: #fff; 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact; 
        }
        ${pageCss}
        @media print { body > * { margin: 0; padding: 0; } }
      </style>
    `;

    win.document.documentElement.innerHTML = `<head><meta charset="UTF-8">${styles}</head><body>${content}</body>`;
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
      win.close();
    }, 300);
  };

  if (!invoice) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800">
              <Printer size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Print Invoice
              </p>
              <p className="text-sm font-bold text-gray-800">
                #{invoice?.invoiceNumber || "N/A"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-6 px-6 py-3 border-b border-gray-100 bg-white">
          <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Page Size:
          </p>
          {[
            { val: "a4full", label: "A4 Full Page (Student + Office Copy)" },
            { val: "pos", label: "POS Receipt (80mm Thermal)" },
          ].map((opt) => (
            <label
              key={opt.val}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                value={opt.val}
                checked={printType === opt.val}
                onChange={(e) => setPrintType(e.target.value)}
                className="w-4 h-4 cursor-pointer accent-slate-800"
              />
              <span className="text-sm font-medium text-gray-700">
                {opt.label}
              </span>
            </label>
          ))}
        </div>

        {/* Preview */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#F1F5F9]">
          {printType === "a4full" ? (
            <A4FullPrint ref={printRef} invoice={invoice} />
          ) : (
            <POSPrint ref={printRef} invoice={invoice} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white transition-all shadow-sm bg-slate-800 hover:bg-slate-900 rounded-lg"
          >
            <Printer size={15} />
            Print Document
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── COLUMN HELPER (stable) ───────────────────────────────────────────────────
const columnHelper = createColumnHelper();

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StudentAllInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);

  const {
    invoices,
    isLoading,
    isFetching,
    isDeletingStudentInvoice,
    search,
    clearSearch,
    paymentDate,
    page,
    limit,
    totalInvoices,
    totalPages,
    handleSearch,
    startDate,
    endDate,
    handlePaymentDate,
    handleStartDate,
    handleEndDate,
    handlePageChange,
    handleLimitChange,
    handleDelete,
    clearFilters,
  } = useStudentInvoices();

  // Stable columns
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <SelectionHeader
            allRowsSelected={table.getIsAllRowsSelected()}
            onToggle={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <SelectionCell
            isSelected={row.getIsSelected()}
            onToggle={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("invoiceNumber", {
        header: "Invoice",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 bg-gray-100 rounded-md">
              <Receipt size={11} className="text-gray-400" />
            </div>
            <div className="min-w-0">
              <p
                className="text-xs font-semibold text-gray-800 font-sans"
                title={info.getValue()}
              >
                {info.getValue()}
              </p>
              <p className="text-[10px] text-gray-400 font-sans">
                {info.row.original.studentUniqueId}
              </p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("studentName", {
        header: "Student",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-indigo-800 flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold uppercase">
              {(info.getValue() || "?").charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 capitalize truncate">
                {info.getValue()}
              </p>
              <p className="text-[10px] text-gray-400">
                {info.row.original.studentPhone}
              </p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor(
        (row) => row.dueAmountBeforePayment ?? row.previousDue ?? 0,
        {
          id: "dueBefore",
          header: "Due Before",
          cell: (info) => (
            <span className="text-xs text-gray-600 font-sans">
              {fmtBDT(info.getValue())}
            </span>
          ),
          sortingFn: "alphanumeric",
        },
      ),
      columnHelper.accessor("paidAmount", {
        header: "Paid",
        cell: (info) => (
          <span className="text-xs font-bold font-sans text-emerald-600">
            {fmtBDT(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor(
        (row) => row.dueAmountAfterPayment ?? row.finalDue ?? 0,
        {
          id: "remaining",
          header: "Remaining",
          cell: (info) => {
            const value = info.getValue();
            const isDue = Number(value) > 0;
            return (
              <span
                className={`text-xs font-sans font-bold ${
                  isDue ? "text-red-500" : "text-emerald-500"
                }`}
              >
                {fmtBDT(value)}
              </span>
            );
          },
        },
      ),
      columnHelper.accessor("paymentMethod", {
        header: "Method",
        cell: (info) => (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
            <CreditCard size={9} />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const inv = row.original;
          const remainingDue = Number(
            inv.dueAmountAfterPayment ?? inv.finalDue ?? 0,
          );
          const paidAmount = Number(inv.paidAmount ?? 0);

          let status = "pending";
          if (remainingDue === 0) status = "paid";
          else if (paidAmount > 0) status = "partial";

          return <StatusBadge status={status} />;
        },
      }),
      columnHelper.accessor("paymentDate", {
        header: "Date",
        cell: (info) => (
          <span className="text-[11px] text-gray-500 whitespace-nowrap">
            {fmtDate(info.getValue() || info.row.original.createdAt)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Print",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedInvoice(row.original)}
              title="Print"
              className="text-gray-600 transition-colors rounded hover:bg-indigo-50 hover:text-indigo-600"
            >
              <Printer size={16} />
            </button>
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.display({
        id: "remove",
        header: "Remove",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => handleDelete([row.original._id])}
              disabled={isDeletingStudentInvoice}
              className="text-gray-500 transition-colors hover:text-red-500"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ),
        enableSorting: false,
      }),
    ],
    [handleDelete, isDeletingStudentInvoice],
  );

  const table = useReactTable({
    data: invoices || [],
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row._id,
  });

  // Selected IDs from the table (correct source of truth)
  const selectedRowIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original._id);

  // Stats
  const stats = {
    total: (invoices || []).reduce(
      (s, i) => s + (i.dueAmountBeforePayment || 0),
      0,
    ),
    paid: (invoices || []).reduce((s, i) => s + (i.paidAmount || 0), 0),
    pending: (invoices || []).reduce(
      (s, i) => s + (i.dueAmountAfterPayment || 0),
      0,
    ),
    count: (invoices || []).length,
  };

  const thClass =
    "px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap";

  let tableContent;
  if (isLoading) {
    tableContent = (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 mb-3 border-2 border-indigo-400 rounded-full border-t-transparent animate-spin" />
        <p className="text-xs text-gray-400">Please wait...</p>
      </div>
    );
  } else if (!invoices || invoices.length === 0) {
    tableContent = <EmptyState search={search} />;
  } else {
    tableContent = (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-100 bg-gray-50/60"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`${thClass} ${header.id === "select" ? "w-8 pl-4 pr-2" : ""}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanSort() && <ArrowUpDown size={10} />}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: row.index * 0.025 }}
                className={`group border-b border-gray-100 last:border-0 transition-colors ${
                  row.getIsSelected()
                    ? "bg-indigo-50/60"
                    : "hover:bg-gray-50/80"
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-3 py-3 ${
                      cell.column.id === "select" ? "pl-4 pr-2" : ""
                    } ${cell.column.id === "actions" ? "pr-4 text-right" : ""}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      {/* Cover */}
      <div className="relative w-full h-36 bg-gradient-to-r from-slate-100 via-slate-200/70 to-zinc-100 border-b border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute right-24 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent blur-2xl" />
      </div>

      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="border-b border-[#E8E8E5] px-5 sm:px-5 py-6 sm:py-8 bg-white"
      >
        <div className="flex flex-col gap-6 -mt-20 relative z-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:items-start">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.05,
                type: "spring",
                stiffness: 200,
                damping: 18,
              }}
              className="inline-flex items-center justify-center w-24 h-24 p-5 text-4xl bg-white border shadow-md select-none rounded border-slate-200/80"
            >
              <PiInvoice className="w-auto h-auto" />
            </motion.div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight leading-tight sm:text-3xl">
                <span className="bg-gradient-to-r from-[#122054] to-[#2C2484] bg-clip-text text-transparent">
                  Student's Invoices
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7A7A75] font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                  Payment Records
                </span>
                <span className="hidden sm:inline text-[#E8E8E5]">|</span>
                <span className="flex items-center gap-1">
                  Financial Tracking & Reports
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-[#8A8A80] max-w-xl leading-relaxed pt-0.5">
                Manage and track all student invoices, payments, and outstanding
                dues in one place. Search, filter, sort, and print receipts
                effortlessly.
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <main className="px-5 py-5 mx-auto space-y-4 sm:px-5">
        {/* Controls */}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search
              size={13}
              className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search invoice, student, phone…"
              className="w-full py-2 pl-8 pr-8 text-sm transition-all bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Start Date Input */}
            <div className="relative">
              <Calendar
                size={13}
                className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDate(e.target.value)}
                className="py-2 pl-8 pr-3 text-sm transition-all bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400"
              />
            </div>

            {/* End Date Input */}
            <div className="relative">
              <Calendar
                size={13}
                className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDate(e.target.value)}
                className="py-2 pl-8 pr-3 text-sm transition-all bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400"
              />
            </div>

            {(startDate || endDate || search) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}
          </div>

          <AnimatePresence>
            {selectedRowIds.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleDelete(selectedRowIds)}
                disabled={isDeletingStudentInvoice}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded transition-all shadow-sm ml-auto"
              >
                <Trash2 size={12} />
                Delete {selectedRowIds.length}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden bg-white border border-gray-100 rounded shadow-sm"
        >
          {tableContent}

          {/* Pagination */}
          {totalInvoices > 0 && (
            <div className="flex flex-col gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50/40 sm:flex-row sm:items-center sm:justify-start">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-[14px] text-gray-500">
                  Showing{" "}
                  <strong className="text-gray-700">
                    {(page - 1) * limit + 1}–
                    {Math.min(page * limit, totalInvoices)}
                  </strong>{" "}
                  of <strong className="text-gray-700">{totalInvoices}</strong>{" "}
                  invoices
                  {selectedRowIds.length > 0 && (
                    <span className="ml-2 font-semibold text-indigo-600">
                      · {selectedRowIds.length} selected
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-1.5 text-[14px] text-gray-500">
                  <span>Entries:</span>
                  <select
                    value={limit}
                    onChange={(e) => handleLimitChange(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-200 rounded"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">
                  Page <strong className="text-gray-700">{page}</strong> of{" "}
                  <strong className="text-gray-700">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1 || isFetching}
                    className="p-1.5 text-gray-500 transition-colors border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous Page"
                  >
                    <ChevronLeft size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages || isFetching}
                    className="p-1.5 text-gray-500 transition-colors border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next Page"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Print Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <PrintModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
