import React from 'react';
import { Users } from 'lucide-react';
import TextInput from '../../common/TextInput';
import Toggle from '../../common/Toggle';
import FormField from '../../common/FormField';
import SearchableSelect from '../../common/SearchableSelect';

export default function GuardianInfo({
  student,
  handleChange,
  sameAsGuardianPhone,
  handleSameAsGuardianPhoneToggle,
  dispatch,
  updatedField,
}) {
  return (
    <div className="pt-4 border-t border-[#f1f0ee]">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-emerald-50">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <p className="text-sm font-semibold text-[#37352f]">
          Guardian Information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Guardian Name" required>
          <TextInput
            name="guardianName"
            value={student?.guardianName || ''}
            onChange={handleChange}
            placeholder="Guardian's full name"
            required
          />
        </FormField>

        <FormField label="Relationship" required>
          <SearchableSelect
            name="relationWithGuardian"
            value={student?.relationWithGuardian || ''}
            onChange={handleChange}
            options={[
              'Father',
              'Mother',
              'Brother',
              'Sister',
              'Uncle',
              'Aunt',
              'Grandfather',
              'Grandmother',
              'Other',
            ]}
            placeholder="e.g. Father, Mother"
            required
          />
        </FormField>

        <FormField label="Contact Number" required>
          <TextInput
            type="tel"
            name="guardianPhone"
            value={student?.guardianPhone || ''}
            onChange={handleChange}
            placeholder="Guardian's phone number"
            required
          />
        </FormField>

        <FormField>
          <div className="flex items-center justify-between">
            <FormField label="WhatsApp Number" />
            <Toggle
              id="sameAsGuardianPhone"
              checked={sameAsGuardianPhone}
              onChange={(e) => {
                handleSameAsGuardianPhoneToggle(e.target.checked);
                if (e.target.checked && student?.guardianPhone) {
                  dispatch(
                    updatedField({
                      name: 'guardianWhatsAppNum',
                      value: student.guardianPhone,
                    }),
                  );
                }
              }}
              label="Same as contact"
            />
          </div>
          <TextInput
            type="tel"
            name="guardianWhatsAppNum"
            value={student?.guardianWhatsAppNum || ''}
            onChange={handleChange}
            placeholder="Guardian's WhatsApp number"
            disabled={sameAsGuardianPhone}
          />
        </FormField>
      </div>
    </div>
  );
}
