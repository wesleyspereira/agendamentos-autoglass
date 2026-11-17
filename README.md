# Agenda de Recebimentos

Projeto em React e Vite. Na pasta que contém package.json, use Node.js 22.12+ ou 24 e execute:

    npm ci
    npm run dev

## Entrada de demonstração

- Na tela de login, clique em Entrar sem preencher os campos para acessar como Visitante.
- Para personalizar o cabeçalho, digite um nome ou e-mail, por exemplo wesley.santos@exemplo.com. Não é necessário informar CNPJ ou senha.
- A identificação permanece ao atualizar a página na mesma aba. O botão Sair volta ao login.
- As rotas utilizam `#` para funcionar também no GitHub Pages.
- Esse acesso é demonstrativo: não valida credenciais nem restringe permissões.

Para atualizar uma cópia existente sem perder o Git, copie os arquivos da pasta deste ZIP por cima da pasta do projeto, mantendo a pasta `.git`. O `App.jsx` utilizado é o que está dentro de `src`.

## Roteiro de conferência

1. Abra Cadastros > Fornecedores. Informe um nome e o CNPJ. Use "+ Adicionar CNPJ" para incluir uma filial no mesmo fornecedor. Também é possível editar o cadastro depois.
2. Em Cadastros > Usuários, registre nome e e-mail. Esta aba é uma lista de usuários da operação; não fornece autenticação.
3. No novo agendamento, informe qualquer CNPJ cadastrado. O sistema busca o nome e vincula a carga ao identificador do fornecedor. Um CNPJ desconhecido impede avançar.
4. Na etapa Documentos fiscais, anexe pelo menos uma NF (PDF/XML). Os CT-e são opcionais. Cada grupo tem sua própria lista e permite adicionar ou remover arquivos. Nenhuma chave ou número de documento precisa ser digitado.
5. Revise e confirme a entrega. Nos detalhes do agendamento, abra os documentos registrados para baixar um anexo.

Cadastros e agendamentos usam o armazenamento local do navegador. Os anexos fiscais confirmados são armazenados no IndexedDB; agendamentos antigos que possuem apenas nomes continuam disponíveis, sem download. A aplicação não extrai CNPJs ou números de PDFs. Para uso compartilhado entre a equipe e transportadoras em computadores diferentes, é necessário integrar um serviço de dados, autenticação e armazenamento de arquivos.

Validação: npm test, npm run lint e npm run build.
