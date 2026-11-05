import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  GraduationCap,
  BookOpen,
  Calendar,
  Save,
  LayoutDashboard,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAddAcademicInfoMutation,
  useDeleteAcademicInfoMutation,
  useGetAcademicInfosQuery,
  useUpdateAcademicInfoMutation,
} from '../../../../../redux/features/academic/academicApi';

// --- Main Component ---
const AcademicInfo = () => {
  const [activeTab, setActiveTab] = useState('manage'); // 'add' or 'manage'
  const [addAcademicInfo, { isLoading: isAdding }] =
    useAddAcademicInfoMutation();

  const { data, isLoading: isFetching } = useGetAcademicInfosQuery();
  const academicInfos = data?.data;

  const [formData, setFormData] = useState({
    sscInformation: { groups: [], boards: [], passingYears: [] },
    diplomaInformation: { groups: [], passingYears: [] },
  });

  const [inputs, setInputs] = useState({
    sscGroup: '',
    sscBoard: '',
    sscYear: '',
    diplomaGroup: '',
    diplomaYear: '',
  });

  // Simplified Handle Add for cleaner code
  const handleAddItem = (section, field, value, inputKey) => {
    if (!value) return;
    const isYear = field === 'passingYears';
    const exists = formData[section][field].some((item) =>
      isYear ? item.year === value.year : item.name === value.name,
    );

    if (exists) {
      toast.error(`${isYear ? 'Year' : 'Item'} already added.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], { id: Date.now(), ...value }],
      },
    }));
    setInputs((prev) => ({ ...prev, [inputKey]: '' }));
  };

  const handleRemoveItem = (section, field, id) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((item) => item.id !== id),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await addAcademicInfo(formData).unwrap();
      if (res.success) {
        toast.success(res.message);
        setFormData({
          sscInformation: { groups: [], boards: [], passingYears: [] },
          diplomaInformation: { groups: [], passingYears: [] },
        });
        setActiveTab('manage');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 mx-auto space-y-8 antialiased font-sans max-w-7xl text-slate-900">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 pb-6 border-b md:flex-row md:items-center border-slate-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Academic Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure graduation groups, boards, and passing years.
          </p>
        </div>

        <div className="flex p-1 rounded-lg bg-slate-100">
          <TabButton
            active={activeTab === 'manage'}
            onClick={() => setActiveTab('manage')}
            icon={<LayoutDashboard size={16} />}
            label="View Data"
          />
          <TabButton
            active={activeTab === 'add'}
            onClick={() => setActiveTab('add')}
            icon={<Plus size={16} />}
            label="Add New"
          />
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'add' ? (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <Card
                    title="Secondary School Certificate (SSC)"
                    icon={<GraduationCap className="text-blue-500" />}
                  >
                    <div className="grid gap-6">
                      <TagInput
                        label="Groups"
                        value={inputs.sscGroup}
                        onChange={(v) => setInputs({ ...inputs, sscGroup: v })}
                        onAdd={() =>
                          handleAddItem(
                            'sscInformation',
                            'groups',
                            { name: inputs.sscGroup.trim() },
                            'sscGroup',
                          )
                        }
                        list={formData.sscInformation.groups}
                        onRemove={(id) =>
                          handleRemoveItem('sscInformation', 'groups', id)
                        }
                      />
                      <TagInput
                        label="Boards"
                        value={inputs.sscBoard}
                        onChange={(v) => setInputs({ ...inputs, sscBoard: v })}
                        onAdd={() =>
                          handleAddItem(
                            'sscInformation',
                            'boards',
                            { name: inputs.sscBoard.trim() },
                            'sscBoard',
                          )
                        }
                        list={formData.sscInformation.boards}
                        onRemove={(id) =>
                          handleRemoveItem('sscInformation', 'boards', id)
                        }
                      />
                      <TagInput
                        label="Passing Years"
                        type="number"
                        value={inputs.sscYear}
                        onChange={(v) => setInputs({ ...inputs, sscYear: v })}
                        onAdd={() =>
                          handleAddItem(
                            'sscInformation',
                            'passingYears',
                            { year: Number(inputs.sscYear) },
                            'sscYear',
                          )
                        }
                        list={formData.sscInformation.passingYears}
                        displayKey="year"
                        onRemove={(id) =>
                          handleRemoveItem('sscInformation', 'passingYears', id)
                        }
                      />
                    </div>
                  </Card>

                  <Card
                    title="Diploma Information"
                    icon={<BookOpen className="text-emerald-500" />}
                  >
                    <div className="grid gap-6">
                      <TagInput
                        label="Specializations"
                        value={inputs.diplomaGroup}
                        onChange={(v) =>
                          setInputs({ ...inputs, diplomaGroup: v })
                        }
                        onAdd={() =>
                          handleAddItem(
                            'diplomaInformation',
                            'groups',
                            { name: inputs.diplomaGroup.trim() },
                            'diplomaGroup',
                          )
                        }
                        list={formData.diplomaInformation.groups}
                        onRemove={(id) =>
                          handleRemoveItem('diplomaInformation', 'groups', id)
                        }
                      />
                      <TagInput
                        label="Passing Years"
                        type="number"
                        value={inputs.diplomaYear}
                        onChange={(v) =>
                          setInputs({ ...inputs, diplomaYear: v })
                        }
                        onAdd={() =>
                          handleAddItem(
                            'diplomaInformation',
                            'passingYears',
                            { year: Number(inputs.diplomaYear) },
                            'diplomaYear',
                          )
                        }
                        list={formData.diplomaInformation.passingYears}
                        displayKey="year"
                        onRemove={(id) =>
                          handleRemoveItem(
                            'diplomaInformation',
                            'passingYears',
                            id,
                          )
                        }
                      />
                    </div>
                  </Card>
                </div>

                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex items-center justify-center w-full h-12 gap-2 font-semibold text-white transition-all shadow-lg bg-slate-900 rounded-xl hover:bg-slate-800 shadow-slate-200 disabled:opacity-50"
                >
                  {isAdding ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save All Information
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="manage-table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {isFetching ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="mb-2 animate-spin" size={32} />
                  <p>Fetching academic records...</p>
                </div>
              ) : academicInfos ? (
                <AcademicManager data={academicInfos} />
              ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-2xl border-slate-200">
                  <AlertCircle
                    className="mx-auto mb-2 text-slate-300"
                    size={40}
                  />
                  <p className="font-medium text-slate-500">
                    No records found. Switch to &quot;Add New&quot; to create
                    one.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Reusable UI Components ---

const Card = ({ title, icon, children }) => (
  <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-2xl">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      {icon}
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
      active
        ? 'bg-white text-slate-900 shadow-sm'
        : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {icon}
    {label}
  </button>
);

const TagInput = ({
  label,
  value,
  onChange,
  onAdd,
  onRemove,
  list,
  type = 'text',
  displayKey = 'name',
}) => (
  <div className="space-y-2">
    <label className="text-xs font-bold tracking-wider uppercase text-slate-400">
      {label}
    </label>
    <div className="flex gap-2">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
        placeholder={`Add ${label.toLowerCase()}...`}
        className="flex-1 h-10 px-3 text-sm transition-all bg-white border rounded-lg outline-none border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="button"
        onClick={onAdd}
        disabled={!value}
        className="h-10 px-4 text-sm text-white transition-colors rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200"
      >
        Add
      </button>
    </div>
    <div className="flex flex-wrap gap-2 pt-1">
      <AnimatePresence>
        {list.map((item) => (
          <motion.span
            key={item.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold group border border-slate-200 hover:bg-white hover:border-slate-300 transition-all"
          >
            {item[displayKey]}
            <button
              onClick={() => onRemove(item.id)}
              className="p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  </div>
);

// --- Academic Data Manager (Table/Edit View) ---
const AcademicManager = ({ data }) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formData, setFormData] = useState(null);

  const [deleteAcademicInfo] = useDeleteAcademicInfoMutation();
  const [updateAcademicInfo, { isLoading: isUpdating }] =
    useUpdateAcademicInfoMutation();

  useEffect(() => {
    if (data) setFormData(JSON.parse(JSON.stringify(data)));
  }, [data]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleUpdate = async () => {
    try {
      const updates = [];
      ['sscInformation', 'diplomaInformation'].forEach((section) => {
        Object.keys(formData[section]).forEach((field) => {
          if (formData[section][field]?.length) {
            updates.push({
              path: `${section}.${field}`,
              items: formData[section][field],
            });
          }
        });
      });

      for (const update of updates) {
        await updateAcademicInfo({ id: data._id, ...update }).unwrap();
      }
      toast.success('Updated successfully');
      setEditMode(false);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAcademicInfo({ id: data._id, itemIds: selectedIds }).unwrap();
      toast.success('Selected items deleted');
      setSelectedIds([]);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (!formData) return null;

  return (
    <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-2xl">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex gap-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Edit3 size={14} /> Edit Data
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <Check size={14} /> {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors text-red-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} /> Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Section</th>
              <th className="px-6 py-4">Current Values</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <DataRow
              title="SSC Groups"
              items={formData.sscInformation.groups}
              editMode={editMode}
              selectedIds={selectedIds}
              onToggle={toggleSelect}
              onEdit={(i, v) => {
                const updated = { ...formData };
                updated.sscInformation.groups[i].name = v;
                setFormData(updated);
              }}
            />
            <DataRow
              title="SSC Boards"
              items={formData.sscInformation.boards}
              editMode={editMode}
              selectedIds={selectedIds}
              onToggle={toggleSelect}
              onEdit={(i, v) => {
                const updated = { ...formData };
                updated.sscInformation.boards[i].name = v;
                setFormData(updated);
              }}
            />
            <DataRow
              title="SSC Years"
              items={formData.sscInformation.passingYears}
              type="number"
              valueKey="year"
              editMode={editMode}
              selectedIds={selectedIds}
              onToggle={toggleSelect}
              onEdit={(i, v) => {
                const updated = { ...formData };
                updated.sscInformation.passingYears[i].year = Number(v);
                setFormData(updated);
              }}
            />
            <DataRow
              title="Diploma Groups"
              items={formData.diplomaInformation.groups}
              editMode={editMode}
              selectedIds={selectedIds}
              onToggle={toggleSelect}
              onEdit={(i, v) => {
                const updated = { ...formData };
                updated.diplomaInformation.groups[i].name = v;
                setFormData(updated);
              }}
            />
            <DataRow
              title="Diploma Years"
              items={formData.diplomaInformation.passingYears}
              type="number"
              valueKey="year"
              editMode={editMode}
              selectedIds={selectedIds}
              onToggle={toggleSelect}
              onEdit={(i, v) => {
                const updated = { ...formData };
                updated.diplomaInformation.passingYears[i].year = Number(v);
                setFormData(updated);
              }}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DataRow = ({
  title,
  items,
  editMode,
  selectedIds,
  onToggle,
  onEdit,
  type = 'text',
  valueKey = 'name',
}) => (
  <tr>
    <td className="px-6 py-4 font-semibold align-top text-slate-700 whitespace-nowrap">
      {title}
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-wrap gap-3">
        {items?.map((item, i) => (
          <div
            key={item._id}
            className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100"
          >
            {!editMode ? (
              <label className="flex items-center gap-2 px-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item._id)}
                  onChange={() => onToggle(item._id)}
                  className="w-4 h-4 text-blue-600 transition-all rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-600">
                  {item[valueKey]}
                </span>
              </label>
            ) : (
              <input
                type={type}
                value={item[valueKey]}
                onChange={(e) => onEdit(i, e.target.value)}
                className="w-24 px-2 text-sm bg-white border rounded outline-none h-7 border-slate-200 focus:ring-1 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
      </div>
    </td>
  </tr>
);

export default AcademicInfo;
