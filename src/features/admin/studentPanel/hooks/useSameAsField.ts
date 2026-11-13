import { updatedField } from "@/redux/features/student/studentSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";

export interface StudentForSameAs {
  phone?: string | null;
  guardianPhone?: string | null;
  permanentVillage?: string | null;
  permanentPostcode?: string | null;
  permanentUpozilla?: string | null;
  permanentZilla?: string | null;
  [key: string]: unknown;
}

export interface UseSameAsFieldReturn {
  sameAsPhone: boolean;
  sameAsGuardianPhone: boolean;
  sameAsPermanentAddress: boolean;
  handleSameAsPhoneToggle: (checked: boolean) => void;
  handleSameAsGuardianPhoneToggle: (checked: boolean) => void;
  handleSameAsPermanentAddressToggle: (checked: boolean) => void;
}

export const useSameAsField = (
  student?: StudentForSameAs | null,
): UseSameAsFieldReturn => {
  const dispatch = useDispatch();

  const [sameAsPhone, setSameAsPhone] = useState<boolean>(false);
  const [sameAsGuardianPhone, setSameAsGuardianPhone] =
    useState<boolean>(false);
  const [sameAsPermanentAddress, setSameAsPermanentAddress] =
    useState<boolean>(false);

  // 1. Same as Student Phone -> WhatsApp Number
  const handleSameAsPhoneToggle = (checked: boolean): void => {
    setSameAsPhone(checked);
    if (checked) {
      dispatch(
        updatedField({
          key: "studentWhatsAppNum",
          value: student?.phone || "",
        }),
      );
    } else {
      dispatch(updatedField({ key: "studentWhatsAppNum", value: "" }));
    }
  };

  // 2. Same as Guardian Phone -> Guardian WhatsApp Number
  const handleSameAsGuardianPhoneToggle = (checked: boolean): void => {
    setSameAsGuardianPhone(checked);
    if (checked) {
      dispatch(
        updatedField({
          key: "guardianWhatsAppNum",
          value: student?.guardianPhone || "",
        }),
      );
    } else {
      dispatch(updatedField({ key: "guardianWhatsAppNum", value: "" }));
    }
  };

  // 3. Same as Permanent Address -> Present Address
  const handleSameAsPermanentAddressToggle = (checked: boolean): void => {
    setSameAsPermanentAddress(checked);

    dispatch(updatedField({ name: "sameAsPermanent", value: checked }));

    if (checked) {
      dispatch(
        updatedField({
          key: "presentVillage",
          value: student?.permanentVillage || "",
        }),
      );
      dispatch(
        updatedField({
          key: "presentPostcode",
          value: student?.permanentPostcode || "",
        }),
      );
      dispatch(
        updatedField({
          key: "presentUpozilla",
          value: student?.permanentUpozilla || "",
        }),
      );
      dispatch(
        updatedField({
          key: "presentZilla",
          value: student?.permanentZilla || "",
        }),
      );
    } else {
      dispatch(updatedField({ key: "presentVillage", value: "" }));
      dispatch(updatedField({ key: "presentPostcode", value: "" }));
      dispatch(updatedField({ key: "presentUpozilla", value: "" }));
      dispatch(updatedField({ key: "presentZilla", value: "" }));
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
