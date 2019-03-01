const util = require('util')
const FS = require('fs')
const PATH = require('path')
const inlineCss = require('inline-css')

const constants = {
  DIRECTORY: 'directory',
  FILE: 'file'
}

Object.keys(FS).forEach(key => {
  if (/Sync/.test(key)) {
    return
  }
  if (typeof FS[key] === 'function') {
    FS[key] = util.promisify(FS[key])
  }
})

const { stat, readdir, readFile, writeFileSync } = FS

async function safeReadDir (path) {
  let dirData = {}
  try {
    dirData = await readdir(path)
  } catch (ex) {
    if (ex.code === 'EACCES') {
      /**
       * User does not have permissions, ignore directory
       */
      return null
    } else throw ex
  }

  return dirData
}

async function safeWriteIndex (
  requiredFile,
  fileName,
  path,
  destFolder,
  inlinerOptions
) {
  if (requiredFile !== fileName) {
    return null
  }

  const stylesDir = PATH.dirname(path) + '/'

  let text = ''
  let styledHTML
  let dir
  let base
  if (destFolder === '') {
    base = 'index.html'
    dir = stylesDir
  } else {
    base = path.match(/[^/]+(?=\/[^/]+$)/)[0] + '.html'
    dir = destFolder + '/'
  }

  const opts = { url: 'file://' + stylesDir }

  if (inlinerOptions) {
    Object.getOwnPropertyNames(inlinerOptions).forEach(key => {
      opts[key] = inlinerOptions[key]
    })
  }

  try {
    text = await readFile(path, 'utf-8')
    styledHTML = await inlineCss(text, opts)
    writeFileSync(dir + base, styledHTML)
  } catch (ex) {
    if (ex.code === 'EACCES') {
      /**
       * User does not have permissions, ignore file
       */
      return null
    } else throw ex
  }
  return text
}

/**
 * Windows style paths to unix style
 */
function normalizePath (path) {
  return path.replace(/\\/g, '/')
}

/**
 * Check if specified items need to be displayed in a tree
 */
function checkPresence (preferences, item) {
  let present = true

  if (preferences === undefined) {
    present = false
  } else if (typeof preferences === 'string') {
    present = preferences !== item
  } else if (Array.isArray(preferences)) {
    present = preferences.filter(pref => pref === item).length === 0
  }

  return present
}

async function traverseDir (
  path,
  destFolder,
  baseHtml,
  options,
  inlinerOptions,
  onEachFile,
  onEachDirectory
) {
  const { base, name } = PATH.parse(path)
  path = options && options.toUnix ? normalizePath(path) : path
  const item = { base, path }
  let stats

  try {
    stats = await stat(path)
  } catch (error) {
    console.error(error)
    return null
  }

  if (stats.isFile()) {
    item.type = constants.FILE
    const ext = PATH.extname(path)

    /**
     * Omit specified extensions from the tree
     */
    if (
      options &&
      options.omitExtensions &&
      options.omitExtensions.indexOf(ext) > -1
    ) {
      return null
    }

    /**
     * Include only specified files into a tree
     */
    if (options && checkPresence(options.displayFiles, name)) {
      return null
    }

    item.text = await safeWriteIndex(
      baseHtml,
      name,
      path,
      destFolder,
      inlinerOptions
    )

    if (options && options.enableMonitor) {
      /**
       * Monitor status
       */
      console.log('File - %s - has been added to the tree', base)
    }
  } else if (stats.isDirectory()) {
    /**
     * Parse only specified directories
     */

    if (
      path !== traverseDir.origin &&
      options &&
      checkPresence(options.traverseFolders, base)
    ) {
      return null
    }

    if (options && options.enableMonitor) {
      /**
       * Monitor status
       */
      console.log('Entering directory: %s/', base)
    }

    const dirData = await safeReadDir(path)

    item.type = constants.DIRECTORY

    /**
     * Promise all is used in order to wait for all children to finish traversing
     * their contents
     */
    item.children = await Promise.all(
      dirData.map(child =>
        traverseDir(
          PATH.resolve(path, child),
          destFolder,
          baseHtml,
          options,
          inlinerOptions
        )
      )
    )

    if (options && options.enableMonitor) {
      /**
       * Monitor status
       */
      console.log('Directory - %s/ - has been parsed', base)
    }
  } else {
    return null // for sockets or pipes (FIFO)
  }
  return item
}

module.exports = traverseDir
