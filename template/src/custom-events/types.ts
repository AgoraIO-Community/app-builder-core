import {RtmAttribute} from 'agora-react-native-rtm';

type Simplify<T> = T extends infer S ? {[K in keyof S]: S[K]} : never;
type NoneOf<T> = Simplify<{[K in keyof T]?: never}>;
type AtMostOneOf<T> =
  | NoneOf<T>
  | {[K in keyof T]: Simplify<Pick<T, K> & NoneOf<Omit<T, K>>>}[keyof T];

// export type TEventOptions = AtMostOneOf<IMessageOptions> & IEventOptions;

interface IChannelMessageOptions {
  channelId: string;
  uids?: never;
}

interface IPeerMessageOptions {
  uids: string | string[];
  channelId?: never;
}

export type ToOptions = string | string[];

interface IEventPayloadBase {
  value?: any;
}

interface IEventPayloadWithoutAttributes extends IEventPayloadBase {
  level?: never;
  attributes?: never;
}

interface IEventPayloadWithAttributes extends IEventPayloadBase {
  level: 2 | 3;
  attributes: RtmAttribute[];
}

export type EventPayload =
  | IEventPayloadWithoutAttributes
  | IEventPayloadWithAttributes
  | Record<string, never>;
