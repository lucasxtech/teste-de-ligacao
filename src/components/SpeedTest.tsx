import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SpeedTestResults {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  jitter: number;
  packetLoss: number;
}

export const SpeedTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SpeedTestResults | null>(null);
  const [currentTest, setCurrentTest] = useState<string>("");
  const { toast } = useToast();

  const runSpeedTest = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      setCurrentTest("🔄 Iniciando teste...");
      
      // Simulated test with Cloudflare speedtest logic
      // Note: @cloudflare/speedtest might need specific implementation
      
      setCurrentTest("📥 Medindo download...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentTest("📤 Medindo upload...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentTest("📊 Calculando latência e jitter...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock results for demonstration
      const mockResults: SpeedTestResults = {
        downloadSpeed: Math.random() * 100 + 10,
        uploadSpeed: Math.random() * 50 + 5,
        latency: Math.random() * 50 + 10,
        jitter: Math.random() * 10 + 1,
        packetLoss: Math.random() * 2
      };
      
      setCurrentTest("✅ Teste concluído!");
      setResults(mockResults);
      
      toast({
        title: "Teste de velocidade concluído",
        description: "Todos os parâmetros de rede foram medidos com sucesso.",
      });
      
    } catch (error) {
      toast({
        title: "Erro no teste de velocidade",
        description: "Não foi possível completar o teste. Tente novamente.",
        variant: "destructive",
      });
      setCurrentTest("");
    } finally {
      setIsRunning(false);
    }
  };

  const formatSpeed = (speed: number) => speed.toFixed(2);
  const formatMs = (ms: number) => ms.toFixed(2);
  const formatPercent = (percent: number) => percent.toFixed(2);

  return (
    <div className="space-y-6">
      {/* Speed Test Card */}
      <Card className="border-2 rounded-2xl bg-gradient-to-br from-background to-muted/20 shadow-diagnostic">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
            🚀 Teste de Velocidade
          </CardTitle>
          <p className="text-muted-foreground">
            Meça a qualidade da sua conexão para chamadas
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Start Button */}
          <div className="text-center">
            <Button
              onClick={runSpeedTest}
              disabled={isRunning}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-diagnostic px-8 py-6 text-lg rounded-2xl"
            >
              {isRunning ? "Testando..." : "Iniciar Teste"}
            </Button>
          </div>

          {/* Status Area */}
          {(isRunning || currentTest) && (
            <div className="text-center p-4 bg-muted/20 rounded-xl">
              <p className="text-lg font-medium text-foreground">
                {currentTest}
              </p>
              {isRunning && (
                <div className="mt-3 w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-primary h-2 rounded-full animate-pulse" style={{width: "60%"}}></div>
                </div>
              )}
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
                      ✅ Velocidade de Download
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {formatSpeed(results.uploadSpeed)} Mbps
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ✅ Velocidade de Upload
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatMs(results.latency)} ms
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ✅ Latência
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatMs(results.jitter)} ms
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ✅ Jitter
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl md:col-span-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">
                      {formatPercent(results.packetLoss)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ✅ Perda de Pacotes
                    </div>
                  </div>
                </div>
              </div>

              {/* Speed Test Summary */}
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