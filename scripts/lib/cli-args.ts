export function parseResourceAndFile(argv: string[]): {
  resource: string | undefined;
  file: string | undefined;
} {
  const args = argv.filter((a) => a !== "--");
  let resource: string | undefined;
  let file: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--resource") {
      resource = args[++i];
    } else if (args[i] === "--file") {
      file = args[++i];
    }
  }
  return { resource, file };
}

export function parseResourceAndBatch(argv: string[]): {
  resource: string | undefined;
  batch: string | undefined;
} {
  const args = argv.filter((a) => a !== "--");
  let resource: string | undefined;
  let batch: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--resource") {
      resource = args[++i];
    } else if (args[i] === "--batch") {
      batch = args[++i];
    }
  }
  return { resource, batch };
}
