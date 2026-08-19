import { cn } from "@/lib/utils";

type SignupStepIndicatorProps = {
  currentStep: number;
};

export function SignupStepIndicator({ currentStep }: SignupStepIndicatorProps) {
  return (
    <nav aria-label="회원가입 진행 단계" className="w-full">
      <ol className="flex items-center justify-center gap-2 sm:gap-7">
        {[1, 2, 3, 4].map((step) => (
          <li key={step} className="flex items-center gap-2 sm:gap-7">
            <span
              aria-current={step === currentStep ? "step" : undefined}
              className={cn(
                "whitespace-nowrap text-sm tracking-wide transition-colors",
                step === currentStep ? "text-vh-gray-100" : "text-vh-gray-700"
              )}
            >
              STEP {step}
            </span>
            {step < 4 ? (
              <span className="h-px w-4 bg-vh-gray-700 sm:w-7" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
