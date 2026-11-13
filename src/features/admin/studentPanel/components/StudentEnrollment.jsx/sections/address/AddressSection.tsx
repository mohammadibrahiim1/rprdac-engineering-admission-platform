import React, { type FC, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import MessHostelInfo, {
  type MessItem,
  type StudentMessData,
} from "./MessHostelInfo";
import PresentAddress, { type StudentPresentAddress } from "./PresentAddress";
import PermanentAddress, {
  type StudentPermanentAddress,
} from "./PermanentAddress";
import SectionHeader from "../../common/SectionHeader";

export type AddressStudentData = StudentPermanentAddress &
  StudentPresentAddress &
  StudentMessData & {
    [key: string]: unknown;
  };

export type FormChangeEvent =
  | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  | { target: { name: string; value: unknown } };

export interface AddressSectionProps {
  activeSection: string;
  selectedPermanentZilla: string;
  handlePermanentZillaChange: (e: FormChangeEvent | string) => void;
  districtNames: string[];
  loading: boolean;
  student?: AddressStudentData | null;
  handleChange: (e: FormChangeEvent) => void;
  permanentUpazilaNames: string[];
  selectedPresentZilla: string;
  handlePresentZillaChange: (e: FormChangeEvent | string) => void;
  presentUpazilaNames: string[];
  sameAsPermanentAddress?: boolean;
  handleSameAsPermanentAddressToggle: (checked: boolean) => void;
  messes?: MessItem[];
  loadingMesses?: boolean;
  messSelected?: boolean;
}

export const AddressSection: FC<AddressSectionProps> = ({
  activeSection,
  selectedPermanentZilla,
  handlePermanentZillaChange,
  districtNames,
  loading,
  student,
  handleChange,
  permanentUpazilaNames,
  selectedPresentZilla,
  handlePresentZillaChange,
  presentUpazilaNames,
  sameAsPermanentAddress = false,
  handleSameAsPermanentAddressToggle,
  messes = [],
  loadingMesses = false,
  messSelected = false,
}) => {
  if (activeSection !== "address") return null;

  return (
    <motion.section
      key="address"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="px-5 lg:px-5"
    >
      <SectionHeader
        icon={Home}
        iconBg="bg-violet-50 text-violet-600"
        title="Address Information"
        subtitle="Permanent and present address details"
      />

      <div className="space-y-5">
        <PermanentAddress
          selectedPermanentZilla={selectedPermanentZilla}
          handlePermanentZillaChange={handlePermanentZillaChange}
          districtNames={districtNames}
          loading={loading}
          student={student}
          handleChange={handleChange}
          permanentUpazilaNames={permanentUpazilaNames}
        />

        <PresentAddress
          student={student}
          handleChange={handleChange}
          sameAsPermanentAddress={sameAsPermanentAddress}
          handleSameAsPermanentAddressToggle={
            handleSameAsPermanentAddressToggle
          }
          selectedPermanentZilla={selectedPermanentZilla}
          selectedPresentZilla={selectedPresentZilla}
          handlePresentZillaChange={handlePresentZillaChange}
          districtNames={districtNames}
          loading={loading}
          presentUpazilaNames={presentUpazilaNames}
        />

        <MessHostelInfo
          student={student}
          handleChange={handleChange}
          messes={messes}
          loadingMesses={loadingMesses}
          messSelected={messSelected}
        />
      </div>
    </motion.section>
  );
};

export default AddressSection;
