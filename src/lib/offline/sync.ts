import { db } from './db';

export const queueTransaction = async (data: any) => {
  await db.pending_transactions.add({
    ...data,
    created_at: new Date().toISOString(),
    retry_count: 0
  });
};

export const syncPending = async () => {
  if (!navigator.onLine) return;
  
  const pending = await db.pending_transactions.toArray();
  if (pending.length === 0) return;

  for (const item of pending) {
    if (item.retry_count >= 3) {
      // Hapus jika gagal setelah 3 retries
      await db.pending_transactions.delete(item.id);
      continue;
    }

    try {
      const { id, created_at, retry_count, ...dataPayload } = item;
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataPayload)
      });

      if (res.ok) {
        await db.pending_transactions.delete(item.id);
      } else {
        await db.pending_transactions.update(item.id, { retry_count: item.retry_count + 1 });
      }
    } catch (e) {
      await db.pending_transactions.update(item.id, { retry_count: item.retry_count + 1 });
    }
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', syncPending);
}
