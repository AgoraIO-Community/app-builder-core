const DefaultConfig = {
  PROJECT_ID: '',
  APP_ID: '',
  PRODUCT_ID: 'helloworld',
  APP_NAME: 'HelloWorld',
  LOGO: 'data:image/png;base64,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',
  ICON: 'logoSquare.png',
  FRONTEND_ENDPOINT: '',
  BACKEND_ENDPOINT: 'https://managedservices-preprod.rteappbuilder.com',
  PSTN: false,
  PRECALL: true,
  CHAT: true,
  CLOUD_RECORDING: false,
  RECORDING_MODE: 'WEB',
  SCREEN_SHARING: true,
  LANDING_SUB_HEADING: 'The Real-Time Engagement Platform',
  ENCRYPTION_ENABLED: false,
  ENABLE_GOOGLE_OAUTH: false,
  ENABLE_APPLE_OAUTH: false,
  ENABLE_SLACK_OAUTH: false,
  ENABLE_MICROSOFT_OAUTH: false,
  GOOGLE_CLIENT_ID: '',
  MICROSOFT_CLIENT_ID: '',
  SLACK_CLIENT_ID: '',
  APPLE_CLIENT_ID: '',
  GEO_FENCING: true,
  GEO_FENCING_INCLUDE_AREA: 'GLOBAL',
  GEO_FENCING_EXCLUDE_AREA: '',
  LOG_ENABLED: true,
  EVENT_MODE: false,
  RAISE_HAND: false,
  AUDIO_ROOM: false,
  BG: '',
  PRIMARY_FONT_COLOR: '#363636',
  SECONDARY_FONT_COLOR: '#FFFFFF',
  PROFILE: '720p_3',
  SCREEN_SHARE_PROFILE: '1080p_2',
  ICON_TEXT: true,
  PRIMARY_ACTION_BRAND_COLOR: '#099DFD',
  PRIMARY_ACTION_TEXT_COLOR: '#FFFFFF',
  SECONDARY_ACTION_COLOR: '#FFFFFF',
  FONT_COLOR: '#FFFFFF',
  BACKGROUND_COLOR: '#111111',
  VIDEO_AUDIO_TILE_COLOR: '#222222',
  VIDEO_AUDIO_TILE_OVERLAY_COLOR: '#000004',
  VIDEO_AUDIO_TILE_TEXT_COLOR: '#FFFFFF',
  VIDEO_AUDIO_TILE_AVATAR_COLOR: '#BDD0DB',
  SEMANTIC_ERROR: '#FF414D',
  SEMANTIC_SUCCESS: '#36B37E',
  SEMANTIC_WARNING: '#FFAB00',
  SEMANTIC_NEUTRAL: '#808080',
  INPUT_FIELD_BACKGROUND_COLOR: '#181818',
  INPUT_FIELD_BORDER_COLOR: '#262626',
  CARD_LAYER_1_COLOR: '#1D1D1D',
  CARD_LAYER_2_COLOR: '#262626',
  CARD_LAYER_3_COLOR: '#2D2D2D',
  CARD_LAYER_4_COLOR: '#333333',
  CARD_LAYER_5_COLOR: '#808080',
  HARD_CODED_BLACK_COLOR: '#000000',
  ICON_BG_COLOR: '#242529',
  TOOLBAR_COLOR: '#111111',
  ACTIVE_SPEAKER: true,
  ENABLE_IDP_AUTH: false,
  ENABLE_TOKEN_AUTH: false,
  ENABLE_STT: false,
  ENABLE_CAPTION: true,
  ENABLE_MEETING_TRANSCRIPT: true,
  ENABLE_NOISE_CANCELLATION: true,
  ENABLE_VIRTUAL_BACKGROUND: true,
  ENABLE_WHITEBOARD: false,
  ENABLE_WHITEBOARD_FILE_UPLOAD: false,
  ENABLE_WAITING_ROOM: false,
  WHITEBOARD_APPIDENTIFIER: '',
  WHITEBOARD_REGION: '',
  ENABLE_NOISE_CANCELLATION_BY_DEFAULT: false,
  CHAT_ORG_NAME: '',
  CHAT_APP_NAME: '',
  CHAT_URL: '',
  CLI_VERSION: '3.0.32-2',
  CORE_VERSION: '4.0.32-2',
  DISABLE_LANDSCAPE_MODE: false,
  STT_AUTO_START: false,
  CLOUD_RECORDING_AUTO_START: false,
  AUTO_CONNECT_RTM: false,
};

module.exports = DefaultConfig;
