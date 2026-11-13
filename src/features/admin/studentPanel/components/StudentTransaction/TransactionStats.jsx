// src/pages/Transactions/TransactionStats.jsx
const StatCard = ({ title, value, subtitle, color = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    green: "bg-green-50 border-green-100 text-green-700",
    red: "bg-red-50 border-red-100 text-red-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
    gray: "bg-gray-50 border-gray-100 text-gray-700",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">
        {typeof value === "number"
          ? value.toLocaleString("en-BD", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          : value}
      </p>
      {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
    </div>
  );
};

const TransactionStats = ({ statistics, isLoading, isAdmin }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const {
    totalTransactions = 0,
    totalInAmount = 0,
    totalOutAmount = 0,
    netAmount = 0,
    totalAdmissionFeeCollected = 0,
    totalMessServiceChargeCollected = 0,
    totalCashbackGiven = 0,
    totalStudentReturn = 0,
  } = statistics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <StatCard
        title="Total Transactions"
        value={totalTransactions}
        color="blue"
      />
      <StatCard
        title="Total Collected (IN)"
        value={`৳${totalInAmount.toLocaleString("en-BD")}`}
        color="green"
      />
      <StatCard
        title="Total Out"
        value={`৳${totalOutAmount.toLocaleString("en-BD")}`}
        color="red"
      />
      <StatCard
        title="Net Amount"
        value={`৳${netAmount.toLocaleString("en-BD")}`}
        color="purple"
      />
      <StatCard
        title="Admission Fee"
        value={`৳${totalAdmissionFeeCollected.toLocaleString("en-BD")}`}
        color="orange"
      />
      <StatCard
        title="Mess Charge"
        value={`৳${totalMessServiceChargeCollected.toLocaleString("en-BD")}`}
        color="gray"
      />
      {(totalCashbackGiven > 0 || totalStudentReturn > 0) && (
        <>
          <StatCard
            title="Cashback Given"
            value={`৳${totalCashbackGiven.toLocaleString("en-BD")}`}
            color="red"
          />
          <StatCard
            title="Student Return"
            value={`৳${totalStudentReturn.toLocaleString("en-BD")}`}
            color="red"
          />
        </>
      )}
    </div>
  );
};

export default TransactionStats;
