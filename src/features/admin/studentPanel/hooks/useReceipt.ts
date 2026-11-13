import { useEffect, useRef } from "react";
import {
  generateReceiptNo,
  generateMessReceiptNo,
} from "../utils/receiptGenerator";

export type ReceiptChangeHandler = (e: {
  target: { name: string; value: string };
}) => void;

export const useReceipt = (handleChange: ReceiptChangeHandler): void => {
  const isGenerated = useRef<boolean>(false);

  useEffect(() => {
    if (!isGenerated.current) {
      handleChange({
        target: { name: "receiptNo", value: generateReceiptNo() },
      });
      handleChange({
        target: { name: "messReceiptNo", value: generateMessReceiptNo() },
      });

      // Fixed bug: assigned true using assignment operator instead of function call
      isGenerated.current = true;
    }
  }, [handleChange]);
};
