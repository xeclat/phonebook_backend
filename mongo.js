const mongoose = require('mongoose')

if(process.argv.length < 3){
    console.log('provide password as argument')
    process.exit(1)
}

const password = process.argv[2]


mongoose.set('strictQuery', false)

mongoose.connect(url)



const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
} else {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })

    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
    })
    
}

