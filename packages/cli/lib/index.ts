import {mkdir, readFile, writeFile, readdir} from 'fs/promises'
import {join} from 'path'

export async function create(name: string, options: {framework: string}) {
  const appPath = join(process.cwd(), name)
  await mkdir(appPath, {recursive: true})

  const templatePath = join(__dirname, 'frameworks', options.framework)
  const templateFiles = await readdir(templatePath)

  for (const file of templateFiles) {
    const templateFilePath = join(templatePath, file)
    const content = await readFile(templateFilePath, 'utf-8')
    const processedContent = content.replace(/\{\{name\}\}/g, name)
    await writeFile(join(appPath, file), processedContent)
  }

  console.log(
    `Created new TeaUI application: ${name} with framework: ${options.framework}`,
  )
}
