import React from 'react';
import { motion } from 'framer-motion';
import { UserRound } from 'lucide-react';
import GuardianInfo from './GuardianInfo';
import StudentInfo from './StudentInfo';
import StudentPhoto from './StudentPhoto';
import SectionHeader from '../../common/SectionHeader';

export default function PersonalSection({
  activeSection,
  previewUrl,
  setFile,
  setPreviewUrl,
  handleFileChange,
  student,
  handleChange,
  bloodGroups,
  sameAsPhone,
  handleSameAsPhoneToggle,
  sameAsGuardianPhone,
  handleSameAsGuardianPhoneToggle,
  dispatch,
  updatedField,
}) {
  if (activeSection !== 'personal') return null;

  return (
    <motion.section
      key="personal"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="px-4"
    >
      <SectionHeader
        icon={UserRound}
        iconBg="bg-blue-50 text-blue-600"
        title="Personal Information"
        subtitle="Basic details & guardian contact"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[160px_1fr]">
        <StudentPhoto
          previewUrl={previewUrl}
          setFile={setFile}
          setPreviewUrl={setPreviewUrl}
          handleFileChange={handleFileChange}
        />

        <div className="space-y-5">
          <StudentInfo
            student={student}
            handleChange={handleChange}
            bloodGroups={bloodGroups}
            sameAsPhone={sameAsPhone}
            handleSameAsPhoneToggle={handleSameAsPhoneToggle}
            dispatch={dispatch}
            updatedField={updatedField}
          />

          <GuardianInfo
            student={student}
            handleChange={handleChange}
            sameAsGuardianPhone={sameAsGuardianPhone}
            handleSameAsGuardianPhoneToggle={handleSameAsGuardianPhoneToggle}
            dispatch={dispatch}
            updatedField={updatedField}
          />
        </div>
      </div>
    </motion.section>
  );
}
