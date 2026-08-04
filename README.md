# Agenda de Recebimentos

Aplicação React para agendamento de entregas de fornecedores e gestão do fluxo de recebimento.

## Telas disponíveis

- Visão Geral (`/`)
- Calendário de Agendamentos (`/calendario`)
- Agenda Semanal (`/agenda-semanal`)

## Estrutura

```text
src/
├── components/  # Componentes reutilizáveis
├── data/        # Dados simulados das telas
├── pages/       # Páginas da aplicação
├── styles/      # CSS global e design tokens
├── App.jsx      # Configuração das rotas
└── main.jsx     # Ponto de entrada do React
```

## Executar o projeto

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

## Verificar antes de publicar

```bash
npm run lint
npm run build
```

O desenvolvimento deve continuar dentro deste projeto React.
