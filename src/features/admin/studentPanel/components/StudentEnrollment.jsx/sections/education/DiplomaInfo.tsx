import React, { type FC, type ChangeEvent } from "react";
import { Book } from "lucide-react";
import CardSection from "../../common/CardSection";
import FormField from "../../common/FormField";
import SearchableSelect from "../../common/SearchableSelect";
import TextInput from "../../common/TextInput";

export interface DiplomaGroup {
  name: string;
  [key: string]: unknown;
}

export interface PassingYearItem {
  year: string | number;
  [key: string]: unknown;
}

export interface DiplomaInformation {
  groups?: DiplomaGroup[];
  passingYears?: PassingYearItem[];
  [key: string]: unknown;
}

export interface StudentDiplomaData {
  diplomaGroup?: string | null;
  diplomaPassingYear?: string | number | null;
  diplomaGpa?: number | string | null;
  [key: string]: unknown;
}

export interface DiplomaInfoProps {
  student?: StudentDiplomaData | null;
  handleChange: (
    e:
      | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } },
  ) => void;
  diplomaInformation?: DiplomaInformation | null;
  academicLoading?: boolean;
}

export const DiplomaInfo: FC<DiplomaInfoProps> = ({
  student,
  handleChange,
  diplomaInformation,
  academicLoading = false,
}) => {
  return (
    <CardSection
      icon={Book}
      iconColor="text-emerald-500"
      title="Diploma Information"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <FormField label="Group">
          <SearchableSelect
            name="diplomaGroup"
            value={student?.diplomaGroup ? String(student.diplomaGroup) : ""}
            onChange={handleChange}
            options={diplomaInformation?.groups?.map((dg) => dg.name) || []}
            placeholder="Select diploma group"
            isLoading={academicLoading}
          />
        </FormField>

        <FormField label="Board">
          <TextInput
            name="diplomaBoard"
            value="BTEB"
            readOnly
            placeholder="BTEB"
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Passing Year">
          <SearchableSelect
            name="diplomaPassingYear"
            value={
              student?.diplomaPassingYear !== undefined &&
              student?.diplomaPassingYear !== null
                ? String(student.diplomaPassingYear)
                : ""
            }
            onChange={handleChange}
            options={
              diplomaInformation?.passingYears?.map((dpy) =>
                String(dpy.year),
              ) || []
            }
            placeholder="Select year"
            isLoading={academicLoading}
          />
        </FormField>

        <FormField label="GPA">
          <TextInput
            type="number"
            name="diplomaGpa"
            value={
              student?.diplomaGpa !== undefined && student?.diplomaGpa !== null
                ? student.diplomaGpa
                : ""
            }
            onChange={handleChange}
            placeholder="e.g. 3.50"
            step="0.01"
          />
        </FormField>
      </div>
    </CardSection>
  );
};

export default DiplomaInfo;
