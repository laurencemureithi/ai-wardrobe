import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  RefreshCw,
  User,
  AlertCircle,
  ZoomIn,
  Move,
  ChevronRight,
  ShieldCheck,
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
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'presets'>('upload');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(currentPhoto);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [chosenContext, setChosenContext] = useState<PresentationContext>(presentationContext);

  // Framing adjustments for the photo
  const [zoom, setZoom] = useState(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Analysis result confirmation step
  const [analysisResult, setAnalysisResult] = useState<AvatarGenerationResult | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Camera management
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
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      setZoom(1.0);
      setPanX(0);
      setPanY(0);
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
          setZoom(1.0);
          setPanX(0);
          setPanY(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Crop & produce optimized framed image
  const getProcessedAvatarDataUrl = (): string => {
    if (!capturedImage) return '';
    try {
      const canvas = document.createElement('canvas');
      const size = 512;
      canvas.width = size;
      canvas.height = Math.round(size * 1.25); // 512 x 640 portrait
      const ctx = canvas.getContext('2d');
      if (!ctx) return capturedImage;

      const img = new Image();
      img.src = capturedImage;

      // Draw with zoom and pan
      const w = canvas.width * zoom;
      const h = canvas.height * zoom;
      const x = (canvas.width - w) / 2 + (panX * canvas.width) / 100;
      const y = (canvas.height - h) / 2 + (panY * canvas.height) / 100;

      ctx.drawImage(img, x, y, w, h);
      return canvas.toDataURL('image/jpeg', 0.92);
    } catch {
      return capturedImage;
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
      const processedUrl = getProcessedAvatarDataUrl();
      const result = await generateAvatarFromPhoto(processedUrl, chosenContext);
      clearInterval(stepInterval);
      setIsScanning(false);
      setAnalysisResult(result);
    } catch (err) {
      console.warn('Synthesis error:', err);
      setIsScanning(false);
      clearInterval(stepInterval);
    }
  };

  const handleConfirmResult = () => {
    if (analysisResult) {
      onAvatarGenerated(analysisResult);
    }
  };

  const handleSelectPreset = (preset: (typeof USER_AVATAR_PRESETS)[0]) => {
    setCapturedImage(preset.photoUrl);
    setChosenContext(preset.context);
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
  };

  const scanStepMessages = [
    'Detecting facial landmarks, eye level & cranial proportions...',
    'Mapping skin pigmentation & warmth undertones...',
    'Synthesizing full-body digital twin geometry & natural stance...',
    'Activating living respiratory loop & drape physics...',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-ink-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ink-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-950 text-sand-300 shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-ink-950">
                Create Your Living AI Avatar
              </h2>
              <p className="text-xs text-ink-500">
                Upload your real photo or take a selfie to build an authentic digital twin.
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

        {/* Tab switcher (only when not scanning or viewing results) */}
        {!isScanning && !analysisResult && (
          <div className="flex items-center justify-center gap-2 mt-4 p-1 bg-ink-100 rounded-xl">
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
              Upload Photo
            </button>
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
              onClick={() => setActiveTab('presets')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'presets'
                  ? 'bg-white text-ink-950 shadow-xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <User size={14} />
              Sample Avatars
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
        <canvas ref={previewCanvasRef} className="hidden" />

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
                    style={{
                      transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
                    }}
                  />
                )}
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
                <div className="mt-4 h-1.5 w-full bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ink-950 transition-all duration-300 ease-out"
                    style={{ width: `${((scanStep + 1) / 4) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : analysisResult ? (
            /* Analysis Confirmation View */
            <div className="w-full flex flex-col animate-fade-in">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 mb-4">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>AI Biometrics Calibrated ({analysisResult.faceMatchScore}% confidence)</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-ink-50/70 border border-ink-100">
                <div className="relative h-28 w-28 rounded-2xl overflow-hidden shadow-md border-2 border-white shrink-0 bg-ink-100">
                  <img
                    src={analysisResult.avatarUrl}
                    alt="Digital Twin"
                    className="h-full w-full object-cover"
                  />
                  <div
                    className="absolute bottom-1 right-1 h-4 w-4 rounded-full border border-white shadow-xs"
                    style={{ backgroundColor: analysisResult.skinToneHex || '#cf9e7d' }}
                    title={`Skin tone: ${analysisResult.skinTone}`}
                  />
                </div>

                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500 font-medium">Skin Pigment:</span>
                    <span className="font-semibold text-ink-900 flex items-center gap-1.5">
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-ink-200"
                        style={{ backgroundColor: analysisResult.skinToneHex }}
                      />
                      {analysisResult.skinTone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500 font-medium">Hair Style & Tone:</span>
                    <span className="font-semibold text-ink-900">
                      {analysisResult.hairStyle} ({analysisResult.hairColor})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500 font-medium">Silhouette & Build:</span>
                    <span className="font-semibold text-ink-900 capitalize">
                      {analysisResult.bodyType || 'Athletic / Regular'} ({chosenContext})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500 font-medium">Aesthetic Profile:</span>
                    <span className="font-semibold text-accent-700">
                      {analysisResult.aestheticVibe || 'Modern Tailoring'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-2xs text-ink-500 italic px-1">
                "{analysisResult.notes}"
              </p>

              <div className="mt-5 flex gap-2.5">
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="flex-1 rounded-xl border border-ink-200 py-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
                >
                  Adjust Framing
                </button>
                <button
                  onClick={handleConfirmResult}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-ink-950 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-ink-800 transition-all"
                >
                  <span>Equip Living Avatar</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            /* Framing & Customization view */
            <div className="w-full flex flex-col items-center">
              <div className="relative h-64 w-52 rounded-2xl overflow-hidden shadow-lg border-2 border-ink-200 bg-ink-950 group">
                <div
                  className="h-full w-full overflow-hidden flex items-center justify-center"
                  style={{
                    transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
                    transition: 'transform 0.05s ease-out',
                  }}
                >
                  <img
                    src={capturedImage}
                    alt="Captured Portrait"
                    className="h-full w-full object-cover select-none"
                    draggable={false}
                  />
                </div>

                {/* Face Oval Guideline Overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-44 w-32 rounded-[50%] border-2 border-dashed border-sand-300/80 shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
                </div>

                <button
                  onClick={() => {
                    setCapturedImage(null);
                    if (activeTab === 'camera') startCamera();
                  }}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black transition-colors"
                  title="Choose different photo"
                >
                  <RefreshCw size={14} />
                </button>
                <div className="absolute bottom-1.5 inset-x-2 text-center text-3xs text-white/90 bg-black/60 backdrop-blur-xs py-0.5 rounded-full">
                  Align face inside the oval
                </div>
              </div>

              {/* Framing Controls (Zoom & Pan) */}
              <div className="mt-3.5 w-full bg-ink-50 border border-ink-100 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between text-2xs font-semibold text-ink-700">
                  <span className="flex items-center gap-1">
                    <ZoomIn size={12} />
                    <span>Zoom ({Math.round(zoom * 100)}%)</span>
                  </span>
                  <input
                    type="range"
                    min="0.7"
                    max="2.2"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-36 accent-ink-950"
                  />
                </div>

                <div className="flex items-center justify-between text-2xs font-semibold text-ink-700">
                  <span className="flex items-center gap-1">
                    <Move size={12} />
                    <span>Vertical Position</span>
                  </span>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="1"
                    value={panY}
                    onChange={(e) => setPanY(parseFloat(e.target.value))}
                    className="w-36 accent-ink-950"
                  />
                </div>
              </div>

              {/* Context Selector */}
              <div className="mt-3 w-full flex items-center justify-between p-2.5 rounded-xl bg-ink-50 border border-ink-100">
                <span className="text-2xs font-semibold text-ink-700">Silhouette:</span>
                <div className="flex items-center gap-1.5">
                  {(['male', 'female', 'unisex'] as PresentationContext[]).map((ctx) => (
                    <button
                      key={ctx}
                      onClick={() => setChosenContext(ctx)}
                      className={`px-3 py-1 rounded-lg text-2xs font-semibold capitalize transition-all ${
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

              {/* Action Buttons */}
              <div className="mt-4 w-full flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    if (activeTab === 'camera') startCamera();
                  }}
                  className="flex-1 rounded-xl border border-ink-200 py-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
                >
                  Choose Different
                </button>
                <button
                  onClick={handleSynthesizeAvatar}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-ink-950 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-ink-800 transition-all"
                >
                  <Sparkles size={15} className="text-sand-300" />
                  <span>Calibrate & Build Twin</span>
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
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-44 w-32 rounded-[50%] border-2 border-dashed border-white/60 shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
                  </div>

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
            <span className="text-ink-500">Prefer a faceless atelier mannequin?</span>
            <button
              onClick={() => {
                onResetToBlank();
                onClose();
              }}
              className="text-ink-600 hover:text-red-600 font-medium underline underline-offset-2 transition-colors"
            >
              Reset to Blank Sculptural Mannequin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
