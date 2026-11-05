import { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetchEmployeeDutiesQuery } from '../../../../redux/features/staff/employeeApi';
import { useGetSingleNurseAttendancesQuery } from '../../../../redux/features/Nursing/NursingApi';
import { useGetTeacherFinancialStatementQuery } from '../../../../redux/features/teacher/teacherApi';
import { LayoutGrid, Banknote, Info } from 'lucide-react';
import BreadCrumbMenu from '../../../../components/BreadCrumbMenu';
import TeacherFilterSidebar from '../../admin/teacherPanel/components/TeacherFilterSidebar';

const TeacherAllLoanRequest = () => {
  const auth = useSelector((state) => state?.auth?.user);
  const [filters, setFilters] = useState({
    search: '',
    year: '',
    month: '',
    batch: [],
    status: '',
    paymentStatus: '',
    department: '',
    subject: '',
    startDate: '',
    endDate: '',
  });

  // API Hooks
  const { data: nursingData, isLoading: isNursingLoading } =
    useGetSingleNurseAttendancesQuery(
      { nursingId: auth?._id },
      { skip: auth?.userType !== 'nursing' },
    );
  const { data: staffData, isLoading: isStaffLoading } =
    useFetchEmployeeDutiesQuery(
      { employeeId: auth?._id },
      { skip: auth?.userType !== 'staff' },
    );
  const { data: teacherData, isLoading: isTeacherLoading } =
    useGetTeacherFinancialStatementQuery(
      { teacherId: auth?._id, ...filters },
      { skip: auth?.userType !== 'teacher' },
    );

  const isLoading = isNursingLoading || isStaffLoading || isTeacherLoading;

  const getRoleData = useCallback(() => {
    switch (auth?.userType) {
      case 'teacher':
        return teacherData?.statements || [];
      case 'staff':
        return staffData?.statements || [];
      case 'nursing':
        return nursingData?.statements || [];
      default:
        return [];
    }
  }, [auth?.userType, teacherData, staffData, nursingData]);

  const filteredLoans = useMemo(() => {
    return getRoleData().flatMap((yearData) =>
      yearData?.months.flatMap(
        (month) =>
          month.details?.loans?.map((loan) => ({
            ...loan,
            year: yearData.year,
            month: month.month,
          })) || [],
      ),
    );
  }, [getRoleData]);

  const stats = {
    total: filteredLoans?.length,
    approved: filteredLoans?.filter((l) => l.status === 'approve').length,
    pending: filteredLoans?.filter((l) => l.status === 'pending').length,
    amount: filteredLoans?.reduce((sum, l) => sum + (l.amount || 0), 0),
  };

  let loanRows;
  if (isLoading) {
    loanRows = <NotionLoading />;
  } else if (filteredLoans?.length > 0) {
    loanRows = (
      <AnimatePresence>
        {filteredLoans.map((loan, idx) => (
          <motion.tr
            key={
              loan?._id ||
              loan?.id ||
              `${loan?.createdAt}-${loan?.amount}-${loan?.status}`
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group cursor-default hover:bg-[#F7F7F5] transition-colors"
          >
            <td className="px-2 py-3">
              <span className="text-sm">{idx + 1}</span>
            </td>
            <td className="px-2 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium capitalize">
                  {loan?.userDetails?.userName || 'Member'}
                </span>
                <span className="text-[11px] text-[#9B9A97]">
                  • {loan.createdAt?.slice(0, 10)}
                </span>
              </div>
            </td>
            <td className="px-2 py-3">
              <span className="text-sm font-semibold">
                {loan?.amount?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'BDT',
                })}
              </span>
            </td>
            <td className="px-2 py-3">
              <NotionStatus status={loan?.status} />
            </td>
            <td className="px-2 py-3">
              <NotionPayment isPaid={loan?.isPaid} />
            </td>
          </motion.tr>
        ))}
      </AnimatePresence>
    );
  } else {
    loanRows = <NotionEmpty />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#37352F]">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-[#EDECE9] bg-white/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <BreadCrumbMenu />
        </div>
      </nav>

      <main className="px-4">
        {/* Notion Style Header */}
        <header className="my-10 space-y-2">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5 mb-4"
          >
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <Banknote size={14} className="text-slate-600" strokeWidth={2} />
            </div>
            <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-slate-900">
              Loan Registry
            </h1>
            <motion.span
              key={filteredLoans?.length}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200"
            >
              {filteredLoans?.length}
            </motion.span>
            {auth?.userName && (
              <span className="hidden sm:inline text-[12px] text-slate-400 ml-1">
                — {auth.userName}
                {auth?.batch && (
                  <span className="text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {auth?.batch}
                  </span>
                )}
              </span>
            )}
          </motion.div>
          <div className="flex items-center">
            <Info size={14} />
            <span className="hidden sm:inline text-[12px] text-slate-400 ml-1">
              Manage and audit all your institutional loan applications.
            </span>
          </div>
        </header>

        {/* Stats Section - Minimalist Notion Style */}
        <section className="mb-8 grid grid-cols-2 gap-px bg-[#EDECE9] border border-[#EDECE9] rounded-lg overflow-hidden md:grid-cols-4">
          <MinimalStat label="Total Records" value={stats.total} />
          <MinimalStat
            label="Approved"
            value={stats.approved}
            color="text-green-600"
          />
          <MinimalStat
            label="In Review"
            value={stats.pending}
            color="text-orange-600"
          />
          <MinimalStat
            label="Total Amount"
            value={`${stats.amount.toLocaleString('en-US', { style: 'currency', currency: 'BDT' })}`}
          />
        </section>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Sidebar */}
          <aside className="space-y-6 ">
            <div className="group flex items-center gap-3 rounded-lg border border-[#EDECE9] p-3 transition-colors hover:bg-[#F7F7F5]">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#37352F] text-xs font-bold text-white uppercase">
                {auth?.userName?.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">
                  {auth?.userName || 'User Profile'}
                </p>
                <p className="text-[10px] text-[#787774] font-mono tracking-tighter uppercase">
                  ID: {auth?.userId}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <TeacherFilterSidebar filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDECE9] pb-2">
              <div className="flex items-center gap-4 text-sm font-medium text-[#37352F]">
                <span className="cursor-pointer border-b-2 border-[#37352F] pb-2">
                  Table View
                </span>
              </div>
            </div>

            {/* Notion Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#EDECE9] text-[12px] font-normal text-[#787774]">
                    <th className="px-2 py-3 font-medium">#</th>
                    <th className="w-[40%] px-2 py-3 font-medium">
                      NAME & CREATED
                    </th>
                    <th className="px-2 py-3 font-medium">AMOUNT</th>
                    <th className="px-2 py-3 font-medium">STATUS</th>
                    <th className="px-2 py-3 font-medium">PAYMENT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F0EF]">{loanRows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Custom Styled Sub-Components ---

const MinimalStat = ({ label, value, color = 'text-[#37352F]' }) => (
  <div className="p-4 bg-white">
    <p className="text-[11px] font-bold uppercase tracking-wider text-[#9B9A97] mb-1">
      {label}
    </p>
    <p className={`text-lg font-bold ${color}`}>{value}</p>
  </div>
);

const NotionStatus = ({ status }) => {
  const styles = {
    approve: 'bg-[#E2F6F0] text-[#1D8265]',
    pending: 'bg-[#FFF4E5] text-[#B46414]',
    rejected: 'bg-[#FFEBEB] text-[#CF3B3B]',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium ${styles[status] || styles.pending}`}
    >
      {status === 'approve'
        ? 'Approved'
        : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const NotionPayment = ({ isPaid }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[12px] font-medium ${isPaid ? 'bg-blue-50 text-blue-700' : 'bg-[#F1F0EF] text-[#787774]'}`}
  >
    {isPaid ? 'Paid' : 'Due'}
  </span>
);

const NotionLoading = () => (
  <>
    {[1, 2, 3].map((i) => (
      <tr key={i} className="animate-pulse">
        <td colSpan="4" className="px-2 py-4">
          <div className="h-4 w-full bg-[#F1F0EF] rounded" />
        </td>
      </tr>
    ))}
  </>
);

const NotionEmpty = () => (
  <tr>
    <td colSpan="4" className="py-20 text-center">
      <div className="flex flex-col items-center opacity-30">
        <LayoutGrid size={40} className="mb-2" />
        <p className="text-sm">No records in this view.</p>
      </div>
    </td>
  </tr>
);

export default TeacherAllLoanRequest;
