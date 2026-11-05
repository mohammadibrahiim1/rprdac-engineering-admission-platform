import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updatedField } from '../../../../../redux/features/student/studentSlice';
import { addressService } from '../services/address.service';

export const useAddress = (student) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [upazilasData, setUpazilasData] = useState([]);

  const [selectedPermanentZilla, setSelectedPermanentZilla] = useState('');
  const [selectedPresentZilla, setSelectedPresentZilla] = useState('');
  const [permanentUpazilaOptions, setPermanentUpazilaOptions] = useState([]);
  const [presentUpazilaOptions, setPresentUpazilaOptions] = useState([]);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    const loadAddressData = async () => {
      setLoading(true);
      try {
        const [distData, upaData] = await Promise.all([
          addressService.fetchDistricts(),
          addressService.fetchSubDistricts(),
        ]);
        if (isMounted) {
          setDistricts(distData || []);
          setUpazilasData(upaData || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAddressData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync Upazilas for Permanent Address
  useEffect(() => {
    if (selectedPermanentZilla) {
      const district = districts.find((d) => d.name === selectedPermanentZilla);
      setPermanentUpazilaOptions(
        district
          ? upazilasData.filter((u) => u.district_id === district.id)
          : [],
      );
    } else {
      setPermanentUpazilaOptions([]);
    }
  }, [selectedPermanentZilla, districts, upazilasData]);

  // Sync Upazilas for Present Address
  useEffect(() => {
    if (selectedPresentZilla) {
      const district = districts.find((d) => d.name === selectedPresentZilla);
      setPresentUpazilaOptions(
        district
          ? upazilasData.filter((u) => u.district_id === district.id)
          : [],
      );
    } else {
      setPresentUpazilaOptions([]);
    }
  }, [selectedPresentZilla, districts, upazilasData]);

  // Handle "Same as Permanent" checkbox logic
  useEffect(() => {
    if (student?.sameAsPermanent) {
      dispatch(
        updatedField({
          name: 'presentZilla',
          value: student.permanentZilla || '',
        }),
      );
      dispatch(
        updatedField({
          name: 'presentUpozilla',
          value: student.permanentUpozilla || '',
        }),
      );
      dispatch(
        updatedField({
          name: 'presentVillage',
          value: student.permanentVillage || '',
        }),
      );
      dispatch(
        updatedField({
          name: 'presentPostcode',
          value: student.permanentPostcode || '',
        }),
      );
      setSelectedPresentZilla(student.permanentZilla || '');
    }
  }, [
    student?.sameAsPermanent,
    student?.permanentZilla,
    student?.permanentUpozilla,
    student?.permanentVillage,
    student?.permanentPostcode,
    dispatch,
  ]);

  const handlePermanentZillaChange = (e) => {
    const value = typeof e === 'object' ? e?.target?.value : e;
    setSelectedPermanentZilla(value);
    dispatch(updatedField({ name: 'permanentZilla', value }));
    dispatch(updatedField({ name: 'permanentUpozilla', value: '' }));
  };

  const handlePresentZillaChange = (e) => {
    const value = typeof e === 'object' ? e?.target?.value : e;
    setSelectedPresentZilla(value);
    dispatch(updatedField({ name: 'presentZilla', value }));
    dispatch(updatedField({ name: 'presentUpozilla', value: '' }));
  };

  return {
    loading,
    error,
    districtNames: districts.map((d) => d.name),
    permanentUpazilaNames: permanentUpazilaOptions.map((u) => u.name),
    presentUpazilaNames: presentUpazilaOptions.map((u) => u.name),
    selectedPermanentZilla,
    selectedPresentZilla,
    handlePermanentZillaChange,
    handlePresentZillaChange,
    setSelectedPermanentZilla,
    setSelectedPresentZilla,
  };
};
