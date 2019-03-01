# dir-css-inliner
This module recursively and asynchronously traverses provided directory, seeks for &lt;%prototype%>.html file that loads styles via link tag from a separate (.css only) file and creates &lt;%destFile%>.html with inlined styles in the specified directory or directory of the &lt;%prototype%> file. Returns (Promise) tree-object with all specified files and directoires (path provided).

## Install and use
```sh
npm install -S dir-css-inliner
```

```js
const dirCssInliner = require('dir-css-inliner')
```
## [API](https://github.com/zorgick/dir-css-inliner/tree/master/docs/api.md)
