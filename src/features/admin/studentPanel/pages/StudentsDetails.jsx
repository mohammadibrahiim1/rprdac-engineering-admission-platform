import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useGetStudentByIdQuery } from '../../../../../redux/features/student/studentApi';
import rprLogo from '../../../../../assets/img/log-rpr.png';
import signature from '../../../../../assets/img/rpr-director-sign.png';

/* ─── Font injection ──────────────────────────────────────────────────────── */
if (!document.getElementById('rpr-print-core-engine')) {
  const s = document.createElement('style');
  s.id = 'rpr-print-core-engine';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    
    .font-sans  { font-family: 'Noto Sans Bengali', sans-serif !important; }
    .font-english { font-family: 'Inter', sans-serif !important; }
    
    .dotted-line-field {
      flex: 1;
      border-bottom: 1px dotted #94a3b8;
      padding: 0 4px;
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      color: #0f172a;
      display: inline-block;
    }

    /* ─── CLEAN PRINT CORRECTIONS ─── */
    @media print {
      @page { 
        size: A4 portrait; 
        margin: 0 !important; /* Removes default browser headers/URLs */
      }
      
      html, body { 
        width: 210mm !important;
        height: 297mm !important;
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
      }
      
      .no-print { display: none !important; }
      
      /* Purely forces everything inside exactly 1 page */
      .a4-container-print {
    width: 210mm !important;
    height: 297mm !important;
    box-shadow: none !important;
    border: 0px solid transparent !important; 
    outline: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
    page-break-inside: avoid !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    box-sizing: border-box !important;
    padding: 15mm 16mm 12mm 16mm !important;
  }

      /* Dynamically showing system date/time and page numbers only */
      .print-meta-footer {
        display: flex !important;
        justify-content: space-between;
        font-family: 'Inter', sans-serif;
        font-size: 9px;
        color: #64748b;
        border-top: 1px dashed #e2e8f0;
        padding-top: 6px;
        margin-top: auto;
      }
    }
  `;
  document.head.appendChild(s);
}

/* ─── Print / utility styles ─────────────────────────────────────────────── */
if (!document.getElementById('rpr-print-styles')) {
  const s = document.createElement('style');
  s.id = 'rpr-print-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
    .font-sans  { font-family:'Noto Sans Bengali',sans-serif !important; }
    .font-english { font-family:'Inter',sans-serif !important; }
    .dotted-field {
      flex:1; border-bottom:1px dotted #6b7280; min-width:30px;
      padding:0 3px; font-family:'Inter',sans-serif;
      font-size:10.5px; line-height:1.4; display:inline-block;
    }
    @media print {
      @page { size:A4 portrait; margin:0; }
      html,body { width:210mm; height:297mm; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .no-print { display:none !important; }
      .a4-shell  { box-shadow:none !important; border-radius:0 !important; }
    }
  `;
  document.head.appendChild(s);
}

/* ─── Constants ───────────────────────────────────────────────────────────── */
const DEPARTMENTS = [
  'ARCH',
  'CE',
  'CHE',
  'CSE',
  'EEE',
  'FE',
  'ME/IPE/MME',
  'TE',
];

/* ─── Reusable micro-components ───────────────────────────────────────────── */
const DottedField = ({ value, className = 'text-[14px]' }) => (
  <span className={`dotted-field font-sans ${className}`}>{value || ''}</span>
);

const FieldRow = ({ children }) => (
  <div className="flex items-baseline gap-x-1 flex-nowrap mb-[5px] font-sans text-[14px] text-gray-900 leading-snug">
    {children}
  </div>
);

const SectionHeading = ({ children }) => (
  <div className="flex items-center gap-1.5 font-sans text-[14px] font-bold underline text-gray-900 mb-[6px]">
    <span>✦</span>
    <span>{children}</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
const StudentsDetails = () => {
  const { id } = useParams();
  const { data, isError, error } = useGetStudentByIdQuery(id);
  const studentInfo = data?.data;
  const SERVER = import.meta.env.VITE_SERVER_BASE_URL;
  const formRef = useRef();

  /* ── Print form ── */
  const handlePrint = useReactToPrint({
    content: () => formRef.current,
    documentTitle: `AdmissionForm_${studentInfo?.studentId || 'Student'}`,
  });

  const currentDateTime = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  /* ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen">
      {/* ── Toolbar ── */}
      <header className="py-10 border-b border-indigo-100 no-print text-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold leading-tight text-[#191919] tracking-tight">
            Admission Form
          </h1>
          <p className="font-sans text-[16px] text-gray-500 mt-1">
            শিক্ষার্থীর ভর্তি বিবরণ
          </p>
          <button
            type="button"
            onClick={handlePrint}
            className="font-sans w-1/2 mx-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-[13px] font-medium transition-all shadow-sm border-0 cursor-pointer"
          >
            <Printer size={14} />
            Print Form
          </button>
        </div>
      </header>

      {/* ── Error ── */}
      {isError && (
        <p className="font-english text-center text-red-500 py-16 text-[13px]">
          {error?.data?.message}
        </p>
      )}

      {/* ── A4 centred wrapper ── */}
      {!isError && (
        <div className="flex justify-center px-4 py-8">
          <div
            ref={formRef}
            className="a4-container-print relative bg-white border border-slate-200 shadow-lg sm:rounded-xl box-border"
            style={{
              width: '210mm',
              height: '297mm',
              padding: '10mm 10mm 10mm 10mm',
              backgroundColor: '#ffffff',
            }}
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.065]">
              <img src={rprLogo} alt="" className="object-contain w-3/5" />
            </div>

            {/* ── FORM CONTENT ── */}
            <div className="relative z-10">
              {/* بسم الله */}
              <p className="font-sans italic text-center text-[14px] text-gray-800">
                বিসমিল্লাহির রাহমানির রাহীম
              </p>

              {/* ── Header: logo + title + photo ── */}
              <div className="flex items-center justify-between mb-[4px]">
                <div className="flex items-center">
                  <img
                    src={rprLogo}
                    alt="RPR Logo"
                    className="w-[120px] h-[120px] object-contain flex-shrink-0"
                  />
                  <div>
                    <div className="font-black leading-none font-sans">
                      <span className="text-[72px] text-[#03b14f] leading-none">
                        R
                      </span>
                      <span className="text-[72px] text-[#05abe9] leading-none">
                        P
                      </span>
                      <span className="text-[72px] text-[#ec0494] leading-none">
                        R
                      </span>
                      <span className="text-[26px] text-indigo-900 font-bold ml-1">
                        DUET Admission Care
                      </span>
                    </div>
                    <p className="font-sans italic text-[13.5px] text-gray-500 ml-36 -mt-2">
                      An Excellent Guide Center For Bright Future
                    </p>
                  </div>
                </div>

                {/* Photo */}
                <div
                  className="flex-shrink-0 border-[1.5px] border-gray-500 overflow-hidden bg-gray-100 flex items-center justify-center"
                  style={{ width: 110, height: 130 }}
                >
                  {studentInfo?.studentPhoto ? (
                    <img
                      src={`${SERVER}${studentInfo?.studentPhoto}`}
                      alt={studentInfo?.name}
                      className="object-contain w-full h-full text-xs text-center"
                    />
                  ) : (
                    <span className="font-sans text-[9px] text-gray-400">
                      Photo
                    </span>
                  )}
                </div>
              </div>

              {/* Badge */}
              <div className="text-center my-[5px]">
                <span
                  className="font-sans text-[14px] font-semibold text-yellow-400 px-7 py-[3px] rounded-xl inline-block"
                  style={{ background: '#472f90', border: '1px solid #7d1488' }}
                >
                  ভর্তি ফরম
                </span>
              </div>

              {/* Form No */}
              <div className="font-sans text-[14px] text-gray-900 mb-[8px] flex items-baseline gap-1">
                <span className="whitespace-nowrap">ফরম নং -</span>
                <span
                  className="dotted-field font-sans"
                  style={{ maxWidth: 100 }}
                >
                  {studentInfo?.receiptNo || ''}
                </span>
              </div>

              {/* ══ SECTION 1 – Personal Info ══ */}
              <div className="mb-[10px]">
                <SectionHeading>ছাত্র/ছাত্রীর ব্যক্তিগত পরিচয়</SectionHeading>

                <FieldRow>
                  <span className="whitespace-nowrap">
                    ১) (ক) নাম (বাংলায়) :
                  </span>
                  <DottedField value={studentInfo?.nameInBangla} />
                  <span className="ml-2 whitespace-nowrap">(ইংরেজিতে) :</span>
                  <DottedField value={studentInfo?.name} />
                </FieldRow>

                <FieldRow>
                  <span className="pl-4 whitespace-nowrap">
                    (খ) মোবাইল নম্বর : (১)
                  </span>
                  <DottedField value={studentInfo?.phone} />
                  <span className="ml-2 whitespace-nowrap">(২)</span>
                  <DottedField
                    value={
                      studentInfo?.phone
                        ? `${studentInfo.phone} (whatsapp)`
                        : ''
                    }
                  />
                </FieldRow>

                <FieldRow>
                  <span className="whitespace-nowrap">
                    ২) (ক) অভিভাবকের নাম :
                  </span>
                  <DottedField value={studentInfo?.guardianName} />
                  <span className="ml-2 whitespace-nowrap">সম্পর্ক :</span>
                  <DottedField
                    value={studentInfo?.relationWithGuardian}
                    className="!max-w-[80px]"
                  />
                </FieldRow>

                <FieldRow>
                  <span className="pl-4 whitespace-nowrap">
                    (খ) মোবাইল নম্বর : (১)
                  </span>
                  <DottedField value={studentInfo?.guardianPhone} />
                  <span className="ml-2 whitespace-nowrap">(২)</span>
                  <DottedField
                    value={
                      studentInfo?.guardianPhone
                        ? `${studentInfo.guardianPhone} (whatsapp)`
                        : ''
                    }
                  />
                </FieldRow>

                <FieldRow>
                  <span className="whitespace-nowrap">
                    ৩) (ক) স্থায়ী ঠিকানা : গ্রাম/মহল্লা/ওয়ার্ড/সড়ক নম্বর :
                  </span>
                  <DottedField value={studentInfo?.permanentVillage} />
                  <span className="ml-2 whitespace-nowrap">পোস্ট অফিস :</span>
                  <DottedField value={studentInfo?.permanentPostcode} />
                </FieldRow>

                <FieldRow>
                  <span className="whitespace-nowrap pl-7">থানা/উপজেলা :</span>
                  <DottedField value={studentInfo?.permanentUpozilla} />
                  <span className="ml-2 whitespace-nowrap">জেলা :</span>
                  <DottedField value={studentInfo?.permanentZilla} />
                </FieldRow>

                <FieldRow>
                  <span className="pl-4 whitespace-nowrap">
                    (খ) বর্তমান ঠিকানা : বাসা/মেসের নাম :
                  </span>
                  <DottedField value={studentInfo?.mess} />
                  <span className="ml-2 whitespace-nowrap">রুম নং :</span>
                  <DottedField
                    value={studentInfo?.room}
                    className="!max-w-[50px]"
                  />
                </FieldRow>

                <FieldRow>
                  <span className="whitespace-nowrap">৪) রক্তের গ্রুপ :</span>
                  <DottedField
                    value={studentInfo?.bloodGroup}
                    className="!max-w-[80px]"
                  />
                  <span className="flex-1" />
                </FieldRow>
              </div>

              {/* ══ SECTION 2 – Academic ══ */}
              <div className="mb-[10px]">
                <SectionHeading>ছাত্র/ছাত্রীর শিক্ষাগত যোগ্যতা</SectionHeading>

                <p className="font-sans font-bold text-[14px] text-gray-900 mb-[6px]">
                  ৫) মাধ্যমিক ও ডিপ্লোমা পরীক্ষার ফলাফল :
                </p>

                {/* Academic Table */}
                <table className="font-sans w-full text-[13px] border-collapse border border-gray-600 mb-[8px]">
                  <thead>
                    <tr className="bg-indigo-50/70">
                      {[
                        'Name of the Examination',
                        'Group / Technology',
                        'Board',
                        'Passing Year',
                        'GPA / CGPA',
                      ].map((h) => (
                        <th
                          key={h}
                          className="border border-gray-600 px-[6px] py-[5px] text-center font-semibold text-gray-800"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {[
                        'SSC',
                        studentInfo?.sscGroup,
                        studentInfo?.sscBoard,
                        studentInfo?.sscPassingYear,
                        studentInfo?.sscGpa || '-',
                      ]?.map((v, i) => (
                        <td
                          key={i}
                          className="border border-gray-600 px-[6px] py-[5px] text-center text-gray-800"
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      {[
                        'Diploma in Engineering',
                        studentInfo?.diplomaGroup,
                        studentInfo?.diplomaBoard,
                        studentInfo?.diplomaPassingYear || '-',
                        studentInfo?.cgpa || '-',
                      ]?.map((v, i) => (
                        <td
                          key={i}
                          className="border border-gray-600 px-[6px] py-[5px] text-center text-gray-800"
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>

                {/* Department checkboxes */}
                <div className="font-sans  text-[14px] text-gray-900">
                  <p className="mb-[6px] font-bold">
                    ৬) ডুয়েট-এ যে ডিপার্টমেন্টে এ্যাডমিশন দিতে আগ্রহী (টিক
                    চিহ্ন দিন) :
                  </p>
                  <div className="grid grid-cols-5 gap-x-3 gap-y-1.5 pl-2">
                    {DEPARTMENTS?.map((dept, i) => (
                      <label
                        key={i}
                        className="font-english flex items-center gap-1.5 text-[13px] text-gray-800 cursor-default select-none"
                      >
                        <input
                          type="checkbox"
                          checked={studentInfo?.department === dept}
                          readOnly
                          onChange={() => {}}
                          className="accent-indigo-600 w-[11px] h-[11px] cursor-default flex-shrink-0"
                        />
                        {dept}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* ══ SECTION 3 – Terms ══ */}
              <div className="mb-[8px]">
                <div className="flex items-center gap-1.5 font-sans text-[14px] font-bold text-gray-900 mb-[5px]">
                  <span>✦</span>
                  <span className="underline">
                    RPR DUET Admission Care কর্তৃক প্রদত্ত শর্তাবলী
                  </span>
                </div>
                <div className="font-sans text-[13px] text-gray-900 leading-[1.75] space-y-[2px]">
                  <p>
                    (ক) ছাত্র/ছাত্রীকে নিয়মিত ক্লাস করতে হবে এবং সাপ্তাহিক
                    অন্যান্য সকল পরীক্ষা দিতে বাধ্য থাকবে। অন্যথায় অভিভাবকের
                    নিকট জানানো হলে ছাত্র/ছাত্রীর কোন আপত্তি থাকবে না।
                  </p>
                  <p>
                    (খ) কোচিং থেকে যখনই ক্লাস নেওয়া হোক না কেন, তাতে
                    ছাত্র/ছাত্রীর কোন আপত্তি থাকতে পারবে না।
                  </p>
                  <p>(গ) কোচিং এর শৃঙ্খলা বজায় রাখতে হবে।</p>
                  <p className="font-semibold text-rose-600">
                    (ঘ) প্রদানকৃত কোর্স ফি, কোন অবস্থাতেই ফেরত যোগ্য নহে।
                  </p>
                </div>
              </div>

              {/* ══ Declaration ══ */}
              <div className="font-sans text-[13px] text-gray-900 text-justify leading-[1.75] mb-5">
                আমি{' '}
                <span className="font-semibold text-indigo-600 underline font-sans capitalize">
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

              {/* ══ Bottom: Info box + Signatures ══ */}
              <div className="flex items-end justify-between">
                {/* Info box */}
                <div className="border-[1.5px] border-gray-600 p-2 font-sans text-[13px] text-gray-900 leading-[2]">
                  <div className="flex gap-5">
                    <span className="whitespace-nowrap">
                      ব্যাচ :{' '}
                      <span className="pr-5 border-b border-gray-600 border-dotted font-english">
                        {studentInfo?.batch || ''}
                      </span>
                    </span>
                    <span className="whitespace-nowrap">
                      আইডি নং :{' '}
                      <span className="pr-5 border-b border-gray-600 border-dotted font-english">
                        {studentInfo?.studentId || ''}
                      </span>
                    </span>
                  </div>
                  <div>
                    রশিদ নং :{' '}
                    <span className="border-b border-gray-600 border-dotted font-english pr-14">
                      {studentInfo?.receiptNo || ''}
                    </span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex items-end gap-12">
                  <div className="text-center">
                    <img
                      src={signature}
                      alt="director_sign"
                      className="w-18 h-auto mx-auto"
                    />
                    <div className="w-32 border-t border-gray-800" />
                    <p className="font-sans text-[13px] text-gray-800 mt-0.5">
                      কর্তৃপক্ষের স্বাক্ষর
                    </p>
                  </div>
                  <div className="text-center text-[10px]">
                    <span className="capitalize">{studentInfo?.name}</span>
                    <div className="w-32 border-t border-gray-800" />
                    <p className="font-sans text-[13px] text-gray-800 mt-0.5">
                      ছাত্র/ছাত্রীর স্বাক্ষর
                    </p>
                  </div>
                </div>
              </div>
              {/* ── end content ── */}
            </div>
            <span className="text-[9px] py-2">{currentDateTime}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsDetails;
