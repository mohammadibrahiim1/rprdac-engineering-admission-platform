import React, { type FC, type ChangeEvent } from "react";
import { MapPin } from "lucide-react";
import CardSection from "../../common/CardSection";
import FormField from "../../common/FormField";
import SearchableSelect from "../../common/SearchableSelect";
import TextInput from "../../common/TextInput";

export interface StudentPermanentAddress {
  permanentUpozilla?: string | null;
  permanentVillage?: string | null;
  permanentPostcode?: string | null;
  [key: string]: unknown;
}

export interface PermanentAddressProps {
  selectedPermanentZilla: string;
  handlePermanentZillaChange: (
    e:
      | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } }
      | string,
  ) => void;
  districtNames: string[];
  loading: boolean;
  student?: StudentPermanentAddress | null;
  handleChange: (
    e:
      | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } },
  ) => void;
  permanentUpazilaNames: string[];
}

export const PermanentAddress: FC<PermanentAddressProps> = ({
  selectedPermanentZilla,
  handlePermanentZillaChange,
  districtNames,
  loading,
  student,
  handleChange,
  permanentUpazilaNames,
}) => {
  return (
    <CardSection
      icon={MapPin}
      iconColor="text-violet-500"
      title="Permanent Address"
      badge={<span className="ml-1 text-red-400 text-sm">*</span>}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <FormField label="District" required>
          <SearchableSelect
            name="permanentZilla"
            value={selectedPermanentZilla}
            onChange={handlePermanentZillaChange}
            options={districtNames}
            placeholder={loading ? "Loading..." : "Search district"}
            isLoading={loading}
            required
          />
        </FormField>

        <FormField label="Upazila" required>
          <SearchableSelect
            name="permanentUpozilla"
            value={student?.permanentUpozilla || ""}
            onChange={handleChange}
            options={permanentUpazilaNames}
            placeholder="Search upazila"
            disabled={!selectedPermanentZilla}
            required
          />
        </FormField>

        <FormField label="Village / Area" required>
          <TextInput
            name="permanentVillage"
            value={student?.permanentVillage || ""}
            onChange={handleChange}
            placeholder="Enter village or area"
            required
          />
        </FormField>

        <FormField label="Postal Code">
          <TextInput
            name="permanentPostcode"
            value={student?.permanentPostcode || ""}
            onChange={handleChange}
            placeholder="Enter postal code"
          />
        </FormField>
      </div>
    </CardSection>
  );
};

export default PermanentAddress;
