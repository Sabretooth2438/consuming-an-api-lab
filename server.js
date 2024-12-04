const express = require('express')
const axios = require('axios')
const dotenv = require('dotenv')
const moment = require('moment')

dotenv.config()
const app = express()

// Setup middleware and view engine
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

const PORT = process.env.PORT || 3000
const API_KEY = process.env.API_KEY

// Routes
app.get('/', (req, res) => {
  res.render('index')
})

app.post('/weather', async (req, res) => {
  const zip = req.body.zip
  const type = req.body.type

  try {
    if (type === 'forecast') {
      // Fetch 5-day forecast
      const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?zip=${zip},us&units=imperial&appid=${API_KEY}`
      const response = await axios.get(apiUrl)
      const forecastData = response.data

      // Group forecast by date
      const groupedForecast = {}
      forecastData.list.forEach((item) => {
        const date = item.dt_txt.split(' ')[0] // Extract the date part
        if (!groupedForecast[date]) groupedForecast[date] = []
        groupedForecast[date].push({
          time: item.dt_txt.split(' ')[1], // Extract the time part
          temp: item.main.temp,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        })
      })

      // Render grouped forecast data
      res.render('weather/forecast', {
        city: forecastData.city.name,
        groupedForecast
      })
    } else if (type === 'current') {
      // Fetch current weather
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=imperial&appid=${API_KEY}`
      const response = await axios.get(apiUrl)
      const weatherData = response.data

      // Render current weather data
      res.render('weather/show', {
        city: weatherData.name,
        temp: weatherData.main.temp,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        sunrise: moment.unix(weatherData.sys.sunrise).format('h:mm A'),
        sunset: moment.unix(weatherData.sys.sunset).format('h:mm A'),
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure
      })
    } else {
      res.render('error', {
        message: 'Invalid weather type selected. Please try again.'
      })
    }
  } catch (error) {
    res.render('error', {
      message:
        'Error fetching weather data. Please check the ZIP code and try again.'
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
