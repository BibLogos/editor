import { config } from 'dotenv'
import { exec } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import readline from 'readline'

config()

console.clear()

const npmPackageText = readFileSync('package.json')
const npmPackage = JSON.parse(npmPackageText)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`Specify version: (${npmPackage.version})`, async function (version) {
  if (!version) {
    version = npmPackage.version
  }
  
  if (version !== npmPackage.version) {
    npmPackage.version = version
    writeFileSync('package.json', JSON.stringify(npmPackage, null, 2))
  }

  rl.close();

  try {
    await run('git add -A')
    await run(`git commit -m "build for ${version}"`)
    await run(`git push`) 
    await run(`cd api && wrangler publish`) 
    console.clear()
    console.log('='.repeat(40))
    console.log(`Deployed version: ${version}`)
    console.log('='.repeat(40))
  }
  catch (exception) {
    console.log(exception)
  }
})

const run = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      
      if (error) {
          reject(`error: ${error.message}`);
          return;
      }
      
      if (stderr) {
          resolve(`stderr: ${stderr}`);
          return;
      }

      console.log(stdout)
      resolve(stdout);
    });  
  })
}
