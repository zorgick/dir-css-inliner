<a name="module_dir-css-inliner"></a>

# dir-css-inliner ⇒ <code>Promise</code>
**Returns**: <code>Promise</code> - Promise object represents tree view with paths to all nested elements of the **originFolder**  
**Params**

- originFolder <code>string</code> - Relative path to the entry point of the script. It doesn't matter how many nested directories there are, the script will traverse all of them.
- [destFolder] <code>string</code> <code> = &quot;empty string&quot;</code> - Relative path to the destination folder, where the script should put all found HTML files with inlined styles. The directory name, where HTML file was found, will be used as the name of the HTML file. If **destFolder** is not specified, index.html file with inlined styles will be created in the same directory, where **baseHtml** was found. Default value is ''.
- [baseHtml] <code>string</code> <code> = &quot;prototype&quot;</code> - Name of the HTML file, that requires styles from external (.css only) file via link tag. Default value is 'prototype'
- [options] <code>object</code> - options for defining traversing behavior of the script
    - .omitExtensions <code>array</code> | <code>string</code> - Extensions to omit from the tree. Use case: omit extensions ['.jpg', '.jpeg', '.png'] (or only '.jpg') from being added to the tree.
    - .displayFiles <code>array</code> | <code>string</code> - Files to include in the tree. Use case: directory has several .html files and .css files, so you make the script traverse only some of them by specifying their names. For ex., ['prototype', 'stylesForPrototype'] (or only 'prototype').
    - .traverseFolders <code>array</code> | <code>string</code> - Directories to traverse. Use case: traverse only recently modified or created directory by specifying its name. For ex., ['password-recovery', 'password_change'] (or only 'password-recovery').
    - .enableMonitor <code>boolean</code> - Monitor the traversing status of the **originFolder**.
    - .toUnix <code>boolean</code> - For windows users normalize backticks to Unix style.
- inlinerOptions <code>object</code> - Options for [inline-css module](https://www.npmjs.com/package/inline-css)

**Example**  
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
