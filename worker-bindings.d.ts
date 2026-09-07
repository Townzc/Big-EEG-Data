// The starter supports D1, but this catalog currently has no D1 binding.
// Keep the existing runtime guard in getDb() authoritative.
declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
  }
}
