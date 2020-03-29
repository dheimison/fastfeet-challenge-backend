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

- Rota de autenticação: `POST http://localhost:3333/sessions`
  - Exemplo de campos a serem enviados:
  <pre><code>
    {
      "email": "admin@fastfeet.com",
      "password": "123456"
    }
  </code></pre>

### **2. Gestão de Destinatários**

Para realizar todas as operações abaixo o administrador deve enviar o seu **Bearer token** para confirmar que está autenticado no sistema.

Os destinatários são mantidos (cadastrados/atualizados) na aplicação, e esses destinatários contém **nome** e campos de endereço: **rua**, **número**, **complemento**, **estado**, **cidade** e **CEP**.

As informações do destinatário são guardadas em uma tabela do banco de dados chamada `recipients`.

O cadastro de destinatários só pode ser feito por administradores autenticados na aplicação.

O destinatário não pode se autenticar no sistema.

- Rota de cadastro de destinatários: `POST http://localhost:3333/recipients`

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

- Rota de atualização dos dados de destinatários: `PUT http://localhost:3333/recipients`

  - Exemplo de campos a serem enviados:
    <pre><code>
    {
      "currentName": "Nome atual do destinatário",
      "street": "Rua nova"
    }
    </code></pre>
    Obs.1: o campo `currentName` é obrigatório, todos os outros campos são opcionais e seguem a mesma estrutura do exemplo de cadastro de destinatários.

  Obs.2: Para atualizar o nome do destinatário adicione um campo chamado `newName`.

### **3. Gestão de Entregadores**

Para realizar todas as operações abaixo o administrador deve enviar o seu **Bearer token** para confirmar que está autenticado no sistema.

**Listagem de entregadores:**

Administradores podem listar todos os entregadores usando a seguinte rota:

- `GET http://localhost:3333/deliverymen`

**Cadastro de entregadores:**

Administradores podem cadastrar novos entregadores usando a seguinte rota, o nome e o email devem ser passados via `Query params`, a foto do entregador pode ser enviado no corpo da requisição que deve ser do tipo `Multipart Form` e o nome do campo a ser enviado deve ser `file`:

- Rota: `POST http://localhost:3333/deliverymen?name=NomeDoEntregador&email=email@email.com`

- O corpo da requisição dever ser do tipo `Multipart Form` e deve conter o campo `file` junto de um arquivo de imagem.

**Atualização de entregadores:**

Administradores podem atualizar os dados entregadores informando o **ID** do entregador usando a seguinte rota:

- Rota: `PUT http://localhost:3333/deliverymen/id`
  <br>

Para atualizar apenas o nome, exemplo usando id = 1:

- Rota: `PUT http://localhost:3333/deliverymen/1?name=NomeNovo`

Para atualizar apenas o email, exemplo usando id = 1:

- Rota: `PUT http://localhost:3333/deliverymen/1?email=EmailNovo@email.com`

Para atualizar apenas a foto, exemplo usando id = 1:

- Rota `PUT http://localhost:3333/deliverymen/1`

- O corpo da requisição dever ser do tipo `Multipart Form` e deve conter o campo `file` junto de um arquivo de imagem.

**Deletar entregadores:**

Administradores podem deletar entregadores da base de dados usando a seguinte rota:

- `DELETE http://localhost:3333/deliverymen/id`

Exemplo usando o id = 1

- `DELETE http://localhost:3333/deliverymen/1`

### **3. Gestão de Encomendas**

Para realizar todas as operações abaixo o administrador deve enviar o seu **Bearer token** para confirmar que está autenticado no sistema.

**Listagem todas as encomendas:**

Administradores podem listar todas as encomendas usando a seguinte rota:

- Rota: `GET http://localhost:3333/orders`

- Ela retornará um array de encomendas.

**Cadastro de encomendas:**

Administradores podem cadastrar novas encomendas usando a seguinte rota:

- Rota: `POST http://localhost:3333/orders`

- É obrigatório o envio do id do destinatário.

- É obrigatório o envio do id do entregador.

- É obrigatório o envio do nome do produto a ser entregue.

- Exemplo de corpo da requisição a ser enviado:
<pre><code>
   {
     "recipient_id": "2",
     "deliveryman_id": "1",
     "product": "Caixa de som"
   }
</code></pre>

Quando a encomenda é cadastrada para um entregador, o entregador recebe um e-mail com detalhes da encomenda, com nome do produto e uma mensagem informando-o que o produto já está disponível para a retirada

**Atualização de encomendas:**

Administradores podem atualizar as encomendas usando a seguinte rota:

- Rota: `PUT http://localhost:3333/orders/id`

- É obrigatório enviar o id da encomenda a ser atualizada.

- Todos os campos da requisição são opcionais.

- Exemplo da requisição e dos campos a serem enviados:
<br>
`PUT http://localhost:3333/orders/1`
<pre><code>
{
	"recipient_id": "1",
	"deliveryman_id": "2",
	"product": "Caixa vazia"
}
</code></pre>

**Deletar encomendas:**

Administradores podem deletar encomendas usando a seguinte rota:

- Rota: `DELETE http://localhost:3333/orders/id`

- É obrigatório enviar o id da encomenda a ser deletada.

- Exemplo da requisição a ser enviada:
  <br>
  `DELETE http://localhost:3333/orders/1`
