document.addEventListener("DOMContentLoaded", function() {
  var clearSearches = document.getElementById("clearSearches");
  clearSearches.addEventListener("click", function () {
    localStorage.setItem("searchHistory", JSON.stringify([]));
    displaySearchHistory();
  });

  displaySearchHistory();
});

// Function to update today's weather card
function updateTodaysWeather(data) {
  console.log("Data:", data);
  
  if (!data) {
      console.error("Data is undefined.");
      return;
  }

  if (!data.name) {
      console.error("City name is undefined.");
      return;
  }

  // Displaying the current date in "Month Day, Year" format
  var currentDate = new Date();
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  var formattedDate = currentDate.toLocaleDateString('en-US', options);
  document.getElementById("current-date").textContent = formattedDate;

  document.getElementById("current-city").textContent = `Today's Weather in ${data.name}`;

  if (data.main) {
      var temperature = data.main.temp;
      var humidity = data.main.humidity;
      var windSpeed = data.wind.speed;
     

      document.getElementById("current-temp").textContent = `Temperature: ${temperature}°F`;
      document.getElementById("current-humidity").textContent = `Humidity: ${humidity}%`;
      document.getElementById("current-wind").textContent = `Wind: ${windSpeed} MPH`;

        function displayIcon(condition, element) {
          console.log("Condition:", condition);
          console.log("Element:", element);
      
          var iconHTML = "";
          switch (condition) {
              case "Clear":
                  iconHTML = '<i class="fa-solid fa-sun"></i>';
                  break;
              case "Clouds":
                  iconHTML = '<i class="fa-solid fa-cloud"></i>';
                  break;
              case "Rain":
                  iconHTML = '<i class="fa-solid fa-cloud-rain"></i>';
                  break;
              default:
                  iconHTML = ""; // Handle other conditions
          }
      
          if (element) {
              element.innerHTML = iconHTML;
          } else {
              console.error("Element is null.");
          }
      }
      
    }
}

// Fetch weather data using city name
function getApi(citySearch) {
  // Clear search input field
  document.getElementById("city-search").value = "";

  // Save search to history
  saveSearchHistory(citySearch);

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${citySearch}&appid=19b7476c9e106bbc4760a5a8c8ac6547&units=imperial`
  )
    .then(function (response) {
      if (response.ok) return response.json();
      throw new Error('Network response was not ok.');
    })
    .then(function (data) {
      console.log(data);
      updateTodaysWeather(data);
      // Fetch forecast data
      forecastCards(data.coord.lat, data.coord.lon);
    })
    .catch(function (error) {
      console.error('Error fetching weather data:', error);
    });
}

// Fetches forecast data for a location
function forecastCards(lat, lon) {
  var forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=19b7476c9e106bbc4760a5a8c8ac6547&units=imperial`;

  fetch(forecastURL)
    .then(function (response) {
      if (response.ok) return response.json();
      throw new Error('Network response was not ok.');
    })
    .then(function (data) {
      console.log(data);
      // Update forecast cards
      updateForecastCards(data);
    })
    .catch(function (error) {
      console.error('Error fetching forecast data:', error);
    });
}



function updateForecastCards(data) {
  // Group the forecast data by day
  const forecastByDay = groupForecastByDay(data.list);

  // Loop through 5 forecast cards (one for each day)
  $(".card").each(function (i) {
    // Get the forecast data for the current day
    const dailyForecast = forecastByDay[i];

    // Check if dailyForecast exists before proceeding
    if (!dailyForecast) return;

    // Extract the timestamp for the first entry and convert it to a Date object
    const timestamp = dailyForecast[0].dt * 1000;
    const date = new Date(timestamp);

    // Format the date as "MM/DD/YYYY"
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    // Update the text content of the card date element
    $(this).find(".card-date").text(formattedDate);

    // Calculate the daily averages
    const dailyTemps = dailyForecast.map(item => item.main.temp);
    const dailyWinds = dailyForecast.map(item => item.wind.speed);
    const dailyHumidities = dailyForecast.map(item => item.main.humidity);

    const avgTemp = calculateAverage(dailyTemps);
    const avgWind = calculateAverage(dailyWinds);
    const avgHumidity = calculateAverage(dailyHumidities);

    // Update the text content of the card temperature element
    $(this).find(".card-temp").text("Temp: " + avgTemp + "°F");

    // Update the text content of the card wind element
    $(this).find(".card-wind").text("Wind: " + avgWind + " MPH");

    // Update the text content of the card humidity element
    $(this).find(".card-humd").text("Humidity: " + avgHumidity + "%");

    // Get the weather condition for the first forecast of the day
    const condition = dailyForecast[0].weather[0].main;

    // Determine the icon based on the weather condition
    const iconClass = getWeatherIconClass(condition);

    // Set the HTML content of the weather icon element with the appropriate icon class
    $(this).find(".weather-icon").html(`<i class="${iconClass}"></i>`);
  });
}

// Helper function to group the forecast data by day
function groupForecastByDay(forecastList) {
  const forecastByDay = [];
  let currentDay = [];

  for (const item of forecastList) {
    const date = new Date(item.dt * 1000);
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (currentDay.length === 0 || !isSameDay(currentDay[0].dt * 1000, today)) {
      if (currentDay.length > 0) {
        forecastByDay.push(currentDay);
      }
      currentDay = [];
    }

    currentDay.push(item);
  }

  if (currentDay.length > 0) {
    forecastByDay.push(currentDay);
  }

  return forecastByDay;
}

// Helper function to check if two dates are the same day
function isSameDay(timestamp1, timestamp2) {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Helper function to calculate the average of an array
function calculateAverage(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
}

// Helper function to get the weather icon class based on the condition
function getWeatherIconClass(condition) {
  switch (condition) {
    case "Clear":
      return "fa-solid fa-sun";
    case "Clouds":
      return "fa-solid fa-cloud";
    case "Rain":
      return "fa-solid fa-cloud-rain";
    default:
      return ""; // Handle other conditions
  }
}

// Save search history to local storage
function saveSearchHistory(searchTerm) {
  var searches = JSON.parse(localStorage.getItem("searchHistory")) || [];
  searches.push(searchTerm);
  localStorage.setItem("searchHistory", JSON.stringify(searches));
}

// Display search history from local storage
function displaySearchHistory() {
  var searches = JSON.parse(localStorage.getItem("searchHistory")) || [];
  var searchList = document.getElementById("search-history");
  searchList.innerHTML = "";
  searches.forEach(function (city) {
    var li = document.createElement("li");
    li.textContent = city;
    li.classList.add("list-group-item");
    searchList.appendChild(li);
  });
}

// Event listener for search button
document.getElementById("search-button").addEventListener("click", function () {
  var citySearch = document.getElementById("city-search").value;
  if (citySearch) {
    getApi(citySearch);
  }
});

// Run when the page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  displaySearchHistory();
});
