import React, { type FC, type ChangeEvent } from "react";
import FormField from "../../common/FormField";
import TextInput from "../../common/TextInput";
import SearchableSelect from "../../common/SearchableSelect";
import Toggle from "../../common/Toggle";

export interface StudentPersonalInfo {
  name?: string | null;
  nameInBangla?: string | null;
  phone?: string | null;
  bloodGroup?: string | null;
  studentWhatsAppNum?: string | null;
  [key: string]: unknown;
}

export type FormChangeEvent =
  | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  | { target: { name: string; value: unknown } };

export interface StudentInfoProps {
  student?: StudentPersonalInfo | null;
  handleChange: (e: FormChangeEvent) => void;
  bloodGroups: string[];
  sameAsPhone: boolean;
  handleSameAsPhoneToggle: (checked: boolean) => void;
  dispatch: (action: unknown) => void;
  updatedField: (payload: { name: string; value: unknown }) => unknown;
}

export const StudentInfo: FC<StudentInfoProps> = ({
  student,
  handleChange,
  bloodGroups,
  sameAsPhone,
  handleSameAsPhoneToggle,
  dispatch,
  updatedField,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <FormField label="Full Name" required>
        <TextInput
          name="name"
          value={student?.name || ""}
          onChange={handleChange}
          placeholder="Enter full name..."
          required
        />
      </FormField>

      <FormField label="Name in Bangla">
        <TextInput
          name="nameInBangla"
          value={student?.nameInBangla || ""}
          onChange={handleChange}
          placeholder="বাংলায় নাম লিখুন"
        />
      </FormField>

      <FormField label="Phone Number" required>
        <TextInput
          type="tel"
          name="phone"
          value={student?.phone || ""}
          onChange={handleChange}
          placeholder="Enter phone number"
          required
        />
      </FormField>

      <FormField label="Blood Group">
        <SearchableSelect
          name="bloodGroup"
          value={student?.bloodGroup || ""}
          onChange={handleChange}
          options={bloodGroups}
          placeholder="Select blood group"
        />
      </FormField>

      <FormField className="sm:col-span-2">
        <div className="flex items-center justify-between">
          <FormField label="WhatsApp Number" />
          <Toggle
            id="sameAsPhone"
            checked={sameAsPhone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const isChecked = e.target.checked;
              handleSameAsPhoneToggle(isChecked);
              if (isChecked && student?.phone) {
                dispatch(
                  updatedField({
                    name: "studentWhatsAppNum",
                    value: student.phone,
                  }),
                );
              }
            }}
            label="Same as phone"
          />
        </div>
        <TextInput
          type="tel"
          name="studentWhatsAppNum"
          value={student?.studentWhatsAppNum || ""}
          onChange={handleChange}
          placeholder="Enter WhatsApp number"
          disabled={sameAsPhone}
        />
      </FormField>
    </div>
  );
};

export default StudentInfo;
