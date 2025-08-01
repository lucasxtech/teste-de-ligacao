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
    iconColor: "text-info animate-pulse",
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

  // Tooltips específicos para casos problemáticos
  const getSpecificTooltip = () => {
    if (title.includes("IP detectado") && status === "error") {
      return "⚠️ Não foi possível identificar corretamente o IP ou obter dados completos da sua rede.\nIsso pode ser causado por:\n• Uso de VPN ou proxy\n• Bloqueios de firewall\n• Extensões no navegador que interferem na rede\nTente desativar VPNs e extensões, ou usar outra rede.";
    }
    if (title.includes("Qualidade da conexão") && description?.includes("Não testado")) {
      return "⚠️ Não conseguimos medir a qualidade da sua conexão (latência e estabilidade).\nIsso pode ocorrer por:\n• Bloqueio de testes via firewall ou antivírus\n• Navegador com permissões limitadas\n• Falha temporária na rede\nTente recarregar a página ou testar em outra rede.";
    }
    if (title.includes("ICE candidates") && status === "loading") {
      return "⏳ Estamos tentando identificar possíveis rotas para chamadas (WebRTC).\nIsso pode ficar preso em 'em análise' quando:\n• Há bloqueio de conexões UDP\n• A rede usa NAT simétrico ou CGNAT\n• O navegador ou rede bloqueia servidores STUN";
    }
    return explanation;
  };

  return (
    <TooltipProvider>
      <Card className={cn(
        "transition-all duration-300 hover:shadow-lg border-2 rounded-xl",
        config.bgColor,
        config.borderColor,
        status === "loading" && "animate-pulse",
        className
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className={cn(
              "p-2 rounded-full",
              status === "success" && "bg-success/10",
              status === "error" && "bg-error/10",
              status === "warning" && "bg-warning/10",
              status === "loading" && "bg-muted/10",
              status === "pending" && "bg-info/10"
            )}>
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            </div>
            <span className="flex-1">{title}</span>
            {(status === "error" || status === "warning" || status === "loading") && getSpecificTooltip() && (
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
          <CardContent className="pt-0">
            {displayDescription && (
              <p className="text-sm text-muted-foreground mb-2">
                {displayDescription}
              </p>
            )}
            {technical && (
              <p className="text-xs text-muted-foreground/80 mb-2 font-mono">
                {technical}
              </p>
            )}
            {value && (
              <p className="text-sm font-mono bg-muted/30 px-2 py-1 rounded">
                {value}
              </p>
            )}
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
};