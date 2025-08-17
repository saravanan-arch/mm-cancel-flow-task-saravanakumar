export interface CancellationFlowData {
  // Flow A: Got Job path
  gotJob?: 'yes' | 'no';
  jobSource?: string;
  helpFeedback?: string;
  companyVisaSupport?: 'yes' | 'no';
  
  // Flow B: Still Looking path
  downsellAccepted?: boolean;
  cancelReason?: string;
  
  // Conditional questions based on cancel reason
  'cancelReason_too-expensive-feedback'?: string;
  'cancelReason_platform-not-helpful-feedback'?: string;
  'cancelReason_not-enough-jobs-feedback'?: string;
  'cancelReason_decided-not-to-move-feedback'?: string;
  'cancelReason_other-feedback'?: string;
  
  // Additional metadata
  acceptedDownsell?: boolean;
  finalDecision?: 'cancelled' | 'kept';
  
  // Offer details
  offerPercent?: number;
  offerAccepted?: boolean;
}

export interface SaveCancellationRequest {
  userId: string;
  subscriptionId: string;
  downsellVariant: 'A' | 'B';
  flowData: CancellationFlowData;
  currentStep: number;
  completed: boolean;
  
  // Core business fields for individual columns
  gotJob?: 'yes' | 'no';
  cancelReason?: string;
  companyVisaSupport?: 'yes' | 'no';
  acceptedDownsell?: boolean;
  finalDecision?: 'cancelled' | 'kept';
}

export interface SaveCancellationResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface UpdateSubscriptionOfferRequest {
  userId: string;
  subscriptionId: string;
  offerAccepted: boolean;
  offerPercent: number;
}

// New interfaces for conditional branching
export interface ConditionalBranch {
  condition: {
    stepId: string;
    questionId: string;
    value: string;
  };
  nextStepId: string;
}

export interface StepConfig {
  id: string;
  number?: number;
  heading: string;
  description?: string;
  subHeading?: string;
  branchKey?: string;
  questions?: any[];
  buttons?: any[];
  offerButton?: any;
  showOfferButton?: boolean;
  hideImageOnMobile?: boolean;
  conditionalBranches?: ConditionalBranch[];
}

export class CancellationService {
  private static readonly API_BASE = '/api/subscription/';

  /**
   * Save final cancellation data (called only on completion)
   */
  static async saveCancellation(request: SaveCancellationRequest): Promise<SaveCancellationResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/${request.subscriptionId}/cancellation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to save cancellation data',
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Error saving cancellation data:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  /**
   * Get cancellation data for a user
   */
  static async getCancellation(userId: string, subscriptionId?: string): Promise<SaveCancellationResponse> {
    try {
      if (!subscriptionId) {
        return {
          success: false,
          error: 'Subscription ID is required for fetching cancellation data',
        };
      }

      const response = await fetch(`${this.API_BASE}${subscriptionId}/cancellation?userId=${userId}`);

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to fetch cancellation data',
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Error fetching cancellation data:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  /**
   * Update subscription offer status
   */
  static async updateSubscriptionOffer(request: UpdateSubscriptionOfferRequest): Promise<SaveCancellationResponse> {
    try {
      const response = await fetch('/api/subscription/offer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to update subscription offer',
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Error updating subscription offer:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  /**
   * Extract flow data from store state
   */
  static extractFlowData(steps: any[], downsellVariant: 'A' | 'B'): CancellationFlowData {
    const flowData: CancellationFlowData = {};

    steps.forEach((step) => {
      if (step.questions) {
        step.questions.forEach((question: any) => {
          if (question.answer !== undefined) {
            // Store main question answers
            flowData[question.id as keyof CancellationFlowData] = question.answer;
          }
        });
      }

      // Store conditional question answers from the new structure
      if (step.conditionalAnswers) {
        Object.keys(step.conditionalAnswers).forEach((key) => {
          if (step.conditionalAnswers[key] !== undefined) {
            flowData[key as keyof CancellationFlowData] = step.conditionalAnswers[key];
          }
        });
      }

      // Legacy support for old structure (remove this after migration)
      Object.keys(step).forEach((key) => {
        if (key.includes('_') && step[key] !== undefined && !step.conditionalAnswers) {
          flowData[key as keyof CancellationFlowData] = step[key];
        }
      });
    });

    return flowData;
  }

  /**
   * Extract core business fields from flow data for individual columns
   */
  static extractCoreFields(flowData: CancellationFlowData): {
    gotJob: 'yes' | 'no' | null;
    cancelReason: string | null;
    companyVisaSupport: 'yes' | 'no' | null;
    acceptedDownsell: boolean;
    finalDecision: 'cancelled' | 'kept' | null;
  } {
    return {
      gotJob: flowData.gotJob || null,
      cancelReason: flowData.cancelReason || null,
      companyVisaSupport: flowData.companyVisaSupport || null,
      acceptedDownsell: flowData.acceptedDownsell || false,
      finalDecision: flowData.finalDecision || null
    };
  }
}
