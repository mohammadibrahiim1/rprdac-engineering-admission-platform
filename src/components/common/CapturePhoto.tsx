import React, { useRef, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Camera, RefreshCw, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Declare global window property for MediaPipe script
declare global {
  interface Window {
    SelfieSegmentation: any;
  }
}

export interface CapturePhotoProps {
  name?: string; // React Hook Form field name if used inside a form
  onCapture?: (file: File) => void;
}

const PASSPORT_WIDTH = 413; // Standard 35mm at ~300 DPI
const PASSPORT_HEIGHT = 531; // Standard 45mm at ~300 DPI

export const CapturePhoto: React.FC<CapturePhotoProps> = ({
  name,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [segmentationModel, setSegmentationModel] = useState<any>(null);

  // Optional: Hook Form integration if wrapped in FormProvider
  const formContext = useFormContext();

  // ✅ Load MediaPipe SelfieSegmentation script dynamically
  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      if (!window.SelfieSegmentation) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      if (!isMounted) return;

      const model = new window.SelfieSegmentation({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      model.setOptions({ modelSelection: 1 });
      model.onResults(handleSegmentationResults);
      setSegmentationModel(model);
    };

    loadModel();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ✅ Start the camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 720 },
          height: { ideal: 960 },
          aspectRatio: 3 / 4,
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      alert("Camera access denied or unavailable!");
    }
  };

  // ✅ Stop the camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  // ✅ Handle background replacement (Studio White Background + Passport Cropping)
  const handleSegmentationResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = PASSPORT_WIDTH;
    canvas.height = PASSPORT_HEIGHT;

    // 1. Fill with pure studio white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, PASSPORT_WIDTH, PASSPORT_HEIGHT);

    // Save context for mask layering
    ctx.save();

    // 2. Draw segmentation mask to isolate the subject
    ctx.drawImage(
      results.segmentationMask,
      0,
      0,
      PASSPORT_WIDTH,
      PASSPORT_HEIGHT,
    );

    // 3. Keep only the person using source-in composite operation
    ctx.globalCompositeOperation = "source-in";

    // Center crop or fit video frame into passport aspect ratio dimensions
    const video = videoRef.current;
    if (video) {
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;

      // Calculate cover dimensions for passport ratio (3:4)
      const targetRatio = PASSPORT_WIDTH / PASSPORT_HEIGHT;
      const videoRatio = vWidth / vHeight;

      let sWidth = vWidth;
      let sHeight = vHeight;
      let sX = 0;
      let sY = 0;

      if (videoRatio > targetRatio) {
        sWidth = vHeight * targetRatio;
        sX = (vWidth - sWidth) / 2;
      } else {
        sHeight = vWidth / targetRatio;
        sY = (vHeight - sHeight) / 2;
      }

      ctx.drawImage(
        results.image,
        sX,
        sY,
        sWidth,
        sHeight,
        0,
        0,
        PASSPORT_WIDTH,
        PASSPORT_HEIGHT,
      );
    }

    ctx.restore();
  };

  // ✅ Capture photo as professional Passport size JPEG with White BG
  const capturePhoto = async () => {
    if (!segmentationModel || !videoRef.current) return;

    await segmentationModel.send({ image: videoRef.current });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/jpeg", 0.92); // High quality JPEG
    setImage(dataURL);

    // Convert Base64 → File object
    const byteString = atob(dataURL.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: "image/jpeg" });
    const photoFile = new File([blob], "passport_photo.jpg", {
      type: "image/jpeg",
    });

    if (onCapture) onCapture(photoFile);
    stopCamera();
  };

  return (
    <div className="flex flex-col items-center space-y-4 rounded-xl p-4 bg-white border border-slate-200 shadow-sm max-w-sm mx-auto">
      {!image ? (
        <>
          {/* Passport size live view container (3:4 Ratio) */}
          <div className="relative w-48 h-64 bg-black rounded-lg overflow-hidden shadow-inner border border-slate-300 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute w-full h-full object-cover transform -scale-x-100"
            />
            {!stream && (
              <span className="text-xs text-slate-400 font-medium z-10 text-center px-2">
                Camera is off
              </span>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="flex flex-wrap justify-center gap-2.5 w-full">
            {!stream ? (
              <Button
                type="button"
                onClick={startCamera}
                className="w-full bg-[#00A8E8] hover:bg-[#0092CB] text-white font-semibold text-xs uppercase tracking-wider h-10 rounded-lg shadow-sm"
              >
                <Camera className="w-4 h-4 mr-2" /> Start Camera
              </Button>
            ) : (
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider h-10 rounded-lg shadow-sm"
                >
                  Capture
                </Button>
                <Button
                  type="button"
                  onClick={stopCamera}
                  variant="destructive"
                  className="h-10 rounded-lg px-4"
                >
                  <StopCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-3 w-full">
          {/* Passport size preview container (3:4 Ratio) */}
          <div className="w-48 h-64 border border-slate-200 rounded-lg overflow-hidden shadow-md bg-white flex items-center justify-center">
            <img
              src={image}
              alt="Passport Captured"
              className="w-full h-full object-cover"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setImage(null);
              startCamera();
            }}
            className="w-full text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold text-xs uppercase tracking-wider h-10 rounded-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Retake Photo
          </Button>
        </div>
      )}
    </div>
  );
};

export default CapturePhoto;
