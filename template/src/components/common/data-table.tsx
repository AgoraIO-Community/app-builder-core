import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Text,
  StyleProp,
  ScrollView,
} from 'react-native';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import Pagination from '../../atoms/pagination/Pagination';

// Header
interface TableHeaderProps {
  columns: string[];
  containerStyle?: ViewStyle;
  rowStyle?: ViewStyle;
  cellStyle?: ViewStyle;
  firstCellStyle?: ViewStyle;
  lastCellStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  containerStyle,
  rowStyle,
  cellStyle,
  firstCellStyle,
  lastCellStyle,
  textStyle,
}) => (
  <View style={[style.thead, containerStyle]}>
    <View style={[style.throw, rowStyle]}>
      {columns.map((col, index) => {
        const isFirst = index === 0;
        const isLast = index === (columns.length > 1 ? columns.length - 1 : 0);
        return (
          <View
            key={col}
            style={[
              style.th,
              cellStyle,
              isFirst && firstCellStyle,
              isLast && lastCellStyle,
            ]}>
            <Text style={[style.thText, textStyle]}>{col}</Text>
          </View>
        );
      })}
    </View>
  </View>
);

// Body

export type TableStatus = 'idle' | 'pending' | 'resolved' | 'rejected';

export interface TableBodyProps<T> {
  status: TableStatus;
  items: T[];
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  renderRow: (item: T, index: number) => React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  horizontalContainerStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
}

function TableBody<T>({
  status,
  items,
  loadingComponent,
  emptyComponent,
  renderRow,
  bodyStyle,
}: TableBodyProps<T>) {
  const renderTableBodyContent = () => {
    // Loading state
    if (status === 'idle' || status === 'pending') {
      return <>{loadingComponent || null}</>;
    }
    // Empty state
    if (status === 'resolved' && items.length === 0) {
      return <>{emptyComponent || null}</>;
    }
    // Data state
    return items.map((item, index) => renderRow(item, index));
  };

  // Data state
  return (
    <ScrollView contentContainerStyle={[style.scrollgrow]}>
      <ScrollView horizontal contentContainerStyle={[style.scrollgrow]}>
        <View style={[style.tbody, bodyStyle]}>{renderTableBodyContent()}</View>
      </ScrollView>
    </ScrollView>
  );
}

// Footer
interface TableFooterProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  pagination?: Partial<{
    total: number;
    limit: number;
    page: number;
  }>;
  containerStyle?: ViewStyle;
  infoTextStyle?: TextStyle;
  paginationWrapperStyle?: ViewStyle;
  paginationContainerStyle?: ViewStyle;
}

const TableFooter: React.FC<TableFooterProps> = ({
  currentPage,
  onPageChange,
  pagination,
  containerStyle,
  infoTextStyle,
  paginationWrapperStyle,
  paginationContainerStyle,
}) => {
  if (!pagination || pagination.total === 0) {
    return (
      <View style={[style.mfooter, containerStyle]}>
        <Text style={infoTextStyle}> </Text>
      </View>
    );
  }

  const {limit = 10, total = 0} = pagination || {};
  const maxShowing = Math.min(limit * currentPage, total);
  const showing = total <= limit ? total : maxShowing;

  return (
    <View style={[style.mfooter, containerStyle]}>
      <Text style={[style.mfooterTitle, infoTextStyle]}>
        Showing {showing} of {total}
      </Text>
      <View style={[style.pushRight, paginationWrapperStyle]}>
        <View style={[style.pagination, paginationContainerStyle]}>
          <Pagination
            currentPage={currentPage}
            totalCount={total}
            pageSize={limit}
            onPageChange={onPageChange}
          />
        </View>
      </View>
    </View>
  );
};

export {TableHeader, TableFooter, TableBody};

export const style = StyleSheet.create({
  scrollgrow: {
    flexGrow: 1,
  },
  mContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 0,
    // width: 620,
    width: '100%',
    maxWidth: 680,
    minWidth: 340,
    height: 620,
    maxHeight: 620,
    borderRadius: 4,
    zIndex: 2,
  },
  mHeader: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 20,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  mbody: {
    width: '100%',
    flex: 1,
  },
  mfooter: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: 60,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
  },
  ttable: {
    flex: 1,
  },
  // Header styles start
  thead: {
    display: 'flex',
    height: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
  },
  throw: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  th: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    // paddingHorizontal: 12,
  },
  thText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
  },
  // Header style ends
  // Body style starts
  tbody: {
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    paddingHorizontal: 20,
    flex: 1,
  },
  tbrow: {
    display: 'flex',
    alignSelf: 'stretch',
    minHeight: 50,
    flexDirection: 'row',
    paddingBottom: 10,
    paddingTop: 20,
  },
  td: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  tpreview: {
    width: '100%',
    height: 76,
    padding: 4,
    backgroundColor: 'black',
    border: '1px solid grey',
    color: $config.FONT_COLOR,
  },
  ttime: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
  },
  tname: {
    color: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
  },
  tactions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tlink: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    lineHeight: 12,
  },
  // footer start
  mfooterTitle: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
  },
  pagination: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_4_COLOR,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
  },
  placeHolder: {
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
  },
  // footer ends
  captionContainer: {
    height: 44,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    padding: 12,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  captionText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    paddingLeft: 8,
  },
  infotextContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
  },
  iconButtonContainer: {
    marginTop: -8,
  },
  iconButton: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
  },
  iconButtonHoverEffect: {
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%'],
    borderRadius: 16,
  },
  iconShareLink: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zeroHPadding: {
    paddingHorizontal: 0,
  },
  pushRight: {
    marginLeft: 'auto',
  },
  pl10: {
    paddingLeft: 10,
  },
  plzero: {
    paddingLeft: 0,
  },
  pt10: {
    paddingTop: 10,
  },
  pt12: {
    paddingTop: 12,
  },
  pv10: {
    paddingVertical: 10,
  },
  ph20: {
    paddingHorizontal: 20,
  },
  pl15: {
    paddingLeft: 15,
  },
  // icon celles
  tdIconCell: {
    flex: 0,
    flexShrink: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 52,
    // paddingRight: 50 + 12,
  },
  thIconCell: {
    flex: 0,
    flexShrink: 0,
    alignSelf: 'stretch',
    justifyContent: 'center',
    minWidth: 50,
    paddingHorizontal: 12,
  },
  alignCellToRight: {
    alignItems: 'flex-end',
  },
});
