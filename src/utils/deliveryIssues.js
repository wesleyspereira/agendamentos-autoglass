export const OPENED = "Ocorrência registrada";
export const RESOLVED = "Ocorrência resolvida";

// A solução aponta para o ID da ocorrência na mesma entrega. Ressalvas não são ocorrências.
export function deliveryIssues(history = []) {
  const solutions = new Map(
    history.filter((entry) => entry.title === RESOLVED).map((entry) => [entry.occurrenceId, entry]),
  );

  return history
    .filter((entry) => entry.title === OPENED)
    .map((entry) => ({
      entry,
      solution: solutions.get(entry.id),
    }));
}
