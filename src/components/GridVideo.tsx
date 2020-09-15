import React, {useMemo, useContext, useState} from 'react';
import {View, Platform, StyleSheet} from 'react-native';
import MinUidContext from '../../agora-rn-uikit/src/MinUidContext';
import MaxUidContext from '../../agora-rn-uikit/src/MaxUidContext';
import {MaxVideoView} from '../../agora-rn-uikit/Components';

const layout = (len: number, isDesktop: boolean = true) => {
  const rows = Math.round(Math.sqrt(len));
  const cols = Math.ceil(len / rows);
  let [r, c] = isDesktop ? [rows, cols] : [cols, rows];
  return {
    matrix:
      len > 0
        ? [
            ...Array(r - 1)
              .fill(null)
              .map(() => Array(c).fill('X')),
            Array(len - (r - 1) * c).fill('X'),
          ]
        : [],
    dims: {r, c},
  };
};

// const isDesktop = Platform.OS === 'web';

const GridVideo = () => {
  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);
  const users = [...max, ...min];
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const [dim, setDim] = useState([0, 0]);
  const isDesktop = dim[0] > dim[1] + 100;
  let {matrix, dims} = useMemo(() => layout(users.length, isDesktop), [
    users.length,
    isDesktop,
  ]);
  return (
    <View style={style.full} onLayout={onLayout}>
      {matrix.map((r, ridx) => (
        <View style={style.gridRow} key={ridx}>
          {r.map((c, cidx) => (
            <View style={style.gridVideoContainer} key={cidx}>
              <View style={style.gridVideoContainerInner}>
                <MaxVideoView
                  user={users[ridx * dims.c + cidx]}
                  key={users[ridx * dims.c + cidx].uid}
                />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const style = StyleSheet.create({
  full: {
    flex: 1,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  gridVideoContainer: {
    flex: Platform.OS === 'web' ? 1 / dims.c : 1,
    // backgroundColor: '#fff',
    marginHorizontal: 'auto',
  },
  gridVideoContainerInner: {
    // borderColor: '#fff',
    // borderWidth:2,
    flex: 1,
    margin: 1,
  },
})
export default GridVideo;
