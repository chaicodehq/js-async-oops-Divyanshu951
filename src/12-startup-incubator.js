export class Startup {
  #funding;

  constructor(name, founder, domain) {
    const validDomains = ["fintech", "edtech", "healthtech", "foodtech"];
    if (!validDomains.includes(domain))
      throw new Error("Invalid domain! Choose from: fintech, edtech, healthtech, foodtech");
    this.name = name;
    this.founder = founder;
    this.domain = domain;
    this.#funding = 0;
    this.founded = new Date().toISOString();
  }

  get funding() {
    return this.#funding;
  }

  raiseFunding(amount) {
    if (amount <= 0) return -1;
    this.#funding += amount;
    return this.#funding;
  }

  getPitch() {
    return `${this.name} by ${this.founder} | Domain: ${this.domain} | Funding: Rs.${this.funding}`;
  }
}

export class Incubator {
  #startups;
  #mentors;

  constructor(name, maxStartups) {
    this.name = name;
    this.maxStartups = maxStartups;
    this.#startups = [];
    this.#mentors = [];
  }

  async admitStartup(startup) {
    await new Promise((r) => setTimeout(r, 10));
    if (!(startup instanceof Startup)) throw new Error("Invalid startup!");
    if (this.#startups.some((s) => s.startup.name === startup.name))
      throw new Error("Startup already admitted!");
    if (this.#startups.length >= this.maxStartups)
      throw new Error("Incubator full!");
    this.#startups.push({
      startup,
      admittedAt: new Date().toISOString(),
      demoCompleted: false,
    });
    return { success: true, message: `${startup.name} admitted to ${this.name}!` };
  }

  removeStartup(name) {
    const idx = this.#startups.findIndex((s) => s.startup.name === name);
    if (idx === -1) return false;
    this.#startups.splice(idx, 1);
    return true;
  }

  async assignMentor(startupName, mentor) {
    await new Promise((r) => setTimeout(r, 10));
    if (!this.#startups.some((s) => s.startup.name === startupName))
      throw new Error("Startup not found!");
    this.#mentors.push({
      startupName,
      mentor,
      assignedAt: new Date().toISOString(),
    });
    return { success: true, message: `${mentor.name} assigned to ${startupName}` };
  }

  async conductDemo(startupName) {
    await new Promise((r) => setTimeout(r, 10));
    const entry = this.#startups.find((s) => s.startup.name === startupName);
    if (!entry) throw new Error("Startup not found!");
    entry.demoCompleted = true;
    const feedbacks = ["Bahut badhiya!", "Accha hai, improve karo", "Investors impressed!"];
    return {
      startup: startupName,
      score: Math.floor(Math.random() * 41) + 60,
      feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
      timestamp: new Date().toISOString(),
    };
  }

  async batchProcess(startups) {
    const promises = startups.map((s) => this.admitStartup(s));
    return Promise.allSettled(promises);
  }

  getStartupsByDomain(domain) {
    return this.#startups
      .filter((s) => s.startup.domain === domain)
      .map((s) => s.startup);
  }

  getTopFunded(n) {
    if (n <= 0 || this.#startups.length === 0) return [];
    return this.#startups
      .map((s) => s.startup)
      .sort((a, b) => b.funding - a.funding)
      .slice(0, n);
  }

  [Symbol.iterator]() {
    let index = 0;
    const startups = this.#startups;
    return {
      next() {
        if (index < startups.length) {
          return { value: startups[index++].startup, done: false };
        }
        return { done: true };
      },
    };
  }

  static createFromConfig(config) {
    if (!config || !config.name || !config.maxStartups)
      throw new Error("Invalid config!");
    return new Incubator(config.name, config.maxStartups);
  }
}

export async function runDemoDay(incubator) {
  const startups = [];
  for (const startup of incubator) {
    startups.push(startup);
  }
  const promises = startups.map((s) => incubator.conductDemo(s.name));
  const settled = await Promise.allSettled(promises);
  const results = settled.map((r) =>
    r.status === "fulfilled" ? r.value : { error: r.reason.message }
  );
  return {
    incubator: incubator.name,
    totalStartups: startups.length,
    results,
    timestamp: new Date().toISOString(),
  };
}
