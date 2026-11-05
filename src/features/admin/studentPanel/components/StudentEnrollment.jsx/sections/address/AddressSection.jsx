import React from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import MessHostelInfo from './MessHostelInfo';
import PresentAddress from './PresentAddress';
import PermanentAddress from './PermanentAddress';
import SectionHeader from '../../common/SectionHeader';

export default function AddressSection({
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
  sameAsPermanentAddress,
  handleSameAsPermanentAddressToggle,
  messes,
  loadingMesses,
  messSelected,
}) {
  if (activeSection !== 'address') return null;

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
}
