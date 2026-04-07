import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";
import { Input } from "react-aria-components";

type FormInputProps = InputHTMLAttributes<HTMLInputElement>;

const defaultInputClass =
  "text-foreground border-background-border-dimmed1 bg-background-dimmed1 focus:border-yellow-500 focus:ring-yellow-500 w-full rounded-xl border px-3 py-2 outline-none transition-all duration-300";

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ className, ...props }, ref) => {
  return <Input ref={ref} className={clsx(defaultInputClass, className)} {...props} />;
});

FormInput.displayName = "FormInput";

export default FormInput;
