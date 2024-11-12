import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import {promisify} from 'util'
import {execSync} from 'child_process'

const readFile = promisify(fs.readFile)
const readDir = promisify(fs.readdir)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)
const stat = promisify(fs.stat)

async function generateFileHash(filePath) {
  const fileContent = await readFile(filePath)
  return crypto.createHash('sha1').update(fileContent).digest('hex')
}

async function findFiles(startPath) {
  const files = []

  async function traverse(currentPath) {
    const items = await readDir(currentPath)

    for (const item of items) {
      const fullPath = path.join(currentPath, item)
      const fileStat = await stat(fullPath)

      if (fileStat.isDirectory()) {
        await traverse(fullPath)
      } else if (
        fileStat.isFile() &&
        ['.ts', '.js'].some(ext => item.endsWith(ext))
      ) {
        files.push(fullPath)
      }
    }
  }

  await traverse(startPath)
  return files.sort()
}

async function calculateChecksum(directory) {
  const files = await findFiles(directory)
  const hashes = []

  for (const file of files) {
    const hash = await generateFileHash(file)
    // Create a format similar to shasum output
    hashes.push(`${hash}  ${file}`)
  }

  // Sort the hashes and create a final combined hash
  const sortedHashes = hashes.sort().join('\n')
  return crypto.createHash('sha1').update(sortedHashes).digest('hex')
}

export async function compare(directory) {
  try {
    const newSum = await calculateChecksum(directory)

    try {
      const oldSum = await readFile('.sum', 'utf8')

      if (oldSum.trim() === newSum) {
        return 0
      }
    } catch (error) {
    }

    try {
      // Remove old sum file if it exists
      try {
        await unlink('.sum')
      } catch (error) {
        // Ignore error if file doesn't exist
      }

      // Write new sum
      await writeFile('.sum', newSum)
      return 1
    } catch (error) {
      return error.status || 1
    }
  } catch (error) {
    console.error('Error:', error)
    return 1
  }
}

export function main(directory, command) {
  if (!directory) {
    console.error('Usage: check <dir> <command>')
    console.error('    Error: provide a directory path')
    process.exit(1)
  }
  if (!command) {
    console.error('Usage: check <dir> <command>')
    console.error('    Error: provide a command')
    process.exit(1)
  }

  compare(directory)
    .then(success => {
      if (success === 0) {
        console.log('No changes')
      } else {
        console.log('Changes detected')
        execSync(command, {stdio: 'inherit'})
    }
      process.exit(0)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
