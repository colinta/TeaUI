#!/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

function generateFileHash(filePath) {
  const fileContent = fs.readFileSync(filePath);
  return crypto.createHash('sha1')
    .update(fileContent)
    .digest('hex');
}

async function findFiles(startPath) {
  const files = [];

  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (stat.isFile() &&
            (item.endsWith('.ts') || item.endsWith('.js'))) {
        files.push(fullPath);
      }
    }
  }

  traverse(startPath);
  return files.sort();
}

async function calculateChecksum(directory) {
  const files = await findFiles(directory);
  const hashes = [];

  for (const file of files) {
    const hash = generateFileHash(file);
    // Create a format similar to shasum output
    hashes.push(`${hash}  ${file}`);
  }

  // Sort the hashes and create a final combined hash
  const sortedHashes = hashes.sort().join('\n');
  return crypto.createHash('sha1')
    .update(sortedHashes)
    .digest('hex');
}

async function main(directory, command) {
  try {
    const newSum = await calculateChecksum(directory);
    let oldSum = '';

    try {
      oldSum = await readFileAsync('.sum', 'utf8');
    } catch (error) {
      // File doesn't exist, ignore error
    }

    if (oldSum.trim() === newSum) {
      console.log('No changes');
      return 0;
    }

    console.log('Changes detected');

    try {
      execSync(`pnpm ${command}`, { stdio: 'inherit' });

      // Remove old sum file if it exists
      try {
        await unlinkAsync('.sum');
      } catch (error) {
        // Ignore error if file doesn't exist
      }

      // Write new sum
      await writeFileAsync('.sum', newSum);
      return 0;
    } catch (error) {
      return error.status || 1;
    }
  } catch (error) {
    console.error('Error:', error);
    return 1;
  }
}

// If running directly (not imported as a module)
if (require.main === module) {
  const directory = process.argv[2];
  if (!directory) {
    console.error('Please provide a directory path');
    process.exit(1);
  }

  main(directory).then(process.exit).catch(error => {
    console.error(error);
    process.exit(1);
  });
} else {
  module.exports = {
    main,
  }
}
