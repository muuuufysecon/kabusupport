import { openDB } from "idb";

// GitHub Pagesでは同一オリジンでストレージが共有されるため、環境ごとに必ず変更する
export const ENV_SUFFIX = "_INVEST_PROD";
export const DB_NAME = `InvestmentAiNoteDB${ENV_SUFFIX}`;
export const DB_VERSION = 1;

const STORES = [
  "holdings",
  "watchlist",
  "reports",
  "aiResponses",
  "decisions",
  "profile",
  "importHistory",
  "userGlossary"
];

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      });
    }
  });
}

export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function getAll(storeName) {
  const db = await initDB();
  return db.getAll(storeName);
}

export async function putItem(storeName, item) {
  const db = await initDB();
  const now = new Date().toISOString();
  const record = {
    ...item,
    id: item.id || crypto.randomUUID(),
    updatedAt: now,
    createdAt: item.createdAt || now
  };
  await db.put(storeName, record);
  return record;
}

export async function deleteItem(storeName, id) {
  const db = await initDB();
  await db.delete(storeName, id);
}

export async function exportAllData() {
  const db = await initDB();
  const data = {};
  for (const storeName of STORES) {
    data[storeName] = await db.getAll(storeName);
  }
  return {
    app: "InvestmentAiNote",
    exportedAt: new Date().toISOString(),
    dbName: DB_NAME,
    data
  };
}

export async function importAllData(backup) {
  if (!backup?.data) throw new Error("バックアップ形式が正しくありません。");

  const db = await initDB();
  for (const [storeName, records] of Object.entries(backup.data)) {
    if (!STORES.includes(storeName) || !Array.isArray(records)) continue;
    const tx = db.transaction(storeName, "readwrite");
    for (const record of records) {
      await tx.store.put(record);
    }
    await tx.done;
  }
}

export function downloadJson(data, fileNamePrefix = "InvestmentAiNote_Backup") {
  const text = JSON.stringify(data, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).replaceAll("/", "");
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileNamePrefix}_${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
