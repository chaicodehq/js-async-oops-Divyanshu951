const fares = { SL: 250, "3A": 800, "2A": 1200, "1A": 2000 };

export async function checkSeatAvailability(trainNumber, date, classType) {
  await new Promise((r) => setTimeout(r, 100));
  if (typeof trainNumber !== "string" || !/^\d{5}$/.test(trainNumber))
    throw new Error("Invalid train number! 5 digit hona chahiye.");
  if (!["SL", "3A", "2A", "1A"].includes(classType))
    throw new Error("Invalid class type!");
  if (!date || typeof date !== "string") throw new Error("Date required hai!");
  const seats = Math.floor(Math.random() * 51);
  return {
    trainNumber,
    date,
    classType,
    available: seats > 0,
    seats,
    waitlist: Math.floor(Math.random() * 21),
  };
}

export async function bookTicket(passenger, trainNumber, date, classType) {
  if (!passenger || !passenger.name || !passenger.age || !passenger.gender)
    throw new Error("Invalid passenger details!");
  const availability = await checkSeatAvailability(trainNumber, date, classType);
  if (availability.available) {
    return {
      pnr: "PNR" + Math.floor(Math.random() * 1000000),
      passenger,
      trainNumber,
      date,
      class: classType,
      status: "confirmed",
      fare: fares[classType],
    };
  }
  return {
    pnr: "PNR" + Math.floor(Math.random() * 1000000),
    passenger,
    trainNumber,
    date,
    class: classType,
    status: "waitlisted",
    waitlistNumber: Math.floor(Math.random() * 20) + 1,
    fare: fares[classType],
  };
}

export async function cancelTicket(pnr) {
  await new Promise((r) => setTimeout(r, 50));
  if (!pnr || typeof pnr !== "string" || !pnr.startsWith("PNR"))
    throw new Error("Invalid PNR number!");
  return {
    pnr,
    status: "cancelled",
    refund: Math.floor(Math.random() * 901) + 100,
  };
}

export async function getBookingStatus(pnr) {
  await new Promise((r) => setTimeout(r, 50));
  if (!pnr || typeof pnr !== "string" || !pnr.startsWith("PNR"))
    throw new Error("Invalid PNR number!");
  const statuses = ["confirmed", "waitlisted", "cancelled"];
  return {
    pnr,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastUpdated: new Date().toISOString(),
  };
}

export async function bookMultipleTickets(passengers, trainNumber, date, classType) {
  if (!passengers || passengers.length === 0) return [];
  const results = [];
  for (const passenger of passengers) {
    try {
      const result = await bookTicket(passenger, trainNumber, date, classType);
      results.push(result);
    } catch (error) {
      results.push({ passenger, error: error.message });
    }
  }
  return results;
}

export async function raceBooking(trainNumbers, passenger, date, classType) {
  const promises = trainNumbers.map((tn) => bookTicket(passenger, tn, date, classType));
  return Promise.any(promises).catch(() => {
    throw new Error("Koi bhi train mein seat nahi mili!");
  });
}
