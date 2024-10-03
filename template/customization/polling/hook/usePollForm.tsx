import {useState, useEffect, useRef, useCallback, SetStateAction} from 'react';
import {PollItem, PollKind} from '../context/poll-context';
import {useLocalUid} from 'customization-api';

interface UsePollFormProps {
  pollItem: PollItem;
  initialSubmitted?: boolean;
  onFormSubmit: (responses: string | string[]) => void;
  onFormSubmitComplete?: () => void;
}
interface PollFormInput {
  pollItem: PollItem;
  selectedOption: string | null;
  selectedOptions: string[];
  handleRadioSelect: (option: string) => void;
  handleCheckboxToggle: (option: string) => void;
  answer: string;
  setAnswer: React.Dispatch<SetStateAction<string>>;
  submitted: boolean;
}

interface UsePollFormReturn extends PollFormInput {
  onSubmit: () => void;
  buttonVisible: boolean;
  isSubmitting: boolean;
  buttonText: string;
  submitDisabled: boolean;
}

export function usePollForm({
  pollItem,
  initialSubmitted = false,
  onFormSubmit,
  onFormSubmitComplete,
}: UsePollFormProps): UsePollFormReturn {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [buttonVisible, setButtonVisible] = useState(!initialSubmitted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonText, setButtonText] = useState('Submit');
  const [answer, setAnswer] = useState('');

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localUid = useLocalUid();

  // Set state for radio button selection
  const handleRadioSelect = useCallback((option: string) => {
    setSelectedOption(option);
  }, []);

  // Set state for checkbox toggle
  const handleCheckboxToggle = useCallback((value: string) => {
    setSelectedOptions(prevSelectedOptions => {
      if (prevSelectedOptions.includes(value)) {
        return prevSelectedOptions.filter(option => option !== value);
      } else {
        return [...prevSelectedOptions, value];
      }
    });
  }, []);

  // Handle form submission
  const onSubmit = useCallback(() => {
    setIsSubmitting(true);
    setButtonText('Submitting...');

    // Logic to handle form submission
    if (pollItem.multiple_response) {
      if (selectedOptions.length === 0) {
        return;
      }
      onFormSubmit(selectedOptions);
    } else {
      if (!selectedOption) {
        return;
      }
      onFormSubmit([selectedOption]);
    }

    // Simulate submission delay and complete the process
    timeoutRef.current = setTimeout(() => {
      setSubmitted(true);
      setButtonText('Submitted');
      setIsSubmitting(false);

      // Trigger the form submit complete callback, if provided
      if (onFormSubmitComplete) {
        timeoutRef.current = setTimeout(() => {
          // Call the onFormSubmitComplete callback
          onFormSubmitComplete();

          // Hide the button after submission
          setButtonVisible(false);
        }, 2000); // Time for displaying "Submitted" before calling onFormSubmitComplete and hiding the button
      } else {
        // If no callback is provided, immediately hide the button without waiting
        setButtonVisible(false);
      }
    }, 1000);
  }, [
    selectedOption,
    selectedOptions,
    pollItem,
    onFormSubmit,
    onFormSubmitComplete,
  ]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const submitDisabled =
    isSubmitting ||
    submitted ||
    (pollItem.type === PollKind.OPEN_ENDED && answer?.trim() === '') ||
    (pollItem.type === PollKind.YES_NO && !selectedOption) ||
    (pollItem.type === PollKind.MCQ &&
      !pollItem.multiple_response &&
      !selectedOption) ||
    (pollItem.type === PollKind.MCQ &&
      pollItem.multiple_response &&
      selectedOptions.length === 0);

  return {
    selectedOption,
    selectedOptions,
    handleRadioSelect,
    handleCheckboxToggle,
    onSubmit,
    buttonVisible,
    isSubmitting,
    buttonText,
    submitted,
    answer,
    setAnswer,
    submitDisabled,
  };
}

export type {PollFormInput};
