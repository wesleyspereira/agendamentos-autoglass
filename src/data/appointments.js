export const dashboardStats = [
    { title: "Agendamentos hoje", value: 28, tone: "blue", comparison: "+12% vs. ontem", positive: true },
    { title: "Aguardando aprovação", value: 14, tone: "orange", comparison: "+4 vs. ontem" },
    { title: "Em andamento", value: 6, tone: "blue", comparison: "Igual a ontem" },
    { title: "Concluídos", value: 22, tone: "green", comparison: "+16% vs. ontem", positive: true },
]

export const todayAppointments = [
    { time: "08:00", supplier: "Vidros Sul", dock: "Doca 02", status: "approved" },
    { time: "09:30", supplier: "Cristal Glass", dock: "Doca 01", status: "approved" },
    { time: "11:00", supplier: "Auto Peças", dock: "Doca 03", status: "progress" },
    { time: "13:30", supplier: "Vidraçaria Brasil", dock: "Doca 04", status: "pending" },
    { time: "15:00", supplier: "Glass Prime", dock: "Doca 02", status: "approved" },
]

export const upcomingAppointments = [
    { date: "21/07", time: "07:30", supplier: "Vidros Sul", dock: "Doca 01", status: "approved" },
    { date: "21/07", time: "09:00", supplier: "Cristal Glass", dock: "Doca 02", status: "approved" },
    { date: "21/07", time: "10:30", supplier: "Auto Peças", dock: "Doca 03", status: "pending" },
    { date: "21/07", time: "13:00", supplier: "Vidraçaria Brasil", dock: "Doca 04", status: "pending" },
    { date: "21/07", time: "15:30", supplier: "Glass Prime", dock: "Doca 02", status: "approved" },
]

export const calendarWeeks = [
    [{ day: 29, other: true }, { day: 30, other: true }, { day: 1 }, { day: 2, event: ["08:00", "Vidros Sul", "approved"] }, { day: 3, event: ["10:30", "Cristal Glass", "approved"] }, { day: 4 }, { day: 5 }],
    [{ day: 6 }, { day: 7, event: ["09:00", "Vidros Sul", "approved"] }, { day: 8, event: ["13:30", "Auto Peças", "pending"] }, { day: 9 }, { day: 10, event: ["10:30", "Cristal Glass", "progress"] }, { day: 11 }, { day: 12 }],
    [{ day: 13 }, { day: 14 }, { day: 15, event: ["08:00", "Vidros Sul", "progress"] }, { day: 16, event: ["13:30", "Auto Peças", "pending"] }, { day: 17 }, { day: 18 }, { day: 19 }],
    [{ day: 20, today: true, event: ["09:30", "Cristal Glass", "pending"] }, { day: 21, event: ["08:00", "Vidros Sul", "approved"] }, { day: 22 }, { day: 23, event: ["10:30", "Cristal Glass", "approved"] }, { day: 24, event: ["13:30", "Auto Peças", "pending"] }, { day: 25 }, { day: 26 }],
    [{ day: 27 }, { day: 28, event: ["09:00", "Vidros Sul", "pending"] }, { day: 29, event: ["10:30", "Cristal Glass", "approved"] }, { day: 30, event: ["08:00", "Vidros Sul", "approved"] }, { day: 31 }, { day: 1, other: true }, { day: 2, other: true }],
]

export const weekAppointments = [
    { day: 1, start: 2, span: 2, time: "08:00", supplier: "Vidros Sul", dock: "Doca 02", status: "approved" },
    { day: 1, start: 7, span: 2, time: "13:30", supplier: "Auto Peças", dock: "Doca 03", status: "progress" },
    { day: 2, start: 1, span: 2, time: "07:00", supplier: "Cristal Glass", dock: "Doca 01", status: "approved" },
    { day: 3, start: 4, span: 2, time: "10:00", supplier: "Auto Peças", dock: "Doca 03", status: "pending" },
    { day: 3, start: 8, span: 2, time: "14:00", supplier: "Glass Prime", dock: "Doca 01", status: "approved" },
    { day: 4, start: 3, span: 2, time: "09:00", supplier: "Vidraçaria Brasil", dock: "Doca 04", status: "pending" },
    { day: 5, start: 2, span: 2, time: "08:00", supplier: "Cristal Glass", dock: "Doca 02", status: "approved" },
    { day: 5, start: 10, span: 1, time: "16:00", supplier: "Auto Peças", dock: "Doca 03", status: "progress" },
]
