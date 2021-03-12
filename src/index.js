const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const existsUserAccount = users.find(user => user.username === username)

  if (!existsUserAccount) {
    return response.status(404).json({ error: 'User Not found!' })
  }

  request.user = existsUserAccount

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.find(user => user.username === username)

  if(userAlreadyExists) {
    return response.status(400).json({
      error: 'User already exists'
    })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { user } = request

  const existsTodo = user.todos.find(todo => todo.id === id)

  if (!existsTodo) {
    response.status(404).json({ error: 'Todo does not exists' })
  }

  existsTodo.title = title 
  existsTodo.deadline = new Date(deadline) 

  return response.status(200).json(existsTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const existsTodo = user.todos.find(todo => todo.id === id)

  if (!existsTodo) {
    response.status(404).json({ error: 'Todo does not exists' })
  }

  existsTodo.done = true

  return response.status(200).json(existsTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const existsTodo = user.todos.find(todo => todo.id === id)

  if (!existsTodo) {
    response.status(404).json({ error: 'Todo does not exists' })
  }

  user.todos.splice(existsTodo, 1)

  return response.status(204).send()
});

module.exports = app;