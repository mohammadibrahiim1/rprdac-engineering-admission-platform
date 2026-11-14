export const formatDutyTime = (input) => {
  if (!input) return '0h 0m 0s';

  let totalSeconds = 0;

  if (typeof input === 'string' && input.includes(':')) {
    const parts = input.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parseInt(parts[2], 10) || 0;

    totalSeconds = hours * 3600 + minutes * 60 + seconds;
  } else {
    totalSeconds = Number(input);
  }

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${h}h ${m}m ${s}s`;
};
