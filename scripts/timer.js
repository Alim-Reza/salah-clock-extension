class Timer {
    constructor(duration, totalDuration) {
        this.totalDuration = totalDuration;
        this.remainingTime = duration;
        this.isRunning = false;
        this.interval = null;

        // Store the start time to calculate accurate remaining time
        this.startTime = Date.now();
        this.initialDuration = duration;

        this.timerText = document.getElementById('timerText');
        this.progressCircle = document.getElementById('progressCircle');
        this.progressPercent = document.getElementById('progressPercent');

        this.circumference = 2 * Math.PI * 70;
        // Set strokeDasharray to full circumference so we can control visibility with strokeDashoffset
        this.progressCircle.style.strokeDasharray = this.circumference;
        console.log("Circumference: " + this.circumference);
        console.log("Remaining time: " + this.remainingTime + ", Total duration: " + this.totalDuration);

        // Add visibility change listener to refresh timer when tab becomes visible
        this.setupVisibilityListener();

        this.updateDisplay();
        this.start();
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        this.timerText.textContent = this.formatTime(this.remainingTime);

        // Calculate what fraction of time is remaining (0 to 1)
        const remainingFraction = this.remainingTime / this.totalDuration;

        // Set offset so only the remaining portion is visible
        // When remainingFraction = 1 (full time left), offset = 0 (full circle visible)
        // When remainingFraction = 0 (no time left), offset = circumference (no circle visible)
        const offset = this.circumference * (1 - remainingFraction);
        this.progressCircle.style.strokeDashoffset = offset;

        if (this.remainingTime <= 60) {
            this.progressCircle.classList.add('warning');
        } else {
            this.progressCircle.classList.remove('warning');
        }

        if (this.progressPercent) {
            const percentage = Math.round(remainingFraction * 100);
            this.progressPercent.textContent = `${percentage}%`;
        }
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.interval = setInterval(() => {
            if (this.remainingTime > 0) {
                this.remainingTime--;
                this.updateDisplay();
            } else {
                this.stop();
                this.onComplete();
            }
        }, 1000);
    }

    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Tab became visible again, refresh the timer
                this.refreshTimer();
            }
        });
    }

    refreshTimer() {
        // Calculate how much time has actually passed since the timer started
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - this.startTime) / 1000);

        // Calculate the accurate remaining time
        this.remainingTime = Math.max(0, this.initialDuration - elapsedSeconds);

        // Update the display immediately
        this.updateDisplay();

        // If timer has completed while tab was hidden
        if (this.remainingTime <= 0) {
            this.stop();
            this.onComplete();
        }
    }

    onComplete() {
        this.timerText.textContent = "Done!";
        if (this.progressPercent) {
            this.progressPercent.textContent = "100%";
        }
        this.progressCircle.style.stroke = '#4ade80';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Wait for prayer times to be calculated
    const checkRemainingTime = setInterval(() => {
        const remainingTimeText = getRemainingTime(prayerTimeHashMap, currentTime);
        const totalTimeOfPrayer = getTotalTimePerPrayer(prayerTimeHashMap, currentTime);
        if (remainingTimeText) {
            clearInterval(checkRemainingTime);
            // Convert "Xh Ym until Prayer" to minutes
            const [hours, minutes] = remainingTimeText.match(/(\d+)h\s+(\d+)m/).slice(1).map(Number);
            const totalMinutesRemaining = (hours * 60 + minutes) * 60; // Convert to seconds

            const [thours, tminutes] = totalTimeOfPrayer.match(/(\d+)h\s+(\d+)m/).slice(1).map(Number);
            const totalMinutesOfPrayerTime = (thours * 60 + tminutes) * 60; // Convert to seconds
            const timer = new Timer(totalMinutesRemaining, totalMinutesOfPrayerTime);
        }
    }, 100);
});