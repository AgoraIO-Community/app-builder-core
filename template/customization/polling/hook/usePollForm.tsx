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
}
interface PollFormButton {
  onSubmit: () => void;
  buttonVisible: boolean;
  buttonStatus: ButtonStatus;
  buttonText: string;
  submitDisabled: boolean;
}
interface UsePollFormReturn
  extends Omit<PollFormInput, 'pollItem'>,
    PollFormButton {}

type ButtonStatus = 'initial' | 'selected' | 'submitting' | 'submitted';

export function usePollForm({
  pollItem,
  initialSubmitted = false,
  onFormSubmit,
  onFormSubmitComplete,
}: UsePollFormProps): UsePollFormReturn {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [buttonVisible, setButtonVisible] = useState(!initialSubmitted);

  const [answer, setAnswer] = useState('');
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>(
    initialSubmitted ? 'submitted' : 'initial',
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localUid = useLocalUid();

  // Set state for radio button selection
  const handleRadioSelect = useCallback((option: string) => {
    setSelectedOption(option);
    setButtonStatus('selected'); // Mark the button state as selected
  }, []);

  // Set state for checkbox toggle
  const handleCheckboxToggle = useCallback((value: string) => {
    setSelectedOptions(prevSelectedOptions => {
      const newSelectedOptions = prevSelectedOptions.includes(value)
        ? prevSelectedOptions.filter(option => option !== value)
        : [...prevSelectedOptions, value];
      setButtonStatus(newSelectedOptions.length > 0 ? 'selected' : 'initial');
      return newSelectedOptions;
    });
  }, []);

  // Handle form submission
  const onSubmit = useCallback(() => {
    setButtonStatus('submitting');

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
      setButtonStatus('submitted');

      // Trigger the form submit complete callback, if provided
      if (onFormSubmitComplete) {
        timeoutRef.current = setTimeout(() => {
          // Call the onFormSubmitComplete callback
          onFormSubmitComplete();
          // Hide the button after submission
          setButtonVisible(false);
        }, 2000);
      } else {
        // If no callback is provided, immediately hide the button without waiting
        setButtonVisible(false);
        // Time for displaying "Submitted" before calling onFormSubmitComplete
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

  // Derive button text from button status
  const buttonText = (() => {
    switch (buttonStatus) {
      case 'initial':
        return 'Submit';
      case 'selected':
        return 'Submit';
      case 'submitting':
        return 'Submitting...';
      case 'submitted':
        return 'Submitted';
    }
  })();

  // Define when the submit button should be disabled
  const submitDisabled =
    buttonStatus === 'submitting' ||
    buttonStatus === 'submitted' ||
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
    buttonStatus,
    buttonText,
    answer,
    setAnswer,
    submitDisabled,
  };
}

export type {PollFormInput, PollFormButton};
