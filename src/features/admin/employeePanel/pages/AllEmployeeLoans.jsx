import React, { useState } from 'react';

import { useLoaderData } from 'react-router-dom';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import { PiMagnifyingGlass } from 'react-icons/pi';

const ITEMS_PER_PAGE = 15;

const AllEmployeeLoans = () => {
  const [search, setSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const filterOptions = ['approve', 'pending'];
  const data = useLoaderData();

  const loans = data?.data;

  const handleCheckboxChange = (subtype) => {
    setSelectedFilters(
      (prevFilters) =>
        prevFilters.includes(subtype)
          ? prevFilters.filter((filter) => filter !== subtype) // Remove if already selected
          : [...prevFilters, subtype], // Add if not selected
    );
  };

  const filteredLoans = loans?.filter((loan) => {
    const normalizedSearch = search?.toLowerCase() || '';
    const matchedSearch = loan?.createdAt
      ?.toLowerCase()
      ?.includes(normalizedSearch);

    const matchedStatus = selectedFilters?.length
      ? selectedFilters.includes(loan?.status)
      : true;

    return matchedSearch && matchedStatus;
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredLoans?.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLoans = filteredLoans?.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handlePrevClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const userName = filteredLoans?.[0]?.user?.userName || 'No user found';

  return (
    <div>
      <section>
        <div>
          {/* <div className="gap-3 my-10 text-center text-primary">
            <h1 className="col-span-5 text-3xl font-semibold capitalize">
              Employee all loans
            </h1>
            <BreadCrumbMenu></BreadCrumbMenu>
          </div> */}

          <div className="grid items-start justify-between grid-cols-12 gap-5">
            <div className="col-span-12 lg:col-span-3 ">
              <div className="w-full max-w-4xl p-4 mx-auto bg-white rounded-lg shadow-md md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 capitalize">
                    {userName} All Loans
                  </h2>
                  <div className="flex items-center gap-3">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Total {filteredLoans?.length || 0}{' '}
                      {filteredLoans?.length > 1 ? 'loans' : 'loan'}
                    </button>
                  </div>
                </div>

                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search properties..."
                      value={search}
                      onChange={handleSearch}
                      className="w-full p-2 pl-10 text-sm border rounded-md"
                    />
                    <PiMagnifyingGlass className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Table Counts */}
                <div className="flex justify-between p-4 mb-4 bg-gray-100 rounded-md">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Approved:{' '}
                    </span>
                    <span className="text-sm text-gray-800">
                      {data?.totalCounts?.approved || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Pending:{' '}
                    </span>
                    <span className="text-sm text-gray-800">
                      {data?.totalCounts?.pending || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Total :{' '}
                    </span>
                    <span className="text-sm text-gray-800">
                      {data?.totalApprovedLoanAmount || 0} BDT
                    </span>
                  </div>
                </div>

                {/* Filter Container */}
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Status</label>

                    {/* Subtypes */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {filterOptions?.map((subtype) => (
                        <label
                          key={subtype}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={selectedFilters?.includes(subtype)}
                            onChange={() => handleCheckboxChange(subtype)}
                          />
                          {subtype}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col items-center justify-between mt-6 sm:flex-row">
                  <div className="flex items-center">
                    <span className="mr-4 text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={handlePrevClick}
                      disabled={currentPage === 1}
                      className="px-3 py-1 mr-2 text-sm border rounded-md disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextClick}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 overflow-x-auto capitalize lg:col-span-9">
              {currentLoans?.length ? (
                <table className="table bg-white border rounded-md table-sm">
                  <thead className="font-semibold text-white bg-primary/90">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-left text-gray-500 capitalize align-middle bg-gray-100 border border-l-0 border-r-0 border-gray-200 border-solid dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 whitespace-nowrap">
                        SL#
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-left text-gray-500 capitalize align-middle bg-gray-100 border border-l-0 border-r-0 border-gray-200 border-solid dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-left text-gray-500 capitalize align-middle bg-gray-100 border border-l-0 border-r-0 border-gray-200 border-solid dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 whitespace-nowrap">
                        Name
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-left text-gray-500 capitalize align-middle bg-gray-100 border border-l-0 border-r-0 border-gray-200 border-solid dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 whitespace-nowrap">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-left text-gray-500 capitalize align-middle bg-gray-100 border border-l-0 border-r-0 border-gray-200 border-solid dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 whitespace-nowrap">
                        Role
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-left text-gray-500 capitalize align-middle bg-gray-100 border border-l-0 border-r-0 border-gray-200 border-solid dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 whitespace-nowrap">
                        Loan Amount
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-left text-gray-500 capitalize align-middle bg-gray-100 border border-l-0 border-r-0 border-gray-200 border-solid dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 whitespace-nowrap">
                        status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold text-[#101750]">
                    {currentLoans?.map(
                      (
                        { _id, createdAt, user, status, amount, userDetails },
                        index,
                      ) => (
                        <tr key={_id}>
                          <th className="p-4 px-4 text-xs text-left align-middle border-t-0 border-l-0 border-r-0 whitespace-nowrap">
                            {index + 1}
                          </th>
                          <td className="p-4 px-4 text-xs text-left align-middle border-t-0 border-l-0 border-r-0 whitespace-nowrap">
                            {createdAt.slice(0, 10)}
                          </td>
                          <td className="p-4 px-4 text-xs text-left align-middle border-t-0 border-l-0 border-r-0 whitespace-nowrap">
                            {user?.userName ? user.userName : 'not found'}
                          </td>
                          <td className="p-4 px-4 text-xs text-left align-middle border-t-0 border-l-0 border-r-0 whitespace-nowrap">
                            {user?.phone ? user?.phone : 'no contact found'}
                          </td>
                          <td className="p-4 px-4 text-xs text-left align-middle border-t-0 border-l-0 border-r-0 whitespace-nowrap">
                            {user?.userType ? user?.userType : 'no role found'}
                          </td>

                          <td className="p-4 px-4 text-xs text-left align-middle border-t-0 border-l-0 border-r-0 whitespace-nowrap">
                            {amount || 0} BDT
                          </td>
                          <td className="border-b border-gray-100">
                            <span
                              className={
                                status === 'approve'
                                  ? ' btn btn-xs rounded btn-success font-semibold'
                                  : ' btn-xs btn btn-warning rounded py-0 my-1 font-semibold'
                              }
                            >
                              {status === 'approve' ? 'Approved' : status}
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center mx-auto text-center">
                  <img
                    src="https://i.ibb.co.com/dtfdFHv/Empty-State.png"
                    alt=""
                    srcSet=""
                  />
                  <h1 className="py-2 text-xl font-semibold">{data?.error}</h1>
                  <p>
                    Try adjusting your search to find what you are looking for.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllEmployeeLoans;
