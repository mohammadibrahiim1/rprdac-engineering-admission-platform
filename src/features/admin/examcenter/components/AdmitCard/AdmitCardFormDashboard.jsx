import React from 'react';
import { useAdmitCardForm } from '../../hooks/admitcard/useAdmitCardForm';
import AdmitCardFormFields from './AdmitCardFormFields';
import AdmitCardPreview from './AdmitCardPreview';

const AdmitCardFormDashboard = () => {
  const { watchedValues, ...formProps } = useAdmitCardForm();

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4">
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-12  items-start">
          {/* LEFT: Notion Dynamic Form */}
          <div className="lg:col-span-7 xl:col-span-8 w-full">
            <AdmitCardFormFields {...formProps} />
          </div>

          {/* RIGHT: High Reactive Pixel-Perfect Preview */}
          <div className="lg:col-span-5 xl:col-span-4 w-full flex justify-center">
            <AdmitCardPreview watchedValues={watchedValues} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmitCardFormDashboard;
