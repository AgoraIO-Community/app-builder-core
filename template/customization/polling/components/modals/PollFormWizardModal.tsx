import React, {useEffect, useState} from 'react';
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

export default function PollFormWizardModal() {
  const {savePoll, sendPoll, closeCurrentModal} = usePoll();
  const [step, setStep] = useState<FormWizardStep>('SELECT');
  const [type, setType] = useState<PollKind>(PollKind.NONE);
  const [form, setForm] = useState<PollItem | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<PollFormErrors>>({});

  const localUid = useLocalUid();

  useEffect(() => {
    try {
      if (type === PollKind.NONE) {
        return;
      }
      setForm(initPollForm(type));
      setStep('DRAFT');
    } catch (error) {
      log('error while initializing form: ', error);
    }
  }, [type]);

  const onSave = (launch?: boolean) => {
    try {
      if (!form) {
        throw new Error("Form cannot be saved. It's empty");
      }
      const payload = {
        ...form,
        status: launch ? PollStatus.ACTIVE : PollStatus.LATER,
        createdBy: localUid,
      };
      savePoll(payload);
      if (launch) {
        sendPoll(payload.id);
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
    if (!form) {
      // Check if form is null
      return false;
    }
    setFormErrors({});
    if (form.question.trim() === '') {
      setFormErrors({
        ...formErrors,
        question: {message: 'Cannot be blank'},
      });
      return false;
    }
    if (
      form.type === PollKind.MCQ &&
      form.options &&
      (form.options.length === 0 ||
        form.options.find(item => item.text.trim() === ''))
    ) {
      setFormErrors({
        ...formErrors,
        options: {message: 'Cannot be empty'},
      });
      return false;
    }
    return true;
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
    <BaseModal width={600} visible={step !== null}>
      {renderSwitch()}
    </BaseModal>
  );
}
