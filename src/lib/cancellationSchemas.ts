// lib/cancellationSchemas.ts
import { z } from "zod";

/** Question model */
export type QuestionType = "button-options" | "textarea" | "radio-conditional" | "info" | "text";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface ConditionalQuestion {
  questionId: string;
  question: string;
  inputType: "text" | "textarea" | "button-options" | "number";
  maxLength?: number;
  required?: boolean;
  errorMessage?: string;
  options?: QuestionOption[]; // For button-options type
  showDollarSign?: boolean;   // For text type
}

export interface ConditionalBranch {
  condition: {
    stepId: string;
    questionId: string;
    value: string;
  };
  nextStepId: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required?: boolean;             // default false
  defaultAnswer?: string;         // default value for the question
  
  // For button-options type
  options?: QuestionOption[];     // array of options with value and label
  
  // For textarea type
  maxLength?: number;             // max characters for textarea
  
  // For radio-conditional type
  radioOptions?: QuestionOption[]; // radio button options
  conditionalQuestions?: ConditionalQuestion[]; // follow-up questions for each option
}

/** Button action types */
export type ButtonAction = "next" | "prev" | "branch" | "close";

/** Button styles */
export type ButtonStyle = "plain" | "primary" | "secondary" | "accent" | "danger" | "disabled";

/** Button configuration */
export interface Button {
  id: string;
  label: string;
  style: ButtonStyle;
  action: ButtonAction;
  nextStepId?: string;           // for next/branch actions
  prevStepId?: string;           // for back navigation
  branchTarget?: string;         // for conditional branching
  branchCondition?: string;      // for conditional branching
  disabledUntil?: string[];      // question IDs that must be answered before enabling
  color?: "green" | "red" | "white" | "default"; // specific color overrides
}

export interface Step {
  id: string;
  number: number;
  heading: string;
  heading2?: string;
  subHeading?: string;
  description: string;
  showOffer?: boolean;
  branchKey?: string;
  prevStepId?: string;           // for back navigation to previous step
  questions: Question[];
  offerButton?: Button;
  buttons: Button[];
  showOfferButton?: boolean;
  hideImageOnMobile?: boolean;   // config to hide image on mobile for specific steps
  errorMessage?: string;
  note?: string;
  conditionalBranches?: ConditionalBranch[]; // for conditional branching based on previous step answers
}

/** Coercion helpers from form inputs */
const coerceBoolean = (val: unknown) =>
  typeof val === "boolean"
    ? val
    : typeof val === "string"
      ? ["true", "1", "yes", "on"].includes(val.toLowerCase())
      : !!val;

const coerceNumber = (val: unknown) => {
  if (typeof val === "number") return val;
  if (typeof val === "string" && val.trim() !== "") {
    const n = Number(val);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
};

/** Per-question Zod schema factory */
export function zodForQuestion(q: Question): z.ZodTypeAny {
  switch (q.type) {
    case "button-options":
      return z.string().refine((val) => {
        return q.options?.some((opt) => opt.value === val);
      }, "Please select a valid option");
      
    case "textarea":
      return z.string()
        .min(1, "This field is required")
        .min(25, "Please enter at least 25 characters so we can understand your feedback")
        .max(q.maxLength || 1000, `Maximum ${q.maxLength || 1000} characters allowed`)
        .transform((val) => val.trim());
        
    case "text":
      return z.string()
        .min(1, "Please enter some value")
        .max(q.maxLength || 100, `Maximum ${q.maxLength || 100} characters allowed`)
        .transform((val) => val.trim());
        
    case "radio-conditional":
      return z.string().refine((val) => {
        return q.radioOptions?.some((opt) => opt.value === val);
      }, "Please select a valid option");
      
    case "info":
      return z.string().optional();
      
    default:
      return z.string();
  }
}

/** Build a Zod schema for one step using its question list */
export function zodForStep(step: Step) {
  const shape: Record<string, z.ZodTypeAny> = {};
  step.questions.forEach((q) => {
    // Only validate user-facing inputs, skip info
    if (q.type !== "info") {
      shape[q.id] = zodForQuestion(q);
      
      // Add validation for conditional questions if they exist
      if (q.type === "radio-conditional" && q.conditionalQuestions) {
        q.conditionalQuestions.forEach((condQ) => {
          if (condQ.required) {
            shape[`${q.id}_${condQ.questionId}`] = zodForConditionalQuestion(condQ);
          }
        });
      }
    }
  });
  return z.object(shape);
}

/** Build a Zod schema for conditional questions */
export function zodForConditionalQuestion(condQ: ConditionalQuestion): z.ZodTypeAny {
  switch (condQ.inputType) {
    case "button-options":
      return z.string().refine((val) => {
        return condQ.options?.some((opt) => opt.value === val);
      }, "Please select a valid option");
      
    case "textarea":
      return z.string()
        .min(1, "This field is required")
        .min(25, "Please enter at least 25 characters so we can understand your feedback")
        .max(condQ.maxLength || 1000, `Maximum ${condQ.maxLength || 1000} characters allowed`)
        .transform((val) => val.trim());
        
    case "text":
      return z.string()
        .min(1, "Please enter some value")
        .max(condQ.maxLength || 100, `Maximum ${condQ.maxLength || 100} characters allowed`)
        .transform((val) => val.trim());
        
    default:
      return z.string();
  }
}
