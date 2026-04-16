function splitFieldNameTokens(name: string): string[] {
  const spaced = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();
  if (!spaced) {
    return [];
  }
  return spaced.split(/\s+/);
}

export function humanizeColumnLabel(fieldName: string): string {
  const tokens = splitFieldNameTokens(fieldName);
  if (tokens.length === 0) {
    return fieldName;
  }
  return tokens
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === "url") {
        return "URL";
      }
      if (lower === "id") {
        return "ID";
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
