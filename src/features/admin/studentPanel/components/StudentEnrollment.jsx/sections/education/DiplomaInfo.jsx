import React from 'react';
import { Book } from 'lucide-react';
import CardSection from '../../common/CardSection';
import FormField from '../../common/FormField';
import SearchableSelect from '../../common/SearchableSelect';
import TextInput from '../../common/TextInput';

export default function DiplomaInfo({
  student,
  handleChange,
  diplomaInformation,
  academicLoading,
}) {
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
            value={student?.diplomaGroup || ''}
            onChange={handleChange}
            options={diplomaInformation?.groups?.map((dg) => dg.name) || []}
            placeholder="Select diploma group"
            isLoading={academicLoading}
          />
        </FormField>

        <FormField label="Board">
          <TextInput
            name="diplomaBoard"
            value={'BTEB'}
            readOnly
            placeholder="BTEB"
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Passing Year">
          <SearchableSelect
            name="diplomaPassingYear"
            value={student?.diplomaPassingYear || ''}
            onChange={handleChange}
            options={
              diplomaInformation.passingYears?.map((dpy) => String(dpy.year)) ||
              []
            }
            placeholder="Select year"
          />
        </FormField>

        <FormField label="GPA">
          <TextInput
            type="number"
            name="diplomaGpa"
            value={student?.diplomaGpa || ''}
            onChange={handleChange}
            placeholder="e.g. 3.50"
            step="0.01"
          />
        </FormField>
      </div>
    </CardSection>
  );
}
