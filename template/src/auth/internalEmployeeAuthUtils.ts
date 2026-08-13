export const INTERNAL_EMPLOYEE_AUTH_APP_IDS = [
  'a569f8fb0309417780b793786b534a86',
];

export const isInternalEmployeeAuthEnabledForApp = () => {
  return INTERNAL_EMPLOYEE_AUTH_APP_IDS.indexOf($config.APP_ID) !== -1;
};

export const isInternalEmployeeVerificationActive = (
  verifiedUntil?: number | null,
) => {
  return verifiedUntil ? verifiedUntil * 1000 > Date.now() : false;
};

export const getActiveInternalEmployeeToken = (store?: {
  internalEmployeeToken?: string | null;
  internalEmployeeVerifiedUntil?: number | null;
}) => {
  if (
    isInternalEmployeeAuthEnabledForApp() &&
    store?.internalEmployeeToken &&
    isInternalEmployeeVerificationActive(store?.internalEmployeeVerifiedUntil)
  ) {
    return store.internalEmployeeToken;
  }
  return null;
};
