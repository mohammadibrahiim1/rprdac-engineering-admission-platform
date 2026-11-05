import React from 'react';
// @ts-ignore
import logo from '../../../../../../assets/img/log-rpr.png';
// @ts-ignore
import signature from '../../../../../../assets/img/rpr-director-sign.png';
import { formatDate } from '../../hooks/admitcard/useAdmitCardForm';

const AdmitCardPreview = ({ watchedValues }) => {
  // Gracefully handle undefined values during initial render safely
  const {
    topics = '',
    examType = 'written+mcq',
    department = '',
    date = '',
    time = '',
    startId = '',
    venue = 'RPR DUET Admission Care',
    totalPrizeWinners = 10,
    prizes = [],
  } = watchedValues || {};

  const defaultPrizes = [
    { id: 1, name: '১ম পুরস্কার-মোবাইল ফোন।' },
    { id: 2, name: '২য় পুরস্কার-টেবিল ঘড়ি।' },
    { id: 3, name: '৩য় পুরস্কার-১/২ রিম খাতা।' },
    { id: 4, name: '৪র্থ পুরস্কার-১/২ রিম খাতা।' },
    { id: 5, name: '৫ম পুরস্কার-১/৪ রিম খাতা।' },
    { id: 6, name: '৬ষ্ঠ পুরস্কার-১/৪ রিম খাতা।' },
    { id: 7, name: '৭ম পুরস্কার-২ দিস্তা খাতা।' },
    { id: 8, name: '৮ম পুরস্কার-২ দিস্তা খাতা।' },
    { id: 9, name: '৯ম পুরস্কার-২ দিস্তা খাতা।' },
    { id: 10, name: '১০ম পুরস্কার-২ দিস্তা খাতা।' },
  ];

  const prizesList =
    prizes && prizes?.length > 0
      ? prizes?.map((p, i) => ({ id: p.id || i, name: `${p.prizeName}।` }))
      : defaultPrizes;

  const leftColumnPrizes = prizesList?.slice(0, 5);
  const rightColumnPrizes = prizesList?.slice(5, 10);

  return (
    <>
      <div>
        <div className="w-full h-full flex items-center justify-center font-serif text-black box-border">
          <div className="w-full max-w-[390px] mx-auto h-[310px] border-2 border-black bg-white p-2 flex flex-col overflow-hidden leading-tight box-border font-serif select-none shadow-none">
            {/* Header Section */}
            <div className="flex justify-center mb-1 border border-black">
              <div className="flex items-center justify-center flex-1 gap-2 py-1">
                <img
                  src={logo}
                  alt="rpr_logo"
                  className="object-contain h-[46px] relative right-2"
                />
                <div className="relative right-4">
                  <p className="text-[10.5px] leading-none uppercase tracking-tight font-medium">
                    Reflection of Right Pace
                  </p>
                  <div className="text-[23px] font-bold leading-none tracking-wide mt-0.5">
                    RPR
                    <span className="text-[11px] bottom-2 relative font-normal">
                      ®
                    </span>
                    <span className="text-[14px] font-normal tracking-wider ml-1">
                      Exam Center
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center w-1/3 bg-white border-l border-black">
                <h3 className="text-xs font-bold uppercase tracking-wider text-center">
                  Admit Card
                </h3>
              </div>
            </div>

            {/* Topics Section */}
            <div className="px-1.5 py-1 text-white bg-black rounded-sm">
              <p className="font-medium leading-none text-[12px]">
                <span className="font-bold tracking-wide text-[13px] uppercase">
                  Topics:
                </span>{' '}
                <span className="font-sans text-[15px] ml-0.5">
                  {topics ||
                    'ফিজিক্স ভৌত; গতির সমীকরণ; দ্বিমাত্রিক গতি; নিউটনের বলবিদ্যা।'}{' '}
                  <span className="uppercase text-[13px] font-serif font-bold">
                    ({examType || 'Written+MCQ'})
                  </span>
                </span>
              </p>
            </div>

            {/* Info Section*/}
            <div className="pt-1.5 space-y-1.5 text-[13px]">
              <div className="flex justify-between items-center border-b border-dotted border-black pb-1">
                <div>
                  <span className="font-bold uppercase text-[12px]">Name:</span>
                  <span className="font-medium text-slate-400">
                    ..............................................
                  </span>
                </div>
                <div className="font-bold bg-slate-100 px-1.5 py-0.5 border border-black text-[12px] rounded-sm tracking-wide whitespace-nowrap shadow-sm">
                  {formatDate(date)} &nbsp;{time || '09:30 AM'}
                </div>
              </div>

              <div className="flex items-center justify-between font-bold text-[12px] pt-0.5">
                <div className="px-2 py-0.5 border border-black border-dashed bg-slate-50 rounded-sm">
                  ID: {startId || '8321'}
                </div>
                <div className="uppercase border-b border-black px-0.5">
                  Dept: {department || 'All'}
                </div>
                <div className="tracking-tight font-semibold text-[12px]">
                  Venue:{' '}
                  <span className="font-bold">{venue || 'RPR DUET Care'}</span>
                </div>
              </div>
            </div>

            {/* Notice & Grid Prizes Section */}
            <div className="relative flex flex-col flex-1 mt-1.5 border-t border-black pt-1">
              <div className="text-[11.5px] leading-tight font-sans text-black space-y-0.5 font-medium">
                <p>* এডমিটে উল্লেখিত সময় এবং স্থানে পরীক্ষা দিতে আসতে হবে।</p>
                <p className="text-red-600 font-bold">
                  * সময় পরিবর্তন হলে এসএমএস এর মাধ্যমে জানানো হবে।
                </p>
              </div>

              <div className="flex justify-between items-start mt-1 gap-2 relative h-full">
                <div className="w-[72%] font-sans text-[11px] leading-tight grid grid-cols-2 gap-x-2 pt-0.5 font-normal">
                  <div className="space-y-0.5">
                    {leftColumnPrizes?.map((p, i) => (
                      <p key={p.id} className="whitespace-nowrap">
                        ({String.fromCharCode(2453 + i)}) {p.name}
                      </p>
                    ))}
                  </div>
                  <div className="space-y-0.5">
                    {rightColumnPrizes?.map((p, i) => (
                      <p key={p.id} className="whitespace-nowrap">
                        ({String.fromCharCode(2458 + i)}) {p.name}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="absolute right-0 bottom-[-1px] flex flex-col items-center w-[25%]">
                  <img
                    src={signature}
                    alt="Sign"
                    className="object-contain relative top-1.5"
                  />
                  <div className="w-full border-t border-black"></div>
                  <p className="text-[9.5px] font-bold uppercase tracking-tight mt-0.5 text-center whitespace-nowrap">
                    Director Sign
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Prize Count */}
            <div className="py-0.5 text-center text-white bg-black mt-auto rounded-sm">
              <p className="text-[12px] font-bold font-sans tracking-wide">
                সর্বমোট {totalPrizeWinners || '১০'} জনকে পুরস্কার দেওয়া হবে
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdmitCardPreview;
