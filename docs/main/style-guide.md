# minerva's akasha code style guide

## comments, documentation, ui text, variable / property naming

do not use uppercase letters. exceptions:

-   class names
-   special constant names ('true' constants like mathematical constants, component names that have to be uppercase in react, etc.)
-   words after the first word in a camel-cased variable name
-   function names that have to be uppercase (like react's function components)

ok:
```javascript
const Foo = 255

let someVar = 'bar' // this is an acceptable comment on an acceptable variable.

class FooBar {...}

const obj = { key: 'value' }

function doThings(arg1, arg2)

return (<div>hello world</div>)
```

**not** ok:
```javascript
let Foo = 255

let SomeVar = 'Bar' // This is not an acceptable comment, and not an acceptable variable.

class fooBar {...}

const obj = { Key: 'Value' }

function DoThings(Arg1, Arg2)

return (<div>Hello World!</div>)
```

## javascript / jsx

use jsdoc comments for utility methods and class methods.

as for formatting:

it's important to use these same rules for both javascript **and** jsx.

I use the `atom-beautify` extension with `prettier` as the beautifier with these settings:

-   brace style: collapse
-   break chained methods: off
-   end of line: crlf
-   end with comma: off
-   end with newline: off
-   eval code: off
-   indent char: default
-   indent level: 0
-   indent size: 2
-   indent with tabs: off
-   jslint happy: off
-   keep array indentation: off
-   keep function indentation: off
-   max preserve newlines: default
-   object curly spacing: on
-   object curly spacing: on
-   preserve newlines: on
-   space after anon function: off
-   space before conditional: on
-   space in paren: off
-   unescape strings: off
-   wrap line length: default (my editor wraps at 80 chars)

## sass

no need to use a lot of comments in sass or scss code unless you do some obscure trick or something. it's also helpful to add comments to new variables / variable groups, mixins, and animations. other than that, sass/scss is not required to be heavily commented.

**formatting:** I use atom's `atom-beautify` with the `sassconvert` beautifier. no config.

## scss

**formatting:** I use atom's `atom-beautify` with the `prettier` beautifier. no config.
