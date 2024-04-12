import React from 'react';
import {usePagination, DOTS} from './usePagination';
import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';
import ThemeConfig from '../../theme';

const Pagination = props => {
  const {
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage,
    pageSize,
  } = props;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1];

  return (
    <View>
      <View style={style.paginationContainer}>
        <TouchableOpacity
          disabled={currentPage === 1}
          style={[style.paginationButton, style.paginationFirstButton]}
          onPress={onPrevious}>
          <Text
            style={[
              style.btnText,
              currentPage === 1 ? style.disabledText : {},
            ]}>
            Prev
          </Text>
        </TouchableOpacity>
        {paginationRange.map(pageNumber => {
          if (pageNumber === DOTS) {
            return (
              <Text style={[style.paginationButton, style.btnText]}>
                &#8230;
              </Text>
            );
          }
          return (
            <TouchableOpacity
              key={pageNumber}
              onPress={() => onPageChange(pageNumber)}
              style={[
                style.paginationButton,
                pageNumber === currentPage ? style.activeButton : null,
              ]}>
              <Text style={style.btnText}>{pageNumber}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          disabled={currentPage === lastPage}
          style={[style.paginationButton, style.paginationLastButton]}
          onPress={onNext}>
          <Text
            style={[
              style.btnText,
              currentPage === lastPage ? style.disabledText : {},
            ]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Pagination;

const style = StyleSheet.create({
  paginationContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  paginationButton: {
    alignItems: 'center',
    backgroundColor: $config.CARD_LAYER_3_COLOR,
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
    minWidth: 32,
    borderRightWidth: 1,
    borderRightColor: $config.CARD_LAYER_4_COLOR,
  },
  paginationFirstButton: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  paginationLastButton: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  btnText: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 20,
  },
  disabledText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
  },
  activeButton: {
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderRightColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
});
