import React from "react";
import { Markdown } from "@/component/ui/markdown";

interface TextQuestionProps {
  question: any;
  value: string;
  error?: string;
  setAnswer: (stepId: string, questionId: string, answer: any) => void;
  stepId: string;
}

export default function TextQuestion({
  question,
  value,
  error,
  setAnswer,
  stepId
}: TextQuestionProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {question.showDollarSign && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            $
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => setAnswer(stepId, question.id, e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8952fc] focus:border-[#8952fc] transition-colors duration-200 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${question.showDollarSign ? 'pl-8' : ''}`}
          placeholder="Enter your answer"
        />
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
