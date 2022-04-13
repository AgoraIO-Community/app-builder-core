import {TextDataType} from './default-labels/';

export type I18nBaseType<T = undefined> = string | ((template: T) => string);
export type I18nDynamicType = I18nBaseType<string>;
export type I18nConditionalType = I18nBaseType<boolean>;
export interface i18nInterface {
  locale: string;
  label?: string;
  data: TextDataType;
}
