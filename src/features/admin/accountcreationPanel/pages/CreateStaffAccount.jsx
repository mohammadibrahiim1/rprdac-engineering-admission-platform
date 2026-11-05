import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  Save,
  UserPlus,
  ChevronRight,
  LayoutGrid,
  Loader,
  Trash2,
  Users,
  CheckSquare,
  Square,
  KeyRound,
  Layers,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAssignPanelToUserMutation,
  useGetAllUsersPanelsQuery,
  useRemovePanelFromUserMutation,
  useSetAdminPanelPasswordMutation,
} from '../../../../authentication/services/panelAccessApi';
import { ROUTE_CONFIG } from '../../../../../constants/routes.config';

const CreateStaffAccount = () => {
  const [activeTab, setActiveTab] = useState('assign');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Removals State Management: Map per user
  // Structure: { [userId]: { panels: ['student'], routes: ['student_list'] } }
  const [removalMap, setRemovalMap] = useState({});

  // Form States for Assignment
  const [passwords, setPasswords] = useState({});
  const [showPass, setShowPass] = useState({});
  const [userId, setUserId] = useState('');
  const [selectedPanels, setSelectedPanels] = useState([]);
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [panelPassword, setPanelPassword] = useState('');
  const [note, setNote] = useState('');

  const allPanels = [
    'teacher',
    'nursing',
    'employee',
    'announcement',
    'order',
    'student',
    'user',
    'control',
    'account',
    'examcenter',
  ];

  // RTK Query Hooks
  const [assignPanelToUser, { isLoading: assignLoading }] =
    useAssignPanelToUserMutation();
  const {
    data,
    isLoading: accessUsersLoading,
    isError,
    error,
    refetch,
  } = useGetAllUsersPanelsQuery();
  const [setAdminPanelPassword, { isLoading: passLoading }] =
    useSetAdminPanelPasswordMutation();
  const [removeUserPanel, { isLoading: removeLoading }] =
    useRemovePanelFromUserMutation();

  const accessUsers = data?.users || [];

  const handleInputChange = (panel, val) => {
    setPasswords((prev) => ({ ...prev, [panel]: val }));
  };

  const toggleVisibility = (panel) => {
    setShowPass((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const getRoutesForPanel = (panelType, userRole = 'admin') => {
    if (panelType === 'control' || panelType === 'controlPanel') {
      return (ROUTE_CONFIG?.controlPanelRoutes || []).filter(
        (route) => Array.isArray(route.roles) && route.roles.includes(userRole),
      );
    }

    if (panelType === 'account' || panelType === 'accountPanel') {
      return (ROUTE_CONFIG?.accountPanelRoutes || []).filter(
        (route) => Array.isArray(route.roles) && route.roles.includes(userRole),
      );
    }

    const matchedPanel = ROUTE_CONFIG?.panels?.find(
      (p) => p.panelType === panelType,
    );
    if (!matchedPanel?.subRoutes) return [];

    return matchedPanel.subRoutes.filter(
      (sub) => Array.isArray(sub.roles) && sub.roles.includes(userRole),
    );
  };

  // Toggle Panel Selection
  const handlePanelToggle = (panel) => {
    setSelectedPanels((prev) => {
      const isExist = prev.includes(panel);
      if (isExist) {
        const panelRoutes = getRoutesForPanel(panel).map((r) => r.key);
        setSelectedRoutes((rPrev) =>
          rPrev.filter((key) => !panelRoutes.includes(key)),
        );
        return prev.filter((p) => p !== panel);
      } else {
        return [...prev, panel];
      }
    });
  };

  // Toggle Sub-Route Selection
  const handleRouteToggle = (routeKey) => {
    setSelectedRoutes((prev) =>
      prev.includes(routeKey)
        ? prev.filter((k) => k !== routeKey)
        : [...prev, routeKey],
    );
  };

  // Submit Password Form
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(passwords).filter(([_, v]) => v && v.trim() !== ''),
    );

    if (Object.keys(payload).length === 0) {
      return toast.error('Please enter at least one password');
    }

    try {
      const res = await setAdminPanelPassword({
        panelPasswords: payload,
      }).unwrap();
      if (res?.success || res?.status === 'success') {
        toast.success(res?.message || 'Passwords updated successfully!');
        setPasswords({});
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update passwords');
    }
  };

  // Submit Grant Access Form
  const handleAssignPanelSubmit = async (e) => {
    e.preventDefault();

    if (!userId.trim()) return toast.error('Please enter a User ID');
    if (selectedPanels.length === 0)
      return toast.error('Please select at least one panel!');
    if (!panelPassword.trim())
      return toast.error('Please enter panel password');

    try {
      await assignPanelToUser({
        userId: userId.trim(),
        panels: selectedPanels,
        routes: selectedRoutes,
        panelPassword: panelPassword.trim(),
        note: note.trim(),
      }).unwrap();

      toast.success('Permissions assigned successfully!');
      setUserId('');
      setSelectedPanels([]);
      setSelectedRoutes([]);
      setPanelPassword('');
      setNote('');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to assign panel access');
    }
  };

  // Toggle Panel Selection For Removal
  const handlePanelRemovalToggle = (uId, panel) => {
    setRemovalMap((prev) => {
      const current = prev[uId] || { panels: [], routes: [] };
      const isExist = current.panels.includes(panel);
      const updatedPanels = isExist
        ? current.panels.filter((p) => p !== panel)
        : [...current.panels, panel];

      return {
        ...prev,
        [uId]: { ...current, panels: updatedPanels },
      };
    });
  };

  // Toggle Route Selection For Removal
  const handleRouteRemovalToggle = (uId, routeKey) => {
    setRemovalMap((prev) => {
      const current = prev[uId] || { panels: [], routes: [] };
      const isExist = current.routes.includes(routeKey);
      const updatedRoutes = isExist
        ? current.routes.filter((r) => r !== routeKey)
        : [...current.routes, routeKey];

      return {
        ...prev,
        [uId]: { ...current, routes: updatedRoutes },
      };
    });
  };

  // Perform Removal
  const handleRemoveSubmit = async (uId) => {
    const userMap = removalMap[uId];
    const panelsToRemove = userMap?.panels || [];
    const routesToRemove = userMap?.routes || [];

    if (panelsToRemove.length === 0 && routesToRemove.length === 0) {
      return toast.error('Please select at least one panel or route to remove');
    }

    try {
      await removeUserPanel({
        userId: uId,
        panelsToRemove,
        routesToRemove,
      }).unwrap();

      setRemovalMap((prev) => ({
        ...prev,
        [uId]: { panels: [], routes: [] },
      }));

      toast.success('Access privileges removed successfully');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to remove permissions');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased pb-16">
      {/* HEADER */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="px-4 sm:px-5 lg:px-5 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-medium">
                <span>Security</span>
                <ChevronRight size={12} />
                <span className="text-slate-800 font-semibold">
                  Access Control
                </span>
              </nav>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Panel & Route Access Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign or revoke individual route permissions and whole panel
                accesses seamlessly.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200/60 text-xs font-medium text-slate-600">
                <Users size={14} className="text-slate-500" />
                <span>{accessUsers?.length || 0} Staff Active</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-all shadow-sm active:scale-95"
              >
                <KeyRound size={14} />
                <span>Panel Passwords</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 border-b border-slate-200/60 -mb-5">
            <button
              type="button"
              onClick={() => setActiveTab('assign')}
              className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'assign'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus size={15} />
              <span>Grant Permissions</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('passwords')}
              className={`flex items-center gap-2 pb-3 px-1 ml-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'passwords'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock size={15} />
              <span>Master Passwords</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="px-4 sm:px-5 lg:px-5 mt-8 space-y-8">
        {/* TAB 1: GRANT PERMISSIONS FORM */}
        {activeTab === 'assign' && (
          <section className="bg-white border border-slate-200/80 rounded-md shadow-sm overflow-hidden transition-all">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Grant Access Rights
                  </h2>
                  <p className="text-[12px] text-slate-500">
                    Assign panels and granular route endpoints to a staff user.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAssignPanelSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-slate-50/60 rounded-md border border-slate-200/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    User ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 891626"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs text-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    Security Key <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Security Password"
                    value={panelPassword}
                    onChange={(e) => setPanelPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1">
                    <FileText size={12} /> Remarks / Note
                  </label>
                  <input
                    type="text"
                    placeholder="Optional note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Panel Selectors */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    1. Select Panels <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[12px] text-slate-400 font-medium">
                    {selectedPanels?.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {allPanels.map((panel) => {
                    const isSelected = selectedPanels.includes(panel);
                    return (
                      <button
                        type="button"
                        key={panel}
                        onClick={() => handlePanelToggle(panel)}
                        className={`px-3 py-2.5 rounded-md border text-xs font-semibold capitalize transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{panel}</span>
                        {isSelected ? (
                          <CheckSquare
                            size={14}
                            className="text-white shrink-0"
                          />
                        ) : (
                          <Square
                            size={14}
                            className="text-slate-300 shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Route Selectors */}
              {selectedPanels?.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      2. Sub-Route Access Controls
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Select specific sub-routes. If no routes are selected,
                      full panel access is granted by default.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPanels.map((panel) => {
                      const routes = getRoutesForPanel(panel);
                      if (routes.length === 0) return null;

                      return (
                        <div
                          key={panel}
                          className="bg-slate-50/70 rounded-md border border-slate-200/80 p-3.5 space-y-2.5"
                        >
                          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
                              <Layers size={13} /> {panel} Routes
                            </span>
                            <span className="text-[11px] bg-slate-200/60 text-slate-600 font-mono px-1.5 py-0.5 rounded">
                              {routes.length} Available
                            </span>
                          </div>

                          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                            {routes.map((route) => {
                              const isChecked = selectedRoutes.includes(
                                route.key,
                              );
                              return (
                                <div
                                  key={route.key}
                                  onClick={() => handleRouteToggle(route.key)}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-indigo-50/80 text-indigo-900 border border-indigo-200/60 font-semibold'
                                      : 'hover:bg-slate-200/50 text-slate-600 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    {isChecked ? (
                                      <CheckSquare
                                        size={14}
                                        className="text-indigo-600 shrink-0"
                                      />
                                    ) : (
                                      <Square
                                        size={14}
                                        className="text-slate-400 shrink-0"
                                      />
                                    )}
                                    <span className="truncate">
                                      {route.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                    {route.key}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-sm transition-all disabled:opacity-50"
                >
                  {assignLoading ? (
                    <>
                      <Loader size={14} className="animate-spin" /> Assigning...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Grant Access Scope
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* TAB 2: MASTER PASSWORD CONTROL */}
        {activeTab === 'passwords' && (
          <section className="bg-white border border-slate-200/80 rounded-md p-8 max-w-xl mx-auto shadow-sm">
            <div className="text-center space-y-2 mb-6">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200/60">
                <Lock size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Master Password Override
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Update global access controls for system operations.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <PasswordField
                label="Master Security Key"
                panel="master"
                val={passwords.master}
                show={showPass.master}
                onToggle={toggleVisibility}
                onChange={handleInputChange}
              />
              <button
                type="submit"
                disabled={passLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-all shadow-sm disabled:opacity-50"
              >
                {passLoading ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                <span>Update Master Credentials</span>
              </button>
            </form>
          </section>
        )}

        {/* LIVE ACCESS LIST & INTERACTIVE REMOVAL MATRIX */}
        <section className="bg-white border border-slate-200/80 rounded-md shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Active Staff Access Roster
              </h2>
              <p className="text-[12px] text-slate-500">
                Click on any panel badge or sub-route chip to flag it for
                removal!
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors self-start sm:self-auto"
            >
              Refresh Matrix
            </button>
          </div>

          {accessUsersLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader className="animate-spin text-indigo-600" size={24} />
              <span className="text-xs font-medium">
                Fetching permissions matrix...
              </span>
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-xs font-medium text-rose-600 bg-rose-50/50">
              Error loading access list:{' '}
              {error?.data?.message || 'Server error'}
            </div>
          ) : accessUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 font-medium">
              No staff members found with active access permissions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-12">#</th>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Allowed Panels</th>
                    <th className="py-3 px-4">
                      Allowed Sub-Routes (Click to Remove)
                    </th>
                    <th className="py-3 px-4 text-center w-36">
                      Revoke Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {accessUsers.map((user, index) => {
                    const uId = user?.userId;
                    const selectedForRemoval = removalMap[uId] || {
                      panels: [],
                      routes: [],
                    };
                    const panelsToRemove = selectedForRemoval.panels || [];
                    const routesToRemove = selectedForRemoval.routes || [];
                    const totalSelectedCount =
                      panelsToRemove.length + routesToRemove.length;

                    return (
                      <tr
                        key={user?._id || uId || index}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-xs">
                          {index + 1}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 capitalize">
                            {user?.userName || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs">
                            <span className="font-mono text-indigo-600 font-semibold">
                              ID: {uId}
                            </span>
                            {user?.phone && (
                              <span className="text-slate-400">
                                ({user.phone})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ALLOWED PANELS SELECTION */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {user?.allowedPanels?.length > 0 ? (
                              user.allowedPanels.map((panel) => {
                                const isPanelMarked =
                                  panelsToRemove.includes(panel);
                                return (
                                  <button
                                    type="button"
                                    key={panel}
                                    onClick={() =>
                                      handlePanelRemovalToggle(uId, panel)
                                    }
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold capitalize transition-all ${
                                      isPanelMarked
                                        ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        isPanelMarked
                                          ? 'bg-rose-600 animate-pulse'
                                          : 'bg-indigo-500'
                                      }`}
                                    />
                                    <span>{panel}</span>
                                    {isPanelMarked && (
                                      <X
                                        size={12}
                                        className="text-rose-600 shrink-0"
                                      />
                                    )}
                                  </button>
                                );
                              })
                            ) : (
                              <span className="text-slate-400 italic text-xs">
                                No Panels Assigned
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ALLOWED SUB-ROUTES GRANULAR SELECTION */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {user?.allowedRoutes?.length > 0 ? (
                              user.allowedRoutes.map((routeKey) => {
                                const isRouteMarked =
                                  routesToRemove.includes(routeKey);
                                return (
                                  <button
                                    type="button"
                                    key={routeKey}
                                    onClick={() =>
                                      handleRouteRemovalToggle(uId, routeKey)
                                    }
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono transition-all ${
                                      isRouteMarked
                                        ? 'bg-rose-100 border-rose-400 text-rose-800 font-bold shadow-xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span>{routeKey}</span>
                                    {isRouteMarked ? (
                                      <X
                                        size={12}
                                        className="text-rose-600 shrink-0"
                                      />
                                    ) : (
                                      <span className="text-slate-300 text-[10px] ml-0.5">
                                        x
                                      </span>
                                    )}
                                  </button>
                                );
                              })
                            ) : (
                              <span className="text-slate-400 italic text-xs">
                                All Sub-Routes Allowed (Full Panel Scope)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* REMOVE ACTION BUTTON */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveSubmit(uId)}
                            disabled={removeLoading || totalSelectedCount === 0}
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                              totalSelectedCount > 0
                                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm cursor-pointer'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
                            }`}
                          >
                            <Trash2 size={13} />
                            <span>
                              {totalSelectedCount > 0
                                ? `Remove (${totalSelectedCount})`
                                : 'Select Items'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* MODAL FOR PANEL PASSWORDS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="bg-white rounded-md w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl relative z-10 border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Update Module Credentials
                </h3>
                <p className="text-[11px] text-slate-500">
                  Set unique password overrides for specific panels.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[55vh]">
              {allPanels.map((p) => (
                <PasswordField
                  key={p}
                  label={p}
                  panel={p}
                  val={passwords[p]}
                  show={showPass[p]}
                  onToggle={toggleVisibility}
                  onChange={handleInputChange}
                />
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasswordSubmit}
                disabled={passLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-sm disabled:opacity-50"
              >
                {passLoading ? (
                  <Loader size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                <span>Save Credentials</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Password Input Field
const PasswordField = ({ label, panel, val, show, onToggle, onChange }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide capitalize">
      {label} Panel
    </label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={val || ''}
        onChange={(e) => onChange(panel, e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-md py-1.5 pl-3 pr-9 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
        placeholder={`Set ${label} password`}
      />
      <button
        type="button"
        onClick={() => onToggle(panel)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  </div>
);

export default CreateStaffAccount;
