import { useState } from "react";

import { usePayUserDueMutation } from "@/redux/features/staff/employeeApi";

import { X } from "lucide-react";

const PaymentModal = ({ selectedData }) => {
  const [payAmount, setPayAmount] = useState("");
  const [payUserDue, { isLoading }] = usePayUserDueMutation();
  const [successMsg, setSuccessMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      // Trigger the mutation to submit the payment
      const response = await payUserDue({
        userId: selectedData?._id,
        payAmount,
      }).unwrap();

      setSuccessMsg(response);
    } catch (error) {
      setErrMsg(error);
    }

    // Reset form after payment
    setPayAmount("");
  };

  return (
    <div>
      {/* Put this part before </body> tag */}
      <input type="checkbox" id="payment_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="max-w-md bg-white modal-box">
          <h3 className="my-2 text-lg font-semibold capitalize border-b">
            Pay{" "}
            <span className="text-[#2D8AB9]">
              {selectedData?.totalDuePayment?.toFixed(2) || 0} BDT
            </span>{" "}
            of{" "}
            <span className="text-[#2D8AB9] uppercase">
              {selectedData?.userName}
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="table rounded table-sm">
              {/* head */}
              <thead className="bg-[#2D8AB9] text-white">
                <tr>
                  <th>#SL</th>
                  <th>Total Amount</th>
                  <th>Total Loan</th>
                  <th>Due amount</th>
                  <th>Due Loan</th>
                  <th>Sub total</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                <tr>
                  <th>1</th>
                  <td>
                    {selectedData?.totalServiceAmount?.toFixed(2) || 0} BDT
                  </td>
                  <td>{selectedData?.totalLoanAmount?.toFixed(2) || 0} BDT</td>
                  <td>{selectedData?.totalDuePayment?.toFixed(2) || 0} BDT</td>
                  <td>{selectedData?.dueLoanAmount?.toFixed(2) || 0} BDT</td>
                  <td>{selectedData?.totalDuePayment?.toFixed(2) || 0} BDT</td>
                </tr>
              </tbody>
            </table>

            <div>
              <form onSubmit={handlePayment}>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  placeholder="Enter payment amount"
                  className="w-full max-w-xs my-5 rounded-md input input-bordered input-primary input-sm focus:outline-none"
                />
                <div>
                  <button
                    type="submit"
                    className="px-5 py-0 rounded-md btn btn-sm btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Pay"}
                  </button>
                </div>
              </form>
              {successMsg && (
                <div className="mt-5">
                  <p className="text-success">{successMsg?.status}</p>
                  <p className="text-success">{successMsg?.message}</p>
                </div>
              )}
              {errMsg && (
                <span className="font-semibold text-error">
                  {errMsg?.data?.error}
                </span>
              )}
              {errMsg && (
                <div>
                  <p className="text-error">{errMsg?.data?.status}</p>
                  <p className="text-error">{errMsg?.data?.message}</p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-action">
            <label
              htmlFor="payment_modal"
              className="p-2 text-white rounded-full cursor-pointer bg-error"
            >
              <X size={20} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
