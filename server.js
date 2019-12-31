require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const POKEDEX = require('./pokedex.json')

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())


// Validating the bearer token before handling
// any requests since it will be needed for both

app.use(function validateBearerToken(req, res, next) {

    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({error: 'Unauthorized request'})
    }

    // move to the next middleware
    next()
})

///////////////////////////////
//////// GET '/types' /////////
///////////////////////////////

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

function handleGetTypes(req, res) {
    
    res.json(validTypes)
    
}
    
app.get('/types', handleGetTypes)

///////////////////////////////
/////// GET '/pokemon' ////////
///////////////////////////////

function handleGetPokemon(req, res) {

    let response = POKEDEX.pokemon;
    
    // Filter our pokemon by name if name query param is present
    if (req.query.name) {
        response = response.filter(pokemon =>
        // case insensitive searching
        pokemon.name.toLowerCase().includes(req.query.name.toLowerCase())
        )
    }

    // Filter our pokemon by type if type query param is present
    if (req.query.type) {

        // Uppercasing first letter of query to make search case-insensitive
        let typeString = req.query.type
        let formattedTypeString = typeString.substring(0, 1).toUpperCase() + typeString.substring(1);

        response = response.filter(pokemon => 
        // case insensitive searching
        pokemon.type.includes(formattedTypeString) 
        )
    }
    
    res.json(response)
    
}
    
app.get('/pokemon', handleGetPokemon)

///////////////////////////////
/////// ERROR HANDLING ////////
///////////////////////////////

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
})

///////////////////////////////
//////// HEY, LISTEN! /////////
///////////////////////////////

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {});