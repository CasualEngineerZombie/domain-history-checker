declare module "whois" {
  function lookup(
    domain: string,
    callback: (err: Error | null, data: string) => void
  ): void;

  namespace lookup {
    // optional: add more methods if needed later
  }

  export { lookup };
}
