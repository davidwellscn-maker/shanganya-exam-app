import http from "http";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TARGET_HOST = "122.51.203.221";
const API_HOST = "api.ducktoshore.cn";

/**
 * 开发代理：将 /api/* 转发到服务器，并携带 api.ducktoshore.cn Host 头
 * 生产环境由 NEXT_PUBLIC_API_BASE 直连正式域名，不走此代理
 */
function proxy(req: NextRequest): Promise<Response> {
  return new Promise((resolve) => {
    const url = new URL(req.url);
    const headers: Record<string, string> = {
      Host: API_HOST,
    };
    req.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (["host", "connection", "content-length", "content-type"].includes(k)) return;
      headers[key] = value;
    });

    const contentType = req.headers.get("content-type");
    if (contentType) headers["Content-Type"] = contentType;

    const request = http.request(
      {
        host: TARGET_HOST,
        port: 80,
        path: url.pathname + url.search,
        method: req.method,
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c as Buffer));
        res.on("end", () => {
          const body = Buffer.concat(chunks);
          resolve(
            new Response(body, {
              status: res.statusCode ?? 502,
              headers: {
                "content-type": res.headers["content-type"] ?? "application/json; charset=utf-8",
              },
            })
          );
        });
      }
    );

    request.on("error", () => {
      resolve(
        Response.json({ code: 502, message: "无法连接 API 服务器" }, { status: 502 })
      );
    });

    // 读取并转发请求体
    req.arrayBuffer().then((buf) => {
      if (buf.byteLength > 0) request.write(Buffer.from(buf));
      request.end();
    });
  });
}

export async function GET(req: NextRequest) {
  return proxy(req);
}

export async function POST(req: NextRequest) {
  return proxy(req);
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
