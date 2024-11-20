#!/usr/bin/env node

const fs = require('fs/promises')
const path = require('path')

const MAIN_PACKAGE = 'packages/teaui/package.json'
const DEPENDENT_PACKAGES = [
  'packages/shared/package.json',
  'packages/react/package.json',
  'packages/preact/package.json',
]

async function readPackageJson(filePath) {
  const content = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(content)
}

async function writePackageJson(filePath, content) {
  await fs.writeFile(filePath, JSON.stringify(content, null, 2) + '\n')
}

function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number)

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'bug':
      return `${major}.${minor}.${patch + 1}`
    default:
      throw new Error('Invalid bump type. Use "major", "minor", or "bug"')
  }
}

async function updateDependentPackages(newVersion, package) {
  for (const packagePath of DEPENDENT_PACKAGES) {
    const pkg = await readPackageJson(packagePath)
    pkg.version = newVersion

    if (pkg.dependencies && pkg.dependencies[package]) {
      pkg.dependencies[package] = `^${newVersion}`
      await writePackageJson(packagePath, pkg)
      console.log(`Updated ${packagePath} to version ^${newVersion}`)
    } else {
      console.error(`${packagePath} does not depend on ${package}`)
    }
  }
}

async function main() {
  const bumpType = process.argv[2]

  if (!['major', 'minor', 'bug'].includes(bumpType)) {
    console.error('Please specify bump type: "major" "minor" or "bug"')
    process.exit(1)
  }

  try {
    // Read and update main package version
    const mainPkg = await readPackageJson(MAIN_PACKAGE)
    const currentVersion = mainPkg.version
    const newVersion = bumpVersion(currentVersion, bumpType)

    mainPkg.version = newVersion
    await writePackageJson(MAIN_PACKAGE, mainPkg)
    console.log(`Bumped version from ${currentVersion} to ${newVersion}`)

    // Update dependent packages
    await updateDependentPackages(newVersion, '@teaui/core')

    console.log('Version bump completed successfully!')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()
