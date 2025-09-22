import React, { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type SupportedMimeType =
  | "audio/webm;codecs=opus"
  | "audio/webm"
  | "audio/ogg;codecs=opus"
  | "audio/ogg"
  | "audio/mp4"
  | "";

const pickSupportedMimeType = (): SupportedMimeType => {
  const candidates: SupportedMimeType[] = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
    "",
  ];
  for (const type of candidates) {
    if (type === "" || (window.MediaRecorder && MediaRecorder.isTypeSupported(type))) {
      return type;
    }
  }
  return "";
};

export const MicrophoneTest: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [currentMimeType, setCurrentMimeType] = useState<SupportedMimeType>("");
  const [analysis, setAnalysis] = useState<{
    rms: number;
    peak: number;
    clippingPercent: number;
    noiseFloorRms: number | null;
    snrDb: number | null;
    dominantFreqHz: number | null;
    spectralCentroidHz: number | null;
    dcOffset: number;
  } | null>(null);
  const [verdict, setVerdict] = useState<{
    status: "success" | "warning" | "error";
    message: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sampleRateRef = useRef<number>(44100);

  // Acúmulos para análise
  const totalFramesRef = useRef<number>(0);
  const sumRmsRef = useRef<number>(0);
  const peakRef = useRef<number>(0);
  const clippedSamplesRef = useRef<number>(0);
  const totalSamplesRef = useRef<number>(0);
  const sumMeanRef = useRef<number>(0);
  const freqAccumRef = useRef<Float64Array | null>(null);
  const noiseWindowRmsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setAudioUrl(null);
      setFileName(null);
      setAnalysis(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickSupportedMimeType();
      setCurrentMimeType(mimeType);
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      sampleRateRef.current = audioContext.sampleRate || 44100;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const timeArray = new Uint8Array(analyser.fftSize);
      freqAccumRef.current = new Float64Array(analyser.frequencyBinCount);
      totalFramesRef.current = 0;
      sumRmsRef.current = 0;
      peakRef.current = 0;
      clippedSamplesRef.current = 0;
      totalSamplesRef.current = 0;
      sumMeanRef.current = 0;
      noiseWindowRmsRef.current = [];

      const updateVolume = () => {
        // Time domain
        analyser.getByteTimeDomainData(timeArray);
        let sumSquares = 0;
        let maxAbs = 0;
        let meanSum = 0;
        let clipped = 0;
        for (let i = 0; i < timeArray.length; i++) {
          const centered = timeArray[i] - 128;
          meanSum += centered;
          const absVal = Math.abs(centered);
          maxAbs = absVal > maxAbs ? absVal : maxAbs;
          sumSquares += centered * centered;
          if (timeArray[i] <= 1 || timeArray[i] >= 255) clipped++;
        }
        const rms = Math.sqrt(sumSquares / timeArray.length);
        const normalized = Math.min((rms / 128) * 100 * 2, 100);
        setVolume(normalized);

        // Acúmulos globais
        totalFramesRef.current += 1;
        sumRmsRef.current += rms;
        peakRef.current = Math.max(peakRef.current, maxAbs);
        clippedSamplesRef.current += clipped;
        totalSamplesRef.current += timeArray.length;
        const mean = meanSum / timeArray.length; // offset em -128..+127
        sumMeanRef.current += mean;
        if (noiseWindowRmsRef.current.length < 30) {
          noiseWindowRmsRef.current.push(rms);
        }

        // Frequency domain
        analyser.getByteFrequencyData(dataArray);
        if (freqAccumRef.current) {
          for (let i = 0; i < dataArray.length; i++) {
            freqAccumRef.current[i] += dataArray[i];
          }
        }
        animationRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const ts = new Date();
        const pad = (n: number) => n.toString().padStart(2, "0");
        const yyyy = ts.getFullYear();
        const mm = pad(ts.getMonth() + 1);
        const dd = pad(ts.getDate());
        const hh = pad(ts.getHours());
        const mi = pad(ts.getMinutes());
        const ss = pad(ts.getSeconds());
        const ext = (mimeType.includes("ogg") ? "ogg" : (mimeType.includes("mp4") ? "m4a" : "webm"));
        setFileName(`gravacao-${yyyy}${mm}${dd}-${hh}${mi}${ss}.${ext}`);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());

        // Cálculo de métricas
        const avgRms = sumRmsRef.current / Math.max(1, totalFramesRef.current);
        const peak = peakRef.current;
        const clippingPercent = (clippedSamplesRef.current / Math.max(1, totalSamplesRef.current)) * 100;
        const dcOffset = (sumMeanRef.current / Math.max(1, totalFramesRef.current)) / 128; // normalizado -1..1
        const noiseFloorRms = noiseWindowRmsRef.current.length
          ? noiseWindowRmsRef.current.reduce((a, b) => a + b, 0) / noiseWindowRmsRef.current.length
          : null;
        const snrDb = noiseFloorRms && noiseFloorRms > 0
          ? 20 * Math.log10(avgRms / noiseFloorRms)
          : null;

        let dominantFreqHz: number | null = null;
        let spectralCentroidHz: number | null = null;
        const freqAccum = freqAccumRef.current;
        const analyser = analyserRef.current;
        if (freqAccum && analyser) {
          // Dominant frequency
          let maxIndex = 0;
          let maxVal = -1;
          for (let i = 0; i < freqAccum.length; i++) {
            if (freqAccum[i] > maxVal) {
              maxVal = freqAccum[i];
              maxIndex = i;
            }
          }
          const nyquist = sampleRateRef.current / 2;
          const binWidth = nyquist / freqAccum.length;
          dominantFreqHz = Math.round(maxIndex * binWidth);

          // Spectral centroid
          let num = 0;
          let den = 0;
          for (let i = 0; i < freqAccum.length; i++) {
            const freq = i * binWidth;
            const mag = freqAccum[i];
            num += freq * mag;
            den += mag;
          }
          spectralCentroidHz = den > 0 ? Math.round(num / den) : null;
        }

        setAnalysis({
          rms: Number(avgRms.toFixed(2)),
          peak: Number(peak.toFixed(2)),
          clippingPercent: Number(clippingPercent.toFixed(2)),
          noiseFloorRms: noiseFloorRms ? Number(noiseFloorRms.toFixed(2)) : null,
          snrDb: snrDb !== null ? Number(snrDb.toFixed(2)) : null,
          dominantFreqHz,
          spectralCentroidHz,
          dcOffset: Number(dcOffset.toFixed(3)),
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e: any) {
      let message = "Não foi possível acessar o microfone.";
      if (e?.name === "NotAllowedError") message = "Permissão negada para usar o microfone.";
      if (e?.name === "NotFoundError") message = "Nenhum microfone foi encontrado.";
      setError(message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = fileName || "gravacao.webm";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const classify = (metric: string, value: number | null): "success" | "warning" | "error" => {
    if (value === null || Number.isNaN(value)) return "warning";
    switch (metric) {
      case "rms":
        // ótimo acima de 10, bom a partir de 6, aceitável 3-6, ruim abaixo de 3
        if (value >= 10) return "success";
        if (value >= 6 && value < 10) return "success";
        if (value >= 3 && value < 6) return "warning";
        return "error";
      case "peak":
        if (value < 120) return "success";
        if (value < 127) return "warning";
        return "error";
      case "clipping":
        if (value <= 0.0) return "success";
        if (value < 0.1) return "warning";
        return "error";
      case "noise":
        if (value < 5) return "success";
        if (value < 10) return "warning";
        return "error";
      case "snr":
        if (value > 30) return "success";
        if (value > 20) return "warning";
        return "error";
      case "dc":
        if (Math.abs(value) < 0.05) return "success";
        if (Math.abs(value) < 0.1) return "warning";
        return "error";
      case "centroid":
        // fala clara 1-4k, ok 0.5-1k ou 4-6k
        if (value >= 1000 && value <= 4000) return "success";
        if ((value >= 500 && value < 1000) || (value > 4000 && value <= 6000)) return "warning";
        return "warning";
      default:
        return "warning";
    }
  };

  const colorFor = (status: "success" | "warning" | "error") =>
    status === "success" ? "text-success" : status === "warning" ? "text-warning" : "text-error";

  useEffect(() => {
    if (!analysis) {
      setVerdict(null);
      return;
    }
    const sRms = classify("rms", analysis.rms);
    const sPeak = classify("peak", analysis.peak);
    const sClip = classify("clipping", analysis.clippingPercent);
    const sNoise = classify("noise", analysis.noiseFloorRms ?? null);
    const sSnr = classify("snr", analysis.snrDb ?? null);
    const sDc = classify("dc", analysis.dcOffset);
    // pior caso define o veredito
    const statuses = [sRms, sPeak, sClip, sNoise, sSnr, sDc];
    const overall = statuses.includes("error") ? "error" : statuses.includes("warning") ? "warning" : "success";
    const message = overall === "success"
      ? "Áudio em boas condições para chamadas."
      : overall === "warning"
      ? "Áudio utilizável, mas há pontos a melhorar."
      : "Qualidade de áudio baixa detectada.";
    setVerdict({ status: overall, message });
  }, [analysis]);

  return (
    <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-diagnostic space-y-4">
      <h2 className="text-2xl font-semibold text-center">🎤 Teste seu microfone</h2>
      <p className="text-center text-muted-foreground">
        Grave um trecho curto para analisar nível, ruído, clipping e qualidade geral.
      </p>

      {error && (
        <div className="text-sm text-error bg-error/10 border border-error/20 rounded-md p-2">
          {error}
        </div>
      )}

      {isRecording && (
        <div className="w-full h-4 bg-muted rounded">
          <div className="h-4 bg-green-500 rounded transition-all" style={{ width: `${Math.min(volume, 100)}%` }} />
        </div>
      )}

      <div className="text-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-diagnostic px-6 py-3 text-base font-semibold rounded-2xl text-white"
          >
            🎙️ Iniciar Gravação
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
          >
            ⏹️ Parar Gravação
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-1">▶️ Ouça sua gravação abaixo:</p>
          <audio controls src={audioUrl} className="w-full rounded" />
          <div className="mt-3 flex items-center gap-3">
            <a
              href={audioUrl}
              download={fileName || "gravacao.webm"}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90"
            >
              ⬇️ Baixar áudio
            </a>
            {fileName && (
              <span className="text-xs text-muted-foreground">{fileName}</span>
            )}
          </div>
          {analysis && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="font-medium flex items-center gap-1">
                  Nível (RMS / Pico)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button aria-label="Ajuda"><Info className="h-4 w-4 text-muted-foreground" /></button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Intensidade do sinal. Ótimo: RMS ≥ 10, Bom: RMS ≥ 6, Aceitável: RMS ≥ 3, Pico &lt; 120.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-muted-foreground">
                  <span className={colorFor(classify("rms", analysis.rms))}>{analysis.rms}</span>
                  {" "}/{" "}
                  <span className={colorFor(classify("peak", analysis.peak))}>{analysis.peak}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="font-medium flex items-center gap-1">
                  Clipping
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button aria-label="Ajuda"><Info className="h-4 w-4 text-muted-foreground" /></button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Distorção por estouro. Bom: 0%. Aceitável: &lt; 0,1%.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className={colorFor(classify("clipping", analysis.clippingPercent))}>{analysis.clippingPercent}%</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="font-medium flex items-center gap-1">
                  Ruído (RMS)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button aria-label="Ajuda"><Info className="h-4 w-4 text-muted-foreground" /></button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Nível de fundo em silêncio. Bom: &lt; 5. Mais alto indica ruído ambiente.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className={analysis.noiseFloorRms !== null ? colorFor(classify("noise", analysis.noiseFloorRms)) : "text-muted-foreground"}>
                  {analysis.noiseFloorRms ?? "—"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="font-medium flex items-center gap-1">
                  SNR
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button aria-label="Ajuda"><Info className="h-4 w-4 text-muted-foreground" /></button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Relação sinal/ruído. Bom: &gt; 20 dB. Excelente: &gt; 30 dB.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className={analysis.snrDb !== null ? colorFor(classify("snr", analysis.snrDb)) : "text-muted-foreground"}>
                  {analysis.snrDb !== null ? `${analysis.snrDb} dB` : "—"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="font-medium flex items-center gap-1">
                  Freq. dominante
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button aria-label="Ajuda"><Info className="h-4 w-4 text-muted-foreground" /></button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Tom mais forte. Em fala, varia (80–300 Hz base + harmônicos).
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-muted-foreground">{analysis.dominantFreqHz ? `${analysis.dominantFreqHz} Hz` : "—"}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="font-medium flex items-center gap-1">
                  Centróide espectral
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button aria-label="Ajuda"><Info className="h-4 w-4 text-muted-foreground" /></button>
                      </TooltipTrigger>
                      <TooltipContent>
                        “Brilho” do som. Fala clara costuma ficar entre 1–4 kHz.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className={analysis.spectralCentroidHz !== null ? colorFor(classify("centroid", analysis.spectralCentroidHz!)) : "text-muted-foreground"}>
                  {analysis.spectralCentroidHz ? `${analysis.spectralCentroidHz} Hz` : "—"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 sm:col-span-2">
                <div className="font-medium flex items-center gap-1">
                  DC Offset (tendência)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button aria-label="Ajuda"><Info className="h-4 w-4 text-muted-foreground" /></button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Deslocamento do zero. Bom: |offset| &lt; 0,05.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className={colorFor(classify("dc", analysis.dcOffset))}>{analysis.dcOffset}</div>
              </div>
              {verdict && (
                <div className={`sm:col-span-2 p-4 rounded-xl border ${verdict.status === "success" ? "border-success/30 bg-success/10" : verdict.status === "warning" ? "border-warning/30 bg-warning/10" : "border-error/30 bg-error/10"}`}>
                  <div className="text-sm font-medium">Veredito</div>
                  <div className={`text-base font-semibold ${colorFor(verdict.status)}`}>{verdict.message}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MicrophoneTest;


