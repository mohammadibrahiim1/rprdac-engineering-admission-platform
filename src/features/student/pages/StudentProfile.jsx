import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { AlertCircle, Loader2, Printer } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useGetStudentByIdQuery } from '../../../../redux/features/student/studentApi';
import logo from '../../../../assets/img/log-rpr.png';
import Loader from '../../../../components/Loader';
import signature from '../../../../assets/img/rpr-director-sign.png';

const DEPARTMENTS = ['CE', 'EEE', 'CSE', 'TE', 'ARCH', 'CHE', 'ME/IPE/MME'];

const StudentProfile = () => {
  const { id } = useParams();
  const { data, error, isLoading, isError } = useGetStudentByIdQuery(id);

  const studentInfo = data?.data;

  const SERVER = import.meta.env.VITE_SERVER_BASE_URL;
  const formRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => formRef.current,
    documentTitle: `${studentInfo?.studentId || 'student'}_admission_form`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 8mm 0mm !important;
      }
      @media print {
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          overflow: hidden;
        }
        .print-container {
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
          width: 100% !important;
        }
      }
    `,
  });

  return (
    <div className="min-h-screen print:bg-white print:min-h-0 capitalize">
      {/* ── Top Custom Header Section (Hidden on Print) ── */}
      <div className="bg-white border-b border-gray-200 print:hidden sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-[900px] mx-auto px-6 py-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {studentInfo?.name || 'Student Admission Form'}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              ID:{' '}
              <span className="text-[#55004B] font-semibold">
                {studentInfo?.studentId || 'N/A'}
              </span>
            </p>
          </div>
          <button
            onClick={handlePrint}
            disabled={isLoading || isError}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-md bg-[#55004B] hover:bg-[#6a0060] active:bg-[#3d0036] text-white transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer size={16} />
            <span className="font-serifbn">প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="print-container flex flex-col items-center py-6 px-4 print:p-0 print:py-0 w-full">
        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center bg-white border border-gray-100 shadow-xl rounded-md"
            style={{ width: '210mm', height: '297mm' }}
          >
            <Loader2 className="w-12 h-12 text-[#55004B] animate-spin mb-4" />
            <Loader />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-10 max-w-xl w-full border border-red-200 shadow-lg bg-red-50 rounded-md mt-10">
            <AlertCircle className="w-14 h-14 mb-4 text-red-500" />
            <p className="text-base font-medium text-red-600">
              {error?.data?.message ||
                'Something went wrong! Please, try again.'}
            </p>
          </div>
        ) : (
          /* ── Printable A4 Form Wrapper ── */
          <div
            ref={formRef}
            style={{
              width: '100%',
              maxWidth: '190mm',
              height: '280mm',
              background: 'linear-gradient(135deg, #FDFCF0 0%, #FAF9E6 100%)',
              // fontFamily: "'kalpurush', 'Times New Roman', serif",
              padding: '8mm 10mm',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              pageBreakInside: 'avoid',
              margin: '0 auto',
            }}
            className="shadow-2xl print:shadow-none print:rounded-none rounded-md border border-gray-100 print:border-0 font-serifbn"
          >
            {/* Background Watermark Logo */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: 0.05,
              }}
            >
              <img
                src={logo}
                alt="logo"
                style={{ width: '65%', height: '65%', objectFit: 'contain' }}
              />
            </div>

            {/* Form Inner Content */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              {/* Top Bismillah */}
              <p
                style={{
                  textAlign: 'center',
                  fontStyle: 'italic',
                  fontSize: '12px',
                  marginBottom: '4px',
                }}
              >
                বিসমিল্লাহির রাহমানির রাহীম
              </p>

              {/* ── Enhanced Modern Header Section ── */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid #55004B',
                  paddingBottom: '6px',
                  marginBottom: '8px',
                }}
              >
                {/* Logo & Brand Details */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <img
                    src={logo}
                    alt="RPR Logo"
                    style={{
                      width: '70px',
                      height: '70px',
                      objectFit: 'contain',
                    }}
                  />
                  <div>
                    <h1
                      style={{
                        fontSize: '28px',
                        fontWeight: '900',
                        margin: 0,
                        lineHeight: '1.1',
                        fontFamily: "'Inter', sans-serif",
                        background:
                          'linear-gradient(45deg, #00b4d8, #55004B, #b5179e)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px',
                      }}
                    >
                      RPR DUET Admission Care
                    </h1>
                    <p
                      style={{
                        fontSize: '11px',
                        color: '#555',
                        fontStyle: 'italic',
                        margin: '1px 0 0 0',
                        fontWeight: '500',
                      }}
                    >
                      An Excellent Guide Center For Bright Future
                    </p>
                  </div>
                </div>

                {/* Student Passport Photo Container */}
                <div
                  style={{
                    width: '90px',
                    height: '105px',
                    border: '2px solid #55004B',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {studentInfo?.studentPhoto ? (
                    <img
                      src={`${SERVER}${studentInfo.studentPhoto}`}
                      alt={studentInfo?.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        textAlign: 'center',
                      }}
                    >
                      Passport Photo
                    </span>
                  )}
                </div>
              </div>

              {/* Admission Badge & Form No Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '700' }}>
                  ফরম নং -{' '}
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: '80px',
                      borderBottom: '1px dotted #333',
                    }}
                  />
                </div>
                <div>
                  <span
                    style={{
                      background: '#55004B',
                      color: '#FFD700',
                      border: '1.5px solid #FFD700',
                      borderRadius: '6px',
                      padding: '2px 18px',
                      fontSize: '14px',
                      fontWeight: '700',
                    }}
                  >
                    ভর্তি ফরম
                  </span>
                </div>
                <div style={{ width: '80px' }} />
              </div>

              {/* ── SECTION 1 — Personal Info ── */}
              <SectionTitle>ছাত্র/ছাত্রীর ব্যক্তিগত পরিচয়</SectionTitle>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  marginBottom: '8px',
                }}
              >
                <FormRow>
                  <Label>১) (ক) নাম (বাংলায়) :</Label>
                  <DottedValue>{studentInfo?.nameInBangla}</DottedValue>
                  <Spacer width="12px" />
                  <Label>(ইংরেজিতে) :</Label>
                  <DottedValue style={{ fontWeight: '600' }}>
                    {studentInfo?.name}
                  </DottedValue>
                </FormRow>

                <FormRow indent>
                  <Label>(খ) মোবাইল নম্বর : (১)</Label>
                  <DottedValue>{studentInfo?.phone}</DottedValue>
                  <Spacer width="12px" />
                  <Label>(২) WhatsApp :</Label>
                  <DottedValue>{studentInfo?.phone}</DottedValue>
                </FormRow>

                <FormRow>
                  <Label>২) (ক) অভিভাবকের নাম :</Label>
                  <DottedValue>{studentInfo?.guardianName}</DottedValue>
                  <Spacer width="12px" />
                  <Label>সম্পর্ক :</Label>
                  <DottedValue style={{ maxWidth: '90px' }}>
                    {studentInfo?.relationWithGuardian}
                  </DottedValue>
                </FormRow>

                <FormRow indent>
                  <Label>(খ) মোবাইল নম্বর : (১)</Label>
                  <DottedValue>{studentInfo?.guardianPhone}</DottedValue>
                  <Spacer width="12px" />
                  <Label>(২) WhatsApp :</Label>
                  <DottedValue>{studentInfo?.guardianWhatsAppNum}</DottedValue>
                </FormRow>

                <FormRow>
                  <Label>৩) (ক) স্থায়ী ঠিকানা : গ্রাম/মহল্লা/সড়ক :</Label>
                  <DottedValue>
                    {studentInfo?.permanentVillage || 'N/A'}
                  </DottedValue>
                  <Spacer width="12px" />
                  <Label>পোস্ট কোড :</Label>
                  <DottedValue style={{ maxWidth: '70px' }}>
                    {studentInfo?.permanentPostcode || 'N/A'}
                  </DottedValue>
                </FormRow>

                <FormRow indent>
                  <Label>থানা/উপজেলা :</Label>
                  <DottedValue>{studentInfo?.permanentUpozilla}</DottedValue>
                  <Spacer width="15px" />
                  <Label>জেলা :</Label>
                  <DottedValue>{studentInfo?.permanentZilla}</DottedValue>
                </FormRow>

                <FormRow indent>
                  <Label>(খ) বর্তমান ঠিকানা : বাসা/মেসের নাম :</Label>
                  <DottedValue>{studentInfo?.mess || 'N/A'}</DottedValue>
                  <Spacer width="12px" />
                  <Label>রুম নং :</Label>
                  <DottedValue style={{ maxWidth: '60px' }}>
                    {studentInfo?.room || 'N/A'}
                  </DottedValue>
                </FormRow>

                <FormRow>
                  <Label>৪) রক্তের গ্রুপ :</Label>
                  <DottedValue style={{ maxWidth: '90px', fontWeight: '600' }}>
                    {studentInfo?.bloodGroup}
                  </DottedValue>
                  <Spacer style={{ flex: 1 }} />
                </FormRow>
              </div>

              {/* ── SECTION 2 — Academic Info ── */}
              <SectionTitle>ছাত্র/ছাত্রীর শিক্ষাগত যোগ্যতা</SectionTitle>
              <div
                style={{
                  fontSize: '12.5px',
                  marginBottom: '3px',
                  fontWeight: '500',
                }}
              >
                ৫) মাধ্যমিক ও ডিপ্লোমা পরীক্ষার ফলাফল :
              </div>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12.5px',
                  marginBottom: '8px',
                  border: '1.5px solid #444',
                }}
              >
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    {[
                      'Name of Exam',
                      'Group / Technology',
                      'Board',
                      'Passing Year',
                      'GPA / CGPA',
                    ].map((header, index) => (
                      <th
                        key={index}
                        style={{
                          border: '1px solid #444',
                          padding: '4px 6px',
                          textAlign: 'center',
                          fontWeight: '700',
                          fontFamily: 'serif',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tdStyle}>SSC</td>
                    <td style={tdStyle}>{studentInfo?.sscGroup || 'N/A'}</td>
                    <td style={tdStyle}>{studentInfo?.sscBoard || 'N/A'}</td>
                    <td style={tdStyle}>
                      {studentStyleValue(studentInfo?.sscPassingYear)}
                    </td>
                    <td style={tdStyle}>
                      {studentStyleValue(studentInfo?.sscGpa)}
                    </td>
                  </tr>
                  <tr>
                    <td style={tdStyle}>Diploma in Engineering</td>
                    <td style={tdStyle}>
                      {studentInfo?.diplomaGroup || 'N/A'}
                    </td>
                    <td style={tdStyle}>
                      {studentInfo?.diplomaBoard || 'N/A'}
                    </td>
                    <td style={tdStyle}>
                      {studentStyleValue(studentInfo?.diplomaPassingYear)}
                    </td>
                    <td style={tdStyle}>
                      {studentStyleValue(studentInfo?.cgpa)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Department Checkboxes */}
              <div style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    fontSize: '12.5px',
                    marginBottom: '3px',
                    fontWeight: '500',
                  }}
                >
                  ৬) ডুয়েট-এ যে ডিপার্টমেন্টে এ্যাডমিশন দিতে আগ্রহী (টিক চিহ্ন
                  দিন) :
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '3px 0',
                  }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <label
                      key={dept}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12.5px',
                        fontFamily: 'sans-serif',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={studentInfo?.department === dept}
                        readOnly
                        style={{
                          accentColor: '#55004B',
                          width: '13px',
                          height: '13px',
                        }}
                      />
                      <span
                        style={{
                          fontWeight:
                            studentInfo?.department === dept ? '700' : '400',
                        }}
                      >
                        {dept}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── SECTION 3 — Terms & Conditions ── */}
              <div style={{ marginBottom: '8px' }}>
                <SectionTitle>
                  RPR DUET Admission Care কর্তৃক প্রদত্ত শর্তাবলী
                </SectionTitle>
                <div
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.45',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1px',
                    color: '#334155',
                  }}
                >
                  <div>
                    (ক) ছাত্র/ছাত্রীকে নিয়মিত ক্লাস করতে হবে এবং সাপ্তাহিক
                    অন্যান্য সকল পরীক্ষা দিতে বাধ্য থাকবে। অন্যথায় অভিভাবকের
                    নিকট জানানো হলে ছাত্র/ছাত্রীর কোন আপত্তি থাকবে না।
                  </div>
                  <div>
                    (খ) কোচিং থেকে যখনই ক্লাস নেওয়া হোক না কেন, তাতে
                    ছাত্র/ছাত্রীর কোন আপত্তি থাকতে পারবে না।
                  </div>
                  <div>(গ) কোচিং এর শৃঙ্খলা বজায় রাখতে হবে।</div>
                  <div style={{ color: '#df1c24', fontWeight: '700' }}>
                    (ঘ) প্রদানকৃত কোর্স ফি, কোন অবস্থাতেই ফেরত যোগ্য নহে।
                  </div>
                </div>
              </div>

              {/* Declaration Paragraph */}
              <div
                style={{
                  fontSize: '14px',
                  textTransform: 'capitalize',
                  lineHeight: '1.5',
                  textAlign: 'justify',
                  marginBottom: '20px',
                  color: '#1e293b',
                }}
              >
                আমি{' '}
                <span
                  style={{
                    color: '#55004B',
                    fontWeight: '700',
                    borderBottom: '1px solid #55004B',
                    padding: '0 2px',
                  }}
                >
                  {studentInfo?.name}
                </span>{' '}
                এই মর্মে প্রত্যয়ন করছি যে, এই ফর্মে প্রদত্ত সকল তথ্য সঠিক ও
                সত্য এবং আমার সজ্ঞানে উল্লেখিত। এছাড়াও কোচিং কর্তৃক প্রদত্ত সকল
                শর্ত আমি মেনে নিলাম এবং শর্তানুযায়ী আমি চলতে বাধ্য থাকবো। এতে
                কোন ত্রুটি হলে এবং প্রদত্ত কোন তথ্য ভুল প্রমানিত হলে, কোচিং
                কর্তৃপক্ষ আমার বিরুদ্ধে যে কোন ব্যবস্থা নিতে পারবে এবং তাতে আমার
                কোন আপত্তি থাকবে না। সন্তানের/আমার ভর্তি বাতিল হতে পারে এবং কোন
                অর্থ ফেরত পাওয়ার দাবি থাকবে না।
              </div>

              {/* ── Footer Section: Info Box & Signatures ── */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: 'auto',
                }}
              >
                {/* Office Info Box */}
                <div
                  style={{
                    border: '1.5px solid #55004B',
                    borderRadius: '6px',
                    padding: '5px 8px',
                    fontSize: '12.5px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    minWidth: '160px',
                    background: '#fff',
                  }}
                >
                  <InfoBoxRow label="ব্যাচ :" value={studentInfo?.batch} />
                  <InfoBoxRow
                    label="আইডি নং :"
                    value={studentInfo?.studentId}
                  />
                  <InfoBoxRow
                    label="রশিদ নং :"
                    value={studentInfo?.receiptNo}
                  />
                </div>

                {/* Signatures Row */}
                <div
                  style={{
                    display: 'flex',
                    gap: '50px',
                    fontSize: '12.5px',
                    alignItems: 'flex-end',
                  }}
                >
                  {/* কর্তৃপক্ষের স্বাক্ষর */}
                  <div style={{ textAlign: 'center', minWidth: '130px' }}>
                    <div
                      style={{
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4px',
                      }}
                    >
                      <img
                        src={signature}
                        alt="Authority Signature"
                        style={{ maxHeight: '40px', objectFit: 'contain' }}
                      />
                    </div>
                    <div
                      style={{
                        borderTop: '1.5px solid #444',
                        paddingTop: '4px',
                        fontWeight: '500',
                      }}
                    >
                      কর্তৃপক্ষের স্বাক্ষর
                    </div>
                  </div>

                  {/* ছাত্র/ছাত্রীর স্বাক্ষর */}
                  <div style={{ textAlign: 'center', minWidth: '130px' }}>
                    <div
                      style={{
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4px',
                      }}
                    >
                      <p style={{ maxHeight: '0px', objectFit: 'contain' }}>
                        {studentInfo?.name}
                      </p>
                    </div>
                    <div
                      style={{
                        borderTop: '1.5px solid #444',
                        paddingTop: '4px',
                        fontWeight: '500',
                      }}
                    >
                      ছাত্র/ছাত্রীর স্বাক্ষর
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Custom Styled Subcomponents ── */

const SectionTitle = ({ children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontWeight: '700',
      fontSize: '14px',
      color: '#55004B',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '2px',
      marginBottom: '5px',
      marginTop: '2px',
    }}
  >
    <span style={{ color: '#b5179e' }}>✦</span>
    <span>{children}</span>
  </div>
);

const FormRow = ({ children, indent = false }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      paddingLeft: indent ? '16px' : '0',
      lineHeight: '1.35',
    }}
  >
    {children}
  </div>
);

const Label = ({ children, style = {} }) => (
  <span
    style={{
      fontSize: '14px',
      whiteSpace: 'nowrap',
      color: '#334155',
      flexShrink: 0,
      ...style,
    }}
  >
    {children}
  </span>
);

const DottedValue = ({ children, style = {} }) => (
  <span
    style={{
      flex: 1,
      borderBottom: '1px dotted #475569',
      fontSize: '14px',
      paddingLeft: '4px',
      minWidth: '35px',
      color: '#0f172a',
      ...style,
    }}
  >
    {children || '\u00A0'}
  </span>
);

const Spacer = ({ width = '10px' }) => (
  <span style={{ display: 'inline-block', width }} />
);

const InfoBoxRow = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
    <span
      style={{
        whiteSpace: 'nowrap',
        flexShrink: 0,
        color: '#475569',
        fontWeight: '500',
      }}
    >
      {label}
    </span>
    <span
      style={{
        flex: 1,
        borderBottom: '1px dotted #64748b',
        minWidth: '50px',
        paddingLeft: '4px',
        fontWeight: '600',
      }}
    >
      {value || '\u00A0'}
    </span>
  </div>
);

const studentStyleValue = (val) => val || 'N/A';

const tdStyle = {
  border: '1px solid #444',
  padding: '3px 5px',
  textAlign: 'center',
  fontSize: '14px',
};

export default StudentProfile;
