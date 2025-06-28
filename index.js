require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')


const app = express()

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({error: error.message})
  }

  

  next(error)
}

app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (request) => {
  return request.method === 'POST' ? JSON.stringify(request.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms - body: :body'))


let persons = []


app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})


app.get('/info', (request, response) => {
    const now = new Date().toString()
    response.send(`
        <p>Phonebook has info for ${Person.countDocuments({})} people</p>
        <p>${now}</p>
    `)
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => {
            console.log(error)
            response.status(500).send({ error: 'malformatted id' })
        })
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if(!body.name){
        return response.status(400).json({
            error: 'name missing'
        })
    } else if(!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const name = body.name

    /* if(persons.some(p => p.name === name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    } */

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id

    Person.findByIdAndDelete(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findById(request.params.id)
        .then(person => {
            if (!person) {
                return response.status(404).end()
            }

            person.name = name
            person.number = number

            return person.save().then((updatedPerson) => {
                response.json(updatedPerson)
            })
        })
        .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})