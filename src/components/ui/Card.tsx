import React from "react";

interface CardProps {
  variant?: "default" | "secondary";
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  children,
  className = "",
}) => {
  const cardClass =
    variant === "secondary" ? "card-secondary" : "card";

  return <div className={`${cardClass} ${className}`}>{children}</div>;
};

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="mb-4 pb-4 border-b border-brand-secondary/20">{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <h2 className="text-2xl font-bold text-brand-text">{children}</h2>;

export const CardContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="space-y-4">{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="mt-6 pt-4 border-t border-brand-secondary/20 flex items-center gap-2">
    {children}
  </div>
);
