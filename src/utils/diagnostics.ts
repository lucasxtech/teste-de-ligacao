export interface DiagnosticResult {
  id: string;
  title: string;
  description?: string;
  status: "success" | "error" | "warning" | "loading" | "pending";
  value?: string;
  category: "device" | "browser" | "network" | "webrtc";
  explanation?: string;
  technical?: string;
}

export interface SpeedTestResults {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  jitter: number;
  packetLoss: number;
}

export interface DiagnosticSummary {
  timestamp: string;
  userAgent: string;
  results: DiagnosticResult[];
  overallStatus: "success" | "warning" | "error";
}

export class DiagnosticTester {
  private results: DiagnosticResult[] = [];
  private onUpdate?: (results: DiagnosticResult[]) => void;
  private speedTestResults?: SpeedTestResults;

  constructor(onUpdate?: (results: DiagnosticResult[]) => void) {
    this.onUpdate = onUpdate;
  }

  setSpeedTestResults(speedResults: SpeedTestResults) {
    this.speedTestResults = speedResults;
    this.processSpeedTestResults();
  }

  private updateResult(result: DiagnosticResult) {
    const index = this.results.findIndex(r => r.id === result.id);
    if (index >= 0) {
      this.results[index] = result;
    } else {
      this.results.push(result);
    }
    this.onUpdate?.(this.results);
  }

  async runAllTests(): Promise<DiagnosticResult[]> {
    this.results = [];
    
    // Inicializar todos os testes como loading
    const loadingTests: DiagnosticResult[] = [
      { id: "microphone", title: "Microfone detectado", status: "loading", category: "device" },
      { id: "speakers", title: "Saída de áudio detectada", status: "loading", category: "device" },
      { id: "browser", title: "Navegador suportado", status: "loading", category: "browser" },
      { id: "permissions", title: "Permissão de microfone", status: "loading", category: "browser" },
      { id: "https", title: "HTTPS ativo", status: "loading", category: "browser" },
      { id: "websockets", title: "WebSockets ativos", status: "loading", category: "browser" },
      { id: "webrtc", title: "WebRTC disponível", status: "loading", category: "webrtc" }
    ];

    this.results = loadingTests;
    this.onUpdate?.(this.results);

    // Executar testes com delay para melhor UX
    await this.testDevices();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await this.testBrowser();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await this.testWebRTC();

    // Adicionar resultados do teste de velocidade se disponíveis
    if (this.speedTestResults) {
      this.processSpeedTestResults();
    }

    return this.results;
  }

  private processSpeedTestResults() {
    if (!this.speedTestResults) return;

    const { downloadSpeed, uploadSpeed, latency, jitter, packetLoss } = this.speedTestResults;

    // Análise da velocidade de download
    let downloadStatus: "success" | "warning" | "error" = "success";
    let downloadDescription = `${downloadSpeed.toFixed(2)} Mbps`;
    let downloadExplanation = "";

    if (downloadSpeed < 5) {
      downloadStatus = "error";
      downloadExplanation = "Velocidade muito baixa para chamadas de vídeo. Recomendamos pelo menos 5 Mbps.";
    } else if (downloadSpeed < 15) {
      downloadStatus = "warning";
      downloadExplanation = "Velocidade adequada para chamadas básicas, mas pode haver limitações em vídeo HD.";
    }

    this.updateResult({
      id: "download-speed",
      title: "Velocidade de Download",
      description: downloadDescription,
      status: downloadStatus,
      category: "network",
      explanation: downloadExplanation,
      technical: `Download: ${downloadSpeed.toFixed(2)} Mbps - ${downloadStatus === "success" ? "✅ Excelente" : downloadStatus === "warning" ? "⚠️ Adequado" : "❌ Insuficiente"}`
    });

    // Análise da velocidade de upload
    let uploadStatus: "success" | "warning" | "error" = "success";
    let uploadDescription = `${uploadSpeed.toFixed(2)} Mbps`;
    let uploadExplanation = "";

    if (uploadSpeed < 1) {
      uploadStatus = "error";
      uploadExplanation = "Velocidade de upload muito baixa. Pode causar problemas graves durante chamadas.";
    } else if (uploadSpeed < 3) {
      uploadStatus = "warning";
      uploadExplanation = "Velocidade de upload adequada para chamadas básicas, mas limitada para vídeo HD.";
    }

    this.updateResult({
      id: "upload-speed",
      title: "Velocidade de Upload",
      description: uploadDescription,
      status: uploadStatus,
      category: "network",
      explanation: uploadExplanation,
      technical: `Upload: ${uploadSpeed.toFixed(2)} Mbps - ${uploadStatus === "success" ? "✅ Excelente" : uploadStatus === "warning" ? "⚠️ Adequado" : "❌ Insuficiente"}`
    });

    // Análise da latência
    let latencyStatus: "success" | "warning" | "error" = "success";
    let latencyDescription = `${latency.toFixed(2)} ms`;
    let latencyExplanation = "";

    if (latency > 150) {
      latencyStatus = "error";
      latencyExplanation = "Latência muito alta. Pode causar atrasos perceptíveis durante as chamadas.";
    } else if (latency > 100) {
      latencyStatus = "warning";
      latencyExplanation = "Latência moderada. Pode haver pequenos atrasos durante as chamadas.";
    }

    this.updateResult({
      id: "latency",
      title: "Latência",
      description: latencyDescription,
      status: latencyStatus,
      category: "network",
      explanation: latencyExplanation,
      technical: `Latência: ${latency.toFixed(2)} ms - ${latencyStatus === "success" ? "✅ Excelente" : latencyStatus === "warning" ? "⚠️ Moderado" : "❌ Alto"}`
    });

    // Análise da perda de pacotes
    let packetLossStatus: "success" | "warning" | "error" = "success";
    let packetLossDescription = `${packetLoss.toFixed(2)}%`;
    let packetLossExplanation = "";

    if (packetLoss > 3) {
      packetLossStatus = "error";
      packetLossExplanation = "Perda de pacotes alta. Pode causar cortes de áudio/vídeo durante as chamadas.";
    } else if (packetLoss > 1) {
      packetLossStatus = "warning";
      packetLossExplanation = "Perda de pacotes moderada. Pode afetar ocasionalmente a qualidade das chamadas.";
    }

    this.updateResult({
      id: "packet-loss",
      title: "Perda de Pacotes",
      description: packetLossDescription,
      status: packetLossStatus,
      category: "network",
      explanation: packetLossExplanation,
      technical: `Perda: ${packetLoss.toFixed(2)}% - ${packetLossStatus === "success" ? "✅ Baixa" : packetLossStatus === "warning" ? "⚠️ Moderada" : "❌ Alta"}`
    });
  }

  private async testDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      // Teste de microfone
      const microphones = devices.filter(device => device.kind === 'audioinput');
      this.updateResult({
        id: "microphone",
        title: "Microfone detectado",
        description: microphones.length > 0 ? `${microphones.length} microfone(s) encontrado(s)` : "Nenhum microfone detectado",
        status: microphones.length > 0 ? "success" : "error",
        category: "device",
        explanation: microphones.length === 0 ? "Nenhum microfone foi detectado. Verifique se há um microfone conectado e se o navegador tem permissão para acessá-lo." : undefined,
        technical: `Status de compatibilidade com chamadas: ${microphones.length > 0 ? '✅ OK' : '❌ Erro'}`
      });

      // Teste de saída de áudio
      const speakers = devices.filter(device => device.kind === 'audiooutput');
      this.updateResult({
        id: "speakers", 
        title: "Saída de áudio detectada",
        description: speakers.length > 0 ? `${speakers.length} dispositivo(s) de áudio encontrado(s)` : "Nenhuma saída de áudio detectada",
        status: speakers.length > 0 ? "success" : "warning",
        category: "device",
        explanation: speakers.length === 0 ? "Nenhum dispositivo de áudio foi detectado. Verifique se há fones ou alto-falantes conectados." : undefined,
        technical: `Status de reprodução de áudio: ${speakers.length > 0 ? '✅ OK' : '⚠️ Limitado'}`
      });
    } catch (error) {
      this.updateResult({
        id: "microphone",
        title: "Microfone detectado", 
        description: "Erro ao verificar dispositivos",
        status: "error",
        category: "device",
        explanation: "Não foi possível acessar os dispositivos. Verifique as permissões do navegador ou tente recarregar a página.",
        technical: "Status de compatibilidade com chamadas: ❌ Erro"
      });
    }
  }

  private async testBrowser() {
    // Teste do navegador
    const userAgent = navigator.userAgent;
    const isChrome = userAgent.includes('Chrome');
    const isFirefox = userAgent.includes('Firefox');
    const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
    const isEdge = userAgent.includes('Edge');
    
    const supportedBrowser = isChrome || isFirefox || isSafari || isEdge;
    
    this.updateResult({
      id: "browser",
      title: "Navegador suportado",
      description: supportedBrowser ? "Navegador compatível detectado" : "Navegador não suportado",
      value: userAgent,
      status: supportedBrowser ? "success" : "warning",
      category: "browser",
      technical: `Status de compatibilidade com chamadas: ${supportedBrowser ? '✅ OK' : '⚠️ Limitado'}`,
      explanation: !supportedBrowser ? "Este navegador pode ter limitações para chamadas. Recomendamos usar Chrome, Firefox ou Safari atualizado." : undefined
    });

    // Teste de HTTPS
    const isHttps = location.protocol === 'https:';
    this.updateResult({
      id: "https",
      title: "HTTPS ativo",
      description: isHttps ? "Conexão segura ativa" : "Conexão não segura - HTTPS necessário",
      status: isHttps ? "success" : "error",
      category: "browser",
      explanation: !isHttps ? "Conexões não seguras (HTTP) podem impedir o funcionamento correto das chamadas. Acesse via HTTPS." : undefined,
      technical: `Protocolo de segurança: ${isHttps ? '✅ HTTPS' : '❌ HTTP'}`
    });

    // Teste de WebSockets
    try {
      const wsSupported = 'WebSocket' in window;
      this.updateResult({
        id: "websockets",
        title: "WebSockets ativos",
        description: wsSupported ? "WebSockets suportados" : "WebSockets não suportados",
        status: wsSupported ? "success" : "error",
        category: "browser",
        explanation: !wsSupported ? "WebSockets são necessários para comunicação em tempo real. Atualize seu navegador ou use um navegador compatível." : undefined,
        technical: `Status de comunicação em tempo real: ${wsSupported ? '✅ OK' : '❌ Erro'}`
      });
    } catch (error) {
      this.updateResult({
        id: "websockets",
        title: "WebSockets ativos",
        description: "Erro ao verificar WebSockets",
        status: "error",
        category: "browser",
        explanation: "Erro ao verificar suporte a WebSockets. Tente recarregar a página.",
        technical: "Status de comunicação em tempo real: ❌ Erro"
      });
    }

    // Teste de permissões
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      this.updateResult({
        id: "permissions",
        title: "Permissão de microfone",
        description: "Permissão concedida com sucesso",
        status: "success",
        category: "browser",
        technical: "Status de acesso ao microfone: ✅ OK"
      });
    } catch (error) {
      this.updateResult({
        id: "permissions",
        title: "Permissão de microfone",
        description: "Permissão negada ou erro ao acessar microfone",
        status: "error",
        category: "browser",
        explanation: "O navegador bloqueou o acesso ao microfone. Clique no ícone de cadeado na barra de endereços e permita o acesso ao microfone.",
        technical: "Status de acesso ao microfone: ❌ Erro"
      });
    }
  }


  private async testWebRTC() {
    try {
      // Teste de suporte WebRTC
      const rtcSupported = 'RTCPeerConnection' in window;
      
      this.updateResult({
        id: "webrtc",
        title: "WebRTC disponível",
        description: rtcSupported ? "WebRTC suportado pelo navegador" : "WebRTC não suportado",
        status: rtcSupported ? "success" : "error",
        category: "webrtc",
        explanation: !rtcSupported ? "Seu navegador não suporta WebRTC, que é essencial para fazer chamadas. Atualize seu navegador ou use Chrome, Firefox ou Safari." : undefined,
        technical: `Status de chamadas em tempo real: ${rtcSupported ? '✅ OK' : '❌ Erro'}`
      });
    } catch (error) {
      this.updateResult({
        id: "webrtc",
        title: "WebRTC disponível",
        description: "Erro ao testar WebRTC",
        status: "error",
        category: "webrtc",
        explanation: "Erro inesperado ao testar WebRTC. Tente recarregar a página.",
        technical: "Status de chamadas em tempo real: ❌ Erro"
      });
    }
  }

  generateSummary(): DiagnosticSummary {
    const successCount = this.results.filter(r => r.status === "success").length;
    const errorCount = this.results.filter(r => r.status === "error").length;
    const warningCount = this.results.filter(r => r.status === "warning").length;

    let overallStatus: "success" | "warning" | "error" = "success";
    if (errorCount > 0) {
      overallStatus = "error";
    } else if (warningCount > 0) {
      overallStatus = "warning";
    }

    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      results: this.results,
      overallStatus
    };
  }

  formatSummaryForSupport(summary: DiagnosticSummary): string {
    const date = new Date(summary.timestamp).toLocaleString('pt-BR');
    
    let text = `DIAGNÓSTICO DE CHAMADAS - ${date}\n\n`;
    text += `Status Geral: ${summary.overallStatus.toUpperCase()}\n`;
    text += `Navegador: ${summary.userAgent}\n\n`;

    const categories = {
      device: "📱 DISPOSITIVOS",
      browser: "🌐 NAVEGADOR",
      network: "🌐 CONEXÃO",
      webrtc: "📞 WEBRTC"
    };

    Object.entries(categories).forEach(([category, title]) => {
      const categoryResults = summary.results.filter(r => r.category === category);
      if (categoryResults.length > 0) {
        text += `${title}\n`;
        categoryResults.forEach(result => {
          const statusIcon = result.status === "success" ? "✅" : result.status === "warning" ? "⚠️" : "❌";
          text += `${statusIcon} ${result.title}`;
          if (result.value) text += ` - ${result.value}`;
          if (result.description) text += ` (${result.description})`;
          text += "\n";
        });
        text += "\n";
      }
    });

    return text;
  }
}