import React, { useId } from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    //useId garante o MESMO ID estável tanto no Servidor quanto no Cliente
    const reactId = useId();
    const generatedId = id || `input-${reactId}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={generatedId}
            className="block text-sm font-semibold text-brand-text mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={generatedId}
          className={`input-field ${error ? "border-brand-error ring-brand-error" : ""} ${className}`}
          {...props}
        />
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
