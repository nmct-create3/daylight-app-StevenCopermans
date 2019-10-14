// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
	//Get hours from milliseconds
	const date = new Date(timestamp * 1000);
	// Hours part from the timestamp
	const hours = '0' + date.getHours();
	// Minutes part from the timestamp
	const minutes = '0' + date.getMinutes();
	// Seconds part from the timestamp (gebruiken we nu niet)
	// const seconds = '0' + date.getSeconds();

	// Will display time in 10:30(:23) format
	return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

// 5 TODO: maak updateSun functie
let updateSun = (elapsedPercent, sun) => {
	const angle = 180 - (180/100)*elapsedPercent;
	
	let x = Math.cos(angle / (180 / Math.PI)) * 50;
	let y = Math.sin(angle / (180 / Math.PI)) * 100;

	if (Math.abs(50 - elapsedPercent) < 0.5)
	{
		x = 0;
	}
	if (Math.abs(0 - elapsedPercent) < 0.5)
	{
		y = 0;
	}

	x += 50;

	sun.style.left = x + "%";
	sun.style.bottom = y + "%";
}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise) => {

	calculateSun(totalMinutes, sunrise);
	setInterval(function(){
		calculateSun(totalMinutes, sunrise);
	}, 60000)
	
	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	document.querySelector('body').classList.add('is-loaded');
};

let calculateSun = (totalMinutes, sunrise) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
		// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
		const sun = document.querySelector(".js-sun");
		const minRemaining = document.querySelector(".js-time-left");

		// Bepaal het aantal minuten dat de zon al op is.
		const today = new Date();
		const elapsedMinutes = (getSecondsFromDate(today) - getSecondsFromDate(new Date(sunrise * 1000)))/60;
		
		const hours = '0' + today.getHours();
		const minutes = '0' + today.getMinutes();

		sun.setAttribute("data-time", hours.substr(-2) + ':' + minutes.substr(-2));
		
		// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
		const elapsedPercent = 100*(elapsedMinutes / totalMinutes);

		// for (let i=0; i<1000; i++) {
		// 	setTimeout( function timer(){
		// 		updateSun(Math.round(i * 100) / 1000, sun);
		// 	}, i*5 );
		// }

		updateSun(Math.round(elapsedPercent * 100) / 100, sun);

		// Vergeet niet om het resterende aantal minuten in te vullen.
		minRemaining.innerHTML = Math.round(totalMinutes - elapsedMinutes);

		if (elapsedPercent < 0 || elapsedPercent > 100) {
			document.querySelector('html').classList.remove('is-day');
			document.querySelector('html').classList.add('is-night');
		} else {
			document.querySelector('html').classList.remove('is-night');
			document.querySelector('html').classList.add('is-day');
		}

		// Bekijk of de zon niet nog onder of reeds onder is
		// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
		// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
}

function getSecondsFromDate(date) {  
	// create an object using the current day/month/year
	let now = new Date();
	let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
	let diff = date - today; // ms difference
	return Math.round(diff / 1000); // make seconds
  }

// 3 Met de data van de API kunnen we de app opvullen
let showResult = queryResponse => {
	console.log(queryResponse);
	
	// We gaan eerst een paar onderdelen opvullen
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	document.querySelector('.js-location').innerHTML = queryResponse.city.name + ', ' + getCountryName(queryResponse.city.country);

	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	const sunrise = queryResponse.city.sunrise;
	const sunset = queryResponse.city.sunset;

	document.querySelector('.js-sunrise').innerHTML =_parseMillisecondsIntoReadableTime(sunrise);
	document.querySelector('.js-sunset').innerHTML =_parseMillisecondsIntoReadableTime(sunset);

	placeSunAndStartMoving((sunset - sunrise)/60, sunrise);
	

	// Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.

};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = (lat, lon) => {
	// Eerst bouwen we onze url op
	let url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=c4ac4562ddfacd352308fdef85617310&units=metric&lang=nl&cnt=1`;

	// Met de fetch API proberen we de data op te halen.
	fetch(url)
	.then(response => {
		return response.json()
	  })
	  .then(data => {
		// Work with JSON data here
		showResult(data);
	  })
	.catch(function(error) {
		console.log(error);
	});   
	
};

document.addEventListener('DOMContentLoaded', function() {
	// 1 We will query the API with longitude and latitude.
	navigator.geolocation.getCurrentPosition(function(position) {
		getAPI(position.coords.latitude, position.coords.longitude);
	},
	function error(msg) {alert('Please enable your GPS position feature.');},
    {maximumAge:10000, timeout:5000, enableHighAccuracy: true});	
});
