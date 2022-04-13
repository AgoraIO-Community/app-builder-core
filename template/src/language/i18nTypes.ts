import {TextDataType} from './default-labels/';

export type BaseI18nType<T = undefined> = string | ((template: T) => string);
export type DynamicI18nType = BaseI18nType<string>;
export type ConditionalI18nType = BaseI18nType<boolean>;
export interface i18nInterface {
  locale: string;
  label?: string;
  data: TextDataType;
}
