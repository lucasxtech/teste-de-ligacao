import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DiagnosticStatus = "success" | "error" | "warning" | "loading";

interface DiagnosticCardProps {
  title: string;
  description?: string;
  status: DiagnosticStatus;
  value?: string;
  className?: string;
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
    icon: Clock,
    bgColor: "bg-muted/50",
    iconColor: "text-muted-foreground",
    borderColor: "border-muted"
  }
};

export const DiagnosticCard = ({ 
  title, 
  description, 
  status, 
  value, 
  className 
}: DiagnosticCardProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md border-2",
      config.bgColor,
      config.borderColor,
      status === "loading" && "animate-pulse",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex-shrink-0 p-2 rounded-full",
            config.bgColor,
            status === "success" && "animate-pulse-success"
          )}>
            <Icon className={cn("h-5 w-5", config.iconColor)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              {title}
            </h3>
            
            {description && (
              <p className="text-sm text-muted-foreground mb-2">
                {description}
              </p>
            )}
            
            {value && (
              <div className="text-sm font-mono bg-muted/50 px-2 py-1 rounded border">
                {value}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};