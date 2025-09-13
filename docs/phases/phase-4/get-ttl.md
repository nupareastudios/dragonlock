### CLI get TTL (src/cli/commands/get.ts)

- `--ttl <seconds>`
  - After copying to clipboard, schedules a best‑effort clear after N seconds.
  - Uses `setTimeout`-equivalent via `await delay(ms)` in a detached async task.
  - Clears by writing an empty string to clipboard; may be overridden by user activity. 