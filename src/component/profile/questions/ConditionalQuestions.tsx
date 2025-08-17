import React from "react";
import { Markdown } from "@/component/ui/markdown";
import { useCancellationStore } from "@/store/cancellationStore";

interface ConditionalQuestionsProps {
  stepId: string;
  questionId: string;
  conditionalQuestions: any[];
  setAnswer: (stepId: string, questionId: string, answer: any) => void;
  errors: Record<string, string | undefined>;
}

export const ConditionalQuestions: React.FC<ConditionalQuestionsProps> = ({
  stepId,
  questionId,
  conditionalQuestions,
  setAnswer,
  errors
}) => {
  const { steps, currentStep } = useCancellationStore();
  
  if (!conditionalQuestions || conditionalQuestions.length === 0) {
    return null;
  }

  // Get the current step to access conditional question answers
  const currentStepData = steps[currentStep - 1];
  const parentQuestion = currentStepData?.questions?.find((q: any) => q.id === questionId);
  const parentAnswer = parentQuestion?.answer;

  // Only show conditional questions if parent question has an answer
  if (!parentAnswer) {
    return null;
  }

  // Filter conditional questions based on the selected option
  const relevantConditionalQuestions = conditionalQuestions.filter(
    (condQ) => condQ.questionId === parentAnswer
  );

  if (relevantConditionalQuestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pl-4">
      {relevantConditionalQuestions.map((condQ) => {
        // Get conditional question value from the new store structure
        const condValue = currentStepData?.conditionalAnswers?.[`${questionId}_${condQ.questionId}`] ?? "";
        const condError = errors[`${questionId}_${condQ.questionId}`];
        
        if (condQ.inputType === "textarea") {
          const minChars = condQ.maxLength || 25; // Default to 25 characters
          const currentLength = condValue.length;
          const isValid = currentLength >= minChars;
          const isEmpty = !condValue || condValue.trim() === "";
          
          return (
            <div key={condQ.questionId} className="space-y-2">
              <label className="block text-base font-normal text-[#41403D]">
                {condQ.question}
                {condQ.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="relative">
                <textarea
                  value={condValue}
                  onChange={(e) => setAnswer(stepId, `${questionId}_${condQ.questionId}`, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8952fc] focus:border-[#8952fc] resize-none transition-colors duration-200 ${
                    condError && isEmpty ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={5}
                  maxLength={300}
                  // placeholder={condQ.placeholder || `Please enter at least ${minChars} characters`}
                />
                <div className={`text-xs font-normal tracking-[-0.6px] absolute bottom-3 right-2 text-[#62605C]`}>
                  Min {minChars} characters {currentLength}/{minChars}
                </div>
              </div>
              <div className="flex justify-between items-center">
                {condError && isEmpty && (
                  <p className="text-sm text-red-500">{condError}</p>
                )}
              </div>
              {/* Show errorMessage if available */}
              {/* {condQ.errorMessage && (
                <div className="mt-2">
                  <Markdown>
                    {condQ.errorMessage}
                  </Markdown>
                </div>
              )} */}
            </div>
          );
        } else if (condQ.inputType === "text" || condQ.inputType === "number") {
          const isEmpty = !condValue || condValue.trim() === "";
          
          return (
            <div key={condQ.questionId} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {condQ.question}
                {condQ.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="relative">
                {condQ.showDollarSign && (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                )}
                <input
                  type={condQ.inputType === "number" ? "number" : "text"}
                  value={condValue}
                  onChange={(e) => setAnswer(stepId, `${questionId}_${condQ.questionId}`, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8952fc] focus:border-[#8952fc] transition-colors duration-200 ${
                    condError && isEmpty ? 'border-red-500' : 'border-gray-300'
                  } ${condQ.showDollarSign ? 'pl-8' : ''}`}
                  placeholder="Enter your answer"
                />
              </div>
              {condError && isEmpty && (
                <p className="text-sm text-red-500">{condError}</p>
              )}
              {/* Show errorMessage if available */}
              {/* {condQ.errorMessage && (
                <div className="mt-2">
                  <Markdown>
                    {condQ.errorMessage}
                  </Markdown>
                </div>
              )} */}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};
