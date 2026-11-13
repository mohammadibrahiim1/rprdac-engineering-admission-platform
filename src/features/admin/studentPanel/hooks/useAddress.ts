import {
  useState,
  useEffect,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
} from "react";
import { useDispatch } from "react-redux";
import { updatedField } from "@/redux/features/student/studentSlice";
import { addressService } from "../services/address.service";

export interface District {
  id: string | number;
  name: string;
  [key: string]: unknown;
}

export interface Upazila {
  id: string | number;
  district_id: string | number;
  name: string;
  [key: string]: unknown;
}

export interface StudentAddress {
  sameAsPermanent?: boolean;
  permanentZilla?: string | null;
  permanentUpozilla?: string | null;
  permanentVillage?: string | null;
  permanentPostcode?: string | null;
  [key: string]: unknown;
}

export interface UseAddressReturn {
  loading: boolean;
  error: string | null;
  districtNames: string[];
  permanentUpazilaNames: string[];
  presentUpazilaNames: string[];
  selectedPermanentZilla: string;
  selectedPresentZilla: string;
  handlePermanentZillaChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement> | string,
  ) => void;
  handlePresentZillaChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement> | string,
  ) => void;
  setSelectedPermanentZilla: Dispatch<SetStateAction<string>>;
  setSelectedPresentZilla: Dispatch<SetStateAction<string>>;
}

export const useAddress = (
  student?: StudentAddress | null,
): UseAddressReturn => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilasData, setUpazilasData] = useState<Upazila[]>([]);

  const [selectedPermanentZilla, setSelectedPermanentZilla] =
    useState<string>("");
  const [selectedPresentZilla, setSelectedPresentZilla] = useState<string>("");
  const [permanentUpazilaOptions, setPermanentUpazilaOptions] = useState<
    Upazila[]
  >([]);
  const [presentUpazilaOptions, setPresentUpazilaOptions] = useState<Upazila[]>(
    [],
  );

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
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load address data";
          setError(errorMessage);
        }
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
          name: "presentZilla",
          value: student.permanentZilla || "",
        }),
      );
      dispatch(
        updatedField({
          name: "presentUpozilla",
          value: student.permanentUpozilla || "",
        }),
      );
      dispatch(
        updatedField({
          name: "presentVillage",
          value: student.permanentVillage || "",
        }),
      );
      dispatch(
        updatedField({
          name: "presentPostcode",
          value: student.permanentPostcode || "",
        }),
      );
      setSelectedPresentZilla(student.permanentZilla || "");
    }
  }, [
    student?.sameAsPermanent,
    student?.permanentZilla,
    student?.permanentUpozilla,
    student?.permanentVillage,
    student?.permanentPostcode,
    dispatch,
  ]);

  const handlePermanentZillaChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement> | string,
  ) => {
    const value =
      typeof e === "object" && e !== null && "target" in e && e.target
        ? (e.target as HTMLInputElement | HTMLSelectElement).value
        : (e as string);

    setSelectedPermanentZilla(value);
    dispatch(updatedField({ name: "permanentZilla", value }));
    dispatch(updatedField({ name: "permanentUpozilla", value: "" }));
  };

  const handlePresentZillaChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement> | string,
  ) => {
    const value =
      typeof e === "object" && e !== null && "target" in e && e.target
        ? (e.target as HTMLInputElement | HTMLSelectElement).value
        : (e as string);

    setSelectedPresentZilla(value);
    dispatch(updatedField({ name: "presentZilla", value }));
    dispatch(updatedField({ name: "presentUpozilla", value: "" }));
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
