import React from "react";
import { useCancellationStore } from "@/store/cancellationStore";
import TextareaQuestion from "./TextareaQuestion";
import TextQuestion from "./TextQuestion";
import ButtonOptionsQuestion from "./ButtonOptionsQuestion";
import RadioConditionalQuestion from "./RadioConditionalQuestion";
import { ConditionalQuestions } from "./ConditionalQuestions";

interface QuestionSectionProps {
  step: any;
  setAnswer: (stepId: string, questionId: string, answer: any) => void;
  errors: Record<string, string | undefined>;
}

export default function QuestionSection({
  step,
  setAnswer,
  errors
}: QuestionSectionProps) {
  const { currentStep } = useCancellationStore();
  
  if (!step.questions || step.questions.length === 0) {
    return null;
  }

  const renderQuestion = (q: any) => {
          const value = (q as any).answer ?? "";
      const error = errors[q.id];

    switch (q.type) {
      case "textarea":
        return (
          <TextareaQuestion
            key={q.id}
            question={q}
            value={value}
            error={error}
            setAnswer={setAnswer}
            stepId={step.id}
          />
        );

      case "text":
        return (
          <TextQuestion
            key={q.id}
            question={q}
            value={value}
            error={error}
            setAnswer={setAnswer}
            stepId={step.id}
          />
        );

      case "button-options":
        return (
          <ButtonOptionsQuestion
            key={q.id}
            question={q}
            value={value}
            error={error}
            setAnswer={setAnswer}
            stepId={step.id}
          />
        );

      case "conditional":
        return (
          <ConditionalQuestions
            key={q.id}
            stepId={step.id}
            questionId={q.id}
            conditionalQuestions={q.conditionalQuestions}
            setAnswer={setAnswer}
            errors={errors}
          />
        );

      case "radio-conditional":
        return (
          <RadioConditionalQuestion
            key={q.id}
            question={q}
            value={value}
            error={error}
            setAnswer={setAnswer}
            stepId={step.id}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {step.questions.map(renderQuestion)}
    </div>
  );
}
