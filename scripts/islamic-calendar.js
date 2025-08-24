// Islamic events data - keeping this static as requested
const islamicEvents = [
    { name: "Laylat al-Qadr", arabicName: "ليلة القدر", date: new Date(2024, 3, 15), type: "major", description: "The Night of Power, when the first verses of Quran were revealed", daysUntil: 15 },
    { name: "Eid al-Fitr", arabicName: "عيد الفطر", date: new Date(2024, 3, 20), type: "major", description: "Festival of Breaking the Fast, marking the end of Ramadan", daysUntil: 20 },
    { name: "Isra and Mi'raj", arabicName: "الإسراء والمعراج", date: new Date(2024, 4, 8), type: "special", description: "The Night Journey and Ascension of Prophet Muhammad", daysUntil: 38 },
    { name: "Day of Arafat", arabicName: "يوم عرفة", date: new Date(2024, 5, 15), type: "major", description: "The most important day of Hajj pilgrimage", daysUntil: 76 }
];

function getDaysText(days) {
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days`;
}

// Update Islamic events - keeping this functionality as requested
function updateIslamicEvents() {
    const eventsContainer = document.getElementById('islamic-events');
    
    if (!eventsContainer) return;
    
    eventsContainer.innerHTML = islamicEvents.slice(0, 4).map(event => {
        let countdownClass = 'event-countdown ';
        if (event.daysUntil <= 7) countdownClass += 'urgent';
        else if (event.daysUntil <= 30) countdownClass += 'soon';
        else countdownClass += 'later';
        
        const iconSvg = event.type === 'major' 
            ? '<svg class="icon-small" style="color: var(--islamic-gold);" fill="currentColor" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>'
            : '<svg class="icon-small" style="color: var(--accent);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        
        return `
            <div class="event-item ${event.type}">
                <div class="event-header">
                    <div style="margin-top: 4px;">${iconSvg}</div>
                    <div class="event-info">
                        <div class="event-title">
                            <h4 class="event-name">${event.name}</h4>
                            <span class="event-arabic">${event.arabicName}</span>
                        </div>
                        <p class="event-description">${event.description}</p>
                        <div class="event-meta">
                            <span class="event-date">${event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span class="${countdownClass}">${getDaysText(event.daysUntil)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Initialize Islamic calendar events when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateIslamicEvents();
});