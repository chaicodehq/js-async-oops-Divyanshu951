export function prepareOrder(item, prepTime) {
  return new Promise((resolve, reject) => {
    if (!item) return reject(new Error("Item name required!"));
    if (typeof prepTime !== "number" || prepTime <= 0)
      return reject(new Error("Invalid prep time!"));
    setTimeout(() => {
      resolve({ item, ready: true, prepTime });
    }, prepTime);
  });
}

export function prepareBatch(items) {
  if (items.length === 0) return Promise.resolve([]);
  return Promise.all(items.map((i) => prepareOrder(i.name, i.prepTime)));
}

export function getFirstReady(items) {
  if (items.length === 0)
    return Promise.reject(new Error("No items to prepare!"));
  return Promise.race(items.map((i) => prepareOrder(i.name, i.prepTime)));
}

export function prepareSafeBatch(items) {
  if (items.length === 0) return Promise.resolve([]);
  return Promise.allSettled(
    items.map((i) => prepareOrder(i.name, i.prepTime))
  ).then((results) =>
    results.map((r) =>
      r.status === "fulfilled"
        ? { status: "fulfilled", value: r.value }
        : { status: "rejected", reason: r.reason.message }
    )
  );
}

export function deliverWithTimeout(orderPromise, timeoutMs) {
  if (typeof timeoutMs !== "number" || timeoutMs <= 0)
    return Promise.reject(new Error("Invalid timeout!"));
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Delivery timeout!")), timeoutMs);
  });
  return Promise.race([orderPromise, timeout]);
}

export async function batchWithRetry(items, maxRetries) {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await prepareBatch(items);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
