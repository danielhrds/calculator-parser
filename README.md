A calculator parser made by implementing the content of this [video](https://youtu.be/myZcNjKcVGw?si=sDRP2-k6liZuPXXZ), code written in C, in Typescript. For learning purposes. I intend to refactor in the future to learn more.

```js
const tokens = lexerExpression("50 + 22 * 33 + 2(3 + 2)")
const parser = { tokens, current: 0, next: 0 }
parserAdvance(parser)
const expressionNode = parseExpression(parser, Precedence.Precedence_MIN)
console.log(evaluate(expressionNode)) // 786  
```
