import PaymentModal from "@/components/common/PaymentModal";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";

const UserStatements = () => {
  const [selectedData, setSelectedData] = useState(null); // To hold the selected employee data
  const data = useLoaderData();

  const handlePaymentClick = (stateMentData) => {
    setSelectedData(stateMentData); // Set the clicked employee data
  };

  return (
    <div>
      {" "}
      <div className="grid mb-6 lg:grid-cols-1 sm:grid-cols-2 md:grid-cols-1">
        {/* Statistics */}
        <div className="overflow-auto">
          <h1 className="border-b capitalize text-start text-[#649EB9] font-semibold">
            {data?.user?.userName} Statements
          </h1>
          {data?.statements ? (
            <div className="mt-3 overflow-auto table-container h-80">
              <table className="border border-[#649EB9] table table-sm">
                <thead>
                  <tr className="border-b text-[#FFFFFF]">
                    <th className="border p-2 bg-[#649EB9] border-[#649EB9]">
                      Year
                    </th>
                    <th className="border p-2 bg-[#649EB9] border-[#649EB9] text-center">
                      Monthly Statements
                    </th>
                    <th className="border p-2 bg-[#649EB9] border-[#649EB9] text-center">
                      Summary
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.statements?.map((statement) => (
                    <tr key={statement[0]}>
                      <td className="border-b border-[#649EB9] border-r p-2">
                        {statement?.year || "No year found"}
                      </td>
                      <td className="border-b border-[#649EB9] border-r p-2">
                        <table className="min-w-full table-auto">
                          <thead>
                            <tr>
                              <th className="p-2 bg-gray-100 border-t border-t-gray-300">
                                Month
                              </th>
                              <th className="p-2 bg-gray-100 border-t border-t-gray-300">
                                Approved
                              </th>
                              <th className="p-2 bg-gray-100 border-t border-t-gray-300">
                                Pending
                              </th>
                              <th className="p-2 bg-gray-100 border-t border-t-gray-300">
                                Total
                              </th>
                              <th className="p-2 bg-gray-100 border-t border-t-gray-300">
                                Approved Amount
                              </th>
                              <th className="p-2 bg-gray-100 border-t border-t-gray-300">
                                Approved Loan
                              </th>
                              <th className="p-2 bg-gray-100 border-t border-t-gray-300">
                                Net Total
                              </th>
                              <th className="p-2 bg-gray-100 border-t border-t-gray-300">
                                Due Loan
                              </th>
                              <th className="p-2 bg-gray-100 border-t border-t-gray-300">
                                Payment
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {statement?.months &&
                              Object.values(statement.months).map(
                                (monthData, index) => (
                                  <tr key={index}>
                                    <td className="p-2 border-t border-t-gray-300">
                                      {monthData?.month}
                                    </td>
                                    <td className="p-2 border-t border-t-gray-300">
                                      {monthData?.approved}
                                    </td>
                                    <td className="p-2 border-t border-t-gray-300">
                                      {monthData?.pending}
                                    </td>
                                    <td className="p-2 border-t border-t-gray-300">
                                      {monthData?.totalClasses}
                                    </td>
                                    <td className="p-2 border-t border-t-gray-300">
                                      {monthData?.approvedAmount?.toFixed(2)}{" "}
                                      BDT
                                    </td>
                                    <td className="p-2 border-t border-t-gray-300">
                                      {monthData?.approvedLoanAmount?.toFixed(
                                        2,
                                      )}{" "}
                                      BDT
                                    </td>
                                    <td className="p-2 border-t border-t-gray-300">
                                      {monthData?.netTotalAmount?.toFixed(2)}{" "}
                                      BDT
                                    </td>
                                    <td className="p-2 border-t border-t-gray-300">
                                      {monthData?.dueLoanAmount?.toFixed(2)} BDT
                                    </td>
                                    <td className="p-2 border-t border-t-gray-300">
                                      <label
                                        className="rounded btn btn-sm btn-primary "
                                        onClick={() =>
                                          handlePaymentClick(monthData)
                                        }
                                        htmlFor="payment_modal"
                                      >
                                        <span>
                                          {Math.round(
                                            monthData?.netTotalAmount?.toFixed(
                                              2,
                                            ) || 0,
                                          )
                                            ? "Pay"
                                            : "Loan pay"}
                                        </span>
                                      </label>
                                    </td>
                                  </tr>
                                ),
                              )}
                          </tbody>
                        </table>
                      </td>
                      <td className="border-b border-[#649EB9] border-r p-2">
                        <table className="w-full table-auto">
                          <tbody>
                            {Object?.entries(statement?.summary)?.map(
                              ([key, value]) => (
                                <tr
                                  key={key}
                                  className="border-t border-t-gray-300"
                                >
                                  <td className="px-4 py-2 font-medium capitalize border-t border-t-gray-300">
                                    {key}
                                  </td>
                                  <td className="px-4 py-2 text-gray-600 border-t border-t-gray-300">
                                    {value}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-5 text-error text-start">No data found!</p>
          )}
        </div>
      </div>
      <PaymentModal selectedData={selectedData}></PaymentModal>
    </div>
  );
};

export default UserStatements;
