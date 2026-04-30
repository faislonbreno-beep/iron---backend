# Iron Store Backend

Este é o backend da Iron Store, desenvolvido com Node.js, Express e MySQL.

## Estrutura do Banco de Dados

O arquivo `database.sql` contém o script para criação das tabelas:
- `usuarios`: Gerenciamento de usuários.
- `empresas`: Gerenciamento de empresas/parceiros.
- `usuario_empresa`: Tabela de ligação com controle de permissões (Enum: cliente_atacado, funcionario, gerente, admin).

## Como Instalar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env` com suas credenciais do MySQL.

3. Importe o arquivo `database.sql` no seu servidor MySQL.

4. Inicie o servidor:
   ```bash
   node index.js
   ```

## Rotas Principais

- `GET /api/usuarios`: Lista todos os usuários.
- `POST /api/usuarios`: Cria um novo usuário.
- `GET /api/empresas`: Lista todas as empresas.
- `POST /api/empresas`: Cria uma nova empresa.
- `POST /api/usuario-empresa/vincular`: Vincula um usuário a uma empresa com um papel (role).
