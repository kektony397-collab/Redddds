import Dexie, { Table } from 'dexie';
import type { Trip, Refill, SettingsEntry } from '../types';

export class AppDatabase extends Dexie {
  trips!: Table<Trip>;
  refills!: Table<Refill>;
  settings!: Table<SettingsEntry>;

  constructor() {
    super('DigitalSpeedometerDB');
  }
}

export const db = new AppDatabase();

// FIX: Moved schema definition outside the constructor to resolve a TypeScript type inference issue
// where the 'version' property was not found on 'this' inside the AppDatabase constructor.
db.version(1).stores({
  trips: '++id, date',
  refills: '++id, date',
  settings: 'key',
});
