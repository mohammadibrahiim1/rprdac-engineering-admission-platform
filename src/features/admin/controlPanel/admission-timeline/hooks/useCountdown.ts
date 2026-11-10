import { useEffect, useState, useMemo } from "react";

export interface CountdownTimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export type TargetDateType = string | number | Date | null | undefined;

const calculateTimeLeft = (targetDate: TargetDateType): CountdownTimeLeft => {
  if (!targetDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    };
  }

  const targetTime = new Date(targetDate).getTime();
  if (isNaN(targetTime)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    };
  }

  const difference = targetTime - Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  };
};

export const useCountdown = (targetDate: TargetDateType): CountdownTimeLeft => {
  const [timeLeft, setTimeLeft] = useState<CountdownTimeLeft>(() =>
    calculateTimeLeft(targetDate),
  );

  useEffect(() => {
    // Update immediately on targetDate change
    setTimeLeft(calculateTimeLeft(targetDate));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [targetDate]);

  return useMemo(() => timeLeft, [timeLeft]);
};
