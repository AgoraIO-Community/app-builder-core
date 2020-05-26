import React, {useState} from 'react';
import {View, Button, Text} from 'react-native';

const App: React.FC = () =>{
  let a: number = 10;
  let [count, setCount] = useState<number>(0);
  return <View>
    <Text>Hello world: {count}/{a}</Text>
    <Button title={'Count ++'} onPress={() => setCount(count+1)}/>
  </View>;
};

export default App;