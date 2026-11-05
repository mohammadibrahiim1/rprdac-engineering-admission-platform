import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

type Props = {
  src: string;
  studentPhone: string;
  onEnded: () => void;
};

export default function CustomVideoPlayer({
  src,
  studentPhone,
  onEnded,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
  }, [src]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl aspect-video w-full">
      <video
        ref={videoRef}
        controls
        onEnded={onEnded}
        className="h-full w-full object-contain"
      />

      {/* 💡 Moving Phone Number Watermark Overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-watermark absolute whitespace-nowrap text-white/25 text-sm sm:text-base font-bold select-none">
          {studentPhone}
        </div>
      </div>
    </div>
  );
}
