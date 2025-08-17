import React from "react";
import { Markdown } from "@/component/ui/markdown";

interface TextareaQuestionProps {
  question: any;
  value: string;
  error?: string;
  setAnswer: (stepId: string, questionId: string, answer: any) => void;
  stepId: string;
}

export default function TextareaQuestion({
  question,
  value,
  error,
  setAnswer,
  stepId
}: TextareaQuestionProps) {
  const minChars = question.maxLength || 25; // Default to 25 characters
  const currentLength = value.length;
  const isValid = currentLength >= minChars;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setAnswer(stepId, question.id, e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8952fc] focus:border-[#8952fc] resize-none transition-colors duration-200 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={4}
          maxLength={500}
          // placeholder={question.placeholder || `Please enter at least ${minChars} characters`}
        />
        <div className={`text-sm absolute bottom-3 right-2 ${
          isValid ? 'text-green-600' : 'text-gray-500'
        }`}>
          Min {minChars} characters {currentLength}/{minChars}
        </div>
      </div>
      <div className="flex justify-between items-center mt-1">
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        {!error && question.required && (
          <p className={`text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
            {isValid ? '✓ Valid' : `Minimum ${minChars} characters required`}
          </p>
        )}
      </div>
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
