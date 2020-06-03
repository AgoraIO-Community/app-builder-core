import React from 'react';
import {View, TouchableOpacity, Image} from 'react-native';
import styles from '../components/styles';

const Navbar = (props) => {
  const participantsView = props.participantsView;
  const setParticipantsView = props.setParticipantsView;
  const layout = props.layout;
  const setLayout = props.setLayout;

  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        onPress={() => {
          setParticipantsView(!participantsView);
        }}
        style={styles.participantButton}>
        <Image source={{uri: participantIcon}} style={styles.participantIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setLayout(!layout);
        }}
        style={styles.participantButton}>
        <Image
          source={{uri: switchLayoutIcon}}
          style={styles.participantIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const participantIcon =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABQCAYAAADvCdDvAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAACTwAAAk8B95E4kAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAatSURBVHic7Zzpr11jFId/61RLzVGNIVSooYiEqhgrPphVXFLV8hcgjTQhESF8EaWGkEjKV7SmUDXGPItqKyKtchFCDdUKdSu07n182PvGdbvP3dN6z97nZD/J+fLufdbvXWudPa293iM1NDQ0NDQ09ARW9QTyAkyRdK6k0yUdKekgSbvHmzdL+lbSWklvS3rJzL6rYp49DWDAhcDrwCDZGQReA2YBXffjqyXADGBFjiS040Pg+Kr96Vrio+IaYKtDMob5B7gFaFXtX1cBTAAec0zEaJ4Gdqraz64AGA88FzAZwzwL7FC1v7UHeLADyRhmcdX+1hrgig4mY5h5Vfs9ktrcCgJ7SVonaXKHpTdJmmZmGzusm0id7jZuUueTIUmTJF1fgW4imY8QYIKkvvgzXdIB8abvJa2WtEzSMjPbmncSwN6KnrB3zvtdJ7ZImmJmv+b9Ysi4jCV6CfBVhvPxl8DFBezPD3aFyM7VdYtLkmALuKOAc7eT4+ELeLeAhjdv1S0uScKLSji4MKPGrvg+jRflb2CXusQlSfQSByf7Muic6qDjxclVxyXx8CG6UC1Km1wGFgHjU/Y5zEHHizHn0om4tDuf9Uk6xEH4UEkXpewzyUHHi71TtgePy1gJ8SLN1kRHrbKk3XYHj0u7hMxwFE6z9ZejVln+TNkePC7tErKvo/D+KdtrUbKISZtL8Li0S4hnjYuU7f2OWmX5ImV78Li0S8gPjsJptj6RtM1RryhbJX2ask/wuLRLyEpH4TFtmdmApA8d9YrygZltSdkneFzaJeQZR+Esth531CtKljkEj0viOTF+AForaWpJ0X5JR5vZmKckYJKiam+m0kUABiQdlFbt7URcEo+QuFR8XUlRJF2bloxYb5OkB0vqlWFxltJ7p+Oy/TeLVTSHuS2n1l7AhpI1oiJsJDpCaxmX0cItopJxHoaAhRQoMwPzSjhalDl1j0vSBPqA/gyiXwBptas0rcU5HS3D/d0SlyTx8cBs4GHgM+CP+LMWeCjellbZzaKzA1HPVGiW49CX1am4VApR5+LSgMl4iqZzMR+E6e3dRtPbWw5gOvCBQzLeB46r2p+egOhouQB4hfzrQ14Bzq/ah6zUpnMxK8AB+m8F1VHafgXVN/r/Cqr1FUyzMGOVTkY3f2Uta2xR1CS2SlG9xrdJrEKc4pKveY7szV9Z8WkSq5g4Ll92LC4Ub/7Kyu104To/outX6Lhsf9dHueavNPqBMyuIpwvATGBNwPgsHC3o0fyVxBBwJ7BjRbF0A9gx9iUUfcNCE/C9ZgwzAMzN4OhU4CpgCbCaqPo6/DC4HrgZ2M8hoPvFttbHtrfGWqtj7SuB1J4rYC6wJUC8+oHxAuYEML4ZOHUMp8YBlwPvZbS3jWi9+QLgSGBchsCNi/ddEH93WwadoXhO88bSAE4jqld5M9uAJZI8l3UNSDrPzN5t48zZku6TdEQJjT8lrZH0laTfJP0ej+8haU9Fb/SOVrn1JuskzTezV5M2AjMlvSjft5yPCPjcMcNDwOw2Dkyksws6vXgASOyuJDq7DDlqrRPR6cWLxEZkYDLwkaNOp1kBJC63A+5y1NlsQFojW1bWSDpu9Lvi2JG3JU1z0qmKdZJON7NfRg4SPb1/rKiMUxqvMjSSrkxIxkRJL6j7kyFFPjzPqPcocfnjaqV3aGbCKyFPmtk7CeP3yrdBuWpOkHTP6EEze1NRfao0Xqesk8zsf92HwFmSXnawXUfONLPXRg4AJ0haUdawR0LeMrMzRg4Q3cOvlXR4Sdt15TNJx5jZ4MhB4B1Jp5Ux3FL03FCGhxPGLlPvJkOK/sku6fZ+SUm7m1sq10A8KGl5wnjuNd9dyPyEsWWShkrYXNlSwkUqjwEz2zByAJgqKXU1aw9wCnDwyAEz+1HRLXBR7m6Z2XJJRdsbVyWMnaMufDVcAJN0dsL46oL2bjWz51uSZGY3SLpQ0hvKd01J+jWUuqh1GTMTxvIkZEDS65JmmdmNUoBfMvCxpGO97daUVWbm+pwVomHswAA268oUb4MhErJbAJt1Zff0XfIR4pTlVazsCszMNYZNj2vNaBJSM5qE1IwQCRlM36VncPc1REI2pO/SM/zkbTBEQjz/7aDufORtMERClgawWVce9TYY4jmkpeiXM93bds1YKelEMytTbt8O9yMknuCl6u1ryQZJl3onQwp022tmX0s6Scnl+W5npaIegm9CGA/63iI+fc1R1Ko6Q9I+klL7cmvGoKSfFZ2Gl0p6IsSR0dDQ0NDQ0NBj/AtyxIlmNwu9yAAAAABJRU5ErkJggg==';
const switchLayoutIcon =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcAAAAIACAMAAAAi+0xoAAABL1BMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+r0Zv2AAAAZHRSTlMAAQIEBQYMDQ4PEBESFBYhIiMkMDE0NVBRUlNUVVZYWV1eX2JkZm9xcnR8fX5/gIGCiYqLjY6PnZ+ho6SlpqeztLXBwsTFysvMzc7P0NPU1dbd3uDo6err7O3u7/Dx8vj5+v3+3xm1sQAAAAFiS0dEZMLauAkAAAVTSURBVHja7d3nUpNRFIbR/SGKDQQriL3SbBQr2AUVA4oFE1GReP/X4A8QEUHRcSbfhvVcAJN510wyKZwTIUmSJEmSJEmSJEmSJEmSJEmSJEmSNk1t3ZfuPpupffmqhvalNvNsbOBo29/pHR6p1G1XpuqV4UMb1dvZ+9JgZWy6t2UDfHuv1ExV1mqX9/yBrzj9zkxlrnqh6Xd++5+YqOw97ljfr/ODfcrfpxPr8DVdN06Ohtd8Gt0+ZpksjTav4ffALnm6/4tgccsqmRpb/Szq9S9ZQz/7HbNItk6u9OuYM0i25tpXvAB6/56wR8Uy4DlrZOzM8ufXs8bI2NvdS4BXbZGzgaXv/3x/lLTq4veDvZbIWk9ERFQMkbXpiIjDdsjbwYgYMUPehiJiygx5m4xo8/vBxNVbo9sKmeuKy0bIXH/cNULm7sRTI2RuPF4bIXMzUTVC5mZj3giZ+xw2yB1AgAIogAAFUAAFEKAACqAAAhRAARRAgAIogAIIUAAFUAABCqAAAhRAARRAgP/0Bxrcln/8AAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQoAEAAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECDA/wKoxgYQoAAKIEABFEABBCiAAiiAAAVQAAUQoAAKoAACFEABFECAAiiAAAVQAAUQoAAKoAACFEABFECAAiiAAghQAAVQAAEKoAAKIEABFECAAiiAAghQAAVQAAFqawC6ANINngABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABevwAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCgAQACBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAEC3AyAamwAAQqgAAIUQAEUQIACKIACCFAABVAAAQqgAAogQAEUQAEEKIACCFAABVAAtybgvA0y9zmqRsjcbLw2QuZm4qkRMjceY0bI3O24ZITM9cVRI2SuM9rqVsjbQmtExQx5ex4RI2bI22BEHDJD3g5EeA5N3HRERPQaIms9ERHRUrNEzqotiyceXjFFzvqXjqzc884WGXuz6/uho2eNkbFTy6fGFo+tka+HxY9zfzvm7JGtD+0rT27uNki2un4+e3vYIrm6turw9OKmTTI12rT6+PvmB1bJ073mXy8w2HbDLlm63bzWFRTFkGVSVL9WrHOLyBGfiibo4/H174Fpf2Sf0r9/3/e7m3yK029NVOaq54s/XMa0e8CP7Uvb+/5dG7hPa0fPlKnKWOXijo3eiXZw6MWCwcrUwuTggb+71661q2904lXVf581uPnqq4k7fZ2tIUmSJEmSJEmSJEmSJEmSJEmSJEmSNk3fAJ798DJTq8YqAAAAAElFTkSuQmCC';

export default Navbar;
