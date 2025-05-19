document.addEventListener('DOMContentLoaded', () => {
  // Use chrome.topSites.get to get the list of top sites
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

        // You would typically need to fetch favicons separately if the API doesn't provide them directly
        // The topSites API provides title and url, favicon fetching is a separate task
        // For a simple example, we'll use a placeholder or a service if available and allowed.
        // Direct access to favicons of external sites might have limitations.
        // For a true recreation, you might need to explore Chrome's internal favicon service if exposed to extensions (less likely).
        // A common workaround is to use a service like Google's favicon service if you want actual site favicons.
        // Example using Google's favicon service (subject to availability and terms):
        img.src = `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}`;
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