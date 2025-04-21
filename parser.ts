import { lexerExpression, Token, TokenType } from "./lexer"

enum Precedence {
  Precedence_MIN,
  Precedence_Term,
  Precedence_Mult,
  Precedence_Div,
  Precedence_Power,
  Precedence_MAX,
};

enum NodeType {
  NodeType_Error,
  NodeType_Number,
  NodeType_Positive,
  NodeType_Negative,
  NodeType_Add,
  NodeType_Sub,
  NodeType_Mul,
  NodeType_Div,
  NodeType_Pow,
}

type Unary = NodeType.NodeType_Negative | NodeType.NodeType_Positive
type Binary = NodeType.NodeType_Add | NodeType.NodeType_Sub | NodeType.NodeType_Mul | NodeType.NodeType_Div | NodeType.NodeType_Pow

type ExpressionNode = { type: NodeType.NodeType_Number, number: number } 
                       | { type: Unary, operand: ExpressionNode } 
                       | { type: Binary, left: ExpressionNode, right: ExpressionNode } 
                       | { type: NodeType.NodeType_Error } 

type Parser = { tokens: Token[], current: number, next: number }
                       
const tokenTypeToPrecedenceMap = {
  [TokenType.TokenType_Plus]: Precedence.Precedence_Term,
  [TokenType.TokenType_Minus]: Precedence.Precedence_Term,
  [TokenType.TokenType_Star]: Precedence.Precedence_Mult,
  [TokenType.TokenType_Slash]: Precedence.Precedence_Div,
  [TokenType.TokenType_Caret]: Precedence.Precedence_Power,
}

function tokenTypeToPrecedence(tokenType: TokenType) {
  const precedence = tokenTypeToPrecedenceMap[tokenType]
  if (precedence === undefined) return Precedence.Precedence_MIN
  return precedence
}

function parserAdvance(parser: Parser) {
  parser.current = parser.next
  if (parser.next < parser.tokens.length-1) parser.next++
}

function parserCurrent(parser: Parser): Token {
  return parser.tokens[parser.current]
}

function parseNumber(parser: Parser): ExpressionNode {
  const number = Number(parserCurrent(parser).lexeme)
  parserAdvance(parser)
  return {
    type: NodeType.NodeType_Number,
    number
  }
}

function parsePrefixExpression(parser: Parser): ExpressionNode {
  let node = {} as ExpressionNode

  const current = parserCurrent(parser)
  if (current.type == TokenType.TokenType_Number) {
    node = parseNumber(parser)
  } else if (current.type == TokenType.TokenType_OpenParenthesis) {
    parserAdvance(parser)
    node = parseExpression(parser, Precedence.Precedence_MIN)
    if (parserCurrent(parser).type == TokenType.TokenType_CloseParenthesis) {
      parserAdvance(parser)
    }
  } else if (current.type == TokenType.TokenType_Plus) {
    parserAdvance(parser)
    const unary: ExpressionNode = { type: NodeType.NodeType_Positive, operand: parsePrefixExpression(parser) }
    node = unary
  } else if (current.type == TokenType.TokenType_Minus) {
    parserAdvance(parser)
    const unary: ExpressionNode = { type: NodeType.NodeType_Negative, operand: parsePrefixExpression(parser) }
    node = unary
  }

  if (!Object.keys(node).length) {
    node = {type: NodeType.NodeType_Error}
  }

  if (parserCurrent(parser).type == TokenType.TokenType_Number || parserCurrent(parser).type == TokenType.TokenType_OpenParenthesis) {
    let newNode: ExpressionNode = {
      type: NodeType.NodeType_Mul,
      left: node,
      right: parseExpression(parser, Precedence.Precedence_Div),
    }
    node = newNode
  }

  return node 
}

function parseInfixExpression(parser: Parser, nextOperator: Token, left: ExpressionNode): ExpressionNode {
  let node = {} as {type: Binary, left: ExpressionNode, right: ExpressionNode} // idk im not used to typescript and thats supposed to be me learning

  switch (nextOperator.type) {
    case TokenType.TokenType_Plus: node.type = NodeType.NodeType_Add; break;
    case TokenType.TokenType_Minus: node.type = NodeType.NodeType_Sub; break;
    case TokenType.TokenType_Star: node.type = NodeType.NodeType_Mul; break;
    case TokenType.TokenType_Slash: node.type = NodeType.NodeType_Div; break;
    case TokenType.TokenType_Caret: node.type = NodeType.NodeType_Pow; break;
  }
  
  node.left = left
  node.right = parseExpression(parser, tokenTypeToPrecedence(nextOperator.type))

  return node
}

function parseExpression(parser: Parser, currentOperatorPrecedence: Precedence): ExpressionNode {
  let left = parsePrefixExpression(parser)
  let nextOperator = parserCurrent(parser)
  let nextOperatorPrecedence = tokenTypeToPrecedence(parserCurrent(parser).type)
  
  while (nextOperatorPrecedence != Precedence.Precedence_MIN) {
    if (currentOperatorPrecedence >= nextOperatorPrecedence) {
      break
    } else {
      parserAdvance(parser)
      left = parseInfixExpression(parser, nextOperator, left)
      nextOperator = parserCurrent(parser)
      nextOperatorPrecedence = tokenTypeToPrecedence(nextOperator.type)
    }
  }
  
  return left
}
    
function evaluate(node: ExpressionNode) {
  switch(node.type) {
    case NodeType.NodeType_Number: return node.number
    case NodeType.NodeType_Positive: return evaluate(node.operand)
    case NodeType.NodeType_Negative: return -evaluate(node.operand)
    case NodeType.NodeType_Add:
      return evaluate(node.left) + evaluate(node.right)
    case NodeType.NodeType_Sub:
      return evaluate(node.left) - evaluate(node.right)
    case NodeType.NodeType_Mul:
      return evaluate(node.left) * evaluate(node.right)
    case NodeType.NodeType_Div:
      return evaluate(node.left) / evaluate(node.right)
    case NodeType.NodeType_Pow:
      return Math.pow(evaluate(node.left), evaluate(node.right))
  }
  return 0
}

function main() {
  const tokens = lexerExpression("50 + 22 * 33 + 2(3 + 2)")
  const parser = { tokens, current: 0, next: 0 }
  parserAdvance(parser)
  const expressionNode = parseExpression(parser, Precedence.Precedence_MIN)
  console.log(evaluate(expressionNode))  
}

main()