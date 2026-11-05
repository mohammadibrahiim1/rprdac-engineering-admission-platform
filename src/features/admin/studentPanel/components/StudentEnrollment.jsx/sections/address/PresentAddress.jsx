import React from 'react';
import { MapPin } from 'lucide-react';
import CardSection from '../../common/CardSection';
import Toggle from '../../common/Toggle';
import FormField from '../../common/FormField';
import SearchableSelect from '../../common/SearchableSelect';
import TextInput from '../../common/TextInput';

export default function PresentAddress({
  student,
  handleChange,
  sameAsPermanentAddress,
  handleSameAsPermanentAddressToggle,
  selectedPermanentZilla,
  selectedPresentZilla,
  handlePresentZillaChange,
  districtNames,
  loading,
  presentUpazilaNames,
}) {
  const isSameAsPermanent =
    sameAsPermanentAddress || student?.sameAsPermanent || false;

  return (
    <CardSection
      icon={MapPin}
      iconColor="text-blue-500"
      title="Present Address"
      badge={
        <div className="ml-auto">
          <Toggle
            id="sameAsPermanent"
            checked={isSameAsPermanent}
            onChange={(e) => {
              const checked = typeof e === 'boolean' ? e : e?.target?.checked;
              handleSameAsPermanentAddressToggle(checked);
            }}
            label="Same as permanent"
          />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <FormField label="District">
          <SearchableSelect
            name="presentZilla"
            value={student.presentZilla || ''}
            onChange={handlePresentZillaChange}
            options={districtNames}
            placeholder="Search district"
            isLoading={loading}
            disabled={isSameAsPermanent}
          />
        </FormField>

        <FormField label="Upazila">
          <SearchableSelect
            name="presentUpozilla"
            value={student?.presentUpozilla || ''}
            onChange={handleChange}
            options={presentUpazilaNames}
            placeholder="Search upazila"
            disabled={
              isSameAsPermanent ||
              (!selectedPresentZilla && !student?.presentZilla)
            }
          />
        </FormField>

        <FormField label="Village / Area">
          <TextInput
            name="presentVillage"
            value={student?.presentVillage || ''}
            onChange={handleChange}
            placeholder="Enter village or area"
            disabled={isSameAsPermanent}
          />
        </FormField>

        <FormField label="Postal Code">
          <TextInput
            name="presentPostcode"
            value={student?.presentPostcode || ''}
            onChange={handleChange}
            placeholder="Enter postal code"
            disabled={isSameAsPermanent}
          />
        </FormField>
      </div>
    </CardSection>
  );
}
