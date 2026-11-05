import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

import EnrollmentDetails from './EnrollmentDetails';
import DiplomaInfo from './DiplomaInfo';
import SectionHeader from '../../common/SectionHeader';
import SSCInfo from './SSCInfo';

export default function EducationSection({
  activeSection,
  student,
  handleChange,
  // options
  departments,
  allBatches,
  sessionOptions,
  institutes,
  sscInformation,
  diplomaInformation,
  // loaders
  loadingInstitutes,
  academicLoading,
  // Shared Layout Components
}) {
  if (activeSection !== 'education') return null;

  return (
    <motion.section
      key="education"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="px-5 lg:px-5"
    >
      <SectionHeader
        icon={BookOpen}
        iconBg="bg-orange-50 text-orange-500"
        title="Education & Enrollment"
        subtitle="Academic qualifications and enrollment details"
      />

      <div className="space-y-5">
        <EnrollmentDetails
          student={student}
          handleChange={handleChange}
          departments={departments}
          allBatches={allBatches}
          sessionOptions={sessionOptions}
          institutes={institutes}
          loadingInstitutes={loadingInstitutes}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SSCInfo
            student={student}
            handleChange={handleChange}
            sscInformation={sscInformation}
            academicLoading={academicLoading}
          />

          <DiplomaInfo
            student={student}
            handleChange={handleChange}
            diplomaInformation={diplomaInformation}
            academicLoading={academicLoading}
          />
        </div>
      </div>
    </motion.section>
  );
}
