import React, { type FC, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

import DiplomaInfo, {
  type DiplomaInformation,
  type StudentDiplomaData,
} from "./DiplomaInfo";
import SSCInfo, { type SSCInformation, type StudentSSCData } from "./SSCInfo";
import SectionHeader from "../../common/SectionHeader";
import EnrollmentDetails, {
  BatchItem,
  EnrollmentStudent,
  InstituteItem,
} from "./EnrollmentDetails";

export type EducationStudentData = EnrollmentStudent &
  StudentSSCData &
  StudentDiplomaData & {
    [key: string]: unknown;
  };

export interface EducationSectionProps {
  activeSection: string;
  student?: EducationStudentData | null;
  handleChange: (
    e:
      | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } },
  ) => void;
  departments: string[];
  allBatches?: BatchItem[];
  sessionOptions: string[];
  institutes?: InstituteItem[];
  sscInformation?: SSCInformation | null;
  diplomaInformation?: DiplomaInformation | null;
  loadingInstitutes?: boolean;
  academicLoading?: boolean;
}

export const EducationSection: FC<EducationSectionProps> = ({
  activeSection,
  student,
  handleChange,
  departments,
  allBatches = [],
  sessionOptions,
  institutes = [],
  sscInformation,
  diplomaInformation,
  loadingInstitutes = false,
  academicLoading = false,
}) => {
  if (activeSection !== "education") return null;

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
};

export default EducationSection;
