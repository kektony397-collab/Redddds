import Dexie, { Table } from 'dexie';
import type { Trip, Refill, SettingsEntry } from '../types';

export class AppDatabase extends Dexie {
  trips!: Table<Trip>;
  refills!: Table<Refill>;
  settings!: Table<SettingsEntry>;

  constructor() {
    super('DigitalSpeedometerDB');
    // FIX: Moved schema definition inside the constructor, which is the standard Dexie pattern, to resolve a TypeScript error where the 'version' property was not found on the database instance.
    this.version(1).stores({
      trips: '++id, date',
      refills: '++id, date',
      settings: 'key',
    });
  }
}

export const db = new AppDatabase();
