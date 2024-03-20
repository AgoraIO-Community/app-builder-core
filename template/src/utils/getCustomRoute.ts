import {CUSTOM_ROUTES_PREFIX} from 'customization-api';

const getCustomRoute = customRouteName => {
  return CUSTOM_ROUTES_PREFIX + customRouteName;
};

export default getCustomRoute;
