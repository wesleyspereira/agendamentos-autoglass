// Tela de demonstração; o calendário em uso está em CalendarPage.
import PageHeader from "../components/PageHeader";

import { weekAppointments } from "../data/appointments";

const days = ["Seg 20", "Ter 21", "Qua 22", "Qui 23", "Sex 24"];

const times = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

function WeeklySchedule() {
  return (
    <main className="page-content">
      <PageHeader title="Agenda Semanal" subtitle="20 – 24 de julho de 2026">
        <div className="weekly-actions">
          <div className="toolbar-group">
            <button className="button button--outline" type="button">
              Hoje
            </button>

            <button className="button button--icon" type="button">
              ‹
            </button>

            <button className="button button--icon" type="button">
              ›
            </button>
          </div>

          <label className="filter-field filter-field--compact">
            <span>Fornecedor</span>

            <select>
              <option>Todos</option>
            </select>
          </label>

          <label className="filter-field filter-field--compact">
            <span>Doca</span>

            <select>
              <option>Todas</option>
            </select>
          </label>

          <button className="button button--primary" type="button">
            + Novo agendamento
          </button>
        </div>
      </PageHeader>

      <section className="weekly-panel">
        <div className="weekly-grid">
          <div className="weekly-grid__corner" />

          {days.map((day) => (
            <div className="weekly-grid__day" key={day}>
              {day}
            </div>
          ))}

          <div className="weekly-grid__times">
            {times.map((time) => (
              <span key={time}>{time}</span>
            ))}
          </div>

          <div className="weekly-grid__canvas">
            {Array.from({ length: 5 }).map((_, dayIndex) => (
              <i
                key={dayIndex}
                className="weekly-grid__column"
                style={{
                  left: `${dayIndex * 20}%`,
                }}
              />
            ))}

            {times.map((time, rowIndex) => (
              <i
                key={time}
                className="weekly-grid__line"
                style={{
                  top: `${rowIndex * 10}%`,
                }}
              />
            ))}

            <div className="current-time">
              <span>10:15</span>
            </div>

            {weekAppointments.map((item) => (
              <article
                key={`${item.day}-${item.time}`}
                className={`weekly-event weekly-event--${item.status}`}
                style={{
                  left: `calc(${(item.day - 1) * 20}% + 5px)`,

                  top: `calc(${item.start * 10}% + 4px)`,

                  width: "calc(20% - 10px)",

                  height: `calc(${item.span * 10}% - 8px)`,
                }}
              >
                <strong>{item.time}</strong>

                <span>{item.supplier}</span>

                <small>{item.dock}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default WeeklySchedule;
