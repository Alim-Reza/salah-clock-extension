class Timer {
    constructor(duration) {
        this.totalDuration = duration;
        this.remainingTime = duration;
        this.isRunning = false;
        this.interval = null;
        
        this.timerText = document.getElementById('timerText');
        this.progressCircle = document.getElementById('progressCircle');
        this.progressPercent = document.getElementById('progressPercent');
        
        this.circumference = 2 * Math.PI * 70;
        this.progressCircle.style.strokeDasharray = this.circumference;
        this.progressCircle.style.strokeDashoffset = 0;
        
        this.updateDisplay();
        this.start();
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        this.timerText.textContent = this.formatTime(this.remainingTime);
        
        const progress = this.remainingTime / this.totalDuration;
        const offset = this.circumference * (1 - progress);
        this.progressCircle.style.strokeDashoffset = offset;
        
        if (this.remainingTime <= 60) {
            this.progressCircle.classList.add('warning');
        } else {
            this.progressCircle.classList.remove('warning');
        }
        
        if (this.progressPercent) {
            const percentage = Math.round(((this.totalDuration - this.remainingTime) / this.totalDuration) * 100);
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
        if (remainingTimeText) {
            clearInterval(checkRemainingTime);
            // Convert "Xh Ym until Prayer" to minutes
            const [hours, minutes] = remainingTimeText.match(/(\d+)h\s+(\d+)m/).slice(1).map(Number);
            const totalMinutes = (hours * 60 + minutes) * 60; // Convert to seconds
            const timer = new Timer(totalMinutes);
        }
    }, 100);
});