// Datas locais em YYYY-MM-DD podem ser comparadas e ordenadas como texto.
export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function appointmentDateKey(appointment) {
  return appointment.dateISO || appointment.date.split("/").reverse().join("-");
}

export function currentWeekRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return { start: localDateKey(start), end: localDateKey(end) };
}

export function sortAppointments(items) {
  return [...items].sort((a, b) =>
    `${appointmentDateKey(a)} ${a.time}`.localeCompare(`${appointmentDateKey(b)} ${b.time}`),
  );
}

// A comparação após a conversão rejeita datas impossíveis, como 31 de fevereiro.
export function validDateISO(dateISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    return false;
  }

  const parsed = new Date(`${dateISO}T12:00:00.000Z`);

  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === dateISO;
}
