document.addEventListener('DOMContentLoaded', () => {
  // Settings Modal Functionality
  const settingsIcon = document.getElementById('settingsIcon');
  const settingsModal = document.getElementById('settingsModal');
  const closeModal = document.getElementById('closeModal');
  const saveSettings = document.getElementById('saveSettings');
  const cancelSettings = document.getElementById('cancelSettings');

  // Open modal
  settingsIcon.addEventListener('click', () => {
    settingsModal.classList.add('show');
    loadCurrentSettings();
  });

  // Close modal handlers
  const closeModalHandler = () => {
    settingsModal.classList.remove('show');
  };

  closeModal.addEventListener('click', closeModalHandler);
  cancelSettings.addEventListener('click', closeModalHandler);
  
  // Close modal when clicking backdrop
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeModalHandler();
    }
  });

  // Load current settings into form
  function loadCurrentSettings() {
    const settings = getStoredSettings();
    document.getElementById('locationInput').value = settings.location || 'Dhaka';
    document.getElementById('calculationMethod').value = settings.method || 'ISNA';
    document.getElementById('timeFormat').value = settings.timeFormat || '24h';
    document.getElementById('enableNotifications').checked = settings.notifications || false;
    document.getElementById('themeSelect').value = settings.theme || 'dark';
  }

  // Save settings
  saveSettings.addEventListener('click', () => {
    const newSettings = {
      location: document.getElementById('locationInput').value,
      method: document.getElementById('calculationMethod').value,
      timeFormat: document.getElementById('timeFormat').value,
      notifications: document.getElementById('enableNotifications').checked,
      theme: document.getElementById('themeSelect').value
    };
    
    saveSettingsToStorage(newSettings);
    closeModalHandler();
    
    // Reload prayer times with new settings
    location.reload();
  });

  // Storage functions
  function getStoredSettings() {
    const stored = localStorage.getItem('salahClockSettings');
    return stored ? JSON.parse(stored) : {};
  }

  function saveSettingsToStorage(settings) {
    localStorage.setItem('salahClockSettings', JSON.stringify(settings));
  }
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

console.log(times);


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
document.getElementsByClassName('current-prayer')[0].innerText = currentPrayer;
const remainingTime = getRemainingTime(prayerTimeHashMap, currentTime);
// document.getElementsByClassName('salah-remaining-time')[0].innerText = "Remaining: " +  remainingTime;

document.getElementById('fajr').innerText = times.fajr;
document.getElementById('sunrise').innerText = times.sunrise;
document.getElementById('dhuhr').innerText = times.dhuhr;
document.getElementById('asr').innerText = times.asr;
document.getElementById('maghrib').innerText = times.maghrib;
document.getElementById('sunset').innerText = times.sunset;
document.getElementById('isha').innerText = times.isha;
document.getElementById('midnight').innerText = times.midnight;






// Make these variables and functions available globally
window.prayerTimeHashMap = prayerTimeHashMap;
window.currentTime = currentTime;
window.getRemainingTime = getRemainingTime;
window.getCurrentPrayer = getCurrentPrayer; 

// Dispatch an event when prayer times are ready
window.dispatchEvent(new CustomEvent('prayerTimesReady'));


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

function getTotalTimePerPrayer(prayerTimeHashMap, currentTime) {
  function timeToMinutes(timeStr) {
    if (typeof timeStr === 'number') return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  // Get current prayer
  const currentPrayer = getCurrentPrayer(prayerTimeHashMap, currentTime);
  
  // Convert all prayer times to minutes and sort them
  const sortedPrayers = Object.entries(prayerTimeHashMap)
    .map(([name, time]) => [name, timeToMinutes(time)])
    .sort((a, b) => a[1] - b[1]);

  // Find current prayer index
  const currentPrayerIndex = sortedPrayers.findIndex(([name]) => name === currentPrayer);
  const nextPrayerIndex = (currentPrayerIndex + 1) % sortedPrayers.length;

  let startTime = sortedPrayers[currentPrayerIndex][1];
  let endTime = sortedPrayers[nextPrayerIndex][1];

  // Handle case when next prayer is tomorrow (e.g., from Isha to Fajr)
  if (endTime < startTime) {
    endTime += 24 * 60; // Add 24 hours in minutes
  }

  // Calculate total duration in minutes
  const totalMinutes = endTime - startTime;
  
  // Convert to hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
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


