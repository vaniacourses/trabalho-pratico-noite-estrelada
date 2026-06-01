import React from "react";

interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
}

const alertColors = {
  success: {
    bg: "bg-brand-success/10",
    border: "border-brand-success",
    text: "text-brand-success",
    icon: "✓",
  },
  error: {
    bg: "bg-brand-error/10",
    border: "border-brand-error",
    text: "text-brand-error",
    icon: "✕",
  },
  warning: {
    bg: "bg-brand-warning/10",
    border: "border-brand-warning",
    text: "text-brand-warning",
    icon: "⚠",
  },
  info: {
    bg: "bg-brand-primary/10",
    border: "border-brand-primary",
    text: "text-brand-primary",
    icon: "ℹ",
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  message,
  onClose,
}) => {
  const colors = alertColors[variant];

  return (
    <div
      className={`${colors.bg} border-l-4 ${colors.border} p-4 rounded animate-fadeIn`}
      role="alert"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className={`${colors.text} font-bold text-lg flex-shrink-0`}>
            {colors.icon}
          </span>
          <div>
            {title && (
              <h3 className={`${colors.text} font-semibold mb-1`}>{title}</h3>
            )}
            <p className="text-brand-text text-sm">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${colors.text} hover:opacity-70 transition-opacity ml-2`}
            aria-label="Fechar alerta"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
