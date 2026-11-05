export const generateReceiptNo = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const time = Date.now().toString().slice(-3);
  return `RPR-${random}${time}`;
};

export const generateMessReceiptNo = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const time = Date.now().toString().slice(-3);
  return `HSC-${random}${time}`;
};
