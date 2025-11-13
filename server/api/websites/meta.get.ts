import type { APIGatewayEvent, Context } from "aws-lambda"; // 如果你用的是 AWS Lambda
import type { VercelRequest, VercelResponse } from "@vercel/node"; // 如果是 Vercel
import { JSDOM } from "jsdom";
import fetch from "node-fetch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ error: "缺少 url 参数" });
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

    return res.status(200).json({ name, logo });
  } catch (err) {
    return res.status(500).json({ error: "获取站点信息失败" });
  }
}
