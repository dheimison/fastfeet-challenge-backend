<h1 align="center">
  <img alt="FastFeet Logo" title="Fastfeet" src=".github/logo.png" width="300px" />
</h1>

<p>Este desafio está disponível no repositório da <a href="https://github.com/Rocketseat">RocketSeat</a>, ele basicamente consiste em criar uma aplicação completa (Back-end, Front-end e Mobile) do zero usando Node.js, ReactJS e React Native</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-%2304D361">
</p>

## :rocket: Sobre o desafio
A aplicação é um app para uma transportadora fictícia, o FastFeet.

### **Ferramentas e tecnologias usadas no backend :**
- Node.js + Express;
- Sucrase + Nodemon;
- Sequelize;
- PostgresSQL;
- Bcryptjs
- Jsonwebtoken;
- Yup;

### **Funcionalidades**
Abaixo estão descritas as funcionalidades contidas na aplicação.

### **1. Autenticação**
O usuário administrador pode se autenticar usando email e senha.

Ao se autenticar o usuário recebe um token de acesso gerado via JSON Web Token, que será necessario para poder acessar alguma funcionalidades da aplicação.

- Rota de autenticação: `POST http://localhost:3000/sessions`
  - Exemplo de campos a serem enviados:
  <pre><code>
  {
	"email": "admin@fastfeet.com",
	"password": "123456"
  }
  </code></pre> 

### **2. Gestão de Destinatários**

Os destinatários são mantidos (cadastrados/atualizados) na aplicação, e esses destinatários contém **nome** e campos de endereço: **rua**, **número**, **complemento**, **estado**, **cidade** e **CEP**.

As informações do destinatário são guardadas em uma tabela do banco de dados chamada `recipients`.

O cadastro de destinatários só pode ser feito por administradores autenticados na aplicação.

O destinatário não pode se autenticar no sistema.

- Rota de cadastro de destinatários: `POST http://localhost:3000/recipients`
  - Exemplo de campos a serem enviados:
    <pre><code>
    {
      "name": "Destinatário",
      "street": "Rua do destinatário",
      "number": "00",
      "complement": "Complemento de endereço",
      "state": "Estado do destinatário",
      "city": "Cidade do destinatário",
      "cep": "CEP do destinatário"
    }
    </code></pre>

- Rota de atualização dos dados de destinatários: `PUT http://localhost:3000/recipients`
  - Exemplo de campos a serem enviados:
  <pre><code>
  {
    "currentName": "Nome atual do destinatário",
    "street": "Rua nova"
  }
  </code></pre>
  Obs.1: o campo `currentName` é obrigatório, todos os outros campos são opcionais e seguem a mesma estrutura do exemplo de cadastro de destinatários.

  Obs.2: Para atualizar o nome do destinatário adicione um campo chamado `newName`.

