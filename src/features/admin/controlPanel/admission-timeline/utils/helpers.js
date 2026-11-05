export const isEmpty = (value) => {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
};

export const truncate = (text, length = 50) => {
  if (!text) return '';

  return text.length > length ? `${text.slice(0, length)}...` : text;
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
