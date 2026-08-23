// EdgeOne Pages 静态导出构建脚本
// 1. 临时移走本地开发用的 /api 代理路由（静态导出不支持 Route Handlers）
// 2. 执行 next build（output: export）
// 3. 恢复 /api 代理路由，保证本地开发不受影响

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const apiDir = path.join(root, "src", "app", "api");
const tmpDir = path.join(root, ".tmp-api");

const hasApiDir = fs.existsSync(apiDir);
const hasTmpDir = fs.existsSync(tmpDir);

// 上次构建异常中断可能留下残留
if (hasTmpDir) {
  if (!hasApiDir) fs.renameSync(tmpDir, apiDir);
  else fs.rmSync(tmpDir, { recursive: true, force: true });
}

try {
  if (hasApiDir) {
    fs.renameSync(apiDir, tmpDir);
    console.log("[export-build] 已临时移走 /api 代理路由");
  }

  execSync("npx next build", { cwd: root, stdio: "inherit" });
} finally {
  if (fs.existsSync(tmpDir)) {
    fs.renameSync(tmpDir, apiDir);
    console.log("[export-build] 已恢复 /api 代理路由");
  }
}
