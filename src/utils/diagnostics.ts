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

export interface DiagnosticSummary {
  timestamp: string;
  userAgent: string;
  results: DiagnosticResult[];
  overallStatus: "success" | "warning" | "error";
}

export class DiagnosticTester {
  private results: DiagnosticResult[] = [];
  private onUpdate?: (results: DiagnosticResult[]) => void;

  constructor(onUpdate?: (results: DiagnosticResult[]) => void) {
    this.onUpdate = onUpdate;
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
      { id: "ip", title: "IP detectado", status: "loading", category: "network" },
      { id: "connection", title: "Qualidade da conexão", status: "loading", category: "network" },
      { id: "webrtc", title: "WebRTC disponível", status: "loading", category: "webrtc" },
      { id: "ice", title: "ICE candidates", status: "loading", category: "webrtc" }
    ];

    this.results = loadingTests;
    this.onUpdate?.(this.results);

    // Executar testes com delay para melhor UX
    await this.testDevices();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await this.testBrowser();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await this.testNetwork();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await this.testWebRTC();

    return this.results;
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

  private async testNetwork() {
    try {
      // Teste de IP (usando um serviço público)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      
      this.updateResult({
        id: "ip",
        title: "IP detectado",
        description: "IP público obtido com sucesso",
        value: data.ip,
        status: "success",
        category: "network",
        technical: "Status de conectividade: ✅ OK"
      });

      // Teste de velocidade básico
      const startTime = performance.now();
      await fetch('https://www.google.com/favicon.ico');
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      let connectionStatus = "success";
      let connectionDesc = "Conexão estável";
      
      if (latency > 1000) {
        connectionStatus = "warning";
        connectionDesc = "Conexão lenta detectada";
      } else if (latency > 2000) {
        connectionStatus = "error";
        connectionDesc = "Conexão muito lenta";
      }

      this.updateResult({
        id: "connection",
        title: "Qualidade da conexão",
        description: connectionDesc,
        value: `Latência: ${latency}ms`,
        status: connectionStatus as any,
        category: "network",
        explanation: latency > 1000 ? "Latência alta detectada. Isso pode causar atrasos e cortes nas chamadas. Verifique sua conexão com a internet." : 
                    latency > 500 ? "Latência moderada. Pode causar pequenos atrasos nas chamadas." : undefined,
        technical: `Qualidade da conexão: ${latency < 500 ? '✅ Excelente' : latency < 1000 ? '⚠️ Moderada' : '❌ Ruim'}`
      });

    } catch (error) {
      this.updateResult({
        id: "ip",
        title: "IP detectado",
        description: "Erro ao obter informações de rede", 
        status: "warning",
        category: "network",
        explanation: "Não foi possível obter o IP público. Isso pode acontecer devido a firewalls, VPNs ou problemas de conectividade. Tente desativar VPN ou acessar de outra rede.",
        technical: "Status de conectividade: ⚠️ Limitado"
      });
      
      this.updateResult({
        id: "connection",
        title: "Qualidade da conexão",
        description: "Não foi possível testar a conexão",
        status: "warning",
        category: "network",
        explanation: "Não foi possível testar a qualidade da conexão. Verifique se você está conectado à internet e tente novamente.",
        technical: "Qualidade da conexão: ⚠️ Não testado"
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

      if (rtcSupported) {
        // Teste básico de ICE candidates
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        let candidatesReceived = 0;
        const candidatePromise = new Promise((resolve) => {
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              candidatesReceived++;
            } else {
              resolve(candidatesReceived);
            }
          };
        });

        // Criar uma oferta para iniciar o processo ICE
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Aguardar alguns segundos para coletar candidates
        setTimeout(() => {
          pc.close();
        }, 3000);

        await candidatePromise;

        this.updateResult({
          id: "ice",
          title: "ICE candidates",
          description: candidatesReceived > 0 ? "Rede liberada para chamadas" : "Possíveis restrições de rede",
          value: `${candidatesReceived} candidate(s) encontrado(s)`,
          status: candidatesReceived > 0 ? "success" : "warning",
          category: "webrtc",
          explanation: candidatesReceived === 0 ? "Não foram encontradas rotas de conexão. Isso pode acontecer devido a firewalls rigorosos ou configurações de rede restritivas. Verifique as configurações de firewall." : undefined,
          technical: `Rede liberada para chamadas: ${candidatesReceived > 0 ? '✅ OK' : '⚠️ Limitado'}`
        });
      } else {
        this.updateResult({
          id: "ice",
          title: "ICE candidates",
          description: "WebRTC não disponível",
          status: "error",
          category: "webrtc",
          explanation: "WebRTC não está disponível, impossibilitando a realização de chamadas.",
          technical: "Rede liberada para chamadas: ❌ Erro"
        });
      }
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
      network: "📡 REDE",
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