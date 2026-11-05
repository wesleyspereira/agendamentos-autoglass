# Agenda de Recebimentos — Autoglass

Aplicação em React + Vite para registrar, aprovar, acompanhar e conferir agendamentos de entregas.

## Telas disponíveis

- **Visão Geral** (`/`): entregas de hoje, próximas entregas e indicadores atualizados.
- **Calendário** (`/calendario`): visualização mensal, semanal ou diária e filtros.
- **Verificação** (`/verificacao-agendamentos`): marcação e salvamento de conferências.
- **Detalhes** (`/detalhes-agendamento?id=...`): carga, documentos, status e histórico.
- **Novo Agendamento** (`/novo-agendamento`): cadastro da transportadora, fornecedores, CT-e/MDF-e, NF-e, volumes e data, com horários livres, ocupados e encerrados.
- **Aprovação** (`/aprovacao-agendamentos`): aprovar ou recusar agendamentos pendentes.

## Fluxo

1. Em **Novo Agendamento**, a entrega entra como **Pendente**.
2. Cada data e horário aceita **uma única entrega**; agendamentos pendentes já reservam a vaga. Recusar um agendamento libera a vaga; concluir o recebimento não apaga a ocupação histórica.
3. Em **Aprovação**, o responsável **aprova ou recusa**; a decisão agora entra no histórico, com data e hora.
4. Agendamentos **Aprovados** podem iniciar o recebimento em **Detalhes**.
5. O recebimento pode passar de **Em andamento** para **Concluído**.
6. As conferências feitas em **Verificação** são registradas com seus próprios eventos no mesmo histórico.

## Executar

```bash
npm install
npm run dev
```

Abra o endereço apresentado pelo Vite (normalmente `http://localhost:5173`).

## Verificar antes de publicar

```bash
npm run lint
npm run build
```

## Observações importantes

- Os dados são compartilhados **entre as telas do mesmo navegador** pelo `AppointmentsContext`, usando `localStorage` com a chave `autoglass-agendamentos-v1`.
- **Não existe ainda um banco de dados online ou autenticação**: usuários de computadores diferentes não compartilham a mesma lista. O bloqueio de horários funciona somente para os agendamentos presentes no mesmo navegador; para uso simultâneo em vários computadores, será preciso implementar banco de dados com reserva atômica no servidor.
- O cadastro registra **nomes dos anexos**, mas ainda não armazena os arquivos para download.
- Para atualizar um projeto que já possui Git, copie os arquivos desta versão para dentro do repositório existente, sem apagar a pasta oculta `.git`.
- A tela antiga `WeeklySchedule.jsx` permanece no código como legado, mas a rota ativa de calendário é `/calendario`; não foi adicionada nenhuma referência a docas ou pedidos no fluxo atual.
