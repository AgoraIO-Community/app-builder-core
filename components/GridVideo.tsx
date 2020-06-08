import React, {useMemo, useContext} from 'react';
import {View, Platform} from 'react-native';
import MinUidContext from '../agora-rn-uikit/src/MinUidContext';
import MaxUidContext from '../agora-rn-uikit/src/MaxUidContext';
import {MaxVideoView} from '../agora-rn-uikit/Components';
import styles from './styles';

const layout = (len: number, isDesktop: boolean = true) => {
  const rows = Math.round(Math.sqrt(len));
  const cols = Math.ceil(len / rows);
  let [r, c] = isDesktop ? [rows, cols] : [cols, rows];

  return {
    matrix: (len > 0) ? [
      ...Array(r - 1).fill(null).map(() => Array(c).fill('X')),
      Array(len - (r - 1) * c).fill('X')
    ] : [],
    dims: {r, c}
  };
};

const isDesktop = Platform.OS === 'web';

const GridVideo = () => {
  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);
  const users = [...max, ...min];
  let {matrix, dims} = useMemo(() => layout(users.length, isDesktop), [users.length, isDesktop ]);

  return (
    <View style={styles.full}>
      {matrix.map((r, ridx) => (
        <View style={styles.gridRow} key={ridx}>
          {r.map((c, cidx) => (
            <View style={styles.gridVideoContainer} key={cidx}>
              <MaxVideoView
              user={users[ridx * dims.c + cidx]}
              key={users[ridx * dims.c + cidx].uid}
            />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default GridVideo;
