// lib/cancellationSchemas.ts
import { z } from "zod";

/** Question model */
export type QuestionType = "text" | "number" | "boolean" | "select" | "checkboxes" | "info";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required?: boolean;             // default false
  min?: number;                   // for number
  max?: number;                   // for number
  options?: string[];             // for select
  minSelected?: number;           // for checkboxes
  maxSelected?: number;           // for checkboxes
}

export interface Step {
  id: string;
  number: number;
  title: string;
  branchKey?: string;
  questions: Question[];
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
    case "info":
      // purely informational; not validated
      return z.any().optional();

    case "text": {
      let s = z
        .string({ required_error: "Required" })
        .transform((v) => (v ?? "").toString().trim());
      if (!q.required) s = s.optional();
      // allow empty if not required
      if (!q.required) s = s.refine(() => true);
      return s;
    }

    case "number": {
      let s = z
        .preprocess((v) => coerceNumber(v), z.number({ invalid_type_error: "Enter a number" }));
      if (typeof q.min === "number") s = s.min(q.min, `Min ${q.min}`);
      if (typeof q.max === "number") s = s.max(q.max, `Max ${q.max}`);
      if (!q.required) s = s.optional();
      return s;
    }

    case "boolean": {
      let s = z.preprocess((v) => coerceBoolean(v), z.boolean());
      if (!q.required) s = s.optional();
      return s;
    }

    case "select": {
      const opts = q.options ?? [];
      let s = z.string({ required_error: "Required" }).refine(
        (v) => opts.includes(v),
        "Select a valid option"
      );
      if (!q.required) s = s.optional();
      return s;
    }

    case "checkboxes": {
      const opts = q.options ?? [];
      let s = z
        .array(z.string())
        .refine((arr) => arr.every((v) => opts.includes(v)), "Invalid selection");
      if (typeof q.minSelected === "number") s = s.min(q.minSelected, `Select at least ${q.minSelected}`);
      if (typeof q.maxSelected === "number") s = s.max(q.maxSelected, `Select at most ${q.maxSelected}`);
      if (!q.required) s = s.optional();
      return s;
    }

    default:
      return z.any().optional();
  }
}

/** Build a Zod schema for one step using its question list */
export function zodForStep(step: Step) {
  const shape: Record<string, z.ZodTypeAny> = {};
  step.questions.forEach((q) => {
    // Only validate user-facing inputs, skip info
    if (q.type !== "info") shape[q.id] = zodForQuestion(q);
  });
  return z.object(shape);
}
