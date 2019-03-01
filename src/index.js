const traverseDir = require('./dirCssInliner')
const PATH = require('path')

/**
 *
 * @module dir-css-inliner
 * @param {string} originFolder Relative path to the entry point of the script. It doesn't matter how many nested directories there are, the script will traverse all of them.
 * @param {string} [destFolder=empty string] Relative path to the destination folder, where the script should put all found HTML files with inlined styles. The directory name, where HTML file was found, will be used as the name of the HTML file. If **destFolder** is not specified, index.html file with inlined styles will be created in the same directory, where **baseHtml** was found. Default value is ''.
 * @param {string} [baseHtml=prototype] Name of the HTML file, that requires styles from external (.css only) file via link tag. Default value is 'prototype'
 * @param {object} [options] - options for defining traversing behavior of the script
 * @param {array|string} options.omitExtensions Extensions to omit from the tree. Use case: omit extensions ['.jpg', '.jpeg', '.png'] (or only '.jpg') from being added to the tree.
 * @param {array|string} options.displayFiles Files to include in the tree. Use case: directory has several .html files and .css files, so you make the script traverse only some of them by specifying their names. For ex., ['prototype', 'stylesForPrototype'] (or only 'prototype').
 * @param {array|string} options.traverseFolders Directories to traverse. Use case: traverse only recently modified or created directory by specifying its name. For ex., ['password-recovery', 'password_change'] (or only 'password-recovery').
 * @param {boolean} options.enableMonitor Monitor the traversing status of the **originFolder**.
 * @param {boolean} options.toUnix For windows users normalize backticks to Unix style.
 * @param {object} inlinerOptions Options for [inline-css module](https://www.npmjs.com/package/inline-css)
 * @returns {Promise} Promise object represents tree view with paths to all nested elements of the **originFolder**
 * @example
 ```js
dirCssInliner(
  './prototypes',
  './test',
  '',
  {
    omitExtensions: ['.jpg', '.jpeg', '.png'],
    displayFiles: ['prototype', 'styles'],
    traverseFolders: 'access_recovery',
  },
  {
    applyWidthAttributes: true,
    applyTableAttributes: true,
    removeHtmlSelectors: true,
    removeLinkTags: false
  }
)
// returns Promise
// traverses only access_recovery directory in <%cwd%>/prototypes/
// displays in the output (Promise) tree only files which names are 'prototype' or 'styles'
// creates access_recovery.html file in the <%cwd%>/test/ with inlined styles
// Promise.then(res => console.log(JSON.stringify(res, undefined, 2))) outputs the following
{
  base: 'prototypes',
  path: '<%cwd%>/prototypes',
  type: 'directory',
  children: [
    null, // <--- another directory, not specified in traverseFolders
    {
      base: 'access_recovery',
      path: '<%cwd%>/prototypes/access_recovery',
      type: 'directory',
      children: [
        {
          base: 'styles.css',
          path: '<%cwd%>/prototypes/access_recovery/styles.css',
          type: 'file',
          text: null // <--- only baseHtml has value of this property
        },
        {
          base: 'prototype.html',
          path: '<%cwd%>/prototypes/access_recovery/prototype.html',
          type: 'file',
          text: 'long html file text with inlined styles'
        },
        null // <--- another file (not in displayFiles)
      ]
    }
  ]
}

```
*/

const dirCssInliner = (
  originFolder,
  destFolder,
  baseHtml,
  options,
  inlinerOptions
) => {
  traverseDir.origin = PATH.resolve(process.cwd(), originFolder)
  destFolder = destFolder ? PATH.resolve(process.cwd(), destFolder) : ''
  baseHtml = baseHtml || 'prototype'

  return traverseDir(
    traverseDir.origin,
    destFolder,
    baseHtml,
    options,
    inlinerOptions
  )
}

module.exports = dirCssInliner
