export type UpdateManifest = {
  schemaVersion: 1 | 2;
  version: string;
  versionCode?: number;
  apkUrl: string;
  highlights: string[];
  releaseUrl?: string;
  publishedAt?: string;
};

type UpdateManifestPayload = Partial<UpdateManifest> & { notes?: unknown };

function normalizeHighlights(highlights: unknown, notes: unknown) {
  const values = Array.isArray(highlights)
    ? highlights
    : typeof notes === "string"
      ? notes.split(/\r?\n/)
      : [];
  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

export function parseUpdateManifest(payload: unknown): UpdateManifest | null {
  if (!payload || typeof payload !== "object") return null;
  const candidate = payload as UpdateManifestPayload;
  if (typeof candidate.version !== "string" || typeof candidate.apkUrl !== "string") return null;
  return {
    schemaVersion: candidate.schemaVersion === 2 ? 2 : 1,
    version: candidate.version,
    versionCode: typeof candidate.versionCode === "number" ? candidate.versionCode : undefined,
    apkUrl: candidate.apkUrl,
    highlights: normalizeHighlights(candidate.highlights, candidate.notes),
    releaseUrl: typeof candidate.releaseUrl === "string" ? candidate.releaseUrl : undefined,
    publishedAt: typeof candidate.publishedAt === "string" ? candidate.publishedAt : undefined,
  };
}

function normalizeVersionPart(value: string) {
  const numeric = Number.parseInt(value.replace(/[^\d].*$/, ""), 10);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function isRemoteVersionNewer(currentVersion: string, remoteVersion: string) {
  const currentParts = currentVersion.split(".").map(normalizeVersionPart);
  const remoteParts = remoteVersion.split(".").map(normalizeVersionPart);
  const maxLength = Math.max(currentParts.length, remoteParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const current = currentParts[index] ?? 0;
    const remote = remoteParts[index] ?? 0;

    if (remote > current) {
      return true;
    }

    if (remote < current) {
      return false;
    }
  }

  return false;
}

export async function fetchUpdateManifest(url: string): Promise<UpdateManifest | null> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Impossible de verifier la mise a jour (${response.status}).`);
  }

  return parseUpdateManifest(await response.json());
}
