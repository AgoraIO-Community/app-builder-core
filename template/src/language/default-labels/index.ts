import {CommonLabels, CommonLabelsInterface} from './commonLabels';
import {
  CreateScreenLabels,
  CreateScreenLabelsInterface,
} from './createScreenLabels';
import {JoinScreenLabels, JoinScreenLabelsInterface} from './joinScreenLabels';
import {
  ShareLinkScreenLabels,
  ShareLinkScreenLabelsInterface,
} from './shareLinkScreenLabels';
import {
  VideoCallScreenLabels,
  VideoCallScreenLabelsInterface,
} from './videoCallScreenLabels';
import {
  PrecallScreenLabels,
  PrecallScreenLabelsInterface,
} from './precallScreenLabels';

export type TextDataType =
  | CommonLabelsInterface
  | CreateScreenLabelsInterface
  | JoinScreenLabelsInterface
  | ShareLinkScreenLabelsInterface
  | VideoCallScreenLabelsInterface
  | PrecallScreenLabelsInterface;
export const DEFAULT_LABELS: TextDataType = {
  ...CommonLabels,
  ...CreateScreenLabels,
  ...JoinScreenLabels,
  ...ShareLinkScreenLabels,
  ...PrecallScreenLabels,
  ...VideoCallScreenLabels,
};
