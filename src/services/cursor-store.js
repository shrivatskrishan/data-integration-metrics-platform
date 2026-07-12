/** Persists incremental sync cursors per source. */
export class CursorStore {
  #cursors = new Map();

  get(source) { return this.#cursors.get(source) ?? null; }
  set(source, cursor) { this.#cursors.set(source, cursor); }
  getAll() { return Object.fromEntries(this.#cursors); }
  reset(source) {
    if (source) this.#cursors.delete(source);
    else this.#cursors.clear();
  }
}