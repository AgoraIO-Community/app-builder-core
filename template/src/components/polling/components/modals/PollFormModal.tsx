import React, {useEffect, useState} from 'react';
import {BaseModal} from '../../ui/BaseModal';
import SelectNewPollTypeFormView from '../form/SelectNewPollTypeFormView';
import CreatePollFormView from '../form/CreatePollFormView';
import PollPreviewFormView from '../form/PollPreviewFormView';
import {PollItem, PollKind, PollStatus} from '../../context/poll-context';
import {useLocalUid} from '../../../../../agora-rn-uikit/src';
import {usePoll} from '../../context/poll-context';
import {initPollForm} from '../form/form-config';

export default function PollFormModal() {
  const {savePollItem, currentStep, setCurrentStep} = usePoll();
  const [form, setForm] = useState<PollItem>(null);
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
      savePollItem({
        ...form,
        status: PollStatus.ACTIVE,
        createdBy: localUid,
      });
    } else {
      savePollItem({
        ...form,
        status: PollStatus.LATER,
        createdBy: localUid,
      });
    }
    setType(null);
    setCurrentStep(null);
  };

  const onEdit = () => {
    setCurrentStep('CREATE_POLL');
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
            setCurrentStep={setCurrentStep}
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
