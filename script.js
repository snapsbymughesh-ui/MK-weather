const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "384bca1a8c86b2efadbd4e08b1a78ac9";

/* ===== CREATE WEATHER CARD ===== */
const createWeatherCard = (cityName, weatherItem, rainfall, index) => {

    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>🌡 Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>💨 Wind: ${weatherItem.wind.speed} m/s</h6>
                    <h6>💧 Humidity: ${weatherItem.main.humidity}%</h6>
                    <h6>🌧 Rainfall: ${rainfall} mm</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    }

    return `<li class="card">
                <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png">
                <h6>🌡 Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                <h6>💨 Wind: ${weatherItem.wind.speed} m/s</h6>
                <h6>💧 Humidity: ${weatherItem.main.humidity}%</h6>
                <h6>🌧 Rain: ${rainfall} mm</h6>
            </li>`;
};

/* ===== FETCH WEATHER ===== */
const getWeatherDetails = async (cityName, latitude, longitude) => {

    const WEATHER_API_URL =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    const RAIN_API_URL =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum&timezone=auto`;

    try {
        const weatherRes = await fetch(WEATHER_API_URL);
        const weatherData = await weatherRes.json();

        const rainRes = await fetch(RAIN_API_URL);
        const rainData = await rainRes.json();

        const rainfallDays = rainData.daily.precipitation_sum;

        const uniqueForecastDays = [];
        const fiveDaysForecast = weatherData.list.filter(forecast => {
            const day = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(day)) {
                uniqueForecastDays.push(day);
                return true;
            }
        });

        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
            const rainfall = rainfallDays[index] ?? 0;
            const html = createWeatherCard(cityName, weatherItem, rainfall, index);

            if (index === 0) {
                currentWeatherDiv.innerHTML = html;
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });

    } catch {
        alert("Error fetching weather data");
    }
};

/* ===== CITY SEARCH ===== */
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    const API_URL =
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert("City not found");
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        });
};

/* ===== CURRENT LOCATION ===== */
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;

            const API_URL =
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(API_URL)
                .then(res => res.json())
                .then(data => {
                    getWeatherDetails(data[0].name, latitude, longitude);
                });
        },
        () => alert("Location access denied")
    );
};

/* ===== EVENTS ===== */
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
