// config/cancellationFlow.ts
import type { Step } from "@/lib/cancellationSchemas";

export const offerButton = {
  id: "discount-offer",
  label: "*Get $10 off | ${offer_price}* ~<sub>${monthly_price}</sub>~",
  style: "accent",
  action: "next",
  nextStepId: "continue-subscription",
  color: "green",
}

export const cancellationFlowConfig: Step[] = [
  // Initial branching step
  {
    id: "got-job",
    number: 1,
    heading: "Hey mate,<br />Quick one before you go.",
    heading2: "<i>Have you found a job yet?</i>",
    description: "Whatever your answer, we just want to help you take the next step. With visa support, or by hearing how we can do better.",
    branchKey: "gotJob",
    questions: [],
    buttons: [
      {
        id: "got-job-yes",
        label: "Yes, I've found a job",
        style: "plain",
        action: "branch",
        nextStepId: "job-source",
      },
      {
        id: "got-job-no",
        label: "Not yet – I'm still looking",
        style: "plain",
        action: "branch",
        nextStepId: "usage-feedback", // Default route, will be overridden by conditional logic
      },
    ],
    // Conditional branching based on downsell variant
    conditionalBranches: [
      {
        condition: {
          stepId: "got-job",
          questionId: "gotJob",
          value: "no"
        },
        nextStepId: "downsell-offer-check" // Show downsell offer for Variant B
      }
    ],
    hideImageOnMobile: false,
  },

  // ---------- Flow A: Got Job (3 steps) ----------
  {
    id: "job-source",
    number: 1, // Step 1 of Flow A
    heading: "Congrats on the new role! 🎉",
    description: "",
    branchKey: "jobViaMM",
    prevStepId: "got-job",
    questions: [
      { 
        id: "jobViaMM", 
        text: "Did you find this job with Migrate Mate?*", 
        type: "button-options", 
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" }
        ]
      },
      { 
        id: "jobsAppliedViaMM", 
        text: "How many roles did you <u>apply</u> for through Migrate Mate?*", 
        type: "button-options",
        options: [
          { value: "0", label: "0" },
          { value: "1-5", label: "1-5" },
          { value: "6-20", label: "6-20" },
          { value: "20+", label: "20+" }
        ]
      },
      { 
        id: "emailsDirect", 
        text: "How many companies did you <u>email</u> directly?*", 
        type: "button-options",
        options: [
          { value: "0", label: "0" },
          { value: "1-5", label: "1-5" },
          { value: "6-20", label: "6-20" },
          { value: "20+", label: "20+" }
        ]
      },
      { 
        id: "interviewsDone", 
        text: "How many different companies did you <u>interview</u> with?*", 
        type: "button-options",
        options: [
          { value: "0", label: "0" },
          { value: "1-2", label: "1-2" },
          { value: "3-5", label: "3-5" },
          { value: "5+", label: "5+" }
        ]
      },
    ],
    buttons: [
      {
        id: "continue",
        label: "Continue",
        style: "disabled",
        action: "next",
        nextStepId: "help-feedback",
        disabledUntil: ["jobViaMM", "jobsAppliedViaMM", "emailsDirect", "interviewsDone"],
      },
    ],
    hideImageOnMobile: true,
  },
  {
    id: "help-feedback",
    number: 2, // Step 2 of Flow A
    heading: "What's one thing you wish we could've helped you with?",
    description: "We're always looking to improve, your thoughts can help us make Migrate Mate more useful for others.*",
    prevStepId: "job-source",
    questions: [
      { 
        id: "helpFeedback", 
        text: "", 
        type: "textarea",
        maxLength: 25
      },
    ],
    buttons: [
      {
        id: "continue",
        label: "Continue",
        style: "disabled",
        action: "next",
        nextStepId: "visa-status",
        disabledUntil: ["helpFeedback"],
      },
    ],
    conditionalBranches: [
      {
        condition: {
          stepId: "job-source",
          questionId: "jobViaMM",
          value: "yes"
        },
        nextStepId: "visa-status"
      },
      {
        condition: {
          stepId: "job-source",
          questionId: "jobViaMM",
          value: "no"
        },
        nextStepId: "visa-status-no"
      }
    ],
    hideImageOnMobile: true,
  },
  {
    id: "visa-status",
    number: 3, // Step 3 of Flow A
    heading: "We helped you land the job, now let's help you secure your visa.", // Default heading for when jobViaMM is true
    description: "",
    branchKey: "visaHelp",
    prevStepId: "help-feedback",
    questions: [
      { 
        id: "companyVisaSupport", 
        text: "Is your company providing an immigration lawyer to help with your visa?", 
        type: "radio-conditional", 
        required: true,
        radioOptions: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" }
        ],
        conditionalQuestions: [
          {
            questionId: "yes",
            question: "What visa will you be applying for?*",
            inputType: "text",
            maxLength: 0,
            required: true
          },
          {
            questionId: "no",
            question: "We can connect you with one of our trusted partners. Which visa would you like to apply for?*",
            inputType: "text",
            maxLength: 0,
            required: true
          }
        ]
      }
    ],
    buttons: [
      {
        id: "continue",
        label: "Complete cancellation",
        style: "disabled",
        action: "next",
        nextStepId: "all-done", // This will be overridden by conditional logic
        disabledUntil: ["companyVisaSupport"],
      },
    ],
    conditionalBranches: [
      {
        condition: {
          stepId: "visa-status",
          questionId: "companyVisaSupport",
          value: "yes"
        },
        nextStepId: "all-done"
      },
      {
        condition: {
          stepId: "visa-status",
          questionId: "companyVisaSupport",
          value: "no"
        },
        nextStepId: "all-done-visa-support"
      }
    ],
    hideImageOnMobile: true,
  },
  {
    id: "visa-status-no",
    number: 3, // Step 3 of Flow A
    heading: "You landed the job! <br /> <span class='italic'>That's what we live for.</span>", // Default heading for when jobViaMM is true
    subHeading: "Even if it wasn't through Migrate Mate, <br /> let us help get your visa sorted.",
    description: "",
    branchKey: "visaHelp",
    prevStepId: "help-feedback",
    questions: [
      { 
        id: "companyVisaSupport", 
        text: "Is your company providing an immigration lawyer to help with your visa?", 
        type: "radio-conditional", 
        required: true,
        radioOptions: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" }
        ],
        conditionalQuestions: [
          {
            questionId: "yes",
            question: "What visa will you be applying for?*",
            inputType: "text",
            maxLength: 0,
            required: true
          },
          {
            questionId: "no",
            question: "We can connect you with one of our trusted partners. Which visa would you like to apply for?*",
            inputType: "text",
            maxLength: 0,
            required: true
          }
        ]
      }
    ],
    buttons: [
      {
        id: "continue",
        label: "Complete cancellation",
        style: "disabled",
        action: "next",
        nextStepId: "all-done-visa-support", // This will be overridden by conditional logic
        disabledUntil: ["companyVisaSupport"],
      },
    ],
    conditionalBranches: [
      {
        condition: {
          stepId: "visa-status-no",
          questionId: "companyVisaSupport",
          value: "yes"
        },
        nextStepId: "all-done"
      },
      {
        condition: {
          stepId: "visa-status-no",
          questionId: "companyVisaSupport",
          value: "no"
        },
        nextStepId: "all-done-visa-support"
      }
    ],
    hideImageOnMobile: true,
  },
  {
    id: "visa-type-company",
    number: 4, // Additional step (not counted in Flow A)
    heading: "Visa Type",
    description: "What type of visa will you be applying for?",
    prevStepId: "visa-status",
    questions: [
      { 
        id: "visaTypeCompany", 
        text: "What visa will you be applying for?", 
        type: "textarea", 
        required: true,
        maxLength: 200
      }
    ],
    buttons: [
      {
        id: "continue",
        label: "Continue",
        style: "disabled",
        action: "next",
        nextStepId: "all-done", // Default, will be overridden by conditional logic
        disabledUntil: ["visaTypeCompany"],
      },
    ],
    // Conditional branching based on companyVisaSupport answer from visa-status ste
    hideImageOnMobile: true,
  },
  {
    id: "all-done",
    number: 5, // Final step (not counted in Flow A)
    heading: "All done, your cancellation's been processed. ",
    description: "We're stoked to hear you've landed a job and sorted your visa. Big congrats from the team. 🙌",
    prevStepId: "visa-status",
    questions: [],
    buttons: [
      {
        id: "finish",
        label: "Finish",
        style: "primary",
        action: "close",
      },
    ],
    hideImageOnMobile: false,
  },
  {
    id: "all-done-visa-support",
    number: 6, // Final step (not counted in Flow A)
    heading: "Your cancellation's all sorted, mate, no more charges.",
    description: "",
    prevStepId: "visa-status-no",
    questions: [],
    buttons: [
      {
        id: "finish-visa-support",
        label: "Finish",
        style: "primary",
        action: "close",
      },
    ],
    hideImageOnMobile: true,
  },

  // ---------- Flow B: Still Looking (3 steps) ----------
  {
    id: "downsell-offer-check",
    number: 1, // Step 1 of Flow B (variant B only)
    heading: "We built this to help you land the job, this makes it a little easier.",
    subHeading: "We've been there and we're here to help you.",
    description: "",
    branchKey: "offerDecision",
    prevStepId: "got-job",
    questions: [],
    offerButton: {
      id: "discount-offer",
      label: "*Get $10 off | ${offer_price}* ~<sub>${monthly_price}</sub>~",
      style: "accent",
      action: "next",
      nextStepId: "continue-subscription",
      color: "green",
    },
    buttons: [
      {
        id: "continue-cancellation",
        label: "No thanks",
        style: "secondary",
        action: "next",
        nextStepId: "usage-feedback",
        color: "white",
      },
    ],
    hideImageOnMobile: true,
    showOfferButton: false,
  },
  {
    id: "usage-feedback",
    number: 2, // Step 2 of Flow B (variant A), Step 1 of Flow B (variant B)
    heading: "Help us understand how you were using Migrate Mate.",
    description: "",
    prevStepId: "got-job",
    questions: [
      { 
        id: "jobsAppliedViaMM_NoJob", 
        text: "How many roles did you  <u> apply </u>  for through Migrate Mate?*", 
        type: "button-options",
        options: [
          { value: "0", label: "0" },
          { value: "1-5", label: "1-5" },
          { value: "6-20", label: "6-20" },
          { value: "20+", label: "20+" }
        ]
      },
      { 
        id: "emailsDirect_NoJob", 
        text: "How many companies did you <u>email</u> directly?*", 
        type: "button-options",
        options: [
          { value: "0", label: "0" },
          { value: "1-5", label: "1-5" },
          { value: "6-20", label: "6-20" },
          { value: "20+", label: "20+" }
        ]
      },
      { 
        id: "interviewsDone_NoJob", 
        text: "How many different companies did you <u>interview</u> with?*", 
        type: "button-options",
        options: [
          { value: "0", label: "0" },
          { value: "1-2", label: "1-2" },
          { value: "3-5", label: "3-5" },
          { value: "5+", label: "5+" }
        ]
      },
    ],
    buttons: [
      {
        id: "continue",
        label: "Continue",
        style: "disabled",
        action: "next",
        nextStepId: "cancel-reason",
        disabledUntil: ["jobsAppliedViaMM_NoJob", "emailsDirect_NoJob", "interviewsDone_NoJob"],
      },
    ],
    showOfferButton: true,
    hideImageOnMobile: true,
  },
  {
    id: "cancel-reason",
    number: 3, // Step 3 of Flow B (variant A), Step 2 of Flow B (variant B)
    heading: "What's the main <br /> reason for cancelling?",
    description: "Please take a minute to let us know why:",
    errorMessage: "",
    // errorMessage: "Mind letting us know why you're cancelling? <br/> It helps us understand your experience and improve the platform.*",
    prevStepId: "usage-feedback",
    questions: [
      { 
        id: "cancelReason", 
        text: "What's the main reason you're cancelling?", 
        type: "radio-conditional", 
        required: true,
        radioOptions: [
          { value: "too-expensive", label: "Too expensive" },
          { value: "platform-not-helpful", label: "Platform not helpful" },
          { value: "not-enough-jobs", label: "Not enough relevant jobs" },
          { value: "decided-not-to-move", label: "Decided not to move" },
          { value: "other", label: "Other" }
        ],
        conditionalQuestions: [
          {
            questionId: "too-expensive",
            question: "What's the maximum you'd be willing to pay per month?",
            inputType: "number",
            showDollarSign: true,
            required: true
          },
          {
            questionId: "platform-not-helpful",
            question: "Please share why the platform wasn't helpful for you",
            inputType: "textarea",
            errorMessage: "Please enter at least 25 characters so we can understand your feedback*",
            maxLength: 25,
            required: true
          },
          {
            questionId: "not-enough-jobs",
            question: "Please share details about what types of jobs you were looking for",
            inputType: "textarea",
            errorMessage: "Please enter at least 25 characters so we can understand your feedback*",
            maxLength: 25,
            required: true
          },
          {
            questionId: "decided-not-to-move",
            question: "Please share why you decided not to move",
            inputType: "textarea",
            errorMessage: "Please enter at least 25 characters so we can understand your feedback*",
            maxLength: 25,
            required: true
          },
          {
            questionId: "other",
            question: "Please specify your reason for cancelling",
            inputType: "textarea",
            errorMessage: "Please enter at least 25 characters so we can understand your feedback*",
            maxLength: 25,
            required: true
          }
        ]
      }
    ],
    buttons: [
      {
        id: "continue",
        label: "Complete Cancellation",
        style: "danger",
        action: "next",
        nextStepId: "cancel-confirmation",
        disabledUntil: ["cancelReason"],
      },
    ],
    showOfferButton: true,
    hideImageOnMobile: true,
  },
  {
    id: "cancel-confirmation",
    number: 5, // Final step (not counted in Flow B)
    heading: "Sorry to see you go, mate.",
    subHeading: "Thanks for being with us, and you're always welcome back.",
    description: "<strong>Your subscription is set to end on {{endDate}}.<br/> You'll still have full access until then. No further charges after that.</strong> <br/> <ul> Changed your mind? You can reactivate anytime before your end date.</ul>",
    prevStepId: "cancel-reason",
    questions: [
      { id: "cancelComplete", text: "Cancellation completed successfully.", type: "info" }
    ],
    buttons: [
      {
        id: "confirm-cancel",
        label: "Back to Jobs",
        style: "primary",
        action: "close",
      },
    ],
    showOfferButton: false,
    hideImageOnMobile: false,
  },
  {
    id: "continue-subscription",
    number: 4, // Additional step (not counted in Flow B)
    heading: "Great choice, mate!",
    heading2: "You're still on the path to your dream role. Let’s make it happen together!",
    subHeading: "",
    description: "You’ve got ${XX} days left on your current plan.<br />Starting from ${MM/DD/YYYY} date, your monthly payment will be ${offer_price} $",
    note: "You can cancel anytime before then.",
    prevStepId: "downsell-offer-check",
    questions: [],
    buttons: [
      {
        id: "continue",
        label: "Land your dream role",
        style: "primary",
        action: "next",
        nextStepId: "apply-job",
      },
    ],
    hideImageOnMobile: false,
    showOfferButton: false,
  },
  {
    id: "apply-job",
    number: 5, // Additional step (not counted in Flow B)
    heading: "Awesome — we’ve pulled together a few roles that <br /> seem like a great fit for you.",
    subHeading: "",
    description: "Take a look and see what sparks your interest.",
    prevStepId: "continue-subscription",
    questions: [],
    buttons: [
      {
        id: "finish",
        label: "Land your dream role",
        style: "primary",
        action: "close",
      },
    ],
    hideImageOnMobile: true,
    showOfferButton: false,
  },
];
