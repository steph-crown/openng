export async function responseBytes(res: Response): Promise<number | null> {
  const cl = res.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n >= 0) {
      return n;
    }
  }
  if (!res.body) {
    return 0;
  }
  try {
    const stream = res.clone().body;
    if (!stream) {
      return 0;
    }
    const reader = stream.getReader();
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      total += value.byteLength;
    }
    return total;
  } catch {
    return null;
  }
}
