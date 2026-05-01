import Dexie from 'dexie'

class KelarDB extends Dexie {
  pending_transactions!: Dexie.Table

  constructor() { 
    super('kelar-v1'); 
    this.version(1).stores({ 
      pending_transactions: '++id,created_at,retry_count' 
    });
  }
}

export const db = new KelarDB()
