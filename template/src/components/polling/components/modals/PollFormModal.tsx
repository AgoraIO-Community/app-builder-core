import React, {useEffect, useState} from 'react';
import {BaseModal} from '../../ui/BaseModal';
import SelectNewPollTypeFormView from '../form/SelectNewPollTypeFormView';
import CreatePollFormView from '../form/CreatePollFormView';
import PollPreviewFormView from '../form/PollPreviewFormView';
import {
  PollItem,
  PollKind,
  PollStatus,
  PollFormErrors,
} from '../../context/poll-context';
import {useLocalUid} from '../../../../../agora-rn-uikit/src';
import {usePoll} from '../../context/poll-context';
import {initPollForm} from '../form/form-config';
import {filterObject} from '../../../../utils';

export default function PollFormModal() {
  const {polls, savePollForm, sendPollForm, currentStep, setCurrentStep} =
    usePoll();
  const [form, setForm] = useState<PollItem>(null);
  const [formErrors, setFormErrors] = useState<PollFormErrors>(null);

  console.log('supriya poll formErrors: ', formErrors);
  console.log('supriya poll form: ', form);

  const [type, setType] = useState<PollKind>(null);
  const localUid = useLocalUid();

  useEffect(() => {
    if (!type) {
      return;
    }
    setForm(initPollForm(type));
    setCurrentStep('CREATE_POLL');
  }, [type, setCurrentStep]);

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
    savePollForm(payload);
    if (launch) {
      sendPollForm(payload);
    }
    setType(null);
    setCurrentStep(null);
    setForm(null);
  };

  const onEdit = () => {
    setCurrentStep('CREATE_POLL');
  };

  const onPreview = () => {
    if (validateForm()) {
      setCurrentStep('PREVIEW_POLL');
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

  function renderSwitch(step) {
    switch (step) {
      case 'SELECT_POLL':
        return <SelectNewPollTypeFormView setType={setType} />;
      case 'CREATE_POLL':
        return (
          <CreatePollFormView
            form={form}
            setForm={setForm}
            onPreview={onPreview}
            errors={formErrors}
          />
        );
      case 'PREVIEW_POLL':
        return (
          <PollPreviewFormView form={form} onEdit={onEdit} onSave={onSave} />
        );
      default:
        return <></>;
    }
  }

  return (
    <BaseModal visible={currentStep !== null}>
      {renderSwitch(currentStep)}
    </BaseModal>
  );
}
