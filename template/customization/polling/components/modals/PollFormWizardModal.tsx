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
import {useLocalUid, filterObject} from 'customization-api';

type FormWizardStep = 'SELECT' | 'DRAFT' | 'PREVIEW';

export default function PollFormWizardModal() {
  const {polls, savePoll, sendPoll, closeCurrentModal} = usePoll();
  const [step, setStep] = useState<FormWizardStep>('SELECT');
  const [type, setType] = useState<PollKind>(null);
  const [form, setForm] = useState<PollItem>(null);
  const [formErrors, setFormErrors] = useState<PollFormErrors>(null);

  const localUid = useLocalUid();

  useEffect(() => {
    if (!type) {
      return;
    }
    setForm(initPollForm(type));
    setStep('DRAFT');
  }, [type]);

  const onSave = (launch?: boolean) => {
    if (launch) {
      // check if there is an already launched poll
      const isAnyPollActive = Object.keys(
        filterObject(polls, ([_, v]) => v.status === PollStatus.ACTIVE),
      );
      if (isAnyPollActive.length > 0) {
        console.error(
          'Cannot publish poll now as there is already one poll active',
        );
        return;
      }
    }
    const payload = {
      ...form,
      status: launch ? PollStatus.ACTIVE : PollStatus.LATER,
      createdBy: localUid,
    };
    savePoll(payload);
    if (launch) {
      sendPoll(payload);
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
    setFormErrors(null);
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
      form.options.length === 0
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
    setFormErrors(null);
    setForm(null);
    setType(null);
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
          <DraftPollFormView
            form={form}
            setForm={setForm}
            onPreview={onPreview}
            errors={formErrors}
            onClose={onClose}
          />
        );
      case 'PREVIEW':
        return (
          <PreviewPollFormView
            form={form}
            onEdit={onEdit}
            onSave={onSave}
            onClose={onClose}
          />
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
