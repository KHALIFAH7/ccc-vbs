export const CONFIG = {
  heroTitle: "This Year's Theme Goes Here",
  heroVerse: '"Your theme verse placeholder goes here — Reference 0:0"',
  dates: "Aug 3–7, 2026",
  time: "8:00 AM – 4:00 PM",
  location: "CCC Auditorium, Kumasi",
  ages: "2 – 16 years",
  fee: 250,
  feeDisplay: "GH₵250",
  days: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
  schedule: [
    { day: "DAY 01", title: "Welcome & Kickoff", verse: "Focus verse placeholder" },
    { day: "DAY 02", title: "Day Theme Placeholder", verse: "Focus verse placeholder" },
    { day: "DAY 03", title: "Day Theme Placeholder", verse: "Focus verse placeholder" },
    { day: "DAY 04", title: "Day Theme Placeholder", verse: "Focus verse placeholder" },
    { day: "DAY 05", title: "Family Celebration & Closing", verse: "Focus verse placeholder" },
  ],
  ageGroups: [
    { rank: "RANK 01", name: "Cub Travelers", range: "2–4 years", min: 2, max: 4 },
    { rank: "RANK 02", name: "Junior Explorers", range: "5–7 years", min: 5, max: 7 },
    { rank: "RANK 03", name: "Trailblazers", range: "8–10 years", min: 8, max: 10 },
    { rank: "RANK 04", name: "Pathfinders", range: "11–13 years", min: 11, max: 13 },
    { rank: "RANK 05", name: "Voyagers", range: "14–16 years", min: 14, max: 16 },
  ],
};

export function ageGroupFor(age: number) {
  return CONFIG.ageGroups.find((g) => age >= g.min && age <= g.max);
}
