const riders = ["Rahul", "Priya", "Amit", "Neha", "Vikram"];

export function placeOrder(restaurant, items) {
  return new Promise((resolve, reject) => {
    if (!restaurant || typeof restaurant !== "string" || !Array.isArray(items) || items.length === 0) {
      return reject(new Error("Invalid order details!"));
    }
    setTimeout(() => {
      resolve({
        orderId: Math.floor(Math.random() * 10000),
        restaurant,
        items,
        status: "placed",
        timestamp: new Date().toISOString(),
      });
    }, 50);
  });
}

export function confirmOrder(order) {
  return new Promise((resolve, reject) => {
    if (!order || !order.orderId || order.status !== "placed") {
      return reject(new Error("Order cannot be confirmed!"));
    }
    resolve({ ...order, status: "confirmed", estimatedTime: 30 });
  });
}

export function assignRider(order) {
  return new Promise((resolve, reject) => {
    if (!order || order.status !== "confirmed") {
      return reject(new Error("Order not confirmed yet!"));
    }
    const rider = riders[Math.floor(Math.random() * riders.length)];
    resolve({ ...order, rider, status: "assigned" });
  });
}

export function deliverOrder(order) {
  return new Promise((resolve, reject) => {
    if (!order || order.status !== "assigned" || !order.rider) {
      return reject(new Error("No rider assigned!"));
    }
    resolve({
      ...order,
      status: "delivered",
      deliveredAt: new Date().toISOString(),
    });
  });
}

export function processDelivery(restaurant, items) {
  return placeOrder(restaurant, items)
    .then((order) => confirmOrder(order))
    .then((order) => assignRider(order))
    .then((order) => deliverOrder(order))
    .catch((error) => ({ error: error.message, status: "failed" }));
}

export function processMultipleOrders(orderList) {
  const promises = orderList.map((o) => processDelivery(o.restaurant, o.items));
  return Promise.allSettled(promises);
}
