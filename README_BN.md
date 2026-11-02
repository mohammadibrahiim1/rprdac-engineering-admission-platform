# RPR DUET Admission Care — Exam & Result Management

এটি React.js + JavaScript দিয়ে তৈরি **ডেমো অ্যাডমিন ফ্রন্টএন্ড**। লক্ষ্য: আপনার আগের ওয়েবসাইটের **একই Student ID / Student Database** থেকে শিক্ষার্থী লোড করে নম্বর দেওয়া। নতুন করে শিক্ষার্থী যোগ করতে হবে না।

## চালানোর নিয়ম (VS Code)

1. ZIP Extract করুন।
2. `rpr-exam-management` ফোল্ডারটি VS Code-এ **Open Folder** করুন।
3. **Terminal → New Terminal** খুলুন।
4. `npm install` লিখে Enter চাপুন।
5. `npm run dev` লিখে Enter চাপুন।
6. Terminal-এ দেখানো `http://localhost:5173/` ঠিকানায় ব্রাউজার খুলুন।

## কী কী করা যাবে

- Dashboard-এ মোট Student/Exam ও Published/Draft সংখ্যা।
- Batch সিলেক্ট করে Exam তৈরি।
- Student ID/Name দিয়ে খোঁজা ও প্রতিজনের নম্বর দেওয়া।
- অনুপস্থিত (Absent) চিহ্নিত করা।
- Excel `.xlsx` template ডাউনলোড, একই ফাইল পূরণ করে Import, Save Marks।
- স্বয়ংক্রিয় Merit List (একই নম্বরে সমান Rank)।
- রেজাল্ট Excel ডাউনলোড এবং Print / Save as PDF।
- Draft / Published কন্ট্রোল।
- Student ID দিয়ে প্রশাসনিক Result Preview।

## ডেমো বনাম আসল ওয়েবসাইট

**ডেমো মোডে থাকা শিক্ষার্থীরা সবাই কাল্পনিক।** এখানে যে নম্বর দিচ্ছেন তা শুধু আপনার বর্তমান ব্রাউজারের `localStorage`-এ সেভ হয়। এটি বাস্তব কোচিংয়ের Student DB-তে যায় না।

ডেভেলপার লাইভ করার সময় `.env` ফাইলে `VITE_USE_MOCK=false` দেবেন এবং `src/api.js`-এর ৭টি API বিদ্যমান ওয়েবসাইটের Backend/Database-এর সাথে যুক্ত করবেন। API-এর সমস্ত তথ্য `DEVELOPER_HANDOFF.md`-তে দেওয়া আছে।

**মূল ওয়েবসাইটের অ্যাক্সেস, ডাটাবেস পাসওয়ার্ড, API Token এই ফ্রন্টএন্ডে লিখবেন না।** বিদ্যমান authentication, role permissions, server validation, audit trail ও backup ডেভেলপারকে ব্যবস্থা করতে হবে।

**শুধু Student ID দিয়ে পাবলিক রেজাল্ট খোঁজার সুবিধা চালু করবেন না।** Student Login অথবা OTP দিয়ে পরিচয় নিশ্চিত করে শুধু Published result দেখাবেন।
