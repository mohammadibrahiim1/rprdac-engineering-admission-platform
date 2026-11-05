import React from 'react';
import { Book } from 'lucide-react';
import CardSection from '../../common/CardSection';
import FormField from '../../common/FormField';
import SearchableSelect from '../../common/SearchableSelect';
import TextInput from '../../common/TextInput';

export default function SSCInfo({
  student,
  handleChange,
  sscInformation,
  academicLoading,
}) {
  return (
    <CardSection icon={Book} iconColor="text-blue-500" title="SSC Information">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <FormField label="Group">
          <SearchableSelect
            name="sscGroup"
            value={student?.sscGroup || ''}
            onChange={handleChange}
            options={sscInformation?.groups?.map((g) => g.name) || []}
            placeholder="Select SSC group"
            isLoading={academicLoading}
          />
        </FormField>

        <FormField label="Board">
          <SearchableSelect
            name="sscBoard"
            value={student?.sscBoard || ''}
            onChange={handleChange}
            options={sscInformation?.boards?.map((b) => b.name) || []}
            placeholder="Select SSC board"
            isLoading={academicLoading}
          />
        </FormField>

        <FormField label="Passing Year">
          <SearchableSelect
            name="sscPassingYear"
            value={student?.sscPassingYear || ''}
            onChange={handleChange}
            options={
              sscInformation?.passingYears?.map((py) => String(py.year)) || []
            }
            placeholder="Select year"
          />
        </FormField>

        <FormField label="GPA">
          <TextInput
            type="number"
            name="sscGpa"
            value={student?.sscGpa || ''}
            onChange={handleChange}
            placeholder="e.g. 5.00"
            step="0.01"
          />
        </FormField>
      </div>
    </CardSection>
  );
}
