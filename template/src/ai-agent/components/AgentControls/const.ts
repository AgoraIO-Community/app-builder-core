import {isMobileUA} from '../../../utils/common';

export const AI_AGENT_STATE = {
  NOT_CONNECTED: 'Join Call',
  REQUEST_SENT: isMobileUA() ? 'Join Call' : 'Requesting agent join..', // loading - reg
  AWAITING_JOIN: isMobileUA() ? 'Join Call' : 'Agent will join shortly..', // loading
  AGENT_CONNECTED: 'End Call',
  AGENT_REQUEST_FAILED: 'Join Call',
  AGENT_DISCONNECT_REQUEST: isMobileUA()
    ? 'End Call'
    : 'Disconnecting agent...', // loading - req
  AGENT_DISCONNECT_FAILED: 'End Call',
  AWAITING_LEAVE: 'Join Call', // loading
} as const;

export type AIAgentState = keyof typeof AI_AGENT_STATE;

export const AGENT_STATE_TO_API_ACTION = {
  NOT_CONNECTED: 'start_agent',
  AGENT_CONNECTED: 'stop_agent',
} as const;

export type AgentStateToApiAction = keyof typeof AGENT_STATE_TO_API_ACTION;

export const enum AgentState {
  NOT_CONNECTED = 'NOT_CONNECTED',
  REQUEST_SENT = 'REQUEST_SENT',
  AWAITING_JOIN = 'AWAITING_JOIN',
  AGENT_CONNECTED = 'AGENT_CONNECTED',
  AGENT_REQUEST_FAILED = 'AGENT_REQUEST_FAILED',
  AGENT_DISCONNECT_REQUEST = 'AGENT_DISCONNECT_REQUEST',
  AGENT_DISCONNECT_FAILED = 'AGENT_DISCONNECT_FAILED',
  AWAITING_LEAVE = 'AWAITING_LEAVE',
}

export const AI_AGENT_UID = 123456;

// export const AGENT_PROXY_URL = "http://localhost:3000/api/proxy"
// export const AGENT_PROXY_URL = "https://conversational-ai-agent-git-testing-cors-agoraio.vercel.app/api/proxy"
// export const AGENT_PROXY_URL = "https://nodejs-serverless-function-express-alpha-smoky.vercel.app/api/hello"
// export const AGENT_PROXY_URL = "https://conversational-ai-agent-git-setmute-agoraio.vercel.app/api/proxy"

// production router
export const AGENT_PROXY_URL =
  'https://agora-realtime-proxy-590d34bfeb04.herokuapp.com';
// production sso
export const AGORA_SSO_BASE = 'https://sso2.agora.io';

// staging router
// export const AGENT_PROXY_URL = "https://agora-realtime-proxy-dev-0af5192e12dd.herokuapp.com"
// staging sso
// export const AGORA_SSO_BASE = 'https://staging-sso.agora.io';

export const AGORA_SSO_LOGIN_PATH = '/api/v0/oauth/authorize';

export const AGORA_SSO_LOGOUT_PATH = '/api/v0/logout';

export const AGORA_SSO_CLIENT_ID = 'openai_agora';

export const AI_AGENT_VOICE = {
  'en-US-AvaMultilingualNeural': 'en-US-AvaMultilingualNeural',
  'en-US-AndrewMultilingualNeural': 'en-US-AndrewMultilingualNeural',
  'en-US-EmmaMultilingualNeural': 'en-US-EmmaMultilingualNeural',
  'en-US-BrianMultilingualNeural': 'en-US-BrianMultilingualNeural',
  'en-US-AvaNeural': 'en-US-AvaNeural',
  'en-US-AndrewNeural': 'en-US-AndrewNeural',
  'en-US-EmmaNeural': 'en-US-EmmaNeural',
  'en-US-BrianNeural': 'en-US-BrianNeural',
  'en-US-JennyNeural': 'en-US-JennyNeural',
  'en-US-GuyNeural': 'en-US-GuyNeural',
  'en-US-AriaNeural': 'en-US-AriaNeural',
  'en-US-DavisNeural': 'en-US-DavisNeural',
  'en-US-JaneNeural': 'en-US-JaneNeural',
  'en-US-JasonNeural': 'en-US-JasonNeural',
  'en-US-SaraNeural': 'en-US-SaraNeural',
  'en-US-TonyNeural': 'en-US-TonyNeural',
  'en-US-NancyNeural': 'en-US-NancyNeural',
  'en-US-AmberNeural': 'en-US-AmberNeural',
  'en-US-AnaNeural': 'en-US-AnaNeural',
  'en-US-AshleyNeural': 'en-US-AshleyNeural',
  'en-US-BrandonNeural': 'en-US-BrandonNeural',
  'en-US-ChristopherNeural': 'en-US-ChristopherNeural',
  'en-US-CoraNeural': 'en-US-CoraNeural',
  'en-US-ElizabethNeural': 'en-US-ElizabethNeural',
  'en-US-EricNeural': 'en-US-EricNeural',
  'en-US-JacobNeural': 'en-US-JacobNeural',
  'en-US-JennyMultilingualNeural4': 'en-US-JennyMultilingualNeural4',
  'en-US-MichelleNeural': 'en-US-MichelleNeural',
  'en-US-MonicaNeural': 'en-US-MonicaNeural',
  'en-US-RogerNeural': 'en-US-RogerNeural',
};

export const ASR_LANGUAGES = {
  ENGLISH: 'ENGLISH',
  SPANISH: 'SPANISH',
  JAPANESE: 'JAPANESE',
  KOREAN: 'KOREAN',
  ARABIC: 'ARABIC',
  HINDI: 'HINDI',
};
