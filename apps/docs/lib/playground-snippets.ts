export type PlaygroundSnippetLang =
  | "curl"
  | "javascript"
  | "python"
  | "rust"
  | "java"
  | "cpp";

export type PlaygroundSnippetTab = {
  value: PlaygroundSnippetLang;
  label: string;
  shikiLang: string;
};

export const PLAYGROUND_SNIPPET_TABS = [
  { value: "curl", label: "curl", shikiLang: "bash" },
  { value: "javascript", label: "JavaScript", shikiLang: "typescript" },
  { value: "python", label: "Python", shikiLang: "python" },
  { value: "rust", label: "Rust", shikiLang: "rust" },
  { value: "java", label: "Java", shikiLang: "java" },
  { value: "cpp", label: "C++", shikiLang: "cpp" },
] as const satisfies readonly PlaygroundSnippetTab[];

function bashSingleQuoted(url: string): string {
  return `'${url.replace(/'/g, `'\\''`)}'`;
}

function cppStringLiteral(url: string): string {
  return url.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function rustStringLiteral(url: string): string {
  return url.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function javaStringLiteral(url: string): string {
  return url.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

export function buildPlaygroundSnippets(
  url: string,
): Record<PlaygroundSnippetLang, string> {
  const q = bashSingleQuoted(url);
  const curl = `curl -sS \\
  ${q} \\
  -H 'Accept: application/json'`;

  const jsUrl = JSON.stringify(url);
  const javascript = `const r = await fetch(
  ${jsUrl},
  {
    headers: { Accept: "application/json" },
  },
);
const text = await r.text();

console.log(text);`;

  const pyUrl = JSON.stringify(url);
  const python = `import requests

r = requests.request(
  "GET",
  ${pyUrl},
  headers={"Accept": "application/json"},
)
text = r.text

print(text)`;

  const rustUrl = rustStringLiteral(url);
  const rust = `fn main() -> Result<(), Box<dyn std::error::Error>> {
  let text = ureq::get("${rustUrl}")
    .set("Accept", "application/json")
    .call()?
    .into_string()?;

  print!("{}", text);
  Ok(())
}`;

  const javaUrl = javaStringLiteral(url);
  const java = `import java.net.URI;
import java.net.http.*;

public class Main {
  public static void main(String[] args) throws Exception {
    var h = HttpClient.newHttpClient();
    var req = HttpRequest
      .newBuilder(URI.create("${javaUrl}"))
      .GET()
      .header("Accept", "application/json")
      .build();
    var body = h.send(req, HttpResponse.BodyHandlers.ofString()).body();
    System.out.print(body);
  }
}`;

  const cppUrl = cppStringLiteral(url);
  const cpp = `#include <curl/curl.h>
#include <iostream>
#include <string>

static size_t w(char *p, size_t s, size_t n, void *d) {
  static_cast<std::string *>(d)->append(p, s * n);
  return s * n;
}

int main() {
  std::string body;
  CURL *curl = curl_easy_init();
  auto *hdrs = curl_slist_append(
    nullptr,
    "Accept: application/json");
  curl_easy_setopt(curl, CURLOPT_URL, "${cppUrl}");
  curl_easy_setopt(curl, CURLOPT_HTTPHEADER, hdrs);
  curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, w);
  curl_easy_setopt(curl, CURLOPT_WRITEDATA, &body);
  curl_easy_perform(curl);

  std::cout << body;
}`;

  return {
    curl,
    javascript,
    python,
    rust,
    java,
    cpp,
  };
}
