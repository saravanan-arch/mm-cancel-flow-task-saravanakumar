import React from "react";
import { Button } from "@/component/ui/button";
import { ChevronLeft } from "lucide-react";

interface RightPanelProps {
  step: any;
  currentStep: number;
  prevStep: () => void;
}

export default function RightPanel({
  step,
  currentStep,
  prevStep
}: RightPanelProps) {
  return (
    <div className={`flex flex-col gap-2 w-full max-w-[400px] px-4 pt-3 sm:pt-0 sm:px-0 relative overflow-hidden rounded-xl`}>
      {currentStep > 1 && step.id !== "got-job" && (
        <div className="flex sm:hidden justify-start cursor-pointer mr-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            className="text-[#62605C] font-semibold text-sm cursor-pointer hover:bg-gray-100 rounded-lg p-0 pr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      )}
      <img
        src="/empire-state-compressed.jpg"
        alt="Beautiful cityscape at dusk"
        className={`hidden ${!step.hideImageOnMobile ? "!flex" : "hidden"} sm:flex sm:w-[400px] h-[122px] sm:h-full w-full object-cover rounded-xl`}
        style={{ 
          border: "2px solid rgba(255, 255, 255, 0.30)", 
          boxShadow: "0 -6px 4px 0 rgba(0, 0, 0, 0.50) inset, 0 0 30px 0 rgba(0, 0, 0, 0.20)" 
        }}
      />
    </div>
  );
}
