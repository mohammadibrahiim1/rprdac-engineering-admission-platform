import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Copy,
  X,
  Check,
  AlertCircle,
  Building2,
  Filter,
  Download,
  Upload,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Eye,
  FileText,
  Users,
  School,
  ChevronDown,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  MapPin,
} from 'lucide-react';
import {
  useCreateInstituteMutation,
  useDeleteInstitutesMutation,
  useGetInstitutesQuery,
  useUpdateInstituteMutation,
} from '../../../../../redux/features/institute/instituteApi';
import toast from 'react-hot-toast';

const InstituteManagement = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '', show: false });
  const [activeTab, setActiveTab] = useState('view');
  const [editingInstitute, setEditingInstitute] = useState(null);

  // Form states
  const [singleForm, setSingleForm] = useState({
    name: '',
    slug: '',
    eiin: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    type: 'school',
    status: 'active',
  });

  const [multipleForms, setMultipleForms] = useState([
    {
      name: '',
      slug: '',
      eiin: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      type: 'school',
      status: 'active',
    },
  ]);

  // Selection and UI states
  const [selectedInstitutes, setSelectedInstitutes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [bulkUpdateField, setBulkUpdateField] = useState('');
  const [bulkUpdateValue, setBulkUpdateValue] = useState('');
  const [instituteToDelete, setInstituteToDelete] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // RTK Query hooks
  const [
    createInstitute,
    { isLoading: creating, error: createError, reset: resetCreate },
  ] = useCreateInstituteMutation();

  const {
    data: institutesData,
    isLoading: loadingInstitutes,
    error: fetchError,
    refetch,
  } = useGetInstitutesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
  });

  const [deleteInstitutes, { isLoading: deleting }] =
    useDeleteInstitutesMutation();

  const [updateInstitute, { isLoading: updating }] =
    useUpdateInstituteMutation();

  // Data extraction
  const institutes = useMemo(
    () => institutesData?.data || [],
    [institutesData?.data],
  );
  const pagination = institutesData?.pagination || {
    total: 0,
    totalPages: 1,
    currentPage: 1,
  };

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (createError) {
      showMessage(
        'error',
        createError?.data?.message || 'Failed to create institute',
      );
      resetCreate();
    }
    if (fetchError) {
      showMessage(
        'error',
        fetchError?.data?.message || 'Failed to fetch institutes',
      );
    }
  }, [createError, fetchError, resetCreate]);

  useEffect(() => {
    setSelectedInstitutes([]);
    setSelectAll(false);
  }, [institutes]);

  // Utility functions
  const showMessage = (type, text, duration = 5000) => {
    setMessage({ type, text, show: true });
    setTimeout(() => setMessage({ type: '', text: '', show: false }), duration);
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

  const validateInstitute = (institute) => {
    if (!institute.name?.trim()) return 'Institute name is required';
    if (!institute.slug?.trim()) return 'Slug is required';
    if (!institute.eiin?.trim()) return 'EIIN is required';
    if (!/^\d+$/.test(institute.eiin)) return 'EIIN must contain only numbers';
    if (institute.eiin?.length < 4) return 'EIIN must be at least 4 digits';
    if (institute.email && !/^\S+@\S+\.\S+$/.test(institute.email))
      return 'Invalid email format';
    if (institute.phone && !/^[\d\s+\-()]+$/.test(institute.phone))
      return 'Invalid phone number';
    return null;
  };

  // Form handlers
  const handleSingleInputChange = (e) => {
    const { name, value } = e.target;
    setSingleForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && value.trim() && { slug: generateSlug(value) }),
    }));
  };

  const handleMultipleInputChange = (index, field, value) => {
    const updatedForms = [...multipleForms];
    updatedForms[index][field] = value;
    if (field === 'name' && value.trim()) {
      updatedForms[index].slug = generateSlug(value);
    }
    setMultipleForms(updatedForms);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingInstitute((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && value.trim() && { slug: generateSlug(value) }),
    }));
  };

  // Form operations
  const addInstituteRow = () => {
    if (multipleForms.length < 20) {
      setMultipleForms((prev) => [
        ...prev,
        {
          name: '',
          slug: '',
          eiin: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          type: 'school',
          status: 'active',
        },
      ]);
      showMessage('info', 'New institute row added');
    } else {
      showMessage('error', 'Maximum 20 institutes can be added at once');
    }
  };

  const removeInstituteRow = (index) => {
    if (multipleForms.length > 1) {
      setMultipleForms((prev) => prev.filter((_, i) => i !== index));
      showMessage('info', 'Institute row removed');
    }
  };

  const copyToMultiple = () => {
    if (singleForm.name && singleForm.slug && singleForm.eiin) {
      setMultipleForms([{ ...singleForm }]);
      setActiveTab('create-multiple');
      showMessage('success', 'Form data copied to multiple institutes');
    } else {
      showMessage('error', 'Please fill the single institute form first');
    }
  };

  const clearForms = () => {
    if (activeTab === 'create') {
      setSingleForm({
        name: '',
        slug: '',
        eiin: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        type: 'school',
        status: 'active',
      });
      showMessage('info', 'Form cleared');
    } else {
      setMultipleForms([
        {
          name: '',
          slug: '',
          eiin: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          type: 'school',
          status: 'active',
        },
      ]);
      showMessage('info', 'All forms cleared');
    }
  };

  // CRUD Operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isMultiple = activeTab === 'create-multiple';
    let dataToSubmit;

    if (isMultiple) {
      const validForms = multipleForms.filter(
        (form) => form.name.trim() && form.slug.trim() && form.eiin.trim(),
      );

      if (validForms.length === 0) {
        showMessage(
          'error',
          'Please fill at least one institute form completely',
        );
        return;
      }

      for (const [index, form] of validForms.entries()) {
        const error = validateInstitute(form);
        if (error) {
          showMessage('error', `Row ${index + 1}: ${error}`);
          return;
        }
      }

      dataToSubmit = validForms;
    } else {
      const error = validateInstitute(singleForm);
      if (error) {
        showMessage('error', error);
        return;
      }
      dataToSubmit = singleForm;
    }

    try {
      const result = await createInstitute(dataToSubmit).unwrap();
      if (result.success) {
        const message = isMultiple
          ? `${
              result.count || result.data?.length || dataToSubmit.length
            } institutes created successfully!`
          : 'Institute created successfully!';

        showMessage('success', message);
        setSingleForm({
          name: '',
          slug: '',
          eiin: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          type: 'school',
          status: 'active',
        });
        setMultipleForms([
          {
            name: '',
            slug: '',
            eiin: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            type: 'school',
            status: 'active',
          },
        ]);
        refetch();
        setActiveTab('view');
      }
    } catch (error) {
      toast.error(error.data?.message || 'Something went wrong! Try again.');
    }
  };

  const handleUpdateInstitute = async (e) => {
    e.preventDefault();
    if (!editingInstitute) return;

    const error = validateInstitute(editingInstitute);
    if (error) {
      showMessage('error', error);
      return;
    }

    try {
      const result = await updateInstitute({
        id: editingInstitute._id,
        data: {
          name: editingInstitute.name,
          slug: editingInstitute.slug,
          eiin: editingInstitute.eiin,
          address: editingInstitute.address,
          phone: editingInstitute.phone,
          email: editingInstitute.email,
          website: editingInstitute.website,
          type: editingInstitute.type,
          status: editingInstitute.status,
        },
      }).unwrap();

      if (result.success) {
        showMessage('success', 'Institute updated successfully!');
        setEditingInstitute(null);
        setIsEditSheetOpen(false);
        refetch();
        setActiveTab('view');
      }
    } catch (error) {
      toast.error(error.data?.message || 'Something went wrong! Try again.');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedInstitutes.length === 0) {
      showMessage('error', 'Please select institutes to update');
      return;
    }

    if (!bulkUpdateField || !bulkUpdateValue.trim()) {
      showMessage('error', 'Please select a field and enter a value');
      return;
    }

    const updates = selectedInstitutes.map((id) => ({
      id,
      data: { [bulkUpdateField]: bulkUpdateValue },
    }));

    try {
      const result = await updateInstitute(updates).unwrap();
      if (result.success) {
        showMessage(
          'success',
          `${result.data.modifiedCount} institutes updated successfully!`,
        );
        setSelectedInstitutes([]);
        setBulkUpdateField('');
        setBulkUpdateValue('');
        setSelectAll(false);
        setIsBulkUpdateOpen(false);
        refetch();
      }
    } catch (error) {
      showMessage('error', error?.data?.message || 'Error updating institutes');
    }
  };

  const handleDelete = async () => {
    if (!instituteToDelete && selectedInstitutes.length === 0) {
      showMessage('error', 'Please select institutes to delete');
      return;
    }

    const idsToDelete = instituteToDelete
      ? [instituteToDelete]
      : selectedInstitutes;

    try {
      const result = await deleteInstitutes(idsToDelete).unwrap();
      if (result.success) {
        const deletedCount = instituteToDelete ? 1 : result.data.deletedCount;
        showMessage(
          'success',
          `${deletedCount} institute(s) deleted successfully!`,
        );

        if (!instituteToDelete) {
          setSelectedInstitutes([]);
          setSelectAll(false);
        }

        setInstituteToDelete(null);
        setIsDeleteDialogOpen(false);
        refetch();

        if (institutes.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) {
      showMessage('error', error?.data?.message || 'Error deleting institutes');
    }
  };

  // Selection and pagination
  const toggleInstituteSelection = (id) => {
    setSelectedInstitutes((prev) =>
      prev.includes(id)
        ? prev.filter((instituteId) => instituteId !== id)
        : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedInstitutes([]);
    } else {
      setSelectedInstitutes(institutes.map((institute) => institute._id));
    }
    setSelectAll(!selectAll);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination?.totalPages) {
      setCurrentPage(page);
    }
  };

  const startEditing = (institute) => {
    setEditingInstitute({ ...institute });
    setIsEditSheetOpen(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  // Loading skeleton
  const TableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center p-4 space-x-4 bg-white border rounded-lg animate-pulse"
        >
          <div className="w-1/12 h-4 bg-gray-200 rounded"></div>
          <div className="w-4/12 h-4 bg-gray-200 rounded"></div>
          <div className="w-2/12 h-4 bg-gray-200 rounded"></div>
          <div className="w-2/12 h-4 bg-gray-200 rounded"></div>
          <div className="w-1/12 h-4 bg-gray-200 rounded"></div>
          <div className="w-2/12 h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900 md:text-4xl">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Institute Management
                </span>
              </h1>
              <p className="mt-2 text-gray-600">
                Create, manage, and monitor educational institutes
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {pagination?.totalInstitutes || 0} Institutes
                </span>
              </div>

              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Institute
              </button>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        <AnimatePresence>
          {message.show && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <div
                className={`rounded-lg border p-4 ${
                  message.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : message.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                <div className="flex items-center">
                  <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3" />
                  <span className="font-medium">{message.text}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl">
          {/* Mobile Search */}
          <div
            className={`lg:hidden border-b border-gray-200 px-6 py-4 transition-all duration-300 ${
              isMobileMenuOpen ? 'block' : 'hidden'
            }`}
          >
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search institutes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full appearance-none pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                >
                  {[5, 10, 20, 50].map((num) => (
                    <option key={num} value={num}>
                      {num} per page
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                {
                  id: 'view',
                  label: 'View Institutes',
                  icon: Eye,
                  count: pagination?.totalInstitutes,
                },
                { id: 'create', label: 'Create Single', icon: Plus },
                { id: 'create-multiple', label: 'Create Multiple', icon: Copy },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* View Tab */}
            {activeTab === 'view' && (
              <div>
                {loadingInstitutes ? (
                  <TableSkeleton />
                ) : institutes.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full">
                      <School className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      No institutes found
                    </h3>
                    <p className="max-w-sm mx-auto mb-8 text-gray-500">
                      {debouncedSearch
                        ? 'Try adjusting your search terms or filters'
                        : 'Get started by creating your first institute'}
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="flex items-center gap-2 px-6 py-3 mx-auto font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Institute
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Bulk Actions */}
                    {selectedInstitutes.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                      >
                        <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                              <div className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full">
                                {selectedInstitutes.length} selected
                              </div>
                              <span className="text-sm font-medium text-blue-900">
                                Select bulk action:
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setIsBulkUpdateOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 font-medium text-blue-700 transition-all bg-white border border-blue-300 rounded-lg hover:bg-blue-50 focus:ring-2 focus:ring-blue-200"
                              >
                                <Edit2 className="w-4 h-4" />
                                Bulk Update
                              </button>

                              <button
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Selected
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Institutes Table */}
                    <div className="overflow-hidden border border-gray-200 rounded-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                </div>
                              </th>
                              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                                Institute
                              </th>
                              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                                EIIN
                              </th>
                              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {institutes?.map((institute) => (
                              <motion.tr
                                key={institute._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="transition-colors hover:bg-gray-50"
                              >
                                <td className="px-6 py-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedInstitutes.includes(
                                      institute._id,
                                    )}
                                    onChange={() =>
                                      toggleInstituteSelection(institute._id)
                                    }
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {institute.name}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                                        {institute.slug}
                                      </span>
                                    </div>
                                    {institute.address && (
                                      <div className="flex items-start gap-1 mt-1 text-xs text-gray-500">
                                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-1">
                                          {institute.address}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="px-3 py-1.5 bg-gray-100 text-gray-800 font-mono text-sm rounded-lg border border-gray-200">
                                    {institute.eiin}
                                  </div>
                                </td>

                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => startEditing(institute)}
                                      className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setInstituteToDelete(institute._id);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                      className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination */}
                    {pagination?.totalPages > 1 && (
                      <div className="mt-6">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                          <div className="text-sm text-gray-600">
                            Showing{' '}
                            <span className="font-medium">
                              {(currentPage - 1) * itemsPerPage + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                              {Math.min(
                                currentPage * itemsPerPage,
                                pagination.totalInstitutes,
                              )}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">
                              {pagination?.totalInstitutes}
                            </span>{' '}
                            entries
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => goToPage(1)}
                              disabled={currentPage === 1}
                              className={`p-2 rounded-lg border ${
                                currentPage === 1
                                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <ChevronsLeft className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className={`p-2 rounded-lg border ${
                                currentPage === 1
                                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from(
                              { length: Math.min(5, pagination.totalPages) },
                              (_, i) => {
                                let pageNum;
                                if (pagination.totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (
                                  currentPage >=
                                  pagination.totalPages - 2
                                ) {
                                  pageNum = pagination.totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }

                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => goToPage(pageNum)}
                                    className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium border ${
                                      currentPage === pageNum
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              },
                            )}

                            <button
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={currentPage === pagination.totalPages}
                              className={`p-2 rounded-lg border ${
                                currentPage === pagination.totalPages
                                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => goToPage(pagination.totalPages)}
                              disabled={currentPage === pagination.totalPages}
                              className={`p-2 rounded-lg border ${
                                currentPage === pagination.totalPages
                                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <ChevronsRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Create Single Tab */}
            {activeTab === 'create' && (
              <div>
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-3xl mx-auto"
                >
                  <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Create New Institute
                      </h3>
                      <p className="mt-1 text-gray-600">
                        Fill in the details below to create a single institute
                      </p>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Institute Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={singleForm.name}
                            onChange={handleSingleInputChange}
                            placeholder="Enter institute name"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            EIIN Number *
                          </label>
                          <input
                            type="text"
                            name="eiin"
                            value={singleForm.eiin}
                            onChange={handleSingleInputChange}
                            placeholder="Enter EIIN number"
                            required
                            pattern="\d+"
                            minLength="4"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            4+ digits, numbers only
                          </p>
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Slug *
                          </label>
                          <input
                            type="text"
                            name="slug"
                            value={singleForm.slug}
                            onChange={handleSingleInputChange}
                            placeholder="Auto-generated from name"
                            readOnly
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Institute Type
                          </label>
                          <div className="relative">
                            <select
                              name="type"
                              value={singleForm.type}
                              onChange={(e) =>
                                setSingleForm((prev) => ({
                                  ...prev,
                                  type: e.target.value,
                                }))
                              }
                              className="w-full appearance-none px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                            >
                              <option value="school">School</option>
                              <option value="college">College</option>
                              <option value="university">University</option>
                              <option value="madrasah">Madrasah</option>
                              <option value="other">Other</option>
                            </select>
                            <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <div className="relative">
                            <select
                              name="status"
                              value={singleForm.status}
                              onChange={(e) =>
                                setSingleForm((prev) => ({
                                  ...prev,
                                  status: e.target.value,
                                }))
                              }
                              className="w-full appearance-none px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="pending">Pending</option>
                            </select>
                            <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Address
                          </label>
                          <textarea
                            name="address"
                            value={singleForm.address}
                            onChange={handleSingleInputChange}
                            placeholder="Enter full address"
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={singleForm.phone}
                            onChange={handleSingleInputChange}
                            placeholder="Enter phone number"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={singleForm.email}
                            onChange={handleSingleInputChange}
                            placeholder="Enter email address"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Website
                          </label>
                          <input
                            type="url"
                            name="website"
                            value={singleForm.website}
                            onChange={handleSingleInputChange}
                            placeholder="Enter website URL"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-5 border-t border-gray-200">
                      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={clearForms}
                            disabled={!singleForm.name && !singleForm.eiin}
                            className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Clear Form
                          </button>

                          <button
                            type="button"
                            onClick={copyToMultiple}
                            disabled={!singleForm.name || !singleForm.eiin}
                            className="px-4 py-2.5 border border-purple-300 text-purple-700 font-medium rounded-lg hover:bg-purple-50 focus:ring-2 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy to Multiple
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={
                            creating || !singleForm.name || !singleForm.eiin
                          }
                          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 min-w-[150px] justify-center"
                        >
                          {creating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Create Institute
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.form>
              </div>
            )}

            {/* Create Multiple Tab */}
            {activeTab === 'create-multiple' && (
              <div>
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            Create Multiple Institutes
                          </h3>
                          <p className="mt-1 text-gray-600">
                            Add multiple institutes at once (max 20)
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={addInstituteRow}
                            disabled={multipleForms.length >= 20}
                            className="px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Row
                          </button>

                          <button
                            type="button"
                            onClick={clearForms}
                            disabled={multipleForms.every(
                              (f) => !f.name && !f.eiin,
                            )}
                            className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-6">
                        {multipleForms.map((form, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="p-5 transition-colors border border-gray-300 border-dashed rounded-xl hover:border-gray-400 bg-gray-50/50">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-full">
                                    Institute #{index + 1}
                                  </div>
                                  {form.name && (
                                    <span className="text-sm font-medium text-gray-900">
                                      {form.name}
                                    </span>
                                  )}
                                </div>

                                {multipleForms.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeInstituteRow(index)}
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Name *
                                  </label>
                                  <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                      handleMultipleInputChange(
                                        index,
                                        'name',
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Institute name"
                                    required
                                    className="w-full px-3 py-2 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-700">
                                    EIIN *
                                  </label>
                                  <input
                                    type="text"
                                    value={form.eiin}
                                    onChange={(e) =>
                                      handleMultipleInputChange(
                                        index,
                                        'eiin',
                                        e.target.value,
                                      )
                                    }
                                    placeholder="EIIN number"
                                    required
                                    className="w-full px-3 py-2 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Slug *
                                  </label>
                                  <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) =>
                                      handleMultipleInputChange(
                                        index,
                                        'slug',
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Auto-generated"
                                    readOnly
                                    className="w-full px-3 py-2 text-gray-500 bg-gray-100 border border-gray-300 rounded-lg"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Phone
                                  </label>
                                  <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) =>
                                      handleMultipleInputChange(
                                        index,
                                        'phone',
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Phone number"
                                    className="w-full px-3 py-2 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Email
                                  </label>
                                  <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                      handleMultipleInputChange(
                                        index,
                                        'email',
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Email address"
                                    className="w-full px-3 py-2 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Type
                                  </label>
                                  <div className="relative">
                                    <select
                                      value={form.type}
                                      onChange={(e) =>
                                        handleMultipleInputChange(
                                          index,
                                          'type',
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 transition-all bg-white border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                      <option value="school">School</option>
                                      <option value="college">College</option>
                                      <option value="university">
                                        University
                                      </option>
                                      <option value="madrasah">Madrasah</option>
                                    </select>
                                    <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="px-6 py-5 border-t border-gray-200">
                      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            {
                              multipleForms.filter((f) => f.name && f.eiin)
                                .length
                            }{' '}
                          </span>
                          out of {multipleForms.length} forms are ready to
                          create
                        </div>

                        <button
                          type="submit"
                          disabled={
                            creating ||
                            !multipleForms.some((f) => f.name && f.eiin)
                          }
                          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 min-w-[180px] justify-center"
                        >
                          {creating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Creating{' '}
                              {
                                multipleForms.filter((f) => f.name && f.eiin)
                                  .length
                              }{' '}
                              Institutes...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Create{' '}
                              {
                                multipleForms.filter((f) => f.name && f.eiin)
                                  .length
                              }{' '}
                              Institutes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.form>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bulk Update Modal */}
      {isBulkUpdateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white shadow-2xl rounded-2xl"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Bulk Update Institutes
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Update {selectedInstitutes.length} selected institutes
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Field to Update
                </label>
                <div className="relative">
                  <select
                    value={bulkUpdateField}
                    onChange={(e) => setBulkUpdateField(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  >
                    <option value="">Select field...</option>
                    <option value="name">Name</option>
                    <option value="slug">Slug</option>
                    <option value="eiin">EIIN</option>
                    <option value="type">Type</option>
                    <option value="status">Status</option>
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                  </select>
                  <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  New Value
                </label>
                <input
                  type="text"
                  value={bulkUpdateValue}
                  onChange={(e) => setBulkUpdateValue(e.target.value)}
                  placeholder={`Enter new ${bulkUpdateField} value`}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setIsBulkUpdateOpen(false)}
                className="px-4 py-2 font-medium text-gray-700 transition-all border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={
                  !bulkUpdateField || !bulkUpdateValue.trim() || updating
                }
                className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Institutes'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white shadow-2xl rounded-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-center text-gray-900">
                Are you sure?
              </h3>
              <p className="mb-6 text-center text-gray-600">
                {instituteToDelete
                  ? 'This will permanently delete the selected institute.'
                  : `This will permanently delete ${selectedInstitutes.length} selected institutes.`}
                <br />
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setInstituteToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300 transition-all flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Sheet */}
      {isEditSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute inset-y-0 right-0 w-full overflow-y-auto bg-white shadow-2xl sm:max-w-2xl"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Edit Institute
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Update institute details below
                  </p>
                </div>
                <button
                  onClick={() => setIsEditSheetOpen(false)}
                  className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {editingInstitute && (
              <form onSubmit={handleUpdateInstitute} className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editingInstitute.name}
                        onChange={handleEditInputChange}
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        EIIN *
                      </label>
                      <input
                        type="text"
                        name="eiin"
                        value={editingInstitute.eiin}
                        onChange={handleEditInputChange}
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Slug *
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={editingInstitute.slug}
                        onChange={handleEditInputChange}
                        readOnly
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <div className="relative">
                        <select
                          value={editingInstitute.type}
                          onChange={(e) =>
                            setEditingInstitute((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          className="w-full appearance-none px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                        >
                          <option value="school">School</option>
                          <option value="college">College</option>
                          <option value="university">University</option>
                        </select>
                        <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={editingInstitute.phone || ''}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editingInstitute.email || ''}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={editingInstitute.address || ''}
                      onChange={handleEditInputChange}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Institute'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditSheetOpen(false)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InstituteManagement;
