/** Normalize API role names (teacher → instructor). */
export function normalizeRole(r) {
  if (r === "teacher") return "instructor";
  return r;
}

export function isAppRole(r) {
  const n = normalizeRole(r);
  return n === "student" || n === "instructor" || n === "admin";
}

/**
 * @param {Record<string, unknown> | null | undefined} user
 * @returns {string[]}
 */
export function parseRolesFromUser(user) {
  if (!user) return ["student"];
  if (Array.isArray(user.roles) && user.roles.length) {
    return [...new Set(user.roles.map(normalizeRole).filter(isAppRole))];
  }
  if (user.roles != null && user.roles !== "") {
    try {
      const raw = typeof user.roles === "string" ? user.roles : JSON.stringify(user.roles);
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) {
        return [...new Set(arr.map(normalizeRole).filter(isAppRole))];
      }
    } catch {
      /* fall through */
    }
  }
  if (user.role && isAppRole(user.role)) {
    return [normalizeRole(user.role)];
  }
  return ["student"];
}

/**
 * Pick active role: stored choice → URL/path inference → first assigned role.
 * @param {Record<string, unknown> | null | undefined} user
 * @param {string | null} storedRole — from localStorage userRole
 * @param {string | null} [inferredRole] — e.g. from /instructor/... after OAuth redirect
 */
export function resolveActiveRole(user, storedRole, inferredRole) {
  const roles = parseRolesFromUser(user);
  const s = storedRole && isAppRole(storedRole) ? normalizeRole(storedRole) : null;
  if (s && roles.includes(s)) return s;
  const i = inferredRole && isAppRole(inferredRole) ? normalizeRole(inferredRole) : null;
  if (i && roles.includes(i)) return i;
  return roles[0] || "student";
}
