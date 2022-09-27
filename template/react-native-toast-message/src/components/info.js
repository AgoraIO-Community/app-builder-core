import React from 'react';

import BaseToast from './base';
import { icons } from '../assets';
import colors from '../colors';

function InfoToast(props) {
  return (
    <BaseToast
      {...props}
      style={{ borderTopColor: colors.lightSkyBlue }}
      leadingIcon={icons.info}
      text1Style={{ color: colors.black }}
      text2Style={{ color: colors.black }}
    />
  );
}

InfoToast.propTypes = BaseToast.propTypes;

export default InfoToast;
