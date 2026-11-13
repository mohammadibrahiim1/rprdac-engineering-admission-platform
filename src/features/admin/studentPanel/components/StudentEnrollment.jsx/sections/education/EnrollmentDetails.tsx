import React, { type FC, type ChangeEvent } from 'react';
import { Receipt } from 'lucide-react';
import CardSection from '../../common/CardSection';
import FormField from '../../common/FormField';
import SearchableSelect from '../../common/SearchableSelect';

export interface BatchItem {
  _id?: string;
  title: string;
  [key: string]: unknown;
}

export interface InstituteItem {
  _id?: string;
  name: string;
  [key: string]: unknown;
}

export interface EnrollmentStudent {
  receiptNo?: string | null;
  department?: string | null;
  studentId?: string | null;
  batch?: string | null;
  session?: string | null;
  instituteName?: string | null;
  [key: string]: unknown;
}

export interface EnrollmentDetailsProps {
  student?: EnrollmentStudent | null;
  handleChange: (
    e:
      | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } }
  ) => void;
  departments: string[];
  allBatches?: BatchItem[];
  sessionOptions: string[];
  institutes?: InstituteItem[];
  loadingInstitutes?: boolean;
}

export const EnrollmentDetails: FC<EnrollmentDetailsProps> = ({
  student,
  handleChange,
  departments,
  allBatches = [],
  sessionOptions,
  institutes = [],
  loadingInstitutes = false,
}) => {
  return (
    <CardSection
      icon={Receipt}
      iconColor="text-indigo-500"
      title="Enrollment Details"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Receipt Number" required>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[12.5px] font-bold text-[#9b9a97] pointer-events-none select-none">
              RPR-
            </span>
            <input
              type="text"
              name="receiptNo"
              value={
                student?.receiptNo
                  ? String(student.receiptNo).replace(/^RPR-/, '')
                  : ''
              }
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                handleChange({
                  target: {
                    name: 'receiptNo',
                    value: `RPR-${value}`,
                  },
                });
              }}
              placeholder="Enter number"
              required
              className="w-full pl-12 pr-3.5 py-2.5 rounded-md border border-[#e3e2de] text-[12.5px] text-[#37352f] placeholder-[#9b9a97] bg-white hover:border-[#b5b3aa] hover:bg-[#fafaf9] focus:border-[#2383e2] focus:ring-2 focus:ring-[#2383e2]/20 outline-none transition-all"
            />
          </div>
        </FormField>

        <FormField label="Department" required>
          <SearchableSelect
            name="department"
            value={student?.department || ''}
            onChange={handleChange}
            options={departments}
          />
        </FormField>

        <FormField label="Student ID">
          <div className="relative">
            {/* Visual prefix display */}
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[12.5px] font-bold text-[#9b9a97] pointer-events-none select-none">
              {student?.department ? `${student.department}-` : ''}
            </span>

            <input
              type="text"
              name="studentId"
              // Display only the numeric/raw ID part in input field
              value={
                student?.studentId
                  ? student.studentId.replace(/^[A-Z/]+-/, '')
                  : ''
              }
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const rawValue = e.target.value;
                const prefix = student?.department
                  ? `${student.department}-`
                  : '';

                // Custom event object
                handleChange({
                  target: {
                    name: 'studentId',
                    value: prefix ? `${prefix}${rawValue}` : rawValue,
                  },
                });
              }}
              placeholder="Enter ID"
              className={`w-full ${student?.department ? 'pl-16' : 'pl-3.5'} pr-3.5 py-2.5 rounded-md text-[12.5px] border border-[#e3e2de]`}
            />
          </div>
        </FormField>

        <FormField label="Batch">
          <SearchableSelect
            name="batch"
            value={student?.batch || ''}
            onChange={handleChange}
            options={allBatches.map((b) => b.title)}
            placeholder="Select batch"
          />
        </FormField>

        <FormField label="Academic Session" required>
          <SearchableSelect
            name="session"
            value={student?.session || ''}
            onChange={handleChange}
            options={sessionOptions}
            placeholder="Select session"
            required
          />
        </FormField>

        <FormField label="Institute Name">
          <SearchableSelect
            name="instituteName"
            value={student?.instituteName || ''}
            onChange={handleChange}
            options={institutes.map((inst) => inst.name)}
            placeholder="Search institute..."
            isLoading={loadingInstitutes}
          />
        </FormField>
      </div>
    </CardSection>
  );
};

export default EnrollmentDetails;