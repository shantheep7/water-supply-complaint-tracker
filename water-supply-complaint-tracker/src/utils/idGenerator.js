// Generates IDs in the format WSC-<year>-<sequence>, e.g. WSC-2026-1013.
// The Spring Boot backend should own ID generation once it is connected.
export function generateComplaintId(existingIds, date = new Date()) {
  const year = date.getFullYear()
  const prefix = `WSC-${year}-`
  const maxSeq = existingIds
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number.parseInt(id.slice(prefix.length), 10))
    .filter(Number.isFinite)
    .reduce((max, seq) => Math.max(max, seq), 1000)

  let next = maxSeq + 1
  const taken = new Set(existingIds)
  while (taken.has(prefix + next)) next += 1
  return prefix + next
}

export const normalizeComplaintId = (value) => value.trim().toUpperCase()
