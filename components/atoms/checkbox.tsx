import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<React.ComponentProps<"input">, "type"> {
  label?: string;
}

/** Figma checkbox — unselected border #f8e3b9, selected fill #f8e3b9 */
function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const input = (
    <input
      id={id}
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "vh-checkbox size-5 shrink-0 rounded-[4px]",
        !label && className
      )}
      {...props}
    />
  );

  if (!label) {
    return input;
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex cursor-pointer items-center gap-[5px] font-sans text-base text-vh-gray-100",
        className
      )}
    >
      {input}
      {label}
    </label>
  );
}

export { Checkbox };
export type { CheckboxProps };
