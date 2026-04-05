/** App roles (teacher maps to instructor in UI). */
export const APP_ROLES = ["student", "instructor", "admin"];

export function normalizeRole(r) {
  if (r === "teacher") return "instructor";
  return r;
}

export function isAppRole(r) {1234567890
  const n = normalizeRole(r);
  return n === "student" || n === "instructor" || n === "admin";
}

/**
 * Parse roles JSON from user document; fall back to legacy single `role`.
 * @param {Record<string, unknown> | null | undefined} user
 * @returns {string[]}
 */
export function parseRolesFromUser(user) {
  if (!user) return ["student"];
  if (user.roles != null && user.roles !== "") {
    if (Array.isArray(user.roles) && user.roles.length) {
      return [...new Set(user.roles.map(normalizeRole).filter(isAppRole))];
    }
    if (typeof user.roles === "string") {
      try {
        const arr = JSON.parse(user.roles);
        if (Array.isArray(arr) && arr.length) {
          return [...new Set(arr.map(normalizeRole).filter(isAppRole))];
        }
      } catch {
        /* fall through */
      }
    }
  }
  if (user.role && isAppRole(user.role)) {
    return [normalizeRole(user.role)];
  }
  return ["student"];
}

/**
 * @param {string | null | undefined} existingJson
 * @param {string} newRole
 */
export function mergeRolesJson(existingJson, newRole) {
  const n = normalizeRole(newRole);
  if (!isAppRole(n)) return existingJson || JSON.stringify(["student"]);
  const set = new Set(parseRolesFromUser({ roles: existingJson, role: null }));
  set.add(n);
  const list = [...set];
  return JSON.stringify(list);
}
