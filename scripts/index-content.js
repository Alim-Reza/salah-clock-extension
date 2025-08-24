document.addEventListener('DOMContentLoaded', () => {
  // Initialize PrayTimes with stored settings
  const prayTimes = new PrayTimes();
  
  // Load settings from localStorage
  function getStoredSettings() {
    const stored = localStorage.getItem('salahClockSettings');
    return stored ? JSON.parse(stored) : {
      location: 'Dhaka',
      coordinates: [23.8103, 90.4125], // Default to Dhaka
      method: 'ISNA',
      timeFormat: '24h',
      notifications: false,
      theme: 'dark'
    };
  }

  const settings = getStoredSettings();
  
  // Set calculation method from settings
  prayTimes.setMethod(settings.method);
  
  // Adjust parameters based on settings
  prayTimes.adjust({
    fajr: 18,
    dhuhr: '5 min',
    asr: 'Standard',
    isha: 18
  });

  // Get prayer times for today - ensure coordinates are valid
  const coordinates = settings.coordinates || [23.8103, 90.4125]; // Default to Dhaka
  console.log('Using coordinates:', coordinates);
  const times = prayTimes.getTimes(new Date(), coordinates, +6);

  // Prayer times array with Arabic names
  const prayers = [
    { name: "Fajr", arabicName: "فجر", time: times.fajr },
    { name: "Dhuhr", arabicName: "ظهر", time: times.dhuhr },
    { name: "Asr", arabicName: "عصر", time: times.asr },
    { name: "Maghrib", arabicName: "مغرب", time: times.maghrib },
    { name: "Isha", arabicName: "عشاء", time: times.isha }
  ];

  // Utility functions
  function formatTime(time) {
    return time.toString().padStart(2, '0');
  }

  function formatTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  function truncateTitle(title, maxLength = 50) {
    return title.length > maxLength ? title.substring(0, maxLength) + "..." : title;
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  // Update prayer times display
  function updatePrayerTimes() {
    const now = new Date();
    const today = new Date();
    const prayerTimesContainer = document.getElementById('prayer-times');
    
    if (!prayerTimesContainer) return;
    
    // Find next prayer
    let nextPrayerIndex = prayers.findIndex(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = new Date(today);
      prayerTime.setHours(hours, minutes, 0, 0);
      return prayerTime > now;
    });
    
    // Find current prayer (the most recent prayer that has passed)
    let currentPrayerIndex = -1;
    for (let i = prayers.length - 1; i >= 0; i--) {
      const [hours, minutes] = prayers[i].time.split(':').map(Number);
      const prayerTime = new Date(today);
      prayerTime.setHours(hours, minutes, 0, 0);
      if (now >= prayerTime) {
        currentPrayerIndex = i;
        break;
      }
    }
    
    // If no current prayer found (time is before Fajr), current is Isha from yesterday
    if (currentPrayerIndex === -1) {
      currentPrayerIndex = prayers.length - 1; // Isha
    }
    
    // If no next prayer found (after Isha), next is Fajr tomorrow
    if (nextPrayerIndex === -1) nextPrayerIndex = 0;
    
    console.log('Current time:', now.toLocaleTimeString());
    console.log('Current prayer index:', currentPrayerIndex, prayers[currentPrayerIndex]?.name);
    console.log('Next prayer index:', nextPrayerIndex, prayers[nextPrayerIndex]?.name);
    
    prayerTimesContainer.innerHTML = prayers.map((prayer, index) => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = new Date(today);
      prayerTime.setHours(hours, minutes, 0, 0);
      
      const isPast = now > prayerTime;
      const isCurrent = index === currentPrayerIndex;
      const isNext = index === nextPrayerIndex;
      
      let className = 'prayer-item ';
      if (isCurrent) className += 'current';
      else if (isNext && !isCurrent) className += 'next';
      else if (isPast) className += 'past';
      else className += 'default';
      
      return `
        <div class="${className}">
          <div class="prayer-info">
            ${isCurrent ? '<svg class="icon-small star-icon" fill="currentColor" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>' : ''}
            <div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <h3 class="prayer-name">${prayer.name}</h3>
                <span class="prayer-arabic">${prayer.arabicName}</span>
              </div>
              ${isCurrent ? '<p class="prayer-status" style="color: var(--accent);">Current Prayer</p>' : ''}
              ${isNext && !isCurrent ? '<p class="prayer-status" style="color: var(--secondary);">Next Prayer</p>' : ''}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="prayer-time">${prayer.time}</div>
            ${isPast && !isCurrent ? '<p class="prayer-status">Completed</p>' : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Update countdown timer
  function updateTimer() {
    const now = new Date();
    const today = new Date();
    
    // Find current prayer (most recent prayer that has passed)
    let currentPrayer = null;
    for (let i = prayers.length - 1; i >= 0; i--) {
      const [hours, minutes] = prayers[i].time.split(':').map(Number);
      const prayerTime = new Date(today);
      prayerTime.setHours(hours, minutes, 0, 0);
      if (now >= prayerTime) {
        currentPrayer = prayers[i];
        break;
      }
    }
    
    // If no current prayer found (time is before Fajr), current is Isha
    if (!currentPrayer) {
      currentPrayer = prayers[prayers.length - 1]; // Isha
    }
    
    // Find next prayer for countdown
    let nextPrayer = null;
    let nextPrayerTime = null;
    
    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = new Date(today);
      prayerTime.setHours(hours, minutes, 0, 0);
      
      if (prayerTime > now) {
        nextPrayer = prayer;
        nextPrayerTime = prayerTime;
        break;
      }
    }
    
    // If no prayer found today, next is Fajr tomorrow
    if (!nextPrayer) {
      nextPrayer = prayers[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const [hours, minutes] = nextPrayer.time.split(':').map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);
      nextPrayerTime = tomorrow;
    }
    
    // Update prayer name elements to show CURRENT prayer
    const nextPrayerNameEl = document.getElementById('next-prayer-name');
    const nextPrayerArabicEl = document.getElementById('next-prayer-arabic');
    
    if (nextPrayerNameEl && nextPrayerArabicEl) {
      nextPrayerNameEl.textContent = currentPrayer.name;
      nextPrayerArabicEl.textContent = currentPrayer.arabicName;
    }
    
    // Calculate time remaining
    const diff = nextPrayerTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Update timer display elements
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (hoursEl && minutesEl && secondsEl) {
      hoursEl.textContent = formatTime(hours);
      minutesEl.textContent = formatTime(minutes);
      secondsEl.textContent = formatTime(seconds);
    }
    
    // Check if urgent (less than 15 minutes)
    const isUrgent = hours === 0 && minutes < 15;
    const timerDisplay = document.getElementById('timer-display');
    const timerValues = document.querySelectorAll('.timer-value');
    const urgentAlert = document.getElementById('urgent-alert');
    const urgentPrayerName = document.getElementById('urgent-prayer-name');
    
    if (timerDisplay && urgentAlert) {
      if (isUrgent) {
        timerDisplay.classList.add('urgent');
        timerValues.forEach(val => val.classList.add('urgent'));
        urgentAlert.style.display = 'block';
        if (urgentPrayerName) {
          urgentPrayerName.textContent = nextPrayer.name;
        }
      } else {
        timerDisplay.classList.remove('urgent');
        timerValues.forEach(val => val.classList.remove('urgent'));
        urgentAlert.style.display = 'none';
      }
    }
  }

  // Update recent tabs using Chrome extension API
  function updateRecentTabs() {
    const recentTabsContainer = document.getElementById('recent-tabs');
    
    if (!recentTabsContainer) return;

    // Check if we have access to chrome.topSites API
    if (typeof chrome !== 'undefined' && chrome.topSites) {
      chrome.topSites.get((topSites) => {
        if (topSites && topSites.length > 0) {
          recentTabsContainer.innerHTML = topSites.slice(0, 5).map((site, index) => `
            <div class="tab-item" onclick="window.open('${site.url}', '_blank')">
              <div class="tab-favicon">🌐</div>
              <div class="tab-info">
                <h4 class="tab-title">${truncateTitle(site.title || getDomain(site.url))}</h4>
                <div class="tab-meta">
                  <svg class="icon-tiny" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span>${getDomain(site.url)}</span>
                  <span>•</span>
                  <span>Top site</span>
                </div>
              </div>
              <div style="opacity: 0; transition: opacity 0.2s;" class="tab-external">
                <svg class="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15,3 21,3 21,9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </div>
            </div>
          `).join('');
          
          // Add hover effects
          document.querySelectorAll('.tab-item').forEach(item => {
            const externalIcon = item.querySelector('.tab-external');
            if (externalIcon) {
              item.addEventListener('mouseenter', () => {
                externalIcon.style.opacity = '1';
              });
              item.addEventListener('mouseleave', () => {
                externalIcon.style.opacity = '0';
              });
            }
          });
        } else {
          recentTabsContainer.innerHTML = `
            <div class="tab-item">
              <div class="tab-favicon">📭</div>
              <div class="tab-info">
                <h4 class="tab-title">No recent tabs available</h4>
                <div class="tab-meta">
                  <span>Start browsing to see your top sites here</span>
                </div>
              </div>
            </div>
          `;
        }
      });
    } else {
      // Fallback for testing without chrome extension context
      recentTabsContainer.innerHTML = `
        <div class="tab-item">
          <div class="tab-favicon">🔒</div>
          <div class="tab-info">
            <h4 class="tab-title">Chrome Extension API Required</h4>
            <div class="tab-meta">
              <span>Load as Chrome extension to see recent tabs</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Update current date
  function updateDates() {
    const currentDateEl = document.getElementById('current-date');
    const currentYearEl = document.getElementById('current-year');
    
    const now = new Date();
    
    if (currentDateEl) {
      currentDateEl.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    if (currentYearEl) {
      currentYearEl.textContent = now.getFullYear();
    }
  }

  // Initialize all components
  function init() {
    updatePrayerTimes();
    updateTimer();
    updateRecentTabs();
    updateDates();
    
    // Update timer every second
    setInterval(updateTimer, 1000);
    
    // Update prayer times every minute
    setInterval(updatePrayerTimes, 60000);
    
    // Update recent tabs every 5 minutes
    setInterval(updateRecentTabs, 300000);
  }

  // Start initialization
  init();

  // Make variables globally available for compatibility
  window.prayerTimes = prayers;
  window.currentTime = new Date().getHours() + ":" + new Date().getMinutes();
});