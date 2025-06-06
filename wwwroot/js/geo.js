// يحمّل بعد DOM + Lucide
function sendCoordsToServer() {
  if (!navigator.geolocation) return alert('No geolocation');

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lon } = pos.coords;

    fetch(`/Prayer/Times?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(renderTimes)
      .catch(err => alert('Server error: ' + err));
  });
}

function renderTimes(data) {
  document.getElementById('cityName').textContent = data.city;
  const map = {Fajr:'timeFajr',Sunrise:'timeSunrise',Dhuhr:'timeDhuhr',Asr:'timeAsr',Maghrib:'timeMaghrib',Isha:'timeIsha'};
  Object.entries(map).forEach(([k, id]) => {
    document.getElementById(id).textContent = data.timings[k] || '--:--';
  });
}

document.addEventListener('DOMContentLoaded', sendCoordsToServer);
