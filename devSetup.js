/* const exec = require('child_process').exec;
exec(
  'git clone https://github.com/AgoraIO-Community/ReactNative-UIKit template/agora-rn-uikit && cd template/agora-rn-uikit && git checkout app-builder',
  (err, stdout, stderr)=> console.log(stdout || stderr || err)
) */
const path = require('path')
const fs = require('fs/promises');
const ROOT = path.join(process.cwd(),'template');

const dotFiles = [
  '_buckconfig',
  '_eslintrc.js',
  '_gitattributes',
  '_gitignore',
  '_prettierrc.js',
  '_watchmanconfig',
]

async function processDotfiles(){
  try{
    const files = await fs.readdir(ROOT);
    files.forEach((file)=>{
      if(dotFiles.includes(file)){
        console.log(file);
      }
    })
  }
  catch(e){
    console.error(e);
  }
}

processDotfiles();