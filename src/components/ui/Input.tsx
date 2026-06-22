import React, { useId } from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, rightElement, className = "", id, ...props }, ref) => {
    // O hook useId garante o mesmo identificador estável no Servidor e no Navegador
    const reactId = useId();
    const generatedId = id || `input-${reactId}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={generatedId}
            className="block text-sm font-semibold text-brand-text mb-3"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={generatedId}
            className={`input-field ${rightElement ? "pr-12" : ""} ${error ? "border-brand-error ring-brand-error" : ""} ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-brand-error font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";