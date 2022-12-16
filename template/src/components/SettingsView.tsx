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
import React, {useState} from 'react';
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
import {isWebInternal} from '../utils/common';
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

interface EditNameProps {}
const EditName: React.FC = (props?: EditNameProps) => {
  const [newName, setNewName] = useState('');
  const username = useGetName();
  const setUsername = useSetName();
  const disabled = !newName || newName.length === 0 || newName === username;
  return (
    <>
      <Text style={editNameStyle.yournameText}>Your name</Text>
      <Spacer size={12} />
      <View style={editNameStyle.container}>
        <ImageIcon name="person" iconSize={20} iconType="plain" />
        <TextInput
          style={editNameStyle.inputStyle}
          placeholder={username}
          value={newName}
          autoFocus
          onChangeText={(text) => setNewName(text)}
          onSubmitEditing={() => setUsername(newName)}
          placeholderTextColor={
            $config.FONT_COLOR + ThemeConfig.EmphasisPlus.disabled
          }
        />
        <TouchableOpacity
          disabled={disabled}
          style={[
            editNameStyle.editBtn,
            disabled ? {opacity: ThemeConfig.EmphasisOpacity.disabled} : {},
          ]}
          onPress={() => setUsername(newName)}>
          <Text style={editNameStyle.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const editNameStyle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 8,
    paddingLeft: 12,
  },
  editBtn: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderLeftWidth: 1,
    borderLeftColor: $config.INPUT_FIELD_BORDER_COLOR,
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

  return (
    <View
      style={
        isWebInternal()
          ? isSmall
            ? CommonStyles.sidePanelContainerNative
            : CommonStyles.sidePanelContainerWeb
          : CommonStyles.sidePanelContainerNative
      }>
      <SidePanelHeader
        centerComponent={
          <Text style={SidePanelStyles.heading}>{settingsLabel}</Text>
        }
        trailingIconName="close-rounded"
        trailingIconOnPress={() => {
          if (!isSmall) {
            setSidePanel(SidePanelType.None);
          } else {
            props.handleClose && props.handleClose();
          }
        }}
      />
      <ScrollView style={style.contentContainer}>
        <EditName />
        <Spacer size={24} />
        <SelectDevice isIconDropdown />
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
