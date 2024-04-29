document.addEventListener("DOMContentLoaded", function() {
    const cityInput = document.getElementById("city-input");
    const searchButton = document.getElementById("search-button");
    const weatherCardsDiv = document.getElementById("weather-cards");
    const API_key = "19b7476c9e106bbc4760a5a8c8ac6547"; 
  
    const getWeatherDetails = (cityName, lat, lon) => {
        const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lon+"&name="+cityName+"&appid=19b7476c9e106bbc4760a5a8c8ac6547";
        fetch(WEATHER_API_URL)
            .then(res => res.json())
            .then(data => {
                console.log(data);
    
                const { list } = data; // Extracting the list of weather details for each day
      
                // Clearing previous weather data
                weatherCardsDiv.innerHTML = "";
      
                // Get today's date
                const today = new Date().setHours(0, 0, 0, 0);
      
                // Filter weather data for the next day
                const filteredWeather = list.filter(weatherItem => {
                    const weatherDate = new Date(weatherItem.dt * 1000);
                    return (weatherDate.getTime() >= today) && (weatherDate.getTime() < today + 24 * 60 * 60 * 1000);
                });
      
                // Group weather data by date
                const groupedWeather = {};
                filteredWeather.forEach(weatherItem => {
                    const date = new Date(weatherItem.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    if (!groupedWeather[date]) {
                        groupedWeather[date] = [];
                    }
                    groupedWeather[date].push(weatherItem);
                });
      
                // Looping through grouped weather details
                for (const date in groupedWeather) {
                    const weatherItems = groupedWeather[date];
                    const temperature = weatherItems.reduce((acc, curr) => acc + curr.main.temp, 0) / weatherItems.length;
                    const windSpeed = weatherItems.reduce((acc, curr) => acc + curr.wind.speed, 0) / weatherItems.length;
                    const humidity = weatherItems.reduce((acc, curr) => acc + curr.main.humidity, 0) / weatherItems.length;
                    
                    
      
                    // Convert temperature from Kelvin to Celsius
                    const temperatureCelsius = temperature - 273.15;
      
                    // Creating weather card HTML for each date
                    const weatherCardHTML = `
                        <div class="weather-cards">
                        <li class="card">
                        <h3>${cityName}</h3>
                            <p>${date}</p>
                            <img src="https://openweathermap.org/img/wn/10d@2x.png" alt="weather-icon">
                            <p>Temperature: ${temperatureCelsius.toFixed(2)}°C</p>
                            <p>Wind Speed: ${windSpeed.toFixed(2)} m/s</p>
                            <p>Humidity: ${humidity.toFixed(2)}%</p>
                            </li>
                        </div>
                    `;
      
                    // Appending the weather card HTML to the weatherCardsDiv
                    weatherCardsDiv.insertAdjacentHTML("beforeend", weatherCardHTML);
                }
      
            })
            .catch(error => {
                console.error("An error occurred while fetching the weather forecast!",error);
            });
      };
  
      const fetchForecast = (cityName, lat, lon) => {
        const WEATHER_FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + " &lon=" + lon + "&name= " + cityName + "&appid=19b7476c9e106bbc4760a5a8c8ac6547";
    
        fetch(WEATHER_FORECAST_API_URL)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                const { list } = data; // Assuming the list is in the root of the response
    

                if (!list) {
                    console.error("List is undefined in the API response");
                    weatherCardsDiv.innerHTML = "Error fetching weather data. Please try again later.";
                    return;
                }
                



                // Filter and group weather data for the next 5 days
                const filteredWeather = list.filter(weatherItem => {
                    const weatherDate = new Date(weatherItem.dt * 1000);
                    const currentDate = new Date();
                    return weatherDate.getDate() !== currentDate.getDate(); // Exclude today's weather
                });
    
                const groupedWeather = {};
                filteredWeather.forEach(weatherItem => {
                    const date = new Date(weatherItem.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    if (!groupedWeather[date]) {
                        groupedWeather[date] = [];
                    }
                    groupedWeather[date].push(weatherItem);
                });
    
                // Loop through grouped weather details and create weather card HTML for each date
                for (const date in groupedWeather) {
                    const weatherItems = groupedWeather[date];
                    const temperature = weatherItems.reduce((acc, curr) => acc + curr.main.temp, 0) / weatherItems.length;
                    const humidity = weatherItems.reduce((acc, curr) => acc + curr.main.humidity, 0) / weatherItems.length;
                    const windSpeed = weatherItems.reduce((acc, curr) => acc + curr.wind.speed, 0) / weatherItems.length;
    
                    // Convert temperature from Kelvin to Celsius
                    const temperatureCelsius = temperature - 273.15;
    
                    // Creating weather card HTML for each date
                    const weatherCardHTML = `
                        <div class="weather-card">
                            <h3>${cityName}</h3>
                            <h3>${date}</h3>
                            <img src="https://openweathermap.org/img/wn/${weatherItems[0].weather[0].icon}.png" alt="weather-icon">
                            <p>Temperature: ${temperatureCelsius.toFixed(2)}°C</p>
                            <p>Wind Speed: ${windSpeed.toFixed(2)} m/s</p>
                            <p>Humidity: ${humidity.toFixed(2)}%</p>
                        </div>
                    `;
    
                    // Appending the weather card HTML to the weatherCardsDiv
                    weatherCardsDiv.insertAdjacentHTML("beforeend", weatherCardHTML);
                }
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
                weatherCardsDiv.innerHTML = "Error fetching weather data. Please try again later.";
            });
    };
        
  
    const getCityCoordinates = () => {
        const cityName = cityInput.value.trim(); // Get user entered city name and remove extra spaces
        if (!cityName) return; // Return if cityName is empty
        const GEOCODING_API_URL = "https://api.openweathermap.org/geo/1.0/direct?q="+cityName+"&appid=19b7476c9e106bbc4760a5a8c8ac6547";
  
        // Get entered city coordinates (latitude, longitude, and name) from the API response
        fetch(GEOCODING_API_URL)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.length === 0) return alert(`No coordinates found for ${cityName}`);
                const { name, lat, lon } = data[0];
                console.log(lat, lon);
                fetchForecast(cityName);
                getWeatherDetails(name, lat, lon);
            })
            .catch(error => {
                console.error("Error fetching coordinates:", error);
                weatherCardsDiv.innerHTML = "Error fetching coordinates. Please try again.";
            });
    };
  
    if (searchButton) {
        searchButton.addEventListener("click", getCityCoordinates);
    } else {
        console.error("searchButton element not found");
    }
  
    cityInput.addEventListener("keyup", e => {
        if (e.key === "Enter") getCityCoordinates();
    });
  });
  
  
