import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  RefreshCw,
  Check,
  User,
  AlertCircle,
} from 'lucide-react';
import type { PresentationContext } from '@/lib/types';
import {
  generateAvatarFromPhoto,
  USER_AVATAR_PRESETS,
  type AvatarGenerationResult,
} from '@/lib/digitalTwinService';

interface AvatarCreatorModalProps {
  currentPhoto: string | null;
  presentationContext: PresentationContext;
  onClose: () => void;
  onAvatarGenerated: (result: AvatarGenerationResult) => void;
  onResetToBlank?: () => void;
}

export function AvatarCreatorModal({
  currentPhoto,
  presentationContext,
  onClose,
  onAvatarGenerated,
  onResetToBlank,
}: AvatarCreatorModalProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'presets'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(currentPhoto);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [chosenContext, setChosenContext] = useState<PresentationContext>(presentationContext);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera when tab is camera
  useEffect(() => {
    if (activeTab === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera access not supported on this browser. Please upload a photo.');
      }
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload a portrait.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleTakeSnapshot = () => {
    setIsCountingDown(true);
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCountingDown(false);
          performCapture();
          return 0;
        }
        return prev - 1;
      });
    }, 900);
  };

  const performCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror image for natural selfie feel
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesizeAvatar = async () => {
    if (!capturedImage) return;

    setIsScanning(true);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => {
        if (prev >= 3) {
          clearInterval(stepInterval);
          return 3;
        }
        return prev + 1;
      });
    }, 450);

    try {
      const result = await generateAvatarFromPhoto(capturedImage, chosenContext);
      clearInterval(stepInterval);
      setIsScanning(false);
      onAvatarGenerated(result);
    } catch {
      setIsScanning(false);
      clearInterval(stepInterval);
    }
  };

  const handleSelectPreset = (preset: (typeof USER_AVATAR_PRESETS)[0]) => {
    setCapturedImage(preset.photoUrl);
    setChosenContext(preset.context);
  };

  const scanStepMessages = [
    'Detecting facial landmarks, eye level & cranial proportions...',
    'Mapping skin pigmentation & warmth undertones...',
    'Synthesizing full-body digital twin geometry & natural stance...',
    'Activating living respiratory loop & drape physics...',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-ink-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ink-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-950 text-sand-300 shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-ink-950">
                Create Your Living AI Avatar
              </h2>
              <p className="text-xs text-ink-500">
                Take a selfie or upload a photo to generate an avatar that looks like you.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        {!isScanning && (
          <div className="flex items-center justify-center gap-2 mt-4 p-1 bg-ink-100 rounded-xl">
            <button
              onClick={() => {
                setCapturedImage(null);
                setActiveTab('camera');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'camera'
                  ? 'bg-white text-ink-950 shadow-xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Camera size={14} />
              Take Photo
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                fileInputRef.current?.click();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-ink-950 shadow-xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Upload size={14} />
              Upload Image
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'presets'
                  ? 'bg-white text-ink-950 shadow-xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <User size={14} />
              Sample Faces
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Body content */}
        <div className="mt-4 flex flex-col items-center">
          {isScanning ? (
            /* Scanning sequence */
            <div className="w-full flex flex-col items-center py-8">
              <div className="relative h-48 w-48 rounded-full overflow-hidden border-4 border-ink-900 shadow-xl bg-ink-950">
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Scanning"
                    className="h-full w-full object-cover filter contrast-110"
                  />
                )}
                {/* Visual scanner beam overlay */}
                <div className="absolute inset-0 bg-accent-500/20 backdrop-blur-2xs pointer-events-none" />
                <div className="scanner-beam absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-sand-300 to-transparent shadow-[0_0_15px_#fde047]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full border border-sand-300/40 animate-ping opacity-25" />
                </div>
              </div>

              <div className="mt-6 text-center max-w-sm">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-700">
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Synthesizing Living Avatar</span>
                </div>
                <p className="mt-2 text-sm font-serif font-bold text-ink-900">
                  {scanStepMessages[scanStep]}
                </p>
                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ink-950 transition-all duration-300 ease-out"
                    style={{ width: `${((scanStep + 1) / 4) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : capturedImage ? (
            /* Image Preview Ready for Generation */
            <div className="w-full flex flex-col items-center">
              <div className="relative h-60 w-52 rounded-2xl overflow-hidden shadow-lg border-2 border-ink-200 bg-ink-100">
                <img
                  src={capturedImage}
                  alt="Captured Portrait"
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    if (activeTab === 'camera') startCamera();
                  }}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black"
                  title="Retake photo"
                >
                  <RefreshCw size={14} />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center">
                  <span className="text-2xs font-semibold text-sand-300 flex items-center justify-center gap-1">
                    <Check size={12} /> Portrait Captured
                  </span>
                </div>
              </div>

              {/* Context Selector */}
              <div className="mt-4 w-full flex items-center justify-between p-3 rounded-xl bg-ink-50 border border-ink-100">
                <span className="text-xs font-semibold text-ink-700">Silhouette Alignment:</span>
                <div className="flex items-center gap-1.5">
                  {(['male', 'female', 'unisex'] as PresentationContext[]).map((ctx) => (
                    <button
                      key={ctx}
                      onClick={() => setChosenContext(ctx)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        chosenContext === ctx
                          ? 'bg-ink-950 text-white shadow-xs'
                          : 'bg-white text-ink-600 hover:bg-ink-200 border border-ink-200'
                      }`}
                    >
                      {ctx}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-5 w-full flex items-center gap-3">
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    if (activeTab === 'camera') startCamera();
                  }}
                  className="flex-1 rounded-xl border border-ink-200 py-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-100"
                >
                  Retake Photo
                </button>
                <button
                  onClick={handleSynthesizeAvatar}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-ink-950 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-ink-800 transition-all"
                >
                  <Sparkles size={15} className="text-sand-300" />
                  <span>Create Living Avatar</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            /* Live Camera Viewfinder */
            <div className="w-full flex flex-col items-center">
              {cameraError ? (
                <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-amber-50 border border-amber-200 w-full">
                  <AlertCircle size={32} className="text-amber-600 mb-2" />
                  <p className="text-xs font-semibold text-amber-900">{cameraError}</p>
                  <button
                    onClick={() => {
                      setActiveTab('upload');
                      fileInputRef.current?.click();
                    }}
                    className="mt-4 rounded-xl bg-ink-950 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Upload Photo Instead
                  </button>
                </div>
              ) : (
                <div className="relative h-64 w-60 rounded-2xl overflow-hidden shadow-inner bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover transform -scale-x-100"
                  />
                  {/* Face oval guideline */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-44 w-32 rounded-[50%] border-2 border-dashed border-white/60 shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
                  </div>

                  {/* Countdown overlay */}
                  {isCountingDown && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                      <span className="text-6xl font-serif font-bold text-white animate-ping">
                        {countdown}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2 text-2xs text-white/80 bg-black/50 px-3 py-0.5 rounded-full">
                    Position face inside the oval
                  </div>
                </div>
              )}

              {/* Capture button */}
              {!cameraError && cameraActive && (
                <button
                  onClick={handleTakeSnapshot}
                  disabled={isCountingDown}
                  className="mt-5 flex items-center gap-2 rounded-full bg-ink-950 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-ink-800 disabled:opacity-50"
                >
                  <Camera size={16} />
                  <span>Snap Photo</span>
                </button>
              )}
            </div>
          ) : (
            /* Presets Grid */
            <div className="w-full">
              <p className="text-xs text-ink-600 mb-3 text-center">
                Select a reference portrait to synthesize your living twin instantly:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {USER_AVATAR_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="group cursor-pointer rounded-xl border border-ink-200 overflow-hidden bg-white p-2 hover:border-ink-900 transition-all text-center"
                  >
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-ink-100">
                      <img
                        src={preset.photoUrl}
                        alt={preset.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-ink-900 truncate">
                      {preset.name}
                    </p>
                    <span className="text-2xs text-ink-500 capitalize">{preset.skinTone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Blank Reset Option */}
        {onResetToBlank && (
          <div className="mt-5 pt-3 border-t border-ink-100 flex items-center justify-between text-2xs">
            <span className="text-ink-500">Prefer a neutral model?</span>
            <button
              onClick={() => {
                onResetToBlank();
                onClose();
              }}
              className="text-ink-600 hover:text-red-600 font-medium underline underline-offset-2 transition-colors"
            >
              Reset to Blank Unfeatured Mannequin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
