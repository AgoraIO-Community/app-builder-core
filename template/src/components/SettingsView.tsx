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
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import SelectDevice from '../subComponents/SelectDevice';
import LanguageSelector from '../subComponents/LanguageSelector';
import {isWebInternal, maxInputLimit} from '../utils/common';
import {useSidePanel} from '../utils/useSidePanel';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import ThemeConfig from '../theme';
import SidePanelHeader, {
  SidePanelStyles,
} from '../subComponents/SidePanelHeader';
import useGetName from '../utils/useGetName';
import useSetName from '../utils/useSetName';
import ImageIcon from '../atoms/ImageIcon';
import Spacer from '../atoms/Spacer';
import CommonStyles from './CommonStyles';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {useLayout} from '../utils/useLayout';
import {getGridLayoutName} from '../pages/video-call/DefaultLayouts';
import {useFocus} from '../utils/useFocus';

interface EditNameProps {}
const EditName: React.FC = (props?: EditNameProps) => {
  const [saved, setSaved] = useState(false);
  const username = useGetName();
  const [newName, setNewName] = useState(username);
  const [editable, setEditable] = useState(false);
  const [disabled, setDisabled] = useState(
    !newName ||
      newName.length === 0 ||
      newName.trim() == '' ||
      newName === username,
  );
  const setUsername = useSetName();

  useEffect(() => {
    setDisabled(
      !newName ||
        newName.length === 0 ||
        newName.trim() == '' ||
        newName === username,
    );
  }, [newName]);

  const inputRef = useRef(null);
  const onPress = () => {
    if (editable) {
      const trimmedText = newName?.trim();
      if (trimmedText) {
        setUsername(trimmedText);
        setNewName(trimmedText);
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2000);
      setEditable(false);
    } else {
      setEditable(true);
      inputRef.current.focus();
    }
  };

  const {currentFocus, setFocus} = useFocus();

  useEffect(() => {
    if (currentFocus.editName) {
      setEditable(true);
      setTimeout(() => {
        inputRef.current.focus();
        setFocus((prevState) => {
          return {
            ...prevState,
            editName: false,
          };
        });
      }, 500);
    }
  }, [currentFocus?.editName]);

  return (
    <>
      <Text style={editNameStyle.yournameText}>Your name</Text>
      <Spacer size={12} />
      <View style={editNameStyle.container}>
        <View style={editNameStyle.nameContainer}>
          <ImageIcon
            name="person"
            iconSize={20}
            iconType="plain"
            tintColor={$config.SEMANTIC_NETRUAL}
          />
          <TextInput
            maxLength={maxInputLimit}
            ref={inputRef}
            style={[
              editNameStyle.inputStyle,
              !editable
                ? {
                    color:
                      $config.FONT_COLOR + ThemeConfig.EmphasisPlus.disabled,
                  }
                : {},
            ]}
            placeholder={username}
            value={newName}
            editable={editable}
            onChangeText={(text) => setNewName(text)}
            onSubmitEditing={onPress}
            placeholderTextColor={
              $config.FONT_COLOR + ThemeConfig.EmphasisPlus.disabled
            }
          />
        </View>

        <PlatformWrapper>
          <TouchableOpacity
            disabled={saved ? true : editable ? disabled : false}
            style={[
              editNameStyle.editBtn,
              editable
                ? disabled
                  ? {opacity: ThemeConfig.EmphasisOpacity.disabled}
                  : {}
                : {},
            ]}
            onPress={onPress}>
            <Text style={editNameStyle.editBtnText}>
              {saved ? 'Saved' : editable ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </PlatformWrapper>
      </View>
    </>
  );
};

const PlatformWrapper = ({children}) => {
  const [isHovered, setIsHovered] = useState(false);
  return isWebInternal() ? (
    <div
      style={
        isHovered
          ? {
              background:
                $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['15%'],
            }
          : {}
      }
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}>
      {children}
    </div>
  ) : (
    children
  );
};

const editNameStyle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 8,
    paddingLeft: 20,
    overflow: 'hidden',
  },
  editBtn: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderLeftWidth: 1,
    borderLeftColor: $config.INPUT_FIELD_BORDER_COLOR,
  },
  nameContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  inputStyle: {
    color: $config.FONT_COLOR,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.medium,
    width: '100%',
    paddingHorizontal: 8,
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  editBtnText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '600',
    color: $config.SECONDARY_ACTION_COLOR,
  },
  yournameText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    color: $config.FONT_COLOR,
  },
});
const SettingsView = (props) => {
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isSmall = dim[0] < 700;
  const settingsLabel = 'Settings';
  const {setSidePanel} = useSidePanel();
  const {currentLayout} = useLayout();

  return (
    <View
      style={[
        isWebInternal()
          ? isSmall
            ? CommonStyles.sidePanelContainerNative
            : CommonStyles.sidePanelContainerWeb
          : CommonStyles.sidePanelContainerNative,
        isWebInternal() && !isSmall && currentLayout === getGridLayoutName()
          ? {marginVertical: 4}
          : {},
      ]}>
      <SidePanelHeader
        centerComponent={
          <Text style={SidePanelStyles.heading}>{settingsLabel}</Text>
        }
        trailingIconName="close"
        trailingIconOnPress={() => {
          props.handleClose && props.handleClose();
          setSidePanel(SidePanelType.None);
        }}
      />
      <ScrollView style={style.contentContainer}>
        <EditName />
        <Spacer size={24} />
        {isWebInternal() && <SelectDevice isIconDropdown />}
        <LanguageSelector />
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  contentContainer: {
    padding: 20,
  },
});

export default SettingsView;
