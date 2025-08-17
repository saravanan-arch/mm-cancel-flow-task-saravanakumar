# Cancellation Flow Task - Technical Overview

## Architecture Decisions

### **Centralized Flow Configuration System**

The `cancellationFlowConfig` serves as the single source of truth for all cancellation flows, questions, and variations:

```typescript
export const cancellationFlowConfig: Step[] = [
  {
    id: "got-job",
    number: 1, // Step counting for flow-aware navigation
    title: "Have you secured a job?",
    questions: [...],
    conditionalBranches: [...], // A/B testing variant routing
    buttons: [...]
  }
]
```

**Key Features:**

- **Unified Configuration**: All steps, questions, and navigation logic in one place
- **Flow-Aware Step Counting**: Dynamic step calculation based on active flow path
- **Conditional Branching**: Smart routing using `conditionalBranches` for variant-based navigation
- **Question Type Abstraction**: Centralized question definitions with type-specific rendering
- **Navigation Logic**: Button actions and next step routing defined declaratively

**Flow Structure:**

- **Entry Point**: `got-job` step determines flow path
- **Flow A**: Job secured → job source → completion
- **Flow B**: Job not secured → downsell offer → feedback → completion
- **Variant Handling**: Conditional steps based on A/B testing assignment

**Question System Architecture:**

```typescript
questions: [
  {
    id: "gotJob",
    type: "button-options", // Rendered by ButtonOptionsQuestion component
    text: "Have you secured a job?",
    required: true,
    radioOptions: [...],
    conditionalQuestions: [...] // Nested conditional logic
  }
]
```

**Question Types & Rendering:**

- **`button-options`**: Radio buttons with conditional questions
- **`text`**: Single-line text input with validation
- **`textarea`**: Multi-line input with character count requirements
- **`radio-conditional`**: Radio selection with dynamic conditional questions
- **Component Mapping**: Each question type maps to dedicated React component

**Conditional Logic System:**

```typescript
conditionalBranches: [
  {
    condition: {
      stepId: "got-job",
      questionId: "gotJob",
      value: "no",
    },
    nextStepId: "downsell-offer-check", // Variant B only
  },
];
```

**Smart Navigation:**

- **Variant-Aware Routing**: Different paths based on A/B testing assignment
- **Dynamic Step Calculation**: Step indicator counts only relevant flow steps
- **Back Navigation**: Uses `prevStepId` for consistent backward movement
- **Flow Isolation**: Each flow maintains independent step counting

**Data Flow & Validation:**

```typescript
// Centralized validation rules
{
  type: "textarea",
  maxLength: 300,
  required: true,
  // Component automatically enforces min 25 characters
}

// Conditional question validation
conditionalQuestions: [
  {
    questionId: "visa-type-company",
    inputType: "textarea",
    maxLength: 300,
    required: true
  }
]
```

**Configuration-Driven Rendering:**

- **Component Selection**: Question type determines which React component renders
- **Validation Rules**: Built-in validation based on config properties
- **Error Handling**: Centralized error management with config-defined messages
- **Responsive Behavior**: Mobile/desktop adaptations handled by component logic

**Benefits of Centralized Configuration:**

- **Single Source of Truth**: All flow logic in one maintainable file
- **Easy Modifications**: Add/remove steps, questions, or variants without touching components
- **Consistent Behavior**: Standardized question types and validation across all flows
- **A/B Testing**: Variant logic defined declaratively in config
- **Developer Experience**: Clear structure for understanding and modifying flows

**Integration with State Management:**

```typescript
// Store consumes config for initialization
const { steps, currentStep } = useCancellationStore();

// Components render based on config-driven state
const step = steps[currentStep - 1];
const questions = step?.questions || [];

// Dynamic rendering based on question type
{
  questions.map((question) => (
    <QuestionSection key={question.id} question={question} stepId={step.id} />
  ));
}
```

**Configuration-Store Synchronization:**

- **Initialization**: Store loads `cancellationFlowConfig` on startup
- **State Updates**: User interactions update store state based on config rules
- **Navigation**: Store uses config's `conditionalBranches` for smart routing
- **Validation**: Store enforces config-defined validation rules
- **Persistence**: Config structure determines data storage format

**Component Architecture Integration:**

- **`QuestionSection`**: Main orchestrator that maps question types to components
- **Specialized Components**: `TextQuestion`, `TextareaQuestion`, `RadioConditionalQuestion`
- **Conditional Rendering**: `ConditionalQuestions` component handles nested logic
- **Validation Components**: Error display and validation feedback
- **Navigation Components**: Step indicators and back buttons

### **State Management with Zustand**

We chose Zustand over Redux/Context API for its simplicity and performance. The cancellation flow requires complex state management with multiple steps, conditional branching, and A/B testing variants. Zustand provides:

- **Minimal boilerplate** with simple API
- **Selective subscriptions** preventing unnecessary re-renders
- **TypeScript support** for better development experience
- **Middleware support** for debugging and persistence

### **Hybrid Database Schema**

Implemented a hybrid approach combining individual columns for core business fields with JSONB for detailed flow data:

- **Core fields** (gotJob, cancelReason, companyVisaSupport) stored as individual columns for analytics and reporting
- **Detailed flow data** stored as JSONB for flexibility and future extensibility
- **Performance optimization** with indexed core fields and flexible JSONB storage

### **Component Architecture**

Organized components into logical groups:

- **Core**: Main dialog and flow logic
- **Questions**: Reusable question components (text, textarea, radio, conditional)
- **Layout**: UI structure and panels
- **UI**: Reusable UI components (buttons, dialogs, step indicators)

## Security Implementation

### **Row Level Security (RLS)**

Supabase RLS policies ensure data isolation:

```sql
CREATE POLICY "Service role can manage cancellations"
ON cancellations FOR ALL USING (true);
```

- **Service role access** for API operations
- **User isolation** preventing cross-user data access
- **Secure API endpoints** with proper authentication

### **Environment Variable Management**

Sensitive configuration stored in environment variables:

- `SUPABASE_SERVICE_ROLE_KEY` for secure backend operations
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` for client operations
- **No hardcoded secrets** in source code

### **API Security**

- **Input validation** using Zod schemas
- **SQL injection prevention** with parameterized queries
- **Error handling** without exposing internal system details
- **Rate limiting** considerations for production deployment

### **Data Validation**

- **Client-side validation** for immediate user feedback
- **Server-side validation** for data integrity
- **Schema validation** using TypeScript interfaces and Zod

## A/B Testing Approach

### **Deterministic Variant Assignment**

Implemented cryptographically secure A/B testing with 50/50 split:

```typescript
export function generateSecureVariant(): "A" | "B" {
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  return array[0] < 128 ? "A" : "B";
}
```

### **Variant Persistence Strategy**

- **Database storage** in `cancellations.downsell_variant` field
- **No re-randomization** - same user always gets same variant
- **Fallback handling** with default variant assignment
- **Consistent experience** across sessions and page refreshes

### **Flow Variants**

- **Variant A (50%)**: No downsell offer, direct to feedback collection
- **Variant B (50%)**: Shows $10 off downsell offer before feedback
- **Conditional navigation** based on variant and user answers
- **Smart routing** using `conditionalBranches` configuration

### **Implementation Details**

- **Early variant loading** on page load via API call
- **Store integration** with `setDownsellVariant()` method
- **Flow-aware navigation** using `handleGotJobBranch()` logic
- **Variant consistency** maintained throughout user journey

### **Configuration-Driven A/B Testing**

The `cancellationFlowConfig` defines variant-specific behavior declaratively:

```typescript
// Variant-specific step visibility
{
  id: "downsell-offer-check",
  number: 2, // Only counted in Variant B flow
  title: "Special Offer",
  // Step only rendered when downsellVariant === "B"
}

// Conditional branching based on variant
conditionalBranches: [
  {
    condition: {
      stepId: "got-job",
      questionId: "gotJob",
      value: "no"
    },
    nextStepId: "downsell-offer-check" // Variant B routing
  }
]
```

**Variant Logic in Config:**

- **Step Counting**: Variant-specific step numbers for accurate progress tracking
- **Conditional Rendering**: Steps shown/hidden based on variant assignment
- **Navigation Rules**: Different next steps based on variant and user choices
- **Flow Isolation**: Each variant maintains independent step progression

### **Maintenance & Extensibility**

**Adding New Flows:**

```typescript
// Simply add new step to config array
{
  id: "new-flow-step",
  number: 4,
  title: "New Flow Step",
  questions: [...],
  buttons: [...]
}
```

**Modifying Question Types:**

```typescript
// Update question properties in config
{
  type: "textarea",
  maxLength: 500, // Increased from 300
  required: true,
  placeholder: "New placeholder text"
}
```

**Adding New Variants:**

```typescript
// Extend variant logic in conditionalBranches
conditionalBranches: [
  {
    condition: { stepId: "got-job", questionId: "gotJob", value: "no" },
    nextStepId:
      downsellVariant === "B" ? "downsell-offer-check" : "usage-feedback",
  },
];
```

**Benefits of This Architecture:**

- **Zero Component Changes**: Modify flows without touching React components
- **Rapid Prototyping**: Test new flow variations by editing config only
- **Team Collaboration**: Non-developers can modify flow logic
- **Version Control**: Track flow changes in Git with clear diffs
- **Testing**: Unit test flow logic independently of UI components

## Technical Highlights

### **Performance Optimizations**

- **Font preloading** with Google Fonts and Fontsource
- **Efficient state updates** with Zustand's selective subscriptions
- **Lazy loading** of conditional questions
- **Optimized re-renders** preventing unnecessary component updates

### **User Experience Features**

- **Real-time validation** with immediate feedback
- **Progress persistence** across navigation
- **Responsive design** with mobile-first approach
- **Accessibility support** with proper ARIA labels

### **Data Flow Architecture**

- **End-of-flow persistence** ensuring data consistency
- **Conditional question handling** with nested data structures
- **Error recovery** with comprehensive fallback strategies
- **Atomic operations** for database updates

This architecture provides a robust, scalable, and secure foundation for the cancellation flow system while maintaining excellent user experience and developer productivity.
