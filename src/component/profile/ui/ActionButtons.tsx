import React from "react";
import { Button } from "@/component/ui/button";
import { useCancellationStore } from "@/store/cancellationStore";
import { offerButton } from "@/lib/cancellationFlow";
import { Markdown } from "@/component/ui/markdown";

interface ActionButtonsProps {
  step: any;
  handleButtonClick: (button: any) => void;
  isButtonDisabled: (button: any) => boolean;
  getButtonClasses: (button: any) => string;
  getButtonVariant: (button: any) => any;
  replaceVariablesInText: (text: string) => string;
}

export default function ActionButtons({
  step,
  handleButtonClick,
  isButtonDisabled,
  getButtonClasses,
  getButtonVariant,
  replaceVariablesInText
}: ActionButtonsProps) {
  const { saveFlowData, goToStep, steps, downsellVariant } = useCancellationStore();

  return (
    <div className="space-y-3">
        {/* Offer Button - Show when showOfferButton is true and downsell variant is A */}
          {step.showOfferButton && downsellVariant === "B" && offerButton && (
            <Button
              key={offerButton.id}
              variant={offerButton.style === "accent" ? "default" : "secondary"}
              onClick={() => handleButtonClick(offerButton)}
              className={`w-full py-3 text-base tracking-[-0.32px] leading-4 font-semibold ${
                offerButton.style === "accent" 
                  ? "bg-[#4ABF71] hover:bg-[#4ABF71] text-white" 
                  : "bg-white border-2 border-[#8952fc] text-[#8952fc] hover:bg-[#8952fc] hover:text-white"
              }`}
            >
              <Markdown>{replaceVariablesInText(offerButton.label)}</Markdown>
            </Button>
          )}
          
          {/* Default Buttons */}
          {step.buttons?.filter((btn: any) => btn.action !== "prev").map((button: any) => (
            <Button
              key={button.id}
              variant={getButtonVariant(button.style)}
              onClick={() => handleButtonClick(button)}
              disabled={isButtonDisabled(button)}
              className={`w-full py-3 text-base leading-4 tracking-[-0.32px] font-semibold ${getButtonClasses(button)}`}
            >
              {button.label}
            </Button>
          ))}
      </div>
  );
}
