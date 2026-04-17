export type UpdateManifest = {
  version: string;
  apkUrl: string;
  notes?: string;
};

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

  const payload = (await response.json()) as Partial<UpdateManifest>;

  if (!payload.version || !payload.apkUrl) {
    return null;
  }

  return {
    version: payload.version,
    apkUrl: payload.apkUrl,
    notes: payload.notes,
  };
}
