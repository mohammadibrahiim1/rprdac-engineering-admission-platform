import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updatedField } from '../../../../../redux/features/student/studentSlice';

export const useSameAsField = (student) => {
  const dispatch = useDispatch();

  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [sameAsGuardianPhone, setSameAsGuardianPhone] = useState(false);
  const [sameAsPermanentAddress, setSameAsPermanentAddress] = useState(false);

  // 1. Same as Student Phone -> WhatsApp Number
  const handleSameAsPhoneToggle = (checked) => {
    setSameAsPhone(checked);
    if (checked) {
      dispatch(
        updatedField({
          key: 'studentWhatsAppNum',
          value: student?.phone || '',
        }),
      );
    } else {
      dispatch(updatedField({ key: 'studentWhatsAppNum', value: '' }));
    }
  };

  // 2. Same as Guardian Phone -> Guardian WhatsApp Number
  const handleSameAsGuardianPhoneToggle = (checked) => {
    setSameAsGuardianPhone(checked);
    if (checked) {
      dispatch(
        updatedField({
          key: 'guardianWhatsAppNum',
          value: student?.guardianPhone || '',
        }),
      );
    } else {
      dispatch(updatedField({ key: 'guardianWhatsAppNum', value: '' }));
    }
  };

  // 3. Same as Permanent Address -> Present Address
  const handleSameAsPermanentAddressToggle = (checked) => {
    setSameAsPermanentAddress(checked);

    dispatch(updatedField({ name: 'sameAsPermanent', value: checked }));

    if (checked) {
      dispatch(
        updatedField({
          key: 'presentVillage',
          value: student?.permanentVillage || '',
        }),
      );
      dispatch(
        updatedField({
          key: 'presentPostcode',
          value: student?.permanentPostcode || '',
        }),
      );
      dispatch(
        updatedField({
          key: 'presentUpozilla',
          value: student?.permanentUpozilla || '',
        }),
      );
      dispatch(
        updatedField({
          key: 'presentZilla',
          value: student?.permanentZilla || '',
        }),
      );
    } else {
      dispatch(updatedField({ key: 'presentVillage', value: '' }));
      dispatch(updatedField({ key: 'presentPostcode', value: '' }));
      dispatch(updatedField({ key: 'presentUpozilla', value: '' }));
      dispatch(updatedField({ key: 'presentZilla', value: '' }));
    }
  };

  return {
    sameAsPhone,
    sameAsGuardianPhone,
    sameAsPermanentAddress,
    handleSameAsPhoneToggle,
    handleSameAsGuardianPhoneToggle,
    handleSameAsPermanentAddressToggle,
  };
};
