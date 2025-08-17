# Cancellation Flow Task - Enhanced Implementation

## 🎯 Overview

This project implements a comprehensive cancellation flow system with A/B testing, dynamic pricing, conditional branching, and advanced state management. The system provides a sophisticated user experience for subscription cancellation with intelligent offer management and data persistence.

## ✨ Features Implemented

### **Core Functionality**

- **Multi-step Cancellation Flow** with conditional branching
- **A/B Testing System** with deterministic variant assignment
- **Dynamic Pricing** with $10 off offers
- **Conditional Questions** with smart data collection
- **State Management** using Zustand
- **Database Integration** with Supabase
- **Responsive UI** with modern design

### **Advanced Features**

- **Flow-Aware Step Indicator** that counts only relevant steps
- **Variable Replacement System** for dynamic content
- **Hybrid Database Schema** with core fields and JSONB storage
- **Conditional Branching** based on user answers
- **Offer Tracking** with acceptance/decline logging
- **Mock Data Services** for development and testing

## 🚀 Quick Start

### **Prerequisites**

- Node.js 18+
- npm or yarn
- Supabase account and project

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd cancel-flow-task-main

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### **Environment Variables**

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### **Database Setup**

```bash
# Run the seed script in your Supabase SQL editor
# Copy and paste the contents of seed.sql
```

### **Development**

```bash
# Start development server
npm run dev

# Open http://localhost:3000 (or the port shown in terminal)
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── subscription/
│   │   │   ├── [subscriptionId]/cancellation/route.ts
│   │   │   └── offer/route.ts
│   │   └── page.tsx
├── component/
│   ├── profile/
│   │   ├── core/
│   │   │   └── CancellationDialog.tsx
│   │   ├── layout/
│   │   │   ├── LeftPanel.tsx
│   │   │   └── RightPanel.tsx
│   │   ├── questions/
│   │   │   ├── TextQuestion.tsx
│   │   │   ├── TextareaQuestion.tsx
│   │   │   ├── ButtonOptionsQuestion.tsx
│   │   │   ├── RadioConditionalQuestion.tsx
│   │   │   ├── ConditionalQuestions.tsx
│   │   │   ├── QuestionSection.tsx
│   │   │   └── index.ts
│   │   ├── ui/
│   │   │   ├── ActionButtons.tsx
│   │   │   └── StepIndicator.tsx
│   │   └── index.tsx
│   └── ui/
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── markdown.tsx
│       └── step-indicator.tsx
├── lib/
│   ├── abTestingUtils.ts
│   ├── cancellationFlow.ts
│   ├── cancellationSchemas.ts
│   ├── cancellationService.ts
│   └── subscriptionService.ts
├── store/
│   └── cancellationStore.ts
└── types/
    └── index.ts
```

## 🔄 Cancellation Flow

### **Flow A: Got Job (3 steps)**

1. **job-source** - Job search feedback
2. **help-feedback** - Improvement suggestions
3. **visa-status** - Visa support questions
4. **visa-type-company** - Visa type details
5. **all-done** - Completion

### **Flow B: Still Looking (3 steps)**

1. **downsell-offer-check** - $10 off offer (Variant B only)
2. **usage-feedback** - Platform usage feedback
3. **cancel-reason** - Cancellation reason
4. **cancel-confirmation** - Final confirmation

## 🧪 A/B Testing

### **Variant Distribution**

- **Variant A (50%)**: No downsell offer, direct to feedback
- **Variant B (50%)**: Shows $10 off downsell offer

### **Implementation Details**

- **Deterministic Assignment**: Same user always gets same variant
- **Cryptographically Secure**: Uses `crypto.getRandomValues()`
- **Persistent Storage**: Variants saved to `cancellations.downsell_variant`
- **No Re-randomization**: Variants never change once assigned

### **Usage**

```typescript
import { getOrAssignVariant } from "@/lib/abTestingUtils";

// Get or assign variant for user
const variant = getOrAssignVariant(userId, existingVariant);
```

## 💰 Dynamic Pricing

### **Offer Structure**

- **Fixed Discount**: $10 off monthly subscription
- **Dynamic Calculation**: Automatically calculates offer price
- **Variable Replacement**: Supports `${offer_price}`, `${monthly_price}`

### **Example Pricing**

- **$25/month** → **$15/month** ($10 off)
- **$29/month** → **$19/month** ($10 off)
- **$15/month** → **$5/month** ($10 off)

### **Implementation**

```typescript
import { SubscriptionService } from "@/lib/subscriptionService";

// Format offer price
const offerPrice = SubscriptionService.formatOfferPrice(monthlyPrice);

// Replace variables in text
const dynamicText = SubscriptionService.replaceVariablesInText(
  "Get $10 off | ${offer_price} ~~${monthly_price}~~",
  subscription
);
```

## 🗄️ Database Schema

### **Tables**

#### **cancellations**

```sql
CREATE TABLE cancellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  downsell_variant TEXT NOT NULL,
  got_job BOOLEAN,
  cancel_reason TEXT,
  company_visa_support BOOLEAN,
  accepted_downsell BOOLEAN,
  final_decision TEXT,
  flow_data JSONB,
  current_step INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **subscriptions**

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  monthly_price INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  offer_percent INTEGER DEFAULT 0,
  offer_accepted BOOLEAN,
  offer_accepted_at TIMESTAMP,
  offer_declined_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Hybrid Storage Approach**

- **Core Business Fields**: Stored as individual columns for analytics
- **Detailed Flow Data**: Stored as JSONB for flexibility
- **Performance**: Indexed on frequently queried fields

## 🔌 API Endpoints

### **Cancellation Management**

```typescript
// Save cancellation data
POST /api/subscription/[subscriptionId]/cancellation

// Get cancellation data
GET /api/subscription/[subscriptionId]/cancellation?userId=[userId]
```

### **Offer Management**

```typescript
// Update offer status
PUT / api / subscription / offer;

// Get offer status
GET / api / subscription / offer;
```

## 🎨 UI Components

### **Question Types**

- **Text Input**: Single line text with validation
- **Textarea**: Multi-line text with character limits
- **Button Options**: Grid of selectable buttons
- **Radio Conditional**: Radio buttons with follow-up questions

### **Conditional Questions**

- **Smart Display**: Shows based on parent answer
- **Dynamic Inputs**: Adapts input type based on question
- **Data Persistence**: Stores answers in structured format

### **Step Indicator**

- **Flow-Aware Counting**: Only counts relevant steps
- **Dynamic Positioning**: Shows current position in flow
- **Excludes Non-Flow Steps**: Doesn't count offer/additional steps

## 📱 State Management

### **Zustand Store**

```typescript
interface CancellationStore {
  currentStep: number;
  steps: Step[];
  downsellVariant: "A" | "B";
  errors: Record<string, string>;

  // Navigation
  goToStep: (stepNumber: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // A/B Testing
  initializeFlow: (userId: string) => void;
  resetFlow: () => void;

  // Data Management
  saveFlowData: (userId: string, subscriptionId: string) => Promise<boolean>;
  loadFlowData: (userId: string, subscriptionId?: string) => Promise<boolean>;
}
```

### **Key Features**

- **Automatic Flow Reset**: Starts from `got-job` step when reopened
- **Variant Persistence**: Maintains A/B test assignments
- **Error Handling**: Comprehensive validation and error management
- **Conditional Logic**: Smart branching based on user answers

## 🧪 Testing

### **Manual Testing**

1. **Open Cancellation Dialog**: Click "Cancel Migrate Mate" button
2. **Navigate Through Flow**: Complete each step
3. **Test A/B Variants**: Check both Variant A and B behavior
4. **Test Conditional Questions**: Answer questions to trigger follow-ups
5. **Test Flow Reset**: Close and reopen dialog

### **A/B Testing Verification**

```typescript
// Check variant assignment
console.log("Current variant:", store.downsellVariant);

// Verify variant consistency
const variant1 = getOrAssignVariant(userId);
const variant2 = getOrAssignVariant(userId);
console.log("Variant consistency:", variant1 === variant2); // Should be true
```

### **Database Verification**

```sql
-- Check variant distribution
SELECT downsell_variant, COUNT(*)
FROM cancellations
GROUP BY downsell_variant;

-- Check offer acceptance rates
SELECT
  downsell_variant,
  COUNT(*) as total,
  COUNT(CASE WHEN accepted_downsell = true THEN 1 END) as accepted
FROM cancellations
GROUP BY downsell_variant;
```

## 🚀 Deployment

### **Production Setup**

1. **Environment Variables**: Set production Supabase credentials
2. **Database Migration**: Run seed.sql in production database
3. **Build Application**: `npm run build`
4. **Deploy**: Deploy to your hosting platform

### **Environment Configuration**

```bash
# Production
NODE_ENV=production
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

## 📚 Additional Documentation

- **AB_TESTING_IMPLEMENTATION.md**: Detailed A/B testing implementation
- **OFFER_PRICING_REFACTORING.md**: Pricing model changes
- **PREV_STEP_ID_REFACTORING.md**: Navigation improvements
- **CONDITIONAL_QUESTIONS_FIX.md**: Question system fixes

## 🤝 Contributing

### **Development Workflow**

1. **Feature Branch**: Create branch for new features
2. **Implementation**: Follow existing code patterns
3. **Testing**: Test all scenarios manually
4. **Documentation**: Update relevant documentation
5. **Pull Request**: Submit for review

### **Code Standards**

- **TypeScript**: Use strict typing
- **Components**: Follow React functional component pattern
- **State Management**: Use Zustand for global state
- **Styling**: Use Tailwind CSS classes
- **Error Handling**: Implement comprehensive error handling

## 🐛 Troubleshooting

### **Common Issues**

#### **Variant Not Showing**

- Check `downsellVariant` in store
- Verify user is assigned to Variant B
- Check console for A/B testing logs

#### **Flow Not Starting from Beginning**

- Ensure `resetFlow()` is called on dialog close
- Check `initializeFlow()` is called on dialog open
- Verify `currentStep` is reset to 1

#### **Database Connection Issues**

- Verify Supabase credentials
- Check environment variables
- Ensure database tables exist

#### **Conditional Questions Not Displaying**

- Check question type is `radio-conditional`
- Verify parent question has answer
- Check `conditionalQuestions` configuration

### **Debug Mode**

```typescript
// Enable debug logging
console.log("Current step:", store.currentStep);
console.log("Current variant:", store.downsellVariant);
console.log("Step data:", store.steps[store.currentStep - 1]);
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js** for the React framework
- **Zustand** for state management
- **Supabase** for backend services
- **Tailwind CSS** for styling
- **Lucide React** for icons

---

**The cancellation flow system is now fully implemented with advanced features including A/B testing, dynamic pricing, conditional branching, and comprehensive state management!** 🎉

## 🔄 Cancellation Flow Implementation

### **Flow Architecture & Design**

The cancellation flow is built using a **step-based architecture** with **conditional branching** and **variant-aware navigation**. The system intelligently routes users through different paths based on their answers and assigned A/B testing variant.

#### **Core Flow Structure**

```typescript
// Each step in the flow contains:
interface Step {
  id: string; // Unique identifier
  number?: number; // Step number in flow sequence
  heading: string; // Main heading text
  description: string; // Step description
  questions: Question[]; // Questions to collect data
  buttons: Button[]; // Action buttons
  prevStepId?: string; // Previous step for back navigation
  conditionalBranches?: ConditionalBranch[]; // Dynamic routing logic
}
```

#### **Flow Navigation Logic**

```typescript
// Smart navigation based on user answers and variant
const handleGotJobBranch = (gotJobAnswer: "yes" | "no") => {
  if (gotJobAnswer === "yes") {
    // Flow A: User found a job
    goToStep("job-source");
  } else if (gotJobAnswer === "no") {
    // Flow B: User still looking
    if (downsellVariant === "B") {
      goToStep("downsell-offer-check"); // Show offer
    } else {
      goToStep("usage-feedback"); // Skip offer
    }
  }
};
```

### **State Management with Zustand**

The application uses **Zustand** for centralized state management, providing a clean and efficient way to handle complex flow state, user answers, and navigation logic.

#### **Store Structure**

```typescript
interface CancellationStore {
  // Core State
  currentStep: number; // Current step index
  steps: Step[]; // All flow steps
  downsellVariant: "A" | "B"; // A/B testing variant
  errors: Record<string, string>; // Validation errors

  // Navigation Methods
  goToStep: (stepNumber: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // State Management
  setAnswer: (stepId: string, questionId: string, answer: any) => void;
  setError: (questionId: string, error: string | undefined) => void;

  // A/B Testing & Flow Control
  initializeFlow: (userId: string) => Promise<void>;
  resetFlow: () => void;
  handleGotJobBranch: (gotJobAnswer: "yes" | "no") => void;

  // Data Persistence
  saveFlowData: (userId: string, subscriptionId: string) => Promise<boolean>;
  loadFlowData: (userId: string, subscriptionId?: string) => Promise<boolean>;
}
```

#### **Key State Management Features**

**1. Automatic Flow Reset**

```typescript
// Flow always starts from 'got-job' step when reopened
useEffect(() => {
  if (isOpen) {
    initializeFlow(mockUserId); // Reset to step 1
  }
}, [isOpen]);
```

**2. Variant Persistence**

```typescript
// Variants are loaded from database and never re-randomized
const variant = await loadExistingVariant(userId);
if (!variant) {
  const newVariant = generateSecureVariant();
  await saveVariantToDatabase(userId, newVariant);
}
```

**3. Smart Answer Storage**

```typescript
// Answers are stored with proper structure for database persistence
setAnswer(stepId, questionId, answer) {
  const stepIndex = steps.findIndex(s => s.id === stepId);
  if (stepIndex !== -1) {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      questions: updatedSteps[stepIndex].questions.map(q =>
        q.id === questionId ? { ...q, answer } : q
      )
    };
    set({ steps: updatedSteps });
  }
}
```

**4. Conditional Question Handling**

```typescript
// Conditional questions are stored in a separate structure
conditionalAnswers: {
  [`${parentQuestionId}_${conditionalQuestionId}`]: answer
}
```

### **Database Integration & Updates**

The system uses a **hybrid approach** for data storage, combining individual columns for core business fields with JSONB for detailed flow data. **Database updates occur only at the end of the flow** to ensure data consistency and user experience.

#### **Database Schema Design**

**Hybrid Storage Strategy:**

- **Core Business Fields**: Stored as individual columns for analytics and reporting
- **Detailed Flow Data**: Stored as JSONB for flexibility and future extensibility
- **Performance Optimized**: Indexed on frequently queried fields

```sql
CREATE TABLE cancellations (
  -- Core Business Fields (Individual Columns)
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  downsell_variant TEXT NOT NULL,
  got_job BOOLEAN,
  cancel_reason TEXT,
  company_visa_support BOOLEAN,
  accepted_downsell BOOLEAN,
  final_decision TEXT,

  -- Detailed Flow Data (JSONB)
  flow_data JSONB,
  current_step INTEGER,
  completed BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Data Flow Architecture**

**1. Real-time State Management**

```typescript
// User answers are stored in Zustand store immediately
setAnswer(stepId, questionId, answer);
// No database calls during flow progression
```

**2. End-of-Flow Persistence**

```typescript
// Database update only happens when flow is completed
const saveFinalCancellation = async () => {
  const success = await saveFlowData(mockUserId, mockSubscriptionId);
  if (success) {
    onClose(); // Close dialog after successful save
  }
};
```

**3. Comprehensive Data Collection**

```typescript
// All flow data is collected and structured for database storage
const flowData = {
  steps: steps.map((step) => ({
    id: step.id,
    questions: step.questions.map((q) => ({
      id: q.id,
      answer: q.answer,
      conditionalAnswers: step.conditionalAnswers || {},
    })),
  })),
  navigation: {
    variant: downsellVariant,
    flowPath: getCurrentFlowPath(),
    totalSteps: getCurrentFlowSteps().length,
  },
};
```

#### **API Endpoints & Data Flow**

**1. Save Cancellation Data**

```typescript
POST /api/subscription/[subscriptionId]/cancellation
{
  "userId": "user-uuid",
  "subscriptionId": "subscription-uuid",
  "downsellVariant": "A" | "B",
  "flowData": {
    // Complete flow response data
  },
  "currentStep": 5,
  "completed": true
}
```

**2. Load Existing Data**

```typescript
GET /api/subscription/[subscriptionId]/cancellation?userId=[userId]
// Returns existing cancellation data with variant and flow state
```

**3. Data Transformation Pipeline**

```typescript
// Raw store data → Structured database format
const extractFlowData = (steps: Step[]) => {
  const coreFields = {
    gotJob: extractGotJobAnswer(steps),
    cancelReason: extractCancelReason(steps),
    companyVisaSupport: extractVisaSupport(steps),
  };

  const flowData = {
    steps: steps.map((step) => ({
      id: step.id,
      questions: step.questions,
      conditionalAnswers: step.conditionalAnswers || {},
    })),
  };

  return { coreFields, flowData };
};
```

### **Flow Control & Navigation**

#### **Step-by-Step Navigation**

```typescript
// Each step can define its own navigation logic
const step = {
  id: "visa-type-company",
  conditionalBranches: [
    {
      condition: {
        stepId: "visa-type-company",
        questionId: "companyVisaSupport",
        value: "yes",
      },
      nextStepId: "all-done",
    },
    {
      condition: {
        stepId: "visa-type-company",
        questionId: "companyVisaSupport",
        value: "no",
      },
      nextStepId: "all-done-visa-support",
    },
  ],
};
```

#### **Back Navigation System**

```typescript
// Back navigation uses prevStepId from step configuration
const prevStep = () => {
  const currentStepData = steps[currentStep - 1];
  if (currentStepData?.prevStepId) {
    const prevStepIndex = steps.findIndex(
      (step) => step.id === currentStepData.prevStepId
    );
    if (prevStepIndex !== -1) {
      set({ currentStep: prevStepIndex + 1 });
    }
  }
};
```

#### **Flow-Aware Step Indicator**

```typescript
// Step indicator only counts relevant flow steps
const getCurrentFlowSteps = () => {
  return steps.filter(
    (step) =>
      step.number && step.id !== "got-job" && step.id !== "downsell-offer-check"
  );
};

const getCurrentStepPosition = () => {
  const flowSteps = getCurrentFlowSteps();
  const currentFlowStep = flowSteps.find(
    (step) => steps[currentStep - 1]?.id === step.id
  );
  return currentFlowStep ? flowSteps.indexOf(currentFlowStep) + 1 : 0;
};
```

### **Error Handling & Validation**

#### **Real-time Validation**

```typescript
// Validation occurs before step progression
const validateStep = () => {
  const newErrors: Record<string, string> = {};

  step.questions?.forEach((question) => {
    if (question.required) {
      if (!question.answer || question.answer.trim() === "") {
        newErrors[question.id] = "This field is required";
      } else if (question.type === "textarea" && question.maxLength) {
        const minChars = 25;
        if (question.answer.trim().length < minChars) {
          newErrors[
            question.id
          ] = `Please enter at least ${minChars} characters`;
        }
      }
    }
  });

  return Object.keys(newErrors).length === 0;
};
```

#### **Button State Management**

```typescript
// Buttons are disabled until validation passes
const isButtonDisabled = (button: Button) => {
  if (button.disabledUntil) {
    return button.disabledUntil.some((questionId) => {
      const question = step.questions?.find((q) => q.id === questionId);
      return !isQuestionValid(question);
    });
  }
  return false;
};
```

### **Performance & User Experience**

#### **Optimized State Updates**

- **Minimal Re-renders**: Zustand's selective subscriptions prevent unnecessary component updates
- **Efficient Navigation**: Step transitions use direct index-based navigation
- **Memory Management**: Flow state is reset when dialog closes

#### **User Experience Features**

- **Progress Persistence**: Users can navigate back and forth without losing answers
- **Smart Validation**: Real-time feedback on form completion
- **Responsive Design**: Mobile-optimized interface with touch-friendly controls
- **Accessibility**: Proper ARIA labels and keyboard navigation support

#### **Data Consistency**

- **Single Source of Truth**: All flow state managed in Zustand store
- **Atomic Updates**: Database updates happen in single transaction at flow completion
- **Error Recovery**: Failed saves can be retried without data loss
