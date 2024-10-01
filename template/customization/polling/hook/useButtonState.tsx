// useButtonState.ts
import {useState, useCallback, useRef, useEffect} from 'react';

interface useButtonStateReturn {
  buttonText: string;
  isSubmitting: boolean;
  submitted: boolean;
  handleSubmit: (submitFunction?: () => Promise<void> | void) => void;
  resetState: () => void;
}

export function useButtonState(
  initialText: string = 'Submit',
  submittingText: string = 'Submitting...',
  submittedText: string = 'Submitted',
): useButtonStateReturn {
  const [buttonText, setButtonText] = useState(initialText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setIsSubmitted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Reference to store timeout ID

  // Handles the submission process
  const handleSubmit = useCallback(
    async (submitFunction?: () => Promise<void> | void) => {
      setIsSubmitting(true);
      setButtonText(submittingText);

      try {
        // Execute the submit function if provided
        if (submitFunction) {
          await submitFunction();
        }

        // After submission, update the text to "Submitted" with delay
        timeoutRef.current = setTimeout(() => {
          setIsSubmitted(true);
          setButtonText(submittedText);
        }, 1000);
      } catch (error) {
        // Handle error (e.g., reset button text or show error)
        setButtonText(initialText);
      } finally {
        // Restore the submit state after completion
        timeoutRef.current = setTimeout(() => {
          setIsSubmitting(false);
        }, 1000);
      }
    },
    [initialText, submittingText, submittedText],
  );

  // Cleanup function to clear timeouts if the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset the state to the initial values
  const resetState = () => {
    setButtonText(initialText);
    setIsSubmitting(false);
  };

  return {buttonText, isSubmitting, submitted, handleSubmit, resetState};
}
