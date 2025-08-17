// store/cancellationStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { cancellationFlowConfig } from "@/lib/cancellationFlow";
import {
  CancellationService,
  SaveCancellationRequest,
} from "@/lib/cancellationService";
import { generateDeterministicVariant } from "@/lib/abTestingUtils";

interface CancellationStore {
  currentStep: number;
  steps: any[];
  downsellVariant: "A" | "B";
  errors: Record<string, string | undefined>;
  isLoading: boolean;
  savedData: any;

  // Core business fields stored centrally
  gotJob: "yes" | "no" | null;
  cancelReason: string | null;
  companyVisaSupport: "yes" | "no" | null;
  acceptedDownsell: boolean;
  finalDecision: "cancelled" | "kept" | null;

  // Navigation methods
  goToStep: (stepNumber: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // State management
  setAnswer: (stepId: string, questionId: string, answer: any) => void;
  setError: (questionId: string, error: string | undefined) => void;
  clearErrors: () => void;
  setDownsellVariant: (variant: "A" | "B") => void;
  getCurrentVariant: () => "A" | "B";

  // Core field setters
  setGotJob: (value: "yes" | "no") => void;
  setCancelReason: (value: string) => void;
  setCompanyVisaSupport: (value: "yes" | "no") => void;
  setAcceptedDownsell: (value: boolean) => void;
  setFinalDecision: (value: "cancelled" | "kept") => void;

  // Data persistence - save only on final step completion
  saveFlowData: (userId: string, subscriptionId: string) => Promise<boolean>;
  loadFlowData: (userId: string, subscriptionId?: string) => Promise<boolean>;
  getFlowData: () => any;

  // Validation
  validateStep: (stepId: string) => boolean;

  // Conditional branching
  getNextStepId: (currentStepId: string, buttonId: string) => string | null;
  handleGotJobBranch: (gotJobAnswer: "yes" | "no") => void;

  // A/B Testing and flow reset
  initializeFlow: (
    userId: string,
    downsellVariant?: "A" | "B"
  ) => Promise<void>;
  resetFlow: () => void;
}

export const useCancellationStore = create<CancellationStore>()(
  devtools((set, get) => ({
    currentStep: 1,
    steps: cancellationFlowConfig,
    downsellVariant: "A",
    errors: {},
    isLoading: false,
    savedData: null,

    // Core business fields stored centrally
    gotJob: null,
    cancelReason: null,
    companyVisaSupport: null,
    acceptedDownsell: false,
    finalDecision: null,

    goToStep: (stepNumber: number) => {
      set({ currentStep: stepNumber });
    },

    nextStep: () => {
      const { currentStep, steps } = get();
      if (currentStep < steps.length) {
        set({ currentStep: currentStep + 1 });
      }
    },

    prevStep: () => {
      const { currentStep, steps } = get();
      const currentStepData = steps[currentStep - 1]; // Get current step data

      if (currentStepData?.prevStepId) {
        // Use the prevStepId from the current step
        const prevStepIndex = steps.findIndex(
          (step) => step.id === currentStepData.prevStepId
        );
        if (prevStepIndex !== -1) {
          set({ currentStep: prevStepIndex + 1 });
        }
      } else if (currentStep > 1) {
        // Fallback to simple decrement if no prevStepId is defined
        set({ currentStep: currentStep - 1 });
      }
    },

    setAnswer: (stepId, questionId, answer) => {
      set((state) => {
        // Find the step by ID in the flow configuration
        const stepIndex = state.steps.findIndex((step) => step.id === stepId);

        if (stepIndex === -1) {
          console.warn(`Step with ID ${stepId} not found`);
          return state;
        }

        // Update core business fields in store when relevant questions are answered
        let coreFieldUpdates = {};
        if (questionId === "cancelReason") {
          coreFieldUpdates = { cancelReason: answer };
        } else if (questionId === "companyVisaSupport") {
          coreFieldUpdates = { companyVisaSupport: answer };
        }

        return {
          ...state,
          ...coreFieldUpdates,
          steps: state.steps.map((step, index) =>
            index === stepIndex
              ? {
                  ...step,
                  questions: step.questions.map((q: any) =>
                    q.id === questionId ? { ...q, answer } : q
                  ),
                  // Store conditional question answers with proper structure
                  ...(questionId.includes("_") && {
                    conditionalAnswers: {
                      ...(step.conditionalAnswers || {}),
                      [questionId]: answer,
                    },
                  }),
                }
              : step
          ),
        };
      });
    },

    setError: (questionId, error) => {
      set((state) => ({
        errors: {
          ...state.errors,
          [questionId]: error,
        },
      }));
    },

    clearErrors: () => {
      set({ errors: {} });
    },

    setDownsellVariant: (variant) => {
      set({ downsellVariant: variant });
    },

    getCurrentVariant: () => {
      return get().downsellVariant;
    },

    // Core field setters
    setGotJob: (value: "yes" | "no") => {
      set({ gotJob: value });
    },
    setCancelReason: (value: string) => {
      set({ cancelReason: value });
    },
    setCompanyVisaSupport: (value: "yes" | "no") => {
      set({ companyVisaSupport: value });
    },
    setAcceptedDownsell: (value: boolean) => {
      set({ acceptedDownsell: value });
    },
    setFinalDecision: (value: "cancelled" | "kept") => {
      set({ finalDecision: value });
    },

    // Save flow data only on final step completion
    saveFlowData: async (userId: string, subscriptionId: string) => {
      set({ isLoading: true });

      try {
        const state = get();

        // Ensure we have a valid variant before saving
        if (!state.downsellVariant) {
          console.error(
            "No downsellVariant found in store, cannot save flow data"
          );
          set({ isLoading: false });
          return false;
        }

        console.log(`Saving flow data with variant: ${state.downsellVariant}`);

        // Extract flow data for JSONB storage
        const flowData = CancellationService.extractFlowData(
          state.steps,
          state.downsellVariant
        );

        // Use core business fields directly from store state
        const coreFields = {
          gotJob: state.gotJob,
          cancelReason: state.cancelReason,
          companyVisaSupport: state.companyVisaSupport,
          acceptedDownsell: state.acceptedDownsell,
          finalDecision: state.finalDecision,
        };

        // Determine final decision based on flow
        let finalDecision: "cancelled" | "kept" = "cancelled";
        if (state.acceptedDownsell || state.finalDecision === "kept") {
          finalDecision = "kept";
        }

        const request: SaveCancellationRequest = {
          userId,
          subscriptionId,
          downsellVariant: state.downsellVariant,
          flowData,
          currentStep: state.currentStep,
          completed: true,
          gotJob: coreFields.gotJob || undefined,
          cancelReason: coreFields.cancelReason || undefined,
          companyVisaSupport: coreFields.companyVisaSupport || undefined,
          acceptedDownsell: coreFields.acceptedDownsell,
          finalDecision,
        };

        const result = await CancellationService.saveCancellation(request);

        if (result.success) {
          set({ savedData: result.data });
        }

        set({ isLoading: false });
        return result.success;
      } catch (error) {
        console.error("Failed to save flow data:", error);
        set({ isLoading: false });
        return false;
      }
    },

    loadFlowData: async (userId: string, subscriptionId?: string) => {
      set({ isLoading: true });

      try {
        const result = await CancellationService.getCancellation(
          userId,
          subscriptionId
        );

        if (result.success && result.data) {
          const cancellationData = result.data[0]; // Get the most recent cancellation

          if (cancellationData) {
            // Use the existing variant from database - NEVER regenerate
            const variant = cancellationData.downsell_variant;

            // Restore flow state from saved data
            set({
              currentStep: cancellationData.current_step || 1,
              savedData: cancellationData,
              downsellVariant: variant, // Use the existing variant
              // Restore core business fields from database
              gotJob: cancellationData.got_job || null,
              cancelReason: cancellationData.cancel_reason || null,
              companyVisaSupport: cancellationData.company_visa_support || null,
              acceptedDownsell: cancellationData.accepted_downsell || false,
              finalDecision: cancellationData.final_decision || null,
            });

            // Restore answers from flow_data
            if (cancellationData.flow_data) {
              const { steps } = get();
              const updatedSteps = steps.map((step: any) => {
                const stepData = cancellationData.flow_data[step.id];
                if (stepData) {
                  return {
                    ...step,
                    ...stepData,
                  };
                }
                return step;
              });

              set({ steps: updatedSteps });
            }

            console.log(
              `Flow data loaded for user ${userId} with variant ${variant}`
            );
          }
        }

        set({ isLoading: false });
        return result.success;
      } catch (error) {
        console.error("Failed to load flow data:", error);
        set({ isLoading: false });
        return false;
      }
    },

    getFlowData: () => {
      return get().savedData;
    },

    validateStep: (stepId: string) => {
      const { steps, errors } = get();
      const step = steps.find((s: any) => s.id === stepId);

      if (!step || !step.questions) return true;

      let isValid = true;
      const newErrors: Record<string, string | undefined> = {};

      step.questions.forEach((q: any) => {
        if (q.required && (!q.answer || q.answer.trim() === "")) {
          newErrors[q.id] = "This field is required";
          isValid = false;
        }
      });

      set({ errors: newErrors });
      return isValid;
    },

    // Conditional branching
    getNextStepId: (currentStepId: string, buttonId: string) => {
      const { steps } = get();
      const currentStep = steps.find((step) => step.id === currentStepId);
      if (!currentStep || !currentStep.conditionalBranches) return null;

      // Find the button to get its default nextStepId
      const button = currentStep.buttons?.find((b: any) => b.id === buttonId);
      if (!button) return null;

      // Check if there are conditional branches that override the default nextStepId
      for (const branch of currentStep.conditionalBranches) {
        debugger;
        const { condition, nextStepId } = branch;

        // Find the step that contains the condition question
        const conditionStep = steps.find((s) => s.id === condition.stepId);
        if (!conditionStep) continue;

        // Find the question in that step
        const question = conditionStep.questions?.find(
          (q: any) => q.id === condition.questionId
        );
        if (!question) continue;

        // Check if the answer matches the condition
        if ((question as any).answer === condition.value) {
          return nextStepId;
        }
      }

      // If no conditional branch matches, return the button's default nextStepId
      return button.nextStepId;
    },

    // Handle got-job branching based on variant
    handleGotJobBranch: (gotJobAnswer: "yes" | "no") => {
      const { downsellVariant, steps } = get();

      // Store the gotJob answer in the central store
      set({ gotJob: gotJobAnswer });

      if (gotJobAnswer === "yes") {
        // Go to job-source step
        const jobSourceIndex = steps.findIndex((s) => s.id === "job-source");
        if (jobSourceIndex !== -1) {
          set({ currentStep: jobSourceIndex + 1 });
        }
      } else if (gotJobAnswer === "no") {
        // Check variant to determine next step
        if (downsellVariant === "B") {
          // Variant B: Show downsell offer
          const downsellIndex = steps.findIndex(
            (s) => s.id === "downsell-offer-check"
          );
          if (downsellIndex !== -1) {
            set({ currentStep: downsellIndex + 1 });
          }
        } else {
          // Variant A: Skip downsell offer, go directly to usage-feedback
          const usageFeedbackIndex = steps.findIndex(
            (s) => s.id === "usage-feedback"
          );
          if (usageFeedbackIndex !== -1) {
            set({ currentStep: usageFeedbackIndex + 1 });
          }
        }
      }
    },

    // A/B Testing and flow reset
    // IMPORTANT: Once a variant is set for a user, it should NEVER be updated
    // Variants are only generated for new users with no cancellation records
    initializeFlow: async (userId: string, downsellVariant?: "A" | "B") => {
      // Try to load existing variant from database first
      try {
        const result = await CancellationService.getCancellation(userId);
        if (result.success && result.data && result.data.length > 0) {
          const cancellationData = result.data[0];
          if (cancellationData.downsell_variant) {
            // Use existing variant from database - NEVER change this
            set({
              downsellVariant: cancellationData.downsell_variant,
              currentStep: 1,
              errors: {},
              savedData: null,
            });
            console.log(
              `Flow initialized for user ${userId} with existing variant ${cancellationData.downsell_variant} from database`
            );
            return;
          }
        }
      } catch (error) {
        console.warn("Failed to load existing variant from database:", error);
      }

      // No existing variant found in database, generate new one using A/B testing
      // This should only happen for completely new users
      const variant = generateDeterministicVariant(userId);

      // Set the variant and reset flow to the 'got-job' step
      set({
        downsellVariant: downsellVariant || variant,
        currentStep: 1,
        errors: {},
        savedData: null,
        // Reset core business fields
        gotJob: null,
        cancelReason: null,
        companyVisaSupport: null,
        acceptedDownsell: false,
        finalDecision: null,
      });

      // Save the newly assigned variant to database
      try {
        console.log(
          `Saving new variant ${variant} to database for user ${userId}`
        );
        await CancellationService.saveCancellation({
          userId,
          subscriptionId: userId, // Using userId as subscriptionId for now
          downsellVariant: downsellVariant || variant,
          flowData: {},
          currentStep: 1,
          completed: false,
        });
        console.log(
          `New variant ${variant} generated and saved to database for user ${userId}`
        );
      } catch (error) {
        console.warn("Failed to save new variant to database:", error);
      }

      console.log(
        `Flow initialized for user ${userId} with new variant ${variant}`
      );
    },

    resetFlow: () => {
      set({
        currentStep: 1,
        savedData: null,
        errors: {},
        // Reset core business fields
        gotJob: null,
        cancelReason: null,
        companyVisaSupport: null,
        acceptedDownsell: false,
        finalDecision: null,
      });
    },
  }))
);
