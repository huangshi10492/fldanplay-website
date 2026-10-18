import data from "../../../../data/releases.json";

type Release = { version: string; publishedAt: string; changelog: string };
const releases = data.releases as Release[];
const semver = /^(?:v)?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;

function parts(value: string) {
  const match = value.match(semver);
  return match ? match.slice(1, 4).map(Number) : null;
}

function compare(a: string, b: string) {
  const x = parts(a)!;
  const y = parts(b)!;
  return x[0]! - y[0]! || x[1]! - y[1]! || x[2]! - y[2]!;
}

function displayOrder(a: string, b: string) {
  const x = parts(a)!;
  const y = parts(b)!;
  if (x[0] !== y[0]) return y[0]! - x[0]!;
  if (x[1] !== y[1]) return y[1]! - x[1]!;
  if (x[2] === 0 || y[2] === 0) return Number(y[2] === 0) - Number(x[2] === 0);
  return y[2]! - x[2]!;
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
}

export async function GET(request: Request) {
  const version = new URL(request.url).searchParams.get("version")?.replace(/^v/, "") ?? "";
  const latest = releases.reduce<string | undefined>((max, release) => (!max || compare(release.version, max) > 0 ? release.version : max), undefined);
  if (!parts(version) || !latest || compare(version, latest) > 0 || !releases.some((release) => release.version === version)) {
    return json({ error: { code: "INVALID_VERSION", message: "版本号无效或不在发布记录中" } }, 400);
  }
  const updates = releases.filter((release) => compare(release.version, version) > 0).sort((a, b) => displayOrder(a.version, b.version));
  return json({ latestVersion: latest, hasUpdate: updates.length > 0, releases: updates });
}
