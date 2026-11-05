import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Search, Building, Edit, Loader } from 'lucide-react';
import {
  useGetMessesQuery,
  usePostMessMutation,
} from '../../../../../redux/features/mess/messApi';

const MessManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState('view');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const limit = 10;

  // RTK Query hooks
  const [postMess, { isLoading: creating }] = usePostMessMutation();

  const {
    data: messData,
    isLoading: loadingMesses,
    error: fetchError,
    refetch,
  } = useGetMessesQuery({
    search: debouncedSearch,
    page,
    limit,
  });

  const messes = messData?.messes || [];

  const pagination = {
    currentPage: messData?.currentPage || 1,
    totalPages: messData?.totalPages || 1,
    totalMesses: messData?.totalMesses || 0,
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    totalSeats: '',
    availableSeats: '',
    rooms: [{ roomNumber: '', seats: '' }],
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle messages
  useEffect(() => {
    if (fetchError) {
      showMessage('error', 'Failed to fetch messes');
    }
  }, [fetchError]);

  const showMessage = (type, text, duration = 5000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), duration);
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && { slug: generateSlug(value) }),
    }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleRoomChange = (index, e) => {
    const { name, value } = e.target;
    const newRooms = [...formData.rooms];
    newRooms[index][name] = value;
    setFormData((prev) => ({ ...prev, rooms: newRooms }));
  };

  const addRoomField = () => {
    setFormData((prev) => ({
      ...prev,
      rooms: [...prev.rooms, { roomNumber: '', seats: '' }],
    }));
  };

  const removeRoomField = (index) => {
    if (formData.rooms.length > 1) {
      setFormData((prev) => ({
        ...prev,
        rooms: prev.rooms.filter((_, i) => i !== index),
      }));
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      slug: '',
      totalSeats: '',
      availableSeats: '',
      rooms: [{ roomNumber: '', seats: '' }],
    });
    showMessage('info', 'Form cleared');
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim() || !formData.slug.trim()) {
      showMessage('error', 'Please fill in all required fields');
      return;
    }

    try {
      const messData = {
        ...formData,
        totalSeats: Number(formData.totalSeats) || 0,
        availableSeats: Number(formData.availableSeats) || 0,
        rooms: formData.rooms.map((room) => ({
          roomNumber: Number(room.roomNumber) || 0,
          seats: Number(room.seats) || 0,
          occupiedSeats: 0,
          isAvailable: true,
        })),
      };

      await postMess(messData).unwrap();
      showMessage('success', 'Mess created successfully!');
      clearForm();
      refetch();
      setActiveTab('view');
    } catch (error) {
      showMessage('error', error?.data?.message || 'Failed to create mess');
    }
  };

  // Delete mess
  // const handleDelete = async (messId) => {
  //   if (!window.confirm("Are you sure you want to delete this mess?")) return;

  //   try {
  //     await deleteMess(messId).unwrap();
  //     showMessage("success", "Mess deleted successfully!");
  //     refetch();
  //   } catch (error) {
  //     showMessage("error", error?.data?.message || "Failed to delete mess");
  //   }
  // };

  // Pagination
  const goToPage = (newPage) => {
    setPage(newPage);
  };

  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (current < totalPages - 2) pages.push('...');
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="py-16 text-center">
      <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {debouncedSearch ? 'No messes found' : 'No messes available'}
      </h3>
      <p className="max-w-sm mx-auto text-gray-500">
        {debouncedSearch
          ? "Try adjusting your search terms to find what you're looking for."
          : 'Get started by creating your first mess facility.'}
      </p>
      {!debouncedSearch && (
        <button
          onClick={() => setActiveTab('create')}
          className="px-6 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Create Mess
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-6 bg-gray-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-start">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Mess Management
          </h1>
          <p className="max-w-2xl text-sm text-gray-600">
            Create and manage student mess facilities with room allocation and
            seat management
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 rounded-lg p-4 border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : message.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="flex-shrink-0 mr-3">
                  {message.type === 'success'
                    ? '✅'
                    : message.type === 'error'
                      ? '❌'
                      : 'ℹ️'}
                </span>
                <span className="font-medium">{message.text}</span>
              </div>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-5 px-6 text-center font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'create'
                    ? 'border-blue-600 text-blue-700 bg-blue-25'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Mess
                </div>
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`flex-1 py-5 px-6 text-center font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'view'
                    ? 'border-blue-600 text-blue-700 bg-blue-25'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" />
                  View Messes ({pagination.totalMesses})
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Create Mess Tab */}
            {activeTab === 'create' && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Create New Mess
                  </h2>
                  <p className="mt-1 text-gray-600">
                    Fill in the details below to create a new mess facility
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="p-6 bg-gray-50 rounded-xl">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                          Mess Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter mess name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                          Slug <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleChange}
                          className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                          placeholder="Auto-generated from name"
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                          Total Seats
                        </label>
                        <input
                          type="number"
                          name="totalSeats"
                          value={formData.totalSeats}
                          onChange={handleChange}
                          className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter total seats"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                          Available Seats
                        </label>
                        <input
                          type="number"
                          name="availableSeats"
                          value={formData.availableSeats}
                          onChange={handleChange}
                          className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter available seats"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rooms Section */}
                  <div className="p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Room Configuration
                        </h3>
                        <p className="mt-1 text-gray-600">
                          Add rooms and their seating capacity
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addRoomField}
                        className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                        Add Room
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.rooms.map((room, index) => (
                        <div
                          key={index}
                          className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
                              Room #{index + 1}
                            </h4>
                            {formData.rooms.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRoomField(index)}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 transition-colors hover:text-red-800"
                              >
                                <Trash2 className="w-3 h-3" />
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Room Number{' '}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name="roomNumber"
                                value={room.roomNumber}
                                onChange={(e) => handleRoomChange(index, e)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter room number"
                                min="1"
                                // required
                              />
                            </div>

                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Seats <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name="seats"
                                value={room.seats}
                                onChange={(e) => handleRoomChange(index, e)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Number of seats"
                                min="1"
                                max="10"
                                // required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col items-center justify-end gap-3 pt-6 border-t border-gray-200 sm:flex-row">
                    <button
                      type="button"
                      onClick={clearForm}
                      className="w-full px-8 py-3 font-semibold text-gray-700 transition-colors border border-gray-300 rounded-lg sm:w-auto hover:bg-gray-50"
                    >
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[160px]"
                    >
                      {creating ? (
                        <span className="flex items-center justify-center">
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </span>
                      ) : (
                        'Create Mess'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* View Messes Tab */}
            {activeTab === 'view' && (
              <div className="space-y-6">
                {/* Search and Controls */}
                <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="w-full lg:w-96">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full py-3 pl-10 pr-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search messes by name or slug..."
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    <span>{pagination.totalMesses} messes found</span>
                  </div>
                </div>

                {/* Messes Table */}
                <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
                  {loadingMesses ? (
                    <LoadingSpinner />
                  ) : messes.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                              #
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                              Mess Name
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                              Slug
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase">
                              Total Seats
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase">
                              Available
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase">
                              Rooms
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {messes.map((mess, index) => (
                            <tr
                              key={mess._id}
                              className="transition-colors hover:bg-gray-50 group"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {(page - 1) * limit + index + 1}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">
                                  {mess.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="px-2 py-1 font-mono text-sm text-gray-500 border rounded bg-gray-50">
                                  {mess.slug}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {mess.totalSeats}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      mess.availableSeats > 0
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {mess.availableSeats}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-500">
                                  {mess.rooms?.length || 0}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                                  <button className="p-1 text-blue-600 transition-colors rounded hover:text-blue-800">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    // onClick={() => handleDelete(mess._id)}
                                    // disabled={deleting}
                                    className="p-1 text-red-600 transition-colors rounded hover:text-red-800 disabled:opacity-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex flex-col items-center justify-between gap-4 pt-6 border-t border-gray-200 sm:flex-row">
                    <div className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-semibold">
                        {(page - 1) * limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-semibold">
                        {Math.min(page * limit, pagination.totalMesses)}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold">
                        {pagination.totalMesses}
                      </span>{' '}
                      results
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px]"
                      >
                        Previous
                      </button>

                      <div className="flex space-x-1">
                        {getPageNumbers().map((pageNum, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              typeof pageNum === 'number' && goToPage(pageNum)
                            }
                            disabled={pageNum === '...'}
                            className={`px-3.5 py-2 border text-sm font-semibold rounded-lg min-w-[44px] transition-colors ${
                              pageNum === page
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : pageNum === '...'
                                  ? 'border-transparent text-gray-500 cursor-default'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessManagement;
