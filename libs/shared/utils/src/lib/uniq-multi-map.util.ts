/**
 * Extends the Map class to create a multi-map that facilitates storing multiple
 * string or number values for a single key. The values are stored in a Set to
 * ensure uniqueness.
 */
export class UniqMultiMap<K, V extends string | number = string | number> extends Map<K, Set<V>> {
  addMany(key: K, values: Iterable<V>): this {
    if (!this.has(key)) {
      this.set(key, new Set<V>());
    }

    const set = this.get(key) as Set<V>;

    for (const value of values) {
      set.add(value);
    }

    return this;
  }

  addOne(key: K, value: V): this {
    if (!this.has(key)) {
      this.set(key, new Set<V>());
    }

    (this.get(key) as Set<V>).add(value);

    return this;
  }

  getAll(key: K): V[] {
    return Array.from(this.get(key) ?? []);
  }

  hasValue(key: K, value: V): boolean {
    const values = this.get(key);

    return values ? values.has(value) : false;
  }

  /**
   * Removes multiple values from the set associated with the given key.
   * If the set becomes empty after removal, the key is deleted from the map.
   * Returns the number of values removed.
   */
  removeMany(key: K, values: Iterable<V>): number {
    const set = this.get(key);

    if (!set) {
      return 0;
    }

    let removed = 0;

    for (const value of values) {
      if (set.delete(value)) {
        removed++;
      }
    }

    if (set.size === 0) {
      this.delete(key);
    }

    return removed;
  }

  removeOne(key: K, value: V): boolean {
    const set = this.get(key);

    if (!set) {
      return false;
    }

    const removed = set.delete(value);

    if (set.size === 0) {
      this.delete(key);
    }

    return removed;
  }
}
