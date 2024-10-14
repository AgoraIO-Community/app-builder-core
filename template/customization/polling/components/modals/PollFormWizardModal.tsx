import React, {useEffect, useState, useRef} from 'react';
import {BaseModal} from '../../ui/BaseModal';
import SelectNewPollTypeFormView from '../form/SelectNewPollTypeFormView';
import DraftPollFormView from '../form/DraftPollFormView';
import PreviewPollFormView from '../form/PreviewPollFormView';
import {
  PollItem,
  PollKind,
  PollStatus,
  PollFormErrors,
} from '../../context/poll-context';
import {usePoll} from '../../context/poll-context';
import {initPollForm} from '../form/form-config';
import {useLocalUid} from 'customization-api';
import {log} from '../../helpers';

type FormWizardStep = 'SELECT' | 'DRAFT' | 'PREVIEW';

interface PollFormWizardModalProps {
  formObject?: PollItem; // Optional prop to initialize form in edit mode
}

export default function PollFormWizardModal({
  formObject,
}: PollFormWizardModalProps) {
  const {savePoll, sendPoll, closeCurrentModal} = usePoll();
  const [savedPollId, setSavedPollId] = useState<string | null>(null);

  const [step, setStep] = useState<FormWizardStep>(
    formObject ? 'DRAFT' : 'SELECT',
  );
  const [type, setType] = useState<PollKind>(
    formObject ? formObject.type : PollKind.NONE,
  );
  const [form, setForm] = useState<PollItem | null>(formObject || null);
  const [formErrors, setFormErrors] = useState<Partial<PollFormErrors>>({});

  const localUid = useLocalUid();
  const localUidRef = useRef(localUid);

  // Monitor savedPollId to send poll when it's updated
  useEffect(() => {
    if (savedPollId) {
      sendPoll(savedPollId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPollId]);

  useEffect(() => {
    try {
      if (formObject) {
        // If formObject is passed, skip the SELECT step and initialize the form
        setForm(formObject);
        setStep('DRAFT');
      } else if (type !== PollKind.NONE) {
        // Initialize the form for a new poll based on the selected type
        setForm(initPollForm(type, localUidRef.current));
        setStep('DRAFT');
      }
    } catch (error) {
      log('Error while initializing form: ', error);
    }
  }, [type, formObject]);

  const onSave = (launch?: boolean) => {
    try {
      if (!validateForm()) {
        return;
      }
      const payload = {
        ...form,
        status: launch ? PollStatus.ACTIVE : PollStatus.LATER,
      };
      savePoll(payload);
      if (launch) {
        setSavedPollId(payload.id);
      }
    } catch (error) {
      log('error while saving form: ', error);
    }
  };

  const onEdit = () => {
    setStep('DRAFT');
  };

  const onPreview = () => {
    if (validateForm()) {
      setStep('PREVIEW');
    }
  };

  const validateForm = () => {
    // 1. Check if form is null
    if (!form) {
      return false;
    }
    // 2. Start with an empty errors object
    let errors: Partial<PollFormErrors> = {};

    // 3. Validate the question field
    if (form.question.trim() === '') {
      errors = {
        ...errors,
        question: {message: 'This field cannot be empty.'},
      };
    }

    // 4. Validate the options for MCQ type poll
    if (
      form.type === PollKind.MCQ &&
      form.options &&
      (form.options.length === 0 ||
        form.options.some(item => item.text.trim() === ''))
    ) {
      errors = {
        ...errors,
        options: {message: 'Option can’t be empty.'},
      };
    }
    // 5. Set formErrors to the collected errors
    setFormErrors(errors);

    // 6. If there are no errors, return true, otherwise return false
    return Object.keys(errors).length === 0;
  };

  const onClose = () => {
    setFormErrors({});
    setForm(null);
    setType(PollKind.NONE);
    closeCurrentModal();
  };

  function renderSwitch() {
    switch (step) {
      case 'SELECT':
        return (
          <SelectNewPollTypeFormView setType={setType} onClose={onClose} />
        );
      case 'DRAFT':
        return (
          form && (
            <DraftPollFormView
              form={form}
              setForm={setForm}
              onPreview={onPreview}
              onSave={onSave}
              errors={formErrors}
              onClose={onClose}
            />
          )
        );
      case 'PREVIEW':
        return (
          form && (
            <PreviewPollFormView
              form={form}
              onEdit={onEdit}
              onSave={onSave}
              onClose={onClose}
            />
          )
        );
      default:
        return <></>;
    }
  }

  return (
    <BaseModal width={600} visible={step !== null} onClose={onClose}>
      {renderSwitch()}
    </BaseModal>
  );
}