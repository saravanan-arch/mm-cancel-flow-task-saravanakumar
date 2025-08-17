import React from "react";
import { Button } from "@/component/ui/button";
import { Separator } from "@/component/ui/separator";
import { Markdown } from "@/component/ui/markdown";
import QuestionSection from "../questions/QuestionSection";
import DownsellOfferBlock from "../content/DownsellOfferBlock";
import VisaSupportMessageBlock from "../content/VisaSupportMessageBlock";
import ActionButtons from "../ui/ActionButtons";
import { useCancellationStore } from "@/store/cancellationStore";

interface LeftPanelProps {
  step: any;
  getConditionalHeading: () => string;
  handleButtonClick: (button: any) => void;
  isButtonDisabled: (button: any) => boolean;
  getButtonClasses: (button: any) => string;
  getButtonVariant: (button: any) => any;
  handleDownsellOffer: (accepted: boolean) => void;
  replaceVariablesInText: (text: string) => string;
  currentSubscription: any;
  getDynamicHeading: () => string;
  getDynamicHeading2: () => string;
  getDynamicDescriptionWithVariables: () => string;
  getDynamicNote: () => string;
}

export default function LeftPanel({
  step,
  getConditionalHeading,
  handleButtonClick,
  isButtonDisabled,
  getButtonClasses,
  getButtonVariant,
  handleDownsellOffer,
  replaceVariablesInText,
  currentSubscription,
  getDynamicHeading,
  getDynamicHeading2,
  getDynamicDescriptionWithVariables,
  getDynamicNote,
}: LeftPanelProps) {
  const { downsellVariant, setAnswer, errors } = useCancellationStore();
  return (
    <div className="flex-1 flex flex-col gap-5 px-4 sm:p-0">
      {/* Step Content */}
      <div className="flex flex-col px-0 pt-3 pb-0 sm:p-0 gap-3 sm:gap-5 font-dm-sans">
        <div className="flex flex-col gap-4 mb-2"> 
          {step.heading && (
            <div className="leading-[24px] tracking-[-1.2px] sm:tracking-[-1.08px] sm:leading-[36px] text-2xl sm:text-4xl font-semibold text-[#41403D]">
              <Markdown>
                {getDynamicHeading()}
              </Markdown>
            </div>
          )}
        </div>  
        
        {step.heading2 && (
          <div className="leading-normal tracking-[-1.2px] sm:tracking-[-1.08px] sm:leading-[36px] text-2xl sm:text-4xl font-semibold text-[#41403D]">
            <Markdown>
              {getDynamicHeading2()}
            </Markdown>
          </div>
        )}

        {step.subHeading && (
          <div className="text-xl font-semibold text-[#41403D]">
            <Markdown>
              {step.subHeading}
            </Markdown>
          </div>
        )}
        
        {step.description && (
          <div className="text-[#62605C] text-sm sm:text-base leading-normal tracking-[-0.7px] sm:tracking-[-0.8px]">
            <Markdown>
              {getDynamicDescriptionWithVariables()}
            </Markdown>
          </div>
        )}
        
        {/* {step.description && step.id === "cancel-confirmation" && (
          <div className="text-[#62605C] text-sm sm:text-base leading-normal tracking-[-0.7px] sm:tracking-[-0.8px]">
            <div className="!font-inter font-semibold">
              Your subscription is set to end on {replaceVariablesInText("{{endDate}}")}.
            </div>
            <div className="font-inter font-semibold">
              You'll still have full access until then. No further charges after that.
            </div>
            <div className="font-normal">
              <br/>
              Changed your mind? You can reactivate anytime before your end date.
            </div>
          </div>
        )} */}

        {step.note && (
          <div className="text-[#62605C] text-sm leading-normal tracking-[-0.7px]">
            <Markdown>
              {getDynamicNote()}
            </Markdown>
          </div>
        )}
      </div>

      {/* Downsell Offer Block */}
      {step.id === "downsell-offer-check" && downsellVariant === "B" && (
        <DownsellOfferBlock
          step={step}
          currentSubscription={currentSubscription}
          handleDownsellOffer={handleDownsellOffer}
          isButtonDisabled={isButtonDisabled}
          getButtonClasses={getButtonClasses}
          replaceVariablesInText={replaceVariablesInText}
        />
      )}

      {/* Visa Support Message Block */}
      {step.id === "all-done-visa-support" && (
        <VisaSupportMessageBlock />
      )}

      {/* Error Messages */}
      {step.errorMessage && (
        <div className="mt-2 text-[#DC2626] text-sm sm:text-base tracking-[-0.7px] sm:tracking-[-0.8px] font-dm-sans">
          <Markdown>
            {step.errorMessage}
          </Markdown>
        </div>
      )}
      
      <Separator className="block sm:hidden bg-[#E0E0E0] w-full" />
      {/* Questions */}
      {step.questions && step.questions.length > 0 && (
        <div className="flex-1 mb-8">
          <QuestionSection
            step={step}
            setAnswer={setAnswer}
            errors={errors}
          />
        </div>
      )}
      
      {/* Special Step Content */}
      {step.id === "apply-job" && (
        <img src="/job-list.png" alt="Job List" className="w-full h-full object-cover rounded-xl" />
      )}
      
      <Separator className="hidden sm:block bg-[#E0E0E0] w-full" /> 

      {/* Action Buttons */}
      <ActionButtons
        step={step}
        handleButtonClick={handleButtonClick}
        isButtonDisabled={isButtonDisabled}
        getButtonClasses={getButtonClasses}
        getButtonVariant={getButtonVariant}
        replaceVariablesInText={replaceVariablesInText}
      />
    </div>
  );
}
