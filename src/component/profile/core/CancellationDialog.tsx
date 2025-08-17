"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/component/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/component/ui/dialog";
import { X, ChevronLeft } from "lucide-react";
import { Separator } from "@/component/ui/separator";
import { useCancellationStore } from "@/store/cancellationStore";
import QuestionSection from "../questions/QuestionSection";
import { Markdown } from "@/component/ui/markdown";
import { SubscriptionService } from "@/lib/subscriptionService";
import { StepIndicator } from "@/component/ui/step-indicator";
import { offerButton } from "@/lib/cancellationFlow";
import RightPanel from "../layout/RightPanel";
import ActionButtons from "../ui/ActionButtons";
import VisaSupportMessageBlock from "../content/VisaSupportMessageBlock";
import DownsellOfferBlock from "../content/DownsellOfferBlock";
import LeftPanel from "../layout/LeftPanel";

interface CancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Custom DialogContent without the built-in close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentProps<typeof DialogContent>
>(({ children, ...props }, ref) => (
  <DialogContent ref={ref} {...props}>
    {children}
  </DialogContent>
));
CustomDialogContent.displayName = "CustomDialogContent";

export default function CancellationDialog({
  isOpen,
  onClose,
}: CancellationDialogProps) {
  const {
    steps,
    currentStep,
    downsellVariant,
    setAnswer,
    errors,
    prevStep,
    goToStep,
    saveFlowData,
    getNextStepId,
    initializeFlow,
    resetFlow,
    setError,
    handleGotJobBranch,
  } = useCancellationStore();

  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  // Mock user and subscription IDs
  const mockUserId = "550e8400-e29b-41d4-a716-446655440001";
  const mockSubscriptionId = "550e8400-e29b-41d4-a716-446655440001";

  useEffect(() => {
    // Get current subscription data
    const subscription =
      SubscriptionService.getSubscriptionByUserId(mockUserId);
    setCurrentSubscription(subscription);
  }, []);

  // Initialize flow when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Initialize A/B testing and reset flow to got-job step
      initializeFlow(mockUserId, downsellVariant).catch((error: any) => {
        console.error("Failed to initialize flow:", error);
      });
    }
  }, [isOpen, initializeFlow, mockUserId]);

  // Reset flow when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Reset flow when dialog is closed
      resetFlow();
    }
  }, [isOpen, resetFlow]);

  const step = steps[currentStep - 1];

  const getConditionalHeading = () => {
    if (step.heading2) {
      return step.heading2;
    }
    return step.heading;
  };

  const isButtonDisabled = (button: any) => {
    if (button.disabledUntil) {
      return button.disabledUntil.some((questionId: string) => {
        const question = step.questions?.find((q: any) => q.id === questionId);
        if (!question) return false;

        const answer = (question as any).answer;

        // Check if field is empty
        if (!answer || answer.trim() === "") {
          return true;
        }

        // Check minimum character requirement for textarea
        if (question.type === "textarea" && question.maxLength) {
          const minChars = 25; // Default minimum characters
          if (answer.trim().length < minChars) {
            return true;
          }
        }

        // Check conditional questions if this is a radio-conditional question
        if (
          question.type === "radio-conditional" &&
          question.conditionalQuestions &&
          answer
        ) {
          const relevantConditionalQuestion =
            question.conditionalQuestions.find(
              (condQ: any) => condQ.questionId === answer
            );

          if (
            relevantConditionalQuestion &&
            relevantConditionalQuestion.required
          ) {
            const conditionalAnswer =
              step.conditionalAnswers?.[
                `${question.id}_${relevantConditionalQuestion.questionId}`
              ];

            if (!conditionalAnswer || conditionalAnswer.trim() === "") {
              return true;
            }

            if (
              relevantConditionalQuestion.inputType === "textarea" &&
              relevantConditionalQuestion.maxLength
            ) {
              const minChars = 25; // Default minimum characters
              if (conditionalAnswer.trim().length < minChars) {
                return true;
              }
            }
          }
        }

        return false;
      });
    }
    return false;
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate all questions in the current step
    step.questions?.forEach((question: any) => {
      const answer = (question as any).answer;

      if (question.required) {
        if (!answer || answer.trim() === "") {
          newErrors[question.id] = "This field is required";
          isValid = false;
        } else if (question.type === "textarea" && question.maxLength) {
          const minChars = 25; // Default minimum characters
          if (answer.trim().length < minChars) {
            newErrors[
              question.id
            ] = `Please enter at least ${minChars} characters`;
            isValid = false;
          }
        }
      }

      // Validate conditional questions if this is a radio-conditional question
      if (
        question.type === "radio-conditional" &&
        question.conditionalQuestions &&
        answer
      ) {
        const relevantConditionalQuestion = question.conditionalQuestions.find(
          (condQ: any) => condQ.questionId === answer
        );

        if (
          relevantConditionalQuestion &&
          relevantConditionalQuestion.required
        ) {
          const conditionalAnswer =
            step.conditionalAnswers?.[
              `${question.id}_${relevantConditionalQuestion.questionId}`
            ];

          if (!conditionalAnswer || conditionalAnswer.trim() === "") {
            newErrors[
              `${question.id}_${relevantConditionalQuestion.questionId}`
            ] = "This field is required";
            isValid = false;
          } else if (
            relevantConditionalQuestion.inputType === "textarea" &&
            relevantConditionalQuestion.maxLength
          ) {
            const minChars = 25; // Default minimum characters
            if (conditionalAnswer.trim().length < minChars) {
              newErrors[
                `${question.id}_${relevantConditionalQuestion.questionId}`
              ] = `Please enter at least ${minChars} characters`;
              isValid = false;
            }
          }
        }
      }
    });

    // Set errors in the store
    Object.keys(newErrors).forEach((key) => {
      setError(key, newErrors[key]);
    });

    // Clear errors for valid fields
    Object.keys(errors).forEach((key) => {
      if (!newErrors[key]) {
        setError(key, undefined);
      }
    });

    return isValid;
  };

  const getButtonVariant = (style: string) => {
    switch (style) {
      case "primary":
        return "default";
      case "secondary":
        return "secondary";
      case "accent":
        return "default";
      case "danger":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getButtonClasses = (button: any) => {
    const baseClasses =
      "w-full px-6 py-3 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    switch (button.style) {
      case "primary":
        return `${baseClasses} bg-[#8952fc] text-white hover:bg-[#7c4af0] focus:ring-[#8952fc] shadow-sm hover:shadow-md`;
      case "secondary":
        return `${baseClasses} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-[#8952fc] shadow-sm hover:shadow-md`;
      case "accent":
        return `${baseClasses} bg-[#4ABF71] text-white hover:bg-[#45a866] focus:ring-[#4ABF71] shadow-sm hover:shadow-md`;
      case "danger":
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm hover:shadow-md`;
      case "plain":
        return `${baseClasses} bg-white border border-gray-300 text-[#62605C] hover:bg-gray-50 hover:border-[#8952fc] focus:ring-[#8952fc] shadow-sm hover:shadow-md`;
      default:
        return `${baseClasses} bg-white border border-gray-300 text-[#62605C] hover:bg-gray-50 hover:border-gray-400 focus:ring-[#8952fc] shadow-sm hover:shadow-md`;
    }
  };

  const handleButtonClick = async (button: any) => {
    // Handle got-job branching first
    if (step.id === "got-job") {
      if (button.id === "got-job-yes") {
        // Set the answer and handle branching
        setAnswer(step.id, "gotJob", "yes");
        handleGotJobBranch("yes");
        return;
      } else if (button.id === "got-job-no") {
        // Set the answer and handle branching
        setAnswer(step.id, "gotJob", "no");
        handleGotJobBranch("no");
        return;
      }
    }

    // Validate step before proceeding for other actions
    if (button.action === "next" || button.action === "branch") {
      if (!validateStep()) {
        // Validation failed, don't proceed
        return;
      }
    }

    // Handle different button actions
    switch (button.action) {
      case "next":
        // Check for conditional branching first
        const conditionalNextStepId = getNextStepId(step.id, button.id);
        if (conditionalNextStepId) {
          // Use conditional branching result
          const nextStepIndex = steps.findIndex(
            (s) => s.id === conditionalNextStepId
          );
          if (nextStepIndex !== -1) {
            goToStep(nextStepIndex + 1);
          }
        } else if (button.nextStepId) {
          // Fall back to default nextStepId
          const nextStepIndex = steps.findIndex(
            (s) => s.id === button.nextStepId
          );
          if (nextStepIndex !== -1) {
            goToStep(nextStepIndex + 1);
          }
        }
        break;

      case "branch":
        // Handle conditional branching
        if (button.nextStepId) {
          const branchStepIndex = steps.findIndex(
            (s) => s.id === button.nextStepId
          );
          if (branchStepIndex !== -1) {
            goToStep(branchStepIndex + 1);
          }
        }
        break;

      case "close":
        // Close the dialog
        onClose();
        break;

      case "prev":
        // Handle back navigation
        if (button.prevStepId) {
          const prevStepIndex = steps.findIndex(
            (s) => s.id === button.prevStepId
          );
          if (prevStepIndex !== -1) {
            goToStep(prevStepIndex + 1);
          }
        }
        break;

      default:
        // Default action - try to navigate to nextStepId if available
        if (button.nextStepId) {
          const defaultStepIndex = steps.findIndex(
            (s) => s.id === button.nextStepId
          );
          if (defaultStepIndex !== -1) {
            goToStep(defaultStepIndex + 1);
          }
        }
        break;
    }

    // Save only when completing the flow
    if (button.action === "close" || step.id === "confirm-cancel") {
      await saveFinalCancellation();
    }
  };

  const saveFinalCancellation = async () => {
    const success = await saveFlowData(mockUserId, mockSubscriptionId);

    if (success) {
      // Close dialog or show success message
      onClose();
    } else {
      // Show error message
      alert("Failed to save cancellation data. Please try again.");
    }
  };

  const handleDownsellOffer = async (accepted: boolean) => {
    if (accepted && currentSubscription) {
      // Update subscription with offer acceptance
      SubscriptionService.updateSubscriptionOffer(currentSubscription.id, true);
    }

    // Continue with flow
    handleButtonClick(step.offerButton);
  };

  const updateSubscriptionOffer = async (
    accepted: boolean,
    percent: number
  ) => {
    try {
      const response = await fetch("/api/subscription/offer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: mockUserId,
          subscriptionId: mockSubscriptionId,
          offerAccepted: accepted,
          offerPercent: percent,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to update subscription offer:", error);
      return false;
    }
  };

  // Get dynamic description for continue-subscription step
  const getDynamicDescription = () => {
    if (step.id === "continue-subscription" && currentSubscription) {
      return SubscriptionService.getContinueSubscriptionDescription(
        currentSubscription
      );
    }
    return step.description;
  };

  // Replace variables in text with actual subscription data
  const replaceVariablesInText = (text: string): string => {
    if (!text || !currentSubscription) {
      return text;
    }
    return SubscriptionService.replaceVariablesInText(
      text,
      currentSubscription
    );
  };

  // Get dynamic heading with variables replaced
  const getDynamicHeading = (): string => {
    if (step.heading) {
      return replaceVariablesInText(step.heading);
    }
    return "";
  };

  // Get dynamic heading2 with variables replaced
  const getDynamicHeading2 = (): string => {
    if (step.heading2) {
      return replaceVariablesInText(step.heading2);
    }
    return "";
  };

  // Get dynamic description with variables replaced
  const getDynamicDescriptionWithVariables = (): string => {
    if (step.description) {
      return replaceVariablesInText(step.description);
    }
    return "";
  };

  // Get dynamic note with variables replaced
  const getDynamicNote = (): string => {
    if (step.note) {
      return replaceVariablesInText(step.note);
    }
    return "";
  };

  // Calculate current flow steps for StepIndicator
  const getCurrentFlowSteps = () => {
    const { downsellVariant, steps } = useCancellationStore.getState();

    // If we're in the got-job step, determine flow based on variant
    if (step.id === "got-job") {
      return 0; // got-job is not counted in flow steps
    }

    // Flow A (got-job-yes): job-source -> help-feedback -> visa-status (3 steps, final step shows "Completed")
    if (
      step.id === "job-source" ||
      step.id === "help-feedback" ||
      step.id === "visa-status" ||
      step.id === "visa-status-no"
    ) {
      return 3; // Flow A has 3 steps
    }

    // Flow B (got-job-no):
    //   - Variant A: usage-feedback -> cancel-reason (2 steps, final step shows "Completed")
    //   - Variant B: downsell-offer-check -> usage-feedback -> cancel-reason (3 steps, final step shows "Completed")
    if (step.id === "usage-feedback") {
      const totalSteps = downsellVariant === "B" ? 3 : 2;
      return totalSteps;
    }

    if (step.id === "downsell-offer-check") {
      // Only Variant B shows this step, so it's always 3 steps
      return 3;
    }

    if (step.id === "cancel-reason") {
      // cancel-reason is part of the main flow, show step count
      const totalSteps = downsellVariant === "B" ? 3 : 2;
      return totalSteps;
    }

    // Hide step indicator for these steps
    if (step.id === "continue-subscription" || step.id === "apply-job") {
      return -1; // Special value to hide step indicator completely
    }

    // Final steps show "Completed" but keep step indicator dots
    if (
      step.id === "all-done" ||
      step.id === "all-done-visa-support" ||
      step.id === "cancel-confirmation"
    ) {
      // Return the total steps for the flow to show the dots, but position will be 0
      const totalSteps = downsellVariant === "B" ? 3 : 2;
      return totalSteps;
    }

    // For other steps, determine based on current position
    if (step.number && step.number >= 1 && step.number <= 3) {
      // If we're in a numbered step, calculate based on variant
      if (downsellVariant === "B" && step.number <= 3) {
        return 3; // Variant B has 3 steps
      } else if (downsellVariant === "A" && step.number <= 2) {
        return 2; // Variant A has 2 steps
      }
    }

    return 0;
  };

  // Calculate current step position within the flow
  const getCurrentStepPosition = () => {
    const { downsellVariant } = useCancellationStore.getState();

    // If we're in the got-job step, no position to show
    if (step.id === "got-job") {
      return 0;
    }

    // Flow A (got-job-yes): job-source (1) -> help-feedback (2) -> visa-status (3)
    if (step.id === "job-source") {
      return 1;
    }
    if (step.id === "help-feedback") {
      return 2;
    }
    if (step.id === "visa-status" || step.id === "visa-status-no") {
      return 3;
    }

    // Flow B (got-job-no):
    if (step.id === "usage-feedback") {
      // Variant A: usage-feedback is step 1
      // Variant B: usage-feedback is step 2
      const position = downsellVariant === "B" ? 2 : 1;
      return position;
    }

    if (step.id === "downsell-offer-check") {
      // Only Variant B shows this step, it's step 1
      return 1;
    }

    if (step.id === "cancel-reason") {
      // cancel-reason is part of the main flow, show step position
      const position = downsellVariant === "B" ? 3 : 2;
      return position;
    }

    // Final steps show "Completed" instead of step numbers
    if (
      step.id === "all-done" ||
      step.id === "all-done-visa-support" ||
      step.id === "cancel-confirmation"
    ) {
      return 0;
    }

    // For other steps, use the number from config if available
    if (step.number && step.number >= 1 && step.number <= 3) {
      // Adjust step numbers based on variant
      if (downsellVariant === "A" && step.number > 2) {
        const adjustedPosition = step.number - 1; // Skip the hidden downsell step
        return adjustedPosition;
      }
      return step.number;
    }

    return 0;
  };

  if (!step) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="max-w-[1000px] max-h-[90vh] min-h-[400px] p-0 !rounded-[20px] overflow-scroll !gap-0">
        <DialogHeader className="flex flex-row items-center justify-start sm:justify-center px-3 py-4 border-b border-[#E6E6E6] h-[60px]">
          {currentStep > 1 && step.id !== "got-job" && (
            <div className="hidden sm:flex justify-start cursor-pointer mr-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                className="text-[#62605C] font-semibold text-sm cursor-pointer hover:bg-gray-100 rounded-lg p-0 pl-2 pr-4"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          )}
          <DialogTitle className="text-sm sm:text-base leading-normal font-semibold text-[#41403D] flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-6">
            Subscription Cancellation
            {step.id !== "got-job" && getCurrentFlowSteps() !== -1 && (
              <StepIndicator
                currentStep={getCurrentStepPosition()}
                totalSteps={getCurrentFlowSteps()}
                className="justify-center ml-0 sm:ml-0"
              />
            )}
          </DialogTitle>
          <DialogClose asChild className="ml-auto">
            <Button variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col-reverse sm:flex-row max-h-[calc(100vh-60px)] pb-5 p-0 sm:p-5 overflow-scroll gap-0 sm:gap-5">
          {/* Left Content Panel */}
          <LeftPanel
            step={step}
            getConditionalHeading={getConditionalHeading}
            handleButtonClick={handleButtonClick}
            isButtonDisabled={isButtonDisabled}
            getButtonClasses={getButtonClasses}
            getButtonVariant={getButtonVariant}
            handleDownsellOffer={handleDownsellOffer}
            replaceVariablesInText={replaceVariablesInText}
            currentSubscription={currentSubscription}
            getDynamicHeading={getDynamicHeading}
            getDynamicHeading2={getDynamicHeading2}
            getDynamicDescriptionWithVariables={
              getDynamicDescriptionWithVariables
            }
            getDynamicNote={getDynamicNote}
          />
          {/* Right Image Panel - Hidden on mobile for specific steps */}
          <RightPanel
            step={step}
            currentStep={currentStep}
            prevStep={prevStep}
          />
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
