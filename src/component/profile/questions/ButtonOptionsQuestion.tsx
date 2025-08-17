import React from "react";
import { Markdown } from "@/component/ui/markdown";

interface ButtonOptionsQuestionProps {
  question: any;
  value: string;
  error?: string;
  setAnswer: (stepId: string, questionId: string, answer: any) => void;
  stepId: string;
}

export default function ButtonOptionsQuestion({
  question,
  value,
  error,
  setAnswer,
  stepId
}: ButtonOptionsQuestionProps) {
  return (
    <div className="space-y-3">
      <label className="flex text-xs sm:text-base font-semibold text-[#62605C]">
        <Markdown>{question.text}</Markdown>
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex flex-row gap-2">
        {question.options?.map((option: any) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setAnswer(stepId, question.id, option.value)}
            className={`px-4 md:px-6 text-sm tracking-[-0.28px] cursor-pointer py-3 h-[30px] text-[#62605C] w-full text-left rounded flex justify-center items-center transition-all duration-200 ${
              value === option.value
                ? 'bg-[#7b40fc] hover:bg-[#9A6FFF] text-white'
                : 'bg-[#F6F6F6] hover:bg-[#E6E6E6]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      {/* Show errorMessage if available */}
      {question.errorMessage && (
        <div className="mt-2">
          <Markdown>
            {question.errorMessage}
          </Markdown>
        </div>
      )}
    </div>
  );
}
