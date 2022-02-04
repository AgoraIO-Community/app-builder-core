import React from 'react';
import {concat} from 'lodash';
const CustomPreCall:React.FC<{}> = () =>{

  const a = ['hello']
  const b = ['world']

  const c = concat(a,b)
  return(
    <div>
      <h1> PreCall screen custom </h1>
      <ul>
      {
        c.map((i, ) => {
          return <li  key={i}>{i}</li>
        })  
      }
      </ul>
    </div>
  )
}
export default CustomPreCall