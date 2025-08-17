import React from "react";
import { ConditionalQuestions } from "./ConditionalQuestions";
import { Markdown } from "@/component/ui/markdown";
import { useCancellationStore } from "@/store/cancellationStore";

interface RadioConditionalQuestionProps {
  question: any;
  value: string;
  error?: string;
  setAnswer: (stepId: string, questionId: string, answer: any) => void;
  stepId: string;
}

export default function RadioConditionalQuestion({
  question,
  value,
  error,
  setAnswer,
  stepId
}: RadioConditionalQuestionProps) {
  const { steps } = useCancellationStore();
  
  // Debug logging
  console.log('RadioConditionalQuestion render:', {
    questionId: question.id,
    value,
    hasConditionalQuestions: !!question.conditionalQuestions,
    conditionalQuestions: question.conditionalQuestions,
    stepId
  });

  // Get the current step data by stepId instead of currentStep index
  const currentStepData = steps.find(step => step.id === stepId);

  // Get the relevant conditional question for the selected value
  const relevantConditionalQuestion = value && question.conditionalQuestions?.find(
    (condQ: any) => condQ.questionId === value
  );

  // Get the conditional question answer from the store
  const conditionalQuestionId = relevantConditionalQuestion ? `${question.id}_${relevantConditionalQuestion.questionId}` : '';
  const conditionalAnswer = currentStepData?.conditionalAnswers?.[conditionalQuestionId] || '';

  console.log('Conditional question data:', {
    relevantConditionalQuestion,
    conditionalQuestionId,
    conditionalAnswer,
    conditionalAnswers: currentStepData?.conditionalAnswers,
    value,
    questionId: question.id,
    stepId,
    currentStepData: currentStepData?.id
  });

  // Custom radio button component
  const CustomRadioButton = ({ optionValue, isSelected }: { optionValue: string; isSelected: boolean }) => (
    <div className="flex items-center justify-center w-5 h-5">
      {isSelected ? (
        // Selected state: Use radio.svg icon
        <img 
          src="/radio.svg" 
          alt="Selected" 
          className="w-5 h-5"
          width="20"
          height="20"
        />
      ) : (
        // Unselected state: Empty circle with border
        <div className="w-5 h-5 border-2 border-[#62605C] rounded-full"></div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Radio Options - Show all when no selection, show only selected when chosen */}
      <div className="space-y-3">
        <label className="block text-base font-medium text-[#41403D]">
          {question.text}
          {question.required && <span className="ml-1">*</span>}
        </label>
        <div className="space-y-2">
          {question.radioOptions?.map((option: any) => {
            // Show all options if no selection, or only the selected option if one is chosen
            if (!value || option.value === value) {
              return (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => {
                      setAnswer(stepId, question.id, e.target.value);
                    }}
                    className="sr-only" // Hide the actual radio input
                  />
                  <CustomRadioButton 
                    optionValue={option.value} 
                    isSelected={value === option.value} 
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              );
            }
            return null; // Hide unselected options
          })}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
        <ConditionalQuestions
            key={question.id}
            stepId={stepId}
            questionId={question.id}
            conditionalQuestions={question.conditionalQuestions}
            setAnswer={setAnswer}
            errors={{}}
          />
    </div>
  );
}
