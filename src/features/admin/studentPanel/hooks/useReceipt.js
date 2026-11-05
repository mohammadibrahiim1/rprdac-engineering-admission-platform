import { useEffect, useRef } from 'react';
import {
  generateReceiptNo,
  generateMessReceiptNo,
} from '../utils/receiptGenerator';

export const useReceipt = (handleChange) => {
  const isGenerated = useRef(false);
  useEffect(() => {
    if (!isGenerated.current) {
      handleChange({
        target: { name: 'receiptNo', value: generateReceiptNo() },
      });
      handleChange({
        target: { name: 'messReceiptNo', value: generateMessReceiptNo() },
      });

      isGenerated.current(true);
    }
  }, [handleChange]);
};
