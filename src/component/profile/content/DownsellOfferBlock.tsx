import React from "react";
import { Button } from "@/component/ui/button";
import { SubscriptionService } from "@/lib/subscriptionService";
import { Markdown } from "@/component/ui/markdown";

interface DownsellOfferBlockProps {
  step: any;
  currentSubscription: any;
  handleDownsellOffer: (accepted: boolean) => void;
  isButtonDisabled: (button: any) => boolean;
  getButtonClasses: (button: any) => string;
  replaceVariablesInText: (text: string) => string;
}


export default function DownsellOfferBlock({ step, currentSubscription, handleDownsellOffer, isButtonDisabled, getButtonClasses, replaceVariablesInText }: DownsellOfferBlockProps) {

  return (
    <div className="flex flex-col gap-4 p-4  bg-[#EBE1FE] border border-[#9A6FFF] rounded-lg">
      <div className="flex flex-col gap-2 justify-center items-center">
        <h3 className="text-[28px] tracking-[-1.4px] sm:tracking-[-1.2px] leading-normal font-semibold text-[#41403D]">
          Here's <span className="inline-block text-[#9A6FFF]">$10 off</span> until you find a job.
        </h3>
        <div className="flex flex-row gap-2.5">
          <h4 className="text-2xl font-semibold text-[#9A6FFF]">
            {SubscriptionService.formatOfferPrice(currentSubscription?.monthly_price/100)}/month <span className="text-xl text-[#62605C] line-through">{SubscriptionService.formatPrice(currentSubscription.monthly_price)}/month</span>
          </h4>
        </div>
      </div>
      
      {step?.offerButton && (
        <div className="flex flex-col gap-2 justify-center items-center text-center">
          <Button
            key={step?.offerButton.id}
            onClick={() => handleDownsellOffer(true)}
            disabled={isButtonDisabled(step.offerButton)}
            className={getButtonClasses(step.offerButton) + " w-full cursor-pointer"}
          >
            <Markdown>
              {replaceVariablesInText(step.offerButton.label)}
            </Markdown>
          </Button>
          <span className="text-xs italic text-[#62605C]">
            You won't be charged until your next billing date.
          </span>
        </div>
      )}
    </div>
  );
}
