export const generateReceiptNo = (): string => {
  const random: number = Math.floor(1000 + Math.random() * 9000);
  const time: string = Date.now().toString().slice(-3);
  return `RPR-${random}${time}`;
};

export const generateMessReceiptNo = (): string => {
  const random: number = Math.floor(1000 + Math.random() * 9000);
  const time: string = Date.now().toString().slice(-3);
  return `HSC-${random}${time}`;
};