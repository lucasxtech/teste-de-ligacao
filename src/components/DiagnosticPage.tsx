import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiagnosticCard } from "./DiagnosticCard";
import { SpeedTest } from "./SpeedTest";
import { DiagnosticTester, DiagnosticResult, DiagnosticSummary } from "@/utils/diagnostics";
import { ThemeToggle } from "./ThemeToggle";
import { Play, Copy, Send, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DiagnosticPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [summary, setSummary] = useState<DiagnosticSummary | null>(null);
  const { toast } = useToast();

  const handleStartDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    const tester = new DiagnosticTester((updatedResults) => {
      setResults([...updatedResults]);
    });

    try {
      const finalResults = await tester.runAllTests();
      setResults(finalResults);
      setSummary(tester.generateSummary());
      
      toast({
        title: "Diagnóstico concluído",
        description: "Todos os testes foram executados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no diagnóstico",
        description: "Ocorreu um erro durante a execução dos testes.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopySummary = () => {
    if (summary) {
      const tester = new DiagnosticTester();
      const formattedSummary = tester.formatSummaryForSupport(summary);
      navigator.clipboard.writeText(formattedSummary);
      
      toast({
        title: "Resumo copiado",
        description: "O resumo do diagnóstico foi copiado para a área de transferência.",
      });
    }
  };

  const handleSendToSupport = () => {
    if (summary) {
      const tester = new DiagnosticTester();
      const formattedSummary = tester.formatSummaryForSupport(summary);
      const subject = "Diagnóstico de Chamadas - Suporte";
      const body = encodeURIComponent(formattedSummary);
      window.open(`mailto:suporte@empresa.com?subject=${subject}&body=${body}`);
      
      toast({
        title: "Email aberto",
        description: "O cliente de email foi aberto com o diagnóstico.",
      });
    }
  };

  const getResultsByCategory = (category: string) => {
    return results.filter(result => result.category === category);
  };

  const categories = [
    { id: "device", title: "Dispositivos", icon: "🎤" },
    { id: "browser", title: "Navegador e Sistema", icon: "🔧" },
    { id: "network", title: "Rede", icon: "📶" },
    { id: "webrtc", title: "WebRTC", icon: "☎️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 border-2 border-primary/20">
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Diagnóstico de Ligações
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verifique se seu dispositivo está pronto para fazer e receber chamadas com qualidade.
          </p>
        </div>

        {/* Speed Test Section */}
        <div className="mb-8">
          <SpeedTest />
        </div>

        {/* Action Button */}
        <div className="text-center mb-8">
          <Button
            onClick={handleStartDiagnostic}
            disabled={isRunning}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-diagnostic px-8 py-6 text-lg"
          >
            {isRunning ? (
              <>
                <Activity className="mr-2 h-5 w-5 animate-spin" />
                Executando diagnóstico...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Iniciar Diagnóstico
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryResults = getResultsByCategory(category.id);
              if (categoryResults.length === 0) return null;

              return (
                <div key={category.id} className="animate-slide-in">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.title}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {categoryResults.map((result, index) => (
                      <div
                        key={result.id}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        className="animate-fade-in"
                      >
                        <DiagnosticCard
                          title={result.title}
                          description={result.description}
                          status={result.status}
                          value={result.value}
                          explanation={result.explanation}
                          technical={result.technical}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Relatório Final */}
            {summary && (
              <div className="mt-8 space-y-6">
                {/* Card do Diagnóstico Geral */}
                <Card className="border-2 rounded-2xl bg-gradient-to-br from-background to-muted/20 shadow-diagnostic">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-semibold text-foreground mb-2">
                      📋 Relatório de Diagnóstico
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Resumo dos testes realizados em {new Date(summary.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-3">
                      {summary.results.filter(result => result.category === 'browser').map(result => (
                        <div key={result.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                          <span className="font-medium">{result.title}</span>
                          <span className={`text-sm font-semibold ${
                            result.status === 'success' ? 'text-success' : 
                            result.status === 'warning' ? 'text-warning' : 'text-error'
                          }`}>
                            {result.status === 'success' ? '✅ OK' : 
                             result.status === 'warning' ? '⚠️ Atenção' : '❌ Erro'}
                          </span>
                        </div>
                      ))}
                      {summary.results.filter(result => result.category === 'device').map(result => (
                        <div key={result.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                          <span className="font-medium">{result.title}</span>
                          <span className={`text-sm font-semibold ${
                            result.status === 'success' ? 'text-success' : 
                            result.status === 'warning' ? 'text-warning' : 'text-error'
                          }`}>
                            {result.status === 'success' ? '✅ OK' : 
                             result.status === 'warning' ? '⚠️ Atenção' : '❌ Erro'}
                          </span>
                        </div>
                      ))}
                      {summary.results.filter(result => result.category === 'network').map(result => (
                        <div key={result.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                          <span className="font-medium">{result.title}</span>
                          <span className={`text-sm font-semibold ${
                            result.status === 'success' ? 'text-success' : 
                            result.status === 'warning' ? 'text-warning' : 'text-error'
                          }`}>
                            {result.status === 'success' ? '✅ OK' : 
                             result.status === 'warning' ? '⚠️ Atenção' : '❌ Erro'}
                          </span>
                        </div>
                      ))}
                      {summary.results.filter(result => result.category === 'webrtc').map(result => (
                        <div key={result.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                          <span className="font-medium">{result.title}</span>
                          <span className={`text-sm font-semibold ${
                            result.status === 'success' ? 'text-success' : 
                            result.status === 'warning' ? 'text-warning' : 'text-error'
                          }`}>
                            {result.status === 'success' ? '✅ OK' : 
                             result.status === 'warning' ? '⚠️ Atenção' : '❌ Erro'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Status Geral */}
                    <div className="mt-6 p-6 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-3">
                          {summary.overallStatus === "success" 
                            ? "🎉 Sistema Pronto para Chamadas"
                            : summary.overallStatus === "warning"
                            ? "⚠️ Atenção Necessária"
                            : "❌ Problemas Detectados"}
                        </h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {summary.overallStatus === "success" 
                            ? "Todos os testes foram concluídos com sucesso! Seu sistema está otimizado para chamadas de alta qualidade."
                            : summary.overallStatus === "warning"
                            ? "Alguns problemas foram detectados que podem afetar a qualidade das chamadas. Recomendamos verificar as sugestões."
                            : "Problemas críticos foram detectados. Entre em contato com o suporte técnico."}
                        </p>

                        {/* Estatísticas dos Testes */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                            <div className="text-2xl font-bold text-success">
                              {summary.results.filter(r => r.status === "success").length}
                            </div>
                            <div className="text-xs text-muted-foreground">Sucessos</div>
                          </div>
                          <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                            <div className="text-2xl font-bold text-warning">
                              {summary.results.filter(r => r.status === "warning").length}
                            </div>
                            <div className="text-xs text-muted-foreground">Avisos</div>
                          </div>
                          <div className="p-3 rounded-xl bg-error/10 border border-error/20">
                            <div className="text-2xl font-bold text-error">
                              {summary.results.filter(r => r.status === "error").length}
                            </div>
                            <div className="text-xs text-muted-foreground">Erros</div>
                          </div>
                        </div>

                        {/* Recomendações */}
                        {summary.overallStatus !== "success" && (
                          <div className="mt-4 p-4 bg-muted/20 rounded-xl text-left">
                            <h4 className="font-semibold text-sm mb-3 text-center">🔧 Recomendações:</h4>
                            <ul className="text-sm text-muted-foreground space-y-2">
                              {summary.results.some(r => r.title.includes("IP") && (r.status === "error" || r.status === "warning")) && (
                                <li>• Desativar VPN ou proxy temporariamente</li>
                              )}
                              {summary.results.some(r => r.title.includes("Qualidade") && r.description?.includes("Não")) && (
                                <li>• Verificar configurações de firewall e antivírus</li>
                              )}
                              {summary.results.some(r => r.status === "error" || r.status === "warning") && (
                                <li>• Tentar acessar de uma rede diferente</li>
                              )}
                              <li>• Recarregar a página e testar novamente</li>
                              {summary.overallStatus === "error" && (
                                <li>• Entrar em contato com o suporte técnico</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleCopySummary}
                    variant="outline"
                    className="gap-2 rounded-xl px-6 py-3"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Diagnóstico
                  </Button>
                  
                  <Button
                    onClick={handleSendToSupport}
                    variant="default"
                    className="gap-2 rounded-xl px-6 py-3 bg-gradient-primary hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                    Enviar para Suporte
                  </Button>
                </div>

                {/* Call to Action Final */}
                <Card className="border-2 border-primary/20 bg-primary/5 rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground leading-relaxed">
                      {summary.overallStatus === "success" 
                        ? "✅ Todos os testes foram concluídos com sucesso! Seu dispositivo está pronto para chamadas de alta qualidade."
                        : "⚠️ Alguns itens precisam de atenção. Se algo estiver em amarelo ou vermelho, envie este diagnóstico para o suporte técnico."
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};