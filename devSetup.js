const path = require('path')
const fs = require('fs/promises');
const ROOT = path.join(process.cwd(),'template');

console.log('\n\n\tConfiguring the project for dev environment')

const dotFiles = [
  '_buckconfig',
  '_eslintrc.js',
  '_gitattributes',
  '_prettierrc.js',
  '_watchmanconfig',
]

async function processDotfiles(){
  try{
    let dotPromises = [];
    const files = await fs.readdir(ROOT);
    files.forEach(async (file) => {
      if(dotFiles.includes(file)){
        const baseFileName = file.slice(1);
        dotPromises.push(fs.copyFile(
          path.join(ROOT,`_${baseFileName}`),
          path.join(ROOT,`.${baseFileName}`),
        ))
      }
    })
    await Promise.all(dotPromises);
    console.log('\t✓ Generated dot files\n')
  }
  catch(e){
    console.error(e);
  }
}


async function copyConfig(){
  try{
    console.log(process.argv);
    const mode = process.argv[2] || "meeting";
    const isMeeting = mode === "meeting";
    await fs.copyFile(
      path.join(
        process.cwd(),
        isMeeting ? "config.json" : "live-streaming.config.json"
      ),
      path.join(ROOT, "config.json")
    );
    console.log('\t✓ Added dev config in the template')
  }
  catch(e){
    console.error(e);
  }
}

async function copyTheme(){
  try{
    await fs.copyFile(
      path.join(process.cwd(),'theme.json'),
      path.join(ROOT,'theme.json'),
    )
    console.log('\t✓ Added theme in the template')
  }
  catch(e){
    console.error(e);
  }
}

processDotfiles();
copyConfig();
copyTheme();