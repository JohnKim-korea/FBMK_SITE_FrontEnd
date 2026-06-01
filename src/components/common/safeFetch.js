export async function safeFetch(url, options, retry = 2) {
  try {
    const res = await fetch(url, options);
    if (res.status >= 400 && res.status < 500) {
      throw new Error(`client error ${res.status}`);
    }

    if (!res.ok) {
      throw new Error(`server error ${res.status}`);
    }

    // JSON 파싱 안전하게
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("invalid json response");
    }

    return await res.json();
  } catch (err) {
    if (retry > 0) {
      console.warn("재시도 중...", retry);
      await new Promise((r) => setTimeout(r, 500));
      return safeFetch(url, options, retry - 1);
    }
    throw err;
  }
}
