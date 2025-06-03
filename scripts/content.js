document.addEventListener('DOMContentLoaded', () => {
  // Initialize PrayTimes
  const prayTimes = new PrayTimes();
  
  // Set calculation method
  prayTimes.setMethod('ISNA');

// Adjust parameters (optional)
prayTimes.adjust({
  fajr: 18,
  dhuhr: '5 min',
  asr: 'Standard',
  isha: 18
});

// Get prayer times for today at a specific location and timezone
const times = prayTimes.getTimes(new Date(), [23.8103, 90.4125], +6);

// Display the times
console.log('Fajr:', times.fajr);
console.log('Dhuhr:', times.dhuhr);
console.log('Asr:', times.asr);
console.log('Maghrib:', times.maghrib);
console.log('Isha:', times.isha);

const prayerTimeHashMap = {
  'Fajr' : times.fajr,
  'Dhuhr' : times.dhuhr,
  'Asr' : times.asr,
  'Maghrib' : times.maghrib,
  'Isha' : times.isha,
}

const currentTime = new Date().getHours() + ":" + new Date().getMinutes(); // 2:55 PM
console.log(currentTime);
console.log(getCurrentPrayer(prayerTimeHashMap, currentTime)); // Output: "Dhuhr"

const currentPrayer = getCurrentPrayer(prayerTimeHashMap, currentTime);
document.getElementsByClassName('salah-clock-content')[0].innerText = "Its time for: " + currentPrayer;
const remainingTime = getRemainingTime(prayerTimeHashMap, currentTime);
document.getElementsByClassName('salah-remaining-time')[0].innerText = "Remaining: " +  remainingTime;
  chrome.topSites.get((topSites) => {
    const shortcutsList = document.getElementById('shortcuts-list');

    if (topSites && topSites.length > 0) {
      topSites.forEach((site) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        const img = document.createElement('img');
        const title = document.createElement('div');

        link.href = site.url;
        link.title = site.title;
        img.src = `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=128`;
        img.alt = site.title;
        title.textContent = site.title;

        link.appendChild(img);
        link.appendChild(title);
        listItem.appendChild(link);
        shortcutsList.appendChild(listItem);
      });
    } else {
      const listItem = document.createElement('li');
      listItem.textContent = 'No top sites available.';
      shortcutsList.appendChild(listItem);
    }
  });
});


function getCurrentPrayer(prayerTimeHashMap, currentTime) {
  // Convert HH:MM time string to minutes since midnight
  function timeToMinutes(timeStr) {
    if (typeof timeStr === 'number') return timeStr; // already in minutes
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convert all prayer times to minutes
  const prayerTimesInMinutes = Object.entries(prayerTimeHashMap)
    .map(([name, time]) => [name, timeToMinutes(time)])
    .sort((a, b) => a[1] - b[1]); // sort by time ascending

  const currentMinutes = timeToMinutes(currentTime);

  let currentPrayer = null;

  for (let i = 0; i < prayerTimesInMinutes.length; i++) {
    const [name, minutes] = prayerTimesInMinutes[i];
    if (currentMinutes >= minutes) {
      currentPrayer = name;
    } else {
      break;
    }
  }

  // If time is before the first prayer of the day, return the last prayer (e.g. Isha)
  if (!currentPrayer) {
    currentPrayer = prayerTimesInMinutes[prayerTimesInMinutes.length - 1][0];
  }

  return currentPrayer;
}



function getRemainingTime(prayerTimeHashMap, currentTime) {
  function timeToMinutes(timeStr) {
    if (typeof timeStr === 'number') return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  const currentMinutes = timeToMinutes(currentTime);

  const sortedPrayers = Object.entries(prayerTimeHashMap)
    .map(([name, time]) => [name, timeToMinutes(time)])
    .sort((a, b) => a[1] - b[1]);

  for (let i = 0; i < sortedPrayers.length; i++) {
    const [name, minutes] = sortedPrayers[i];
    if (currentMinutes < minutes) {
      const remaining = minutes - currentMinutes;
      const hr = Math.floor(remaining / 60);
      const min = remaining % 60;
      return `${hr}h ${min}m until ${name}`;
    }
  }

  // If after Isha, return time until Fajr next day
  const fajrMinutes = sortedPrayers[0][1];
  const minutesUntilFajr = 24 * 60 - currentMinutes + fajrMinutes;
  const hr = Math.floor(minutesUntilFajr / 60);
  const min = minutesUntilFajr % 60;
  return `${hr}h ${min}m until Fajr`;
}