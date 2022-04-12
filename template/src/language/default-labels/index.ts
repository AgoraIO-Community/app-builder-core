import {i18nInterface} from '../i18nTypes';
import {CommonLabels} from './commonLabels';
import {CreateScreenLabels} from './createScreenLabels';
import {JoinScreenLabels} from './joinScreenLabels';
import {ShareLinkScreenLabels} from './shareLinkScreenLabels';
import {VideoCallScreenLabels} from './videoCallScreenLabels';
import {PrecallScreenLabels} from './precallScreenLabels';

export const DEFAULT_LABELS: i18nInterface['data'] = {
  ...CommonLabels,
  ...CreateScreenLabels,
  ...JoinScreenLabels,
  ...ShareLinkScreenLabels,
  ...PrecallScreenLabels,
  ...VideoCallScreenLabels,
};
