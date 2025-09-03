import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore - No types available for this library
import SpeedTestLib from "@cloudflare/speedtest";

export interface SpeedTestResults {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  jitter: number;
  packetLoss: number;
}

interface SpeedTestProps {
  onTestComplete?: (results: SpeedTestResults) => void;
}

type TestMode = 'fast' | 'complete';

export const SpeedTest = ({ onTestComplete }: SpeedTestProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SpeedTestResults | null>(null);
  const [currentTest, setCurrentTest] = useState<string>("");
  const [testMode, setTestMode] = useState<TestMode>('fast');
  const [progress, setProgress] = useState(0);
  const [testDetails, setTestDetails] = useState<{
    duration: number;
    bytesTransferred: number;
    samples: number;
  } | null>(null);
  const { toast } = useToast();

  const getTestConfig = (mode: TestMode) => {
    if (mode === 'complete') {
      return {
        measurements: [
          { type: 'latency' as const, numPackets: 30 },
          { type: 'download' as const, bytes: 5e6, count: 12 },
          { type: 'download' as const, bytes: 10e6, count: 8 },
          { type: 'upload' as const, bytes: 2e6, count: 10 },
          { type: 'upload' as const, bytes: 5e6, count: 6 },
          { type: 'packetLoss' as const, numPackets: 50 },
        ] as any[],
        estimatedDuration: "≈30s"
      };
    }
    
    return {
      measurements: [
        { type: 'latency' as const, numPackets: 15 },
        { type: 'download' as const, bytes: 2e6, count: 6 },
        { type: 'download' as const, bytes: 5e6, count: 4 },
        { type: 'upload' as const, bytes: 1e6, count: 6 },
        { type: 'upload' as const, bytes: 2e6, count: 3 },
        { type: 'packetLoss' as const, numPackets: 20 },
      ] as any[],
      estimatedDuration: "≈15s"
    };
  };

  const runSpeedTest = async () => {
    setIsRunning(true);
    setResults(null);
    setProgress(0);
    setTestDetails(null);
    setCurrentTest("🔄 Iniciando teste real da rede...");
    
    const startTime = Date.now();
    let bytesTransferred = 0;
    let totalSamples = 0;
    
    try {
      const config = getTestConfig(testMode);
      
      // Create Cloudflare SpeedTest instance with selected configuration
      const speedtest = new SpeedTestLib({
        autoStart: false,
        measurements: config.measurements
      });

      // Track progress through different test phases
      let currentPhase = 0;
      const totalPhases = 4; // latency, download, upload, packetLoss

      speedtest.onResultsChange = ({ type }: any) => {
        console.log(`[${new Date().toISOString()}] Fase do teste:`, type);
        
        if (type === 'latency') {
          currentPhase = 1;
          setCurrentTest("📊 Medindo latência real da rede...");
          setProgress(25);
        } else if (type === 'download') {
          currentPhase = 2;
          setCurrentTest("📥 Testando velocidade real de download...");
          setProgress(50);
        } else if (type === 'upload') {
          currentPhase = 3;
          setCurrentTest("📤 Testando velocidade real de upload...");
          setProgress(75);
        } else if (type === 'packetLoss') {
          currentPhase = 4;
          setCurrentTest("📦 Verificando perda de pacotes...");
          setProgress(90);
        }
      };

      speedtest.onFinish = (results) => {
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        
        console.log(`[${new Date().toISOString()}] Teste concluído em ${duration}s`);
        console.log('Resultados brutos da Cloudflare:', results);
        
        // Use métodos específicos para obter os resultados mais precisos
        const downloadBps = results.getDownloadBandwidth() || 0;
        const uploadBps = results.getUploadBandwidth() || 0;
        const latencyMs = results.getUnloadedLatency() || 0;
        const jitterMs = results.getUnloadedJitter() || 0;
        const packetLossPercent = (results.getPacketLoss() || 0) * 100;
        
        // Calcular bytes transferidos (estimativa baseada na configuração)
        const config = getTestConfig(testMode);
        bytesTransferred = config.measurements.reduce((total, measurement) => {
          if (measurement.type === 'download' || measurement.type === 'upload') {
            return total + (measurement.bytes * measurement.count);
          }
          return total;
        }, 0);
        
        totalSamples = config.measurements.reduce((total, measurement) => {
          return total + (measurement.count || measurement.numPackets || 0);
        }, 0);
        
        console.log('Valores processados:', {
          downloadBps: downloadBps.toFixed(0),
          uploadBps: uploadBps.toFixed(0),
          latencyMs: latencyMs.toFixed(2),
          jitterMs: jitterMs.toFixed(2),
          packetLossPercent: packetLossPercent.toFixed(4),
          duration,
          bytesTransferred: (bytesTransferred / 1e6).toFixed(2) + ' MB',
          totalSamples
        });
        
        // Converter para Mbps com mais precisão
        const downloadSpeedMbps = downloadBps / 1000000;
        const uploadSpeedMbps = uploadBps / 1000000;

        const speedTestResults: SpeedTestResults = {
          downloadSpeed: Math.round(downloadSpeedMbps * 100) / 100, // 2 casas decimais
          uploadSpeed: Math.round(uploadSpeedMbps * 100) / 100,
          latency: Math.round(latencyMs * 100) / 100,
          jitter: Math.round(jitterMs * 100) / 100,
          packetLoss: Math.round(packetLossPercent * 10000) / 10000 // 4 casas decimais
        };

        setTestDetails({
          duration,
          bytesTransferred: Math.round(bytesTransferred / 1e6), // MB
          samples: totalSamples
        });

        setCurrentTest("✅ Teste real concluído!");
        setProgress(100);
        setResults(speedTestResults);
        setIsRunning(false);

        if (onTestComplete) {
          onTestComplete(speedTestResults);
        }

        toast({
          title: "Teste de velocidade concluído",
          description: `Medições reais obtidas em ${duration}s com ${totalSamples} amostras.`,
        });
      };

      speedtest.onError = (error) => {
        console.error('Erro no teste de velocidade:', error);
        toast({
          title: "Erro no teste de velocidade", 
          description: "Não foi possível completar o teste. Verifique sua conexão.",
          variant: "destructive",
        });
        setCurrentTest("");
        setProgress(0);
        setIsRunning(false);
      };

      // Start the test
      speedtest.play();
      
    } catch (error) {
      console.error('Erro ao inicializar teste:', error);
      toast({
        title: "Erro no teste de velocidade",
        description: "Não foi possível inicializar o teste. Tente novamente.",
        variant: "destructive",
      });
      setCurrentTest("");
      setProgress(0);
      setIsRunning(false);
    }
  };

  const formatSpeed = (speed: number) => speed.toFixed(2);
  const formatMs = (ms: number) => ms.toFixed(2);
  const formatPercent = (percent: number) => percent.toFixed(4);

  return (
    <div className="space-y-6">
      <Card className="border-2 rounded-2xl bg-gradient-to-br from-background to-muted/20 shadow-diagnostic">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
            🚀 Teste de Velocidade de Internet
          </CardTitle>
          
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Mode Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Modo de Teste
            </label>
            <Select value={testMode} onValueChange={(value: TestMode) => setTestMode(value)} disabled={isRunning}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">
                  🚀 Rápido (≈15s) - Teste básico
                </SelectItem>
                <SelectItem value="complete">
                  🔬 Completo (≈30s) - Teste detalhado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button
              onClick={runSpeedTest}
              disabled={isRunning}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-diagnostic px-8 py-6 text-lg rounded-2xl"
            >
              {isRunning ? "Testando..." : `Iniciar Teste ${getTestConfig(testMode).estimatedDuration}`}
            </Button>
          </div>

          {/* Progress Area */}
          {(isRunning || currentTest) && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-xl">
              <p className="text-lg font-medium text-foreground text-center">
                {currentTest}
              </p>
              {isRunning && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    {progress}% completo
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Test Details */}
          {testDetails && results && (
            <div className="p-4 bg-accent/20 border border-accent/30 rounded-xl">
              <h4 className="font-semibold mb-2 text-accent-foreground">Detalhes do Teste</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-primary">{testDetails.duration}s</div>
                  <div className="text-muted-foreground">Duração</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-primary">{testDetails.bytesTransferred} MB</div>
                  <div className="text-muted-foreground">Transferidos</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-primary">{testDetails.samples}</div>
                  <div className="text-muted-foreground">Amostras</div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {formatSpeed(results.downloadSpeed)} Mbps
                    </div>
                    <div className="text-sm text-muted-foreground">
                      📥 Download Real
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {formatSpeed(results.uploadSpeed)} Mbps
                    </div>
                    <div className="text-sm text-muted-foreground">
                      📤 Upload Real
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatMs(results.latency)} ms
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ⚡ Latência
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatMs(results.jitter)} ms
                    </div>
                    <div className="text-sm text-muted-foreground">
                      📊 Jitter
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl md:col-span-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">
                      {formatPercent(results.packetLoss)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      📦 Perda de Pacotes
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Quality Summary */}
              <div className="mt-6 p-6 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-3">
                    {results.downloadSpeed > 25 && results.uploadSpeed > 3 && results.latency < 100
                      ? "🎉 Conexão Excelente para Chamadas"
                      : results.downloadSpeed > 10 && results.uploadSpeed > 1 && results.latency < 200
                      ? "✅ Conexão Adequada para Chamadas"
                      : "⚠️ Conexão Pode Afetar Qualidade"}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {results.downloadSpeed > 25 && results.uploadSpeed > 3 && results.latency < 100
                      ? "Sua conexão está otimizada para chamadas de alta qualidade com vídeo e áudio cristalinos."
                      : results.downloadSpeed > 10 && results.uploadSpeed > 1 && results.latency < 200
                      ? "Sua conexão suporta chamadas de boa qualidade. Para melhor experiência, considere uma conexão mais rápida."
                      : "Sua conexão pode causar travamentos ou baixa qualidade nas chamadas. Recomendamos melhorar a conexão."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};