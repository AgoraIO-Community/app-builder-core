import {I18nBaseType} from '../i18nTypes';

export const cancelText = 'cancelText';
export interface I18nCommonLabelsInterface {
  [cancelText]?: I18nBaseType;
  loadingText?: I18nBaseType;
}

export const CommonLabels: I18nCommonLabelsInterface = {
  [cancelText]: 'CANCEL',
  loadingText: 'Loading...',
};
