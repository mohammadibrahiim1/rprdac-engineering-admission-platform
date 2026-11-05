import React, { useState } from 'react';
import { useFetchNursingAllAttendanceQuery } from '../../../../../redux/features/Nursing/NursingApi';

const NursingAllAttendance = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [phone, setPhone] = useState('');
  const { data } = useFetchNursingAllAttendanceQuery({
    page,
    limit,
    phone,
  });

  const nursingAttendances = data?.data;

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value));
  };

  const calculateIndex = (index) => {
    return (page - 1) * limit + index + 1;
  };

  return (
    <div>
      {' '}
      <div className="overflow-x-auto">
        <div className="flex items-center justify-between py-2 ">
          <p className="text-md font-semibold text-[#000000]">
            Total attendance : <strong>{data?.totalCount}</strong>
          </p>
          <div className="flex justify-start items-center gap-2 text-[#101750] font-semibold">
            <label htmlFor="nursing">Search Nursing By Phone : </label>
            <input
              onChange={(e) => {
                const phoneNumber = e.target.value;
                setPhone(`88${phoneNumber}`);
              }}
              placeholder="Enter phone number"
              className="mt-1 block w-[45%]  px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              type="search"
              name="nursing"
              id="nursing"
            />
          </div>
          <div>
            <label className="font-semibold me-1" htmlFor="limit">
              Limit Per Page:{' '}
            </label>
            <select
              className="font-bold select select-bordered select-sm focus:outline-none"
              id="limit"
              value={limit}
              onChange={handleLimitChange}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <table className="table table-sm">
          <thead>
            <tr className="bg-[#F8F5FF] text-sm text-[#000000]">
              <th>SL#</th>
              <th>Date</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Mess name</th>
              <th>Duty Start Time</th>
              <th>Duty End Time</th>
              <th>Total Duty Time(seconds)</th>
              <th>Total amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {nursingAttendances?.map(
              (
                {
                  date,
                  employeeName,
                  phone,
                  dutyStartTime,
                  dutyEndTime,
                  totalAmount,
                  totalDutyTime,
                  status,
                  messName,
                  _id,
                  totalApprovedAmount,
                },
                index,
              ) => (
                <>
                  <tr className="font-semibold capitalize " key={_id}>
                    <th>{calculateIndex(index)}</th>

                    <td> {date} </td>
                    <td className="capitalize"> {employeeName} </td>
                    <td>{phone}</td>
                    <td>{messName}</td>
                    <td> {dutyStartTime} </td>
                    <td> {dutyEndTime} </td>
                    <td className="flex items-center gap-2 bg-[#F8F5FF] text-[#8147E7] font-semibold ">
                      <span>{totalDutyTime} seconds</span>
                      <strong>
                        ({Math.round(totalDutyTime / 3600)}{' '}
                        {Math.round(totalDutyTime / 3600) === 1
                          ? 'hour'
                          : 'hours'}
                        )
                      </strong>
                    </td>
                    <td className="">{totalAmount} BDT</td>
                    <td
                      className={
                        status === 'pending'
                          ? 'btn btn-sm rounded-none my-1 btn-warning text-xs capitalize'
                          : 'btn btn-sm rounded-none my-1 btn-success text-xs capitalize'
                      }
                    >
                      {status}
                    </td>
                  </tr>
                </>
              ),
            )}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th> </th>
              <th> </th>
              <th className="text-sm font-semibold text-[#000000]">
                Total approved amount =
              </th>
              <th className="bg-[#F8F5FF] text-[#fb2e86]">
                {' '}
                {data?.totalApprovedAmount} BDT
              </th>
            </tr>
          </tfoot>
        </table>

        <div className="flex justify-center mx-auto mt-16 join">
          <button
            className="join-item btn btn-md bg-[#8147E7] hover:bg-[#8147E7] text-[#FFFFFF]"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="join-item btn btn-md bg-[#F8F5FF] hover:bg-[#F8F5FF] border-[#F8F5FF] hover:border-[#F8F5FF]">
            Page {page} of {data?.totalPages}
          </span>
          <button
            className="join-item btn btn-md  bg-[#8147E7] hover:bg-[#8147E7] text-[#FFFFFF]"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === data?.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default NursingAllAttendance;
