export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = query.url as string;

  if (!url) {
    return { error: "缺少 url 参数" };
  }

  try {
    const response = await fetch(url);
    const html = await response.text();

    // 简单提取 <title>
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const name = titleMatch ? titleMatch[1].trim() : "";

    // 提取 favicon
    const iconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i);
    let logo = iconMatch ? iconMatch[1] : `${new URL(url).origin}/favicon.ico`;

    // 处理相对路径
    if (logo && !logo.startsWith("http")) {
      logo = new URL(logo, url).href;
    }

    return { name, logo };
  } catch (err) {
    return { error: "获取站点信息失败" };
  }
});
