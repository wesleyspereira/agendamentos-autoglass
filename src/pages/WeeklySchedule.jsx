// Importa o componente reutilizável responsável pelo título da página.
import PageHeader from "../components/PageHeader";

// Importa os dados simulados dos agendamentos da semana.
import { weekAppointments } from "../data/appointments";

// Array com os dias que serão exibidos no cabeçalho da agenda.
const days = ["Seg 20", "Ter 21", "Qua 22", "Qui 23", "Sex 24"];

// Array com os horários que serão exibidos na lateral da agenda.
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

// Componente responsável por montar toda a tela da Agenda Semanal.
function WeeklySchedule() {
  // O return devolve o JSX que será exibido na tela.
  return (
    <main className="page-content">
      {/* Cabeçalho da página.
                title recebe o título principal.
                subtitle recebe o período da semana. */}
      <PageHeader title="Agenda Semanal" subtitle="20 – 24 de julho de 2026">
        <div className="weekly-actions">
          {/* Grupo dos botões de navegação entre as semanas. */}
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

          {/* Campo que futuramente permitirá filtrar por fornecedor. */}
          <label className="filter-field filter-field--compact">
            <span>Fornecedor</span>

            <select>
              <option>Todos</option>
            </select>
          </label>

          {/* Campo que futuramente permitirá filtrar por doca. */}
          <label className="filter-field filter-field--compact">
            <span>Doca</span>

            <select>
              <option>Todas</option>
            </select>
          </label>

          {/* Botão que futuramente abrirá o formulário
                        de um novo agendamento. */}
          <button className="button button--primary" type="button">
            + Novo agendamento
          </button>
        </div>
      </PageHeader>

      {/* Painel principal da agenda semanal. */}
      <section className="weekly-panel">
        <div className="weekly-grid">
          {/* Espaço vazio entre a coluna dos horários
                        e o cabeçalho dos dias. */}
          <div className="weekly-grid__corner" />

          {/* Percorre o array days.
                        Para cada dia, cria uma coluna no cabeçalho. */}
          {days.map((day) => (
            <div className="weekly-grid__day" key={day}>
              {day}
            </div>
          ))}

          {/* Coluna lateral que exibe os horários. */}
          <div className="weekly-grid__times">
            {/* Percorre o array times.
                            Para cada horário, cria um elemento span. */}
            {times.map((time) => (
              <span key={time}>{time}</span>
            ))}
          </div>

          {/* Área onde as linhas, colunas e eventos são desenhados. */}
          <div className="weekly-grid__canvas">
            {/* Array.from cria um array com 5 posições.
                            Cada posição representa um dia útil da semana. */}
            {Array.from({ length: 5 }).map((_, dayIndex) => (
              <i
                key={dayIndex}
                className="weekly-grid__column"

                // Calcula a posição horizontal da coluna.
                // Cada dia ocupa 20% da largura.
                style={{
                  left: `${dayIndex * 20}%`,
                }}
              />
            ))}

            {/* Percorre os horários para desenhar
                            as linhas horizontais da grade. */}
            {times.map((time, rowIndex) => (
              <i
                key={time}
                className="weekly-grid__line"

                // Calcula a posição vertical da linha.
                // Cada horário ocupa 10% da altura.
                style={{
                  top: `${rowIndex * 10}%`,
                }}
              />
            ))}

            {/* Linha que representa o horário atual.
                            Por enquanto, o horário 10:15 está fixo. */}
            <div className="current-time">
              <span>10:15</span>
            </div>

            {/* Percorre a lista de agendamentos da semana.
                            Para cada item, cria um card dentro da agenda. */}
            {weekAppointments.map((item) => (
              <article
                // Cria uma identificação única usando
                // o dia e o horário do agendamento.
                key={`${item.day}-${item.time}`}

                // Acrescenta o status do agendamento na classe.
                // Exemplo: weekly-event--confirmed
                className={`weekly-event weekly-event--${item.status}`}

                // Define a posição e o tamanho do card
                // de acordo com os dados do agendamento.
                style={{
                  // Define em qual dia o card aparecerá.
                  left: `calc(${(item.day - 1) * 20}% + 5px)`,

                  // Define em qual horário o card começará.
                  top: `calc(${item.start * 10}% + 4px)`,

                  // Cada card ocupa uma coluna da agenda.
                  width: "calc(20% - 10px)",

                  // Define a duração visual do agendamento.
                  height: `calc(${item.span * 10}% - 8px)`,
                }}
              >
                {/* Horário do agendamento. */}
                <strong>{item.time}</strong>

                {/* Nome do fornecedor. */}
                <span>{item.supplier}</span>

                {/* Doca utilizada no recebimento. */}
                <small>{item.dock}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// Disponibiliza o componente para ser importado no App.jsx.
export default WeeklySchedule;
