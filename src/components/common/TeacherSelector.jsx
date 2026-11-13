import { useEffect, useRef, useState } from 'react';
import { Search, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetOnlyTeachersQuery } from '../../redux/features/users/userApi';

const TeacherSelector = ({ onSelect, resetKey, labelBase, inputBase }) => {
  const [teacherQuery, setTeacherQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);

  const { data: teachersData } = useGetOnlyTeachersQuery(search);
  const teachers = teachersData?.data || [];

  // debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(teacherQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [teacherQuery]);

  // close outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setTeacherQuery('');
    setSelectedTeacher(null);
  }, [resetKey]);

  const filteredTeachers = teacherQuery
    ? teachers?.filter((teacher) =>
        teacher.userName.toLowerCase().includes(teacherQuery.toLowerCase()),
      )
    : teachers;

  const handleSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherQuery(teacher.userName);
    setIsOpen(false);

    // send data to parent
    onSelect(teacher);
  };

  return (
    <div className="space-y-3 rounded-xl">
      <div className={'flex items-center gap-2 text-slate-800'}>
        <User size={18} className="text-blue-600" />
        <h2 className={'text-sm font-semibold tracking-wider uppercase'}>
          Select Teacher
        </h2>
      </div>

      <div className="relative" ref={dropdownRef}>
        <Search
          className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400"
          size={16}
        />

        <input
          type="text"
          placeholder="Search by name..."
          required
          value={teacherQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setTeacherQuery(e.target.value)}
          className={`${inputBase} pl-10`}
        />

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute z-50 w-full p-1 mt-2 overflow-y-auto bg-white border rounded-lg shadow-xl border-slate-200 max-h-64"
            >
              {filteredTeachers?.map((teacher) => (
                <li
                  key={teacher._id}
                  onClick={() => handleSelect(teacher)}
                  className="flex items-center w-full gap-3 px-4 py-3 text-left transition-colors rounded-md hover:bg-blue-50 cursor-pointer"
                >
                  <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-blue-700 capitalize bg-blue-100 rounded-full">
                    {teacher?.userName?.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold capitalize">
                      {teacher?.userName}
                    </span>
                    <span className="text-[12px] text-slate-500">
                      {teacher?.phone}
                    </span>
                  </div>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4">
        {selectedTeacher ? (
          <div className="flex flex-col gap-2 p-4 mt-6 border border-blue-100 rounded-lg bg-blue-50/50">
            <div className="flex items-center gap-2 text-blue-700">
              <User size={14} />{' '}
              <span className="text-sm font-semibold uppercase">
                {selectedTeacher?.userName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Phone size={14} /> {selectedTeacher?.phone}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center border-2 border-gray-100 border-dashed rounded-xl">
            <p className="text-xs text-gray-400">Search to select member</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSelector;
