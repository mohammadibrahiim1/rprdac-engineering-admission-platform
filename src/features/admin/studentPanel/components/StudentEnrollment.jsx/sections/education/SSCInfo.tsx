import React, { type FC, type ChangeEvent } from "react";
import { Book } from "lucide-react";
import CardSection from "../../common/CardSection";
import FormField from "../../common/FormField";
import SearchableSelect from "../../common/SearchableSelect";
import TextInput from "../../common/TextInput";

export interface SSCGroup {
  name: string;
  [key: string]: unknown;
}

export interface SSCBoard {
  name: string;
  [key: string]: unknown;
}

export interface PassingYearItem {
  year: string | number;
  [key: string]: unknown;
}

export interface SSCInformation {
  groups?: SSCGroup[];
  boards?: SSCBoard[];
  passingYears?: PassingYearItem[];
  [key: string]: unknown;
}

export interface StudentSSCData {
  sscGroup?: string | null;
  sscBoard?: string | null;
  sscPassingYear?: string | number | null;
  sscGpa?: number | string | null;
  [key: string]: unknown;
}

export interface SSCInfoProps {
  student?: StudentSSCData | null;
  handleChange: (
    e:
      | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } },
  ) => void;
  sscInformation?: SSCInformation | null;
  academicLoading?: boolean;
}

export const SSCInfo: FC<SSCInfoProps> = ({
  student,
  handleChange,
  sscInformation,
  academicLoading = false,
}) => {
  return (
    <CardSection icon={Book} iconColor="text-blue-500" title="SSC Information">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <FormField label="Group">
          <SearchableSelect
            name="sscGroup"
            value={student?.sscGroup ? String(student.sscGroup) : ""}
            onChange={handleChange}
            options={sscInformation?.groups?.map((g) => g.name) || []}
            placeholder="Select SSC group"
            isLoading={academicLoading}
          />
        </FormField>

        <FormField label="Board">
          <SearchableSelect
            name="sscBoard"
            value={student?.sscBoard ? String(student.sscBoard) : ""}
            onChange={handleChange}
            options={sscInformation?.boards?.map((b) => b.name) || []}
            placeholder="Select SSC board"
            isLoading={academicLoading}
          />
        </FormField>

        <FormField label="Passing Year">
          <SearchableSelect
            name="sscPassingYear"
            value={
              student?.sscPassingYear !== undefined &&
              student?.sscPassingYear !== null
                ? String(student.sscPassingYear)
                : ""
            }
            onChange={handleChange}
            options={
              sscInformation?.passingYears?.map((py) => String(py.year)) || []
            }
            placeholder="Select year"
            isLoading={academicLoading}
          />
        </FormField>

        <FormField label="GPA">
          <TextInput
            type="number"
            name="sscGpa"
            value={
              student?.sscGpa !== undefined && student?.sscGpa !== null
                ? student.sscGpa
                : ""
            }
            onChange={handleChange}
            placeholder="e.g. 5.00"
            step="0.01"
          />
        </FormField>
      </div>
    </CardSection>
  );
};

export default SSCInfo;
