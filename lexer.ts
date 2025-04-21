import { isNumber } from "./utils"

export enum TokenType {
  TokenType_EOF,
  TokenType_Error,
  TokenType_Ident,
  TokenType_Number,
  TokenType_Plus,
  TokenType_Minus,
  TokenType_Star,
  TokenType_Slash,
  TokenType_Caret,
  TokenType_OpenParenthesis,
  TokenType_CloseParenthesis
}

type Operator = '+' | '-' | '*' | '/' | '^'

type Lexeme = `${number}` | Operator

type Token = { type: TokenType, lexeme: Lexeme }

type Lexer = { expression: string, start: number, current: number }

function lexerCurrentChar(lexer: Lexer): string {
  return lexer.expression[lexer.current]
}

function lexerTokens(lexer: Lexer): Token[] {
  while (lexer.expression[lexer.start] === " ") lexer.start++
  lexer.current = lexer.start
  const tokens: Token[] = []
  while (lexer.current < lexer.expression.length-1) {
    switch (lexerCurrentChar(lexer)) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9': tokens.push(lexerNumber(lexer)); break
      
      case '(': lexer.current++; tokens.push(lexerMakeToken(lexer, TokenType.TokenType_OpenParenthesis)); break
      case ')': lexer.current++; tokens.push(lexerMakeToken(lexer, TokenType.TokenType_CloseParenthesis)); break
      
      case '+': lexer.current++; tokens.push(lexerMakeToken(lexer, TokenType.TokenType_Plus)); break
      case '-': lexer.current++; tokens.push(lexerMakeToken(lexer, TokenType.TokenType_Minus)); break
      case '*': lexer.current++; tokens.push(lexerMakeToken(lexer, TokenType.TokenType_Star)); break
      case '/': lexer.current++; tokens.push(lexerMakeToken(lexer, TokenType.TokenType_Slash)); break
      case '^': lexer.current++; tokens.push(lexerMakeToken(lexer, TokenType.TokenType_Caret)); break
      case ' ': while (lexerCurrentChar(lexer) == ' ') { lexer.current++ }; lexer.start = lexer.current; break
      default: 
        tokens.push(lexerMakeToken(lexer, TokenType.TokenType_Error))
    }
  }

  tokens.push(lexerMakeToken(lexer, TokenType.TokenType_EOF))
  
  return tokens
}

function lexerNumber(lexer: Lexer): Token {
  while (isNumber(lexerCurrentChar(lexer))) lexer.current++
  if (lexerCurrentChar(lexer) == '.') {
    lexer.current++
    if (isNumber(lexerCurrentChar(lexer))) {
      while (isNumber(lexerCurrentChar(lexer))) lexer.current++
    }
  }
const token = lexerMakeToken(lexer, TokenType.TokenType_Number)
  return token
}

function lexerMakeToken(lexer: Lexer, tokenType: TokenType): Token {  
  const token = {
    type: tokenType,
    lexeme: lexer.expression.slice(lexer.start, lexer.current) as Lexeme
  }
  
  lexer.start = lexer.current

  return token
 
}

function lexerExpression(expression: string): Token[] {
  let lexer: Lexer = { expression: expression, start: 0, current: 0 }
  return lexerTokens(lexer)
}

export {
  lexerExpression,
  Token
}