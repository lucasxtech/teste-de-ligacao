import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, Loader2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type DiagnosticStatus = "success" | "error" | "warning" | "loading" | "pending";

interface DiagnosticCardProps {
  title: string;
  description?: string;
  status: DiagnosticStatus;
  value?: string;
  className?: string;
  explanation?: string;
  technical?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-success/10",
    iconColor: "text-success",
    borderColor: "border-success/20"
  },
  error: {
    icon: XCircle,
    bgColor: "bg-error/10", 
    iconColor: "text-error",
    borderColor: "border-error/20"
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-warning/10",
    iconColor: "text-warning", 
    borderColor: "border-warning/20"
  },
  loading: {
    icon: Loader2,
    bgColor: "bg-muted/50",
    iconColor: "text-muted-foreground animate-spin",
    borderColor: "border-muted"
  },
  pending: {
    icon: Loader2,
    bgColor: "bg-info/5",
    iconColor: "text-info",
    borderColor: "border-info/20"
  }
};

export const DiagnosticCard = ({ 
  title, 
  description, 
  status, 
  value, 
  className,
  explanation,
  technical
}: DiagnosticCardProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const displayDescription = status === "loading" ? "⏳ Em análise..." : 
                            status === "pending" ? "⏱️ Aguardando..." : description;

  // Tooltips explicativos para todos os testes
  const getSpecificTooltip = () => {
    // Casos problemáticos específicos
    if (title.includes("IP detectado") && status === "error") {
      return "⚠️ Não foi possível identificar corretamente o IP ou obter dados completos da sua rede.\nIsso pode ser causado por:\n• Uso de VPN ou proxy\n• Bloqueios de firewall\n• Extensões no navegador que interferem na rede\nTente desativar VPNs e extensões, ou usar outra rede.";
    }
    if (title.includes("Qualidade da conexão") && description?.includes("Não testado")) {
      return "⚠️ Não conseguimos medir a qualidade da sua conexão (latência e estabilidade).\nIsso pode ocorrer por:\n• Bloqueio de testes via firewall ou antivírus\n• Navegador com permissões limitadas\n• Falha temporária na rede\nTente recarregar a página ou testar em outra rede.";
    }
    if (title.includes("ICE candidates") && status === "loading") {
      return "⏳ Estamos tentando identificar possíveis rotas para chamadas (WebRTC).\nIsso pode ficar preso em 'em análise' quando:\n• Há bloqueio de conexões UDP\n• A rede usa NAT simétrico ou CGNAT\n• O navegador ou rede bloqueia servidores STUN";
    }
    
    // Tooltips explicativos gerais
    if (title.includes("Microfone")) {
      return "🎤 Verifica se o navegador tem acesso ao microfone e se está funcionando corretamente.\nNecessário para chamadas de voz e vídeo.";
    }
    if (title.includes("Câmera")) {
      return "📹 Verifica se o navegador tem acesso à câmera e se está funcionando corretamente.\nNecessário para chamadas de vídeo.";
    }
    if (title.includes("Navegador")) {
      return "🌐 Verifica se o navegador suporta as tecnologias necessárias para chamadas (WebRTC).\nChrome, Firefox e Safari são recomendados.";
    }
    if (title.includes("Sistema operacional")) {
      return "💻 Verifica informações básicas do sistema operacional.\nAlguns sistemas podem ter limitações específicas.";
    }
    if (title.includes("Conexão de rede")) {
      return "🌐 Verifica se a conexão de internet está funcionando e se permite comunicação WebRTC.\nConexões instáveis podem causar problemas nas chamadas.";
    }
    if (title.includes("WebRTC")) {
      return "☎️ WebRTC é a tecnologia que permite chamadas diretas entre navegadores.\nVerifica se todos os componentes necessários estão funcionando.";
    }
    if (title.includes("STUN/TURN")) {
      return "🔄 STUN/TURN são servidores que ajudam a estabelecer conexões WebRTC.\nNecessários para conectar através de firewalls e NAT.";
    }
    if (title.includes("ICE candidates")) {
      return "🔗 ICE candidates são possíveis rotas de conexão identificadas pelo navegador.\nQuanto mais candidatos, melhor a chance de conexão bem-sucedida.";
    }
    if (title.includes("Permissões")) {
      return "🔐 Verifica se o navegador tem as permissões necessárias para microfone e câmera.\nEssas permissões são essenciais para chamadas.";
    }
    if (title.includes("Codecs")) {
      return "🎵 Verifica quais formatos de áudio e vídeo o navegador suporta.\nCodecs compatíveis garantem melhor qualidade de chamada.";
    }
    
    return explanation;
  };

  return (
    <TooltipProvider>
      <Card className={cn(
        "transition-all duration-300 hover:shadow-lg border-2 rounded-2xl bg-gradient-to-br from-background to-muted/20 shadow-diagnostic",
        config.borderColor,
        status === "loading" && "animate-pulse",
        className
      )}>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-3">
            <div className={cn(
              "p-3 rounded-full",
              status === "success" && "bg-success/10",
              status === "error" && "bg-error/10", 
              status === "warning" && "bg-warning/10",
              status === "loading" && "bg-muted/10",
              status === "pending" && "bg-info/10"
            )}>
              <Icon className={cn("h-6 w-6", config.iconColor)} />
            </div>
            <span className="flex-1">{title}</span>
            {getSpecificTooltip() && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1 hover:bg-muted/20 rounded-full transition-colors">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="text-sm whitespace-pre-line">{getSpecificTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </CardTitle>
        </CardHeader>
        
        {(displayDescription || value || technical) && (
          <CardContent className="space-y-4">
            {displayDescription && (
              <div className="text-center">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {displayDescription}
                </p>
              </div>
            )}
            
            {value && (
              <div className="p-4 bg-muted/20 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {value}
                </div>
              </div>
            )}
            
            {technical && (
              <div className="p-3 bg-muted/10 rounded-xl text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  {technical}
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
};