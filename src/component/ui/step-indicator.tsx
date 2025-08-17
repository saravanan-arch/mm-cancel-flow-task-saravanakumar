import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function StepIndicator({ currentStep, totalSteps, className }: StepIndicatorProps) {
  // Show "Completed" for final steps with step dots
  if (totalSteps > 0 && currentStep === 0) {
    return (
      <div className={cn("flex flex-row items-center justify-center space-x-3", className)}>
        <div className="flex flex-row items-center justify-center space-x-1">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            // All steps are completed in final state
            return (
              <div
                key={stepNumber}
                className={cn(
                  "h-2 rounded-full transition-colors duration-200",
                  "bg-[#4ABF71] w-6 h-2" // All green (completed)
                )}
              />
            );
          })}
        </div>
        <span className="text-sm font-normal tracking-[-0.28px] text-[#4ABF71] font-semibold">
          Completed
        </span>
      </div>
    );
  }

  // Show "Completed" for final steps
  if (totalSteps === 0 && currentStep === 0) {
    return (
      <div className={cn("flex flex-row items-center justify-center space-x-3", className)}>
        <span className="text-sm font-normal tracking-[-0.28px] text-[#4ABF71] font-semibold">
          Completed
        </span>
      </div>
    );
  }

  // Don't render if there are no steps to show
  if (totalSteps === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-row items-center justify-center space-x-3", className)}>
    <div className="flex flex-row items-center justify-center space-x-1">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div
            key={stepNumber}
            className={cn(
              "h-2 rounded-full transition-colors duration-200",
              isActive 
                ? "bg-[#B5B3AF] w-6 h-2"
                : isCompleted 
                ? "bg-[#4ABF71] w-6 h-2"
                : "bg-[#E6E6E6] w-6 h-2"
            )}
          />
        );
      })}
      </div>
      <span className="text-sm font-normal tracking-[-0.28px] text-[#62605C]">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
}