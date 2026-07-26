const MAX_JSON_DEPTH = 512;

class StrictJsonScanner {
  private position = 0;

  constructor(private readonly source: string) {}

  parse(): void {
    this.skipWhitespace();
    this.parseValue(0);
    this.skipWhitespace();
    if (this.position !== this.source.length) this.fail("unexpected trailing content");
  }

  private fail(reason: string): never {
    throw new Error(`Strict JSON parsing failed at offset ${this.position}: ${reason}`);
  }

  private skipWhitespace(): void {
    while (
      this.position < this.source.length
      && (
        this.source[this.position] === " "
        || this.source[this.position] === "\t"
        || this.source[this.position] === "\n"
        || this.source[this.position] === "\r"
      )
    ) {
      this.position += 1;
    }
  }

  private parseValue(depth: number): void {
    if (depth > MAX_JSON_DEPTH) this.fail(`nesting exceeds ${MAX_JSON_DEPTH} levels`);
    const token = this.source[this.position];
    if (token === "{") {
      this.parseObject(depth + 1);
    } else if (token === "[") {
      this.parseArray(depth + 1);
    } else if (token === "\"") {
      this.parseString();
    } else if (token === "-" || (token >= "0" && token <= "9")) {
      this.parseNumber();
    } else if (this.source.startsWith("true", this.position)) {
      this.position += 4;
    } else if (this.source.startsWith("false", this.position)) {
      this.position += 5;
    } else if (this.source.startsWith("null", this.position)) {
      this.position += 4;
    } else {
      this.fail("expected a JSON value");
    }
  }

  private parseObject(depth: number): void {
    this.position += 1;
    this.skipWhitespace();
    const keys = new Set<string>();
    if (this.source[this.position] === "}") {
      this.position += 1;
      return;
    }
    while (this.position < this.source.length) {
      if (this.source[this.position] !== "\"") this.fail("expected an object key");
      const key = this.parseString();
      if (keys.has(key)) this.fail("duplicate object key");
      keys.add(key);
      this.skipWhitespace();
      if (this.source[this.position] !== ":") this.fail("expected ':' after an object key");
      this.position += 1;
      this.skipWhitespace();
      this.parseValue(depth);
      this.skipWhitespace();
      const separator = this.source[this.position];
      if (separator === "}") {
        this.position += 1;
        return;
      }
      if (separator !== ",") this.fail("expected ',' or '}' in an object");
      this.position += 1;
      this.skipWhitespace();
    }
    this.fail("unterminated object");
  }

  private parseArray(depth: number): void {
    this.position += 1;
    this.skipWhitespace();
    if (this.source[this.position] === "]") {
      this.position += 1;
      return;
    }
    while (this.position < this.source.length) {
      this.parseValue(depth);
      this.skipWhitespace();
      const separator = this.source[this.position];
      if (separator === "]") {
        this.position += 1;
        return;
      }
      if (separator !== ",") this.fail("expected ',' or ']' in an array");
      this.position += 1;
      this.skipWhitespace();
    }
    this.fail("unterminated array");
  }

  private parseString(): string {
    const start = this.position;
    this.position += 1;
    while (this.position < this.source.length) {
      const code = this.source.charCodeAt(this.position);
      if (code === 0x22) {
        this.position += 1;
        try {
          return JSON.parse(this.source.slice(start, this.position)) as string;
        } catch {
          this.fail("invalid string");
        }
      }
      if (code < 0x20) this.fail("unescaped control character in a string");
      if (code === 0x5c) {
        this.position += 1;
        const escape = this.source[this.position];
        if (escape === "u") {
          const hex = this.source.slice(this.position + 1, this.position + 5);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) this.fail("invalid Unicode escape");
          this.position += 5;
          continue;
        }
        if (!escape || !/["\\/bfnrt]/.test(escape)) this.fail("invalid string escape");
      }
      this.position += 1;
    }
    this.fail("unterminated string");
  }

  private parseNumber(): void {
    const remainder = this.source.slice(this.position);
    const match = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(
      remainder,
    );
    if (!match) this.fail("invalid number");
    this.position += match[0].length;
  }
}

export function parseStrictJson(source: string): unknown {
  new StrictJsonScanner(source).parse();
  return JSON.parse(source) as unknown;
}
