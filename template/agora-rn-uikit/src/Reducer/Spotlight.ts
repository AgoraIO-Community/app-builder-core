import {ActionType, ContentStateInterface} from '../Contexts/RtcContext';

export default function Spotlight(
  state: ContentStateInterface,
  action: ActionType<'Spotlight'>,
) {
  return {
    ...state,
    spotlightUid: action?.value && action.value?.length ? action.value[0] : 0,
  };
}
