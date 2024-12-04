const express = require('express')
const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()
const app = express()

// Middleware
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// Default port
const PORT = process.env.PORT || 3000

// API Key from .env
const API_KEY = process.env.API_KEY

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/weather', async (req, res) => {
  const zip = req.body.zip
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=imperial&appid=${API_KEY}`

  try {
    const response = await axios.get(apiUrl)
    const weatherData = response.data

    // Pass data to the show page
    res.render('weather/show', {
      city: weatherData.name,
      temp: weatherData.main.temp,
      description: weatherData.weather[0].description
    })
  } catch (error) {
    res.status(500).send(`
      <h1>Error</h1>
      <p>Error fetching weather data. Please check the ZIP code and try again.</p>
      <a href="/">Back to Home</a>
    `)
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
