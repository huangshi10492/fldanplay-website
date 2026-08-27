import { mkdir, writeFile } from "node:fs/promises";

const repo = process.env.RELEASE_REPO || "huangshi10492/flutter_danmaku_player";
const token = process.env.GITHUB_TOKEN;
const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100`, {
  headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
});
if (!response.ok) throw new Error(`GitHub API failed: ${response.status}`);

const rawReleases = await response.json();
const releases = rawReleases
  .filter((release) => !release.draft && !release.prerelease && /^v\d+\.\d+\.\d+$/.test(release.tag_name))
  .map((release) => ({ version: release.tag_name.slice(1), publishedAt: release.published_at || release.created_at, changelog: release.body || "" }))
  .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));

await mkdir("data", { recursive: true });
await writeFile("data/releases.json", `${JSON.stringify({ releases }, null, 2)}\n`);
console.log(`Synced ${releases.length} releases from ${repo}`);
