import { JSDOM } from "jsdom";
import fetch from "node-fetch";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = query.url as string;

  if (!url) {
    return { error: "缺少 url 参数" };
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const name = doc.querySelector("title")?.textContent?.trim() || "";
    let logo =
      doc.querySelector("link[rel='icon']")?.href ||
      doc.querySelector("link[rel='shortcut icon']")?.href ||
      `${new URL(url).origin}/favicon.ico`;

    // 处理相对路径 favicon
    if (logo && !logo.startsWith("http")) {
      logo = new URL(logo, url).href;
    }

    return { name, logo };
  } catch (err) {
    return { error: "获取站点信息失败" };
  }
});
