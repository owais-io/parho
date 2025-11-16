declare module 'gray-matter' {
  interface GrayMatterOption<
    I extends GrayMatterOption.Input,
    O extends GrayMatterOption.Output
  > {
    parser?: () => void;
    eval?: boolean;
    excerpt?: boolean | ((file: Matter.GrayMatterFile<I>, options: GrayMatterOption<I, O>) => string);
    excerpt_separator?: string;
    engines?: {
      [index: string]: (input: string) => object;
    };
    language?: string;
    delimiters?: string | [string, string];
  }

  namespace GrayMatterOption {
    type Input = string | Buffer;
    type Output = string | Buffer;
  }

  namespace Matter {
    interface GrayMatterFile<I extends GrayMatterOption.Input> {
      data: { [key: string]: any };
      content: string;
      excerpt?: string;
      orig: Buffer | I;
      language: string;
      matter: string;
      stringify(lang: string): string;
    }
  }

  function matter<
    I extends GrayMatterOption.Input,
    O extends GrayMatterOption.Output
  >(
    input: I,
    options?: GrayMatterOption<I, O>
  ): Matter.GrayMatterFile<I>;

  export = matter;
}
