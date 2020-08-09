# minerva's akasha code style guide

## commits:

prefer past tense: say 'added new features' rather than 'add new features'. present tense makes no sense if you're describing something you've already done.

after the first line: add as many details as you'd like, reference issues, etc.

emoji: do not use.

## comments, documentation, ui text, variable / property naming

do not use uppercase letters. exceptions:

-   class names
-   special constant names ('true' constants like mathematical constants, component names that have to be uppercase in react, etc.)
-   camel-case variable names

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

classes: define classes in this order: constructor, then static properties / methods, then instance methods.

imports: import node modules first, then all other things.

as for formatting:

it's important to use these same rules for both javascript **and** jsx.

I use the `prettier` atom extension. my `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "jsxSingleQuote": true,
  "jsxBracketSameLine": true,
  "bracketSpacing": true
}
```

## sass

no need to use a lot of comments in sass or scss code unless you do some obscure trick or something. it's also helpful to add comments to new variables / variable groups, mixins, and animations. other than that, sass is not required to be heavily commented.

**formatting:** ever since sass's new module system introduced new syntax (and I migrated all my sass to the new system), every popular sass beautifier has been broken for me. so, I manually format all sass code. if I ever find a formatter that works with the indented syntax, I guess I'll use that.
