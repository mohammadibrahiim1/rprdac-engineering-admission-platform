// @ts-ignore
import React from 'react';
// @ts-ignore
import logo from '../../../../../../assets/img/log-rpr.png';
// @ts-ignore
import signature from '../../../../../../assets/img/rpr-director-sign.png';
// @ts-ignore
const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

// @ts-ignore
const GreenAdmitCard = ({ data }) => (
  <div className="admit-card-container w-[380px] bg-white border border-green-200 shadow-sm rounded-sm overflow-hidden font-sans print:shadow-none print:border print:m-0 break-inside-avoid">
    {/* Header – green gradient */}
    <div className="bg-gradient-to-r from-emerald-600 to-green-700 py-2 flex justify-center print:bg-emerald-600">
      <h2 className="text-[14px] font-bold tracking-[0.2em] text-white uppercase">
        GREEN CARD
      </h2>
    </div>

    <div className="relative px-3 bg-white">
      {/* Logo & Brand */}
      <div className="flex items-start justify-between">
        <div className="flex">
          <img src={logo} alt="logo" className="object-contain h-14 w-14" />
          <div className="flex">
            <div className="flex items-center leading-none">
              <span className="text-emerald-600 font-black text-2xl italic tracking-tighter">
                RPR
              </span>
              <span className="text-[14px] text-emerald-600 font-bold self-start relative left-1 top-3">
                ®
              </span>
            </div>
            <p className="text-emerald-600 font-bold text-[12px] uppercase tracking-tighter relative right-1 top-[26px]">
              DUET Admission Care
            </p>
          </div>
          <div className="relative flex items-center justify-center overflow-hidden font-semibold h-14 w-14 rounded-xl bg-green-100 text-emerald-700 top-2 left-10">
            {data?.studentPhoto ? (
              <img
                src={`${SERVER}${data?.studentPhoto}`}
                alt={data.studentName}
                className="object-cover w-full h-full"
              />
            ) : (
              data?.studentName?.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>

      {/* Student Data */}
      <div className="space-y-2 text-slate-800">
        <div className="flex items-baseline gap-1">
          <span className="text-emerald-700 font-bold italic text-[11px] min-w-[45px]">
            Name:
          </span>
          <span className="flex-1 border-b border-dotted border-green-300 font-bold text-emerald-800 text-[13px] uppercase truncate">
            {data.studentName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-emerald-700 font-bold italic text-[11px]">
              Dept:
            </span>
            <span className="flex-1 border-b border-dotted border-green-300 font-bold text-[10px] text-emerald-800 truncate">
              {data.department}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-emerald-700 font-bold italic text-[11px]">
              ID:
            </span>
            <span className="flex-1 border-b border-dotted border-green-300 font-bold text-[11px] text-emerald-800">
              {data.studentId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-emerald-700 font-bold italic text-[11px]">
              Batch:
            </span>
            <span className="flex-1 border-b border-dotted border-green-300 font-bold text-[11px] text-emerald-800">
              Exam
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-emerald-700 font-bold italic text-[11px]">
              Phone:
            </span>
            <span className="flex-1 border-b border-dotted border-green-300 font-bold text-[10px] text-emerald-800">
              {data.studentPhone}
            </span>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="relative flex justify-end">
        <div className="">
          <img
            src={signature}
            alt="Sign"
            className="relative object-contain w-16 mx-auto top-2"
          />
          <div className="w-20 text-center border-t border-emerald-600 py-0.5">
            <p className="text-emerald-700 font-bold text-[8px]">
              Director Sign.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Footer – green gradient */}
    <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-1 text-white text-center print:bg-emerald-600">
      <p className="text-[12px] font-medium leading-tight font-sans">
        একজনের গ্রীন কার্ড দিয়ে অন্যজন পরীক্ষায় অংশগ্রহণ করতে পারবে না।
      </p>
      <p className="text-[10px] font-medium font-sans">
        মোবাইল: 01742-590128, 01729-870536
      </p>
    </div>
  </div>
);

export default GreenAdmitCard;
