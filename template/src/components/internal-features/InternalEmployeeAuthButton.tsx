/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.
 Use without a license or in violation of any license terms and conditions (including use for
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more
 information visit https://appbuilder.agora.io.
*********************************************
*/
import React, {useContext, useEffect, useState} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import ImageIcon from '../../atoms/ImageIcon';
import Tooltip from '../../atoms/Tooltip';
import Toast from '../../../react-native-toast-message';
import useInternalEmployeeAuth, {
  getDummyInternalFeature,
  isInternalEmployeeAuthEnabledForApp,
  isInternalEmployeeVerificationActive,
} from '../../auth/useInternalEmployeeAuth';
import ThemeConfig from '../../theme';
import StorageContext from '../StorageContext';
import {isWebInternal} from '../../utils/common';

interface InternalEmployeeAuthButtonProps {
  authenticatedText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  loginText?: string;
  size?: 'regular' | 'compact';
}

const InternalEmployeeAuthButton = (props: InternalEmployeeAuthButtonProps) => {
  const {
    authenticatedText = 'Agora employee',
    containerStyle,
    loginText = 'Login',
    size = 'regular',
  } = props;
  const {store, setStore} = useContext(StorageContext);
  const [authRequired, setAuthRequired] = useState(false);
  const [statusChecking, setStatusChecking] = useState(false);
  const {authenticate, loading} = useInternalEmployeeAuth();

  const isInternalEmployeeAuthApp =
    isWebInternal() && isInternalEmployeeAuthEnabledForApp();
  const hasActiveInternalEmployeeToken =
    !!store?.internalEmployeeToken &&
    isInternalEmployeeVerificationActive(store?.internalEmployeeVerifiedUntil);

  useEffect(() => {
    let cancelled = false;

    const validateInternalEmployeeToken = async () => {
      if (!isInternalEmployeeAuthApp) {
        setAuthRequired(false);
        return;
      }

      if (!hasActiveInternalEmployeeToken) {
        setAuthRequired(true);
        return;
      }

      setStatusChecking(true);
      try {
        await getDummyInternalFeature(store.internalEmployeeToken);
        if (!cancelled) {
          setAuthRequired(false);
        }
      } catch (error) {
        if (!cancelled) {
          const failedInternalEmployeeToken = store.internalEmployeeToken;
          setStore?.(prevState => ({
            ...prevState,
            token:
              prevState.token === failedInternalEmployeeToken
                ? null
                : prevState.token,
            internalEmployeeToken: null,
            internalEmployeeVerifiedUntil: null,
          }));
          setAuthRequired(true);
        }
      } finally {
        if (!cancelled) {
          setStatusChecking(false);
        }
      }
    };

    validateInternalEmployeeToken();

    return () => {
      cancelled = true;
    };
  }, [
    hasActiveInternalEmployeeToken,
    isInternalEmployeeAuthApp,
    setStore,
    store?.internalEmployeeToken,
  ]);

  const handlePress = async () => {
    try {
      await authenticate();
      setAuthRequired(false);
      Toast.show({
        leadingIconName: 'tick-fill',
        type: 'success',
        text1: 'Agora employee login complete',
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
    } catch (error) {
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: 'Agora employee login failed',
        text2:
          error instanceof Error ? error.message : 'Please try again later.',
        visibilityTime: 1000 * 10,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
    }
  };

  if (!isInternalEmployeeAuthApp) {
    return <></>;
  }

  const isCompact = size === 'compact';
  const isAuthenticated = hasActiveInternalEmployeeToken && !authRequired;
  const isDisabled = loading || statusChecking;
  const tooltipMessage = isAuthenticated
    ? 'You have access to all private feature.'
    : 'Login to access private features';

  const content = isAuthenticated ? (
    <View
      style={[
        style.statusButton,
        style.authenticatedButton,
        isCompact ? style.compactStatusButton : {},
      ]}
      testID="internal-employee-auth-status">
      <ImageIcon
        iconType="plain"
        name="tick-fill"
        tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
        iconSize={isCompact ? 14 : 16}
        iconParentContainerStyle={style.iconContainer}
      />
      <Text
        numberOfLines={1}
        style={[
          style.text,
          style.authenticatedText,
          isCompact ? style.compactText : {},
        ]}>
        {authenticatedText}
      </Text>
    </View>
  ) : (
    <TouchableOpacity
      style={[style.loginButton, isDisabled ? style.disabled : {}]}
      disabled={isDisabled}
      onPress={handlePress}>
      <Text
        numberOfLines={1}
        style={[style.loginText, isDisabled ? style.disabledText : {}]}>
        {isDisabled ? 'Opening...' : loginText}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[style.container, containerStyle]}>
      <Tooltip
        toolTipMessage={tooltipMessage}
        fontSize={12}
        placement="bottom"
        rootTooltipContainer={{
          display: 'flex',
        }}
        renderContent={() => content}
      />
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  statusButton: {
    flexDirection: 'row',
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderRadius: ThemeConfig.BorderRadius.medium,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  loginButton: {
    minHeight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  authenticatedButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR + '20',
  },
  compactStatusButton: {
    minHeight: 32,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  disabled: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: 6,
  },
  text: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '700',
  },
  loginText: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 16,
  },
  authenticatedText: {
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '600',
  },
  compactText: {
    fontSize: ThemeConfig.FontSize.tiny,
    fontWeight: '600',
  },
  disabledText: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
});

export default InternalEmployeeAuthButton;
