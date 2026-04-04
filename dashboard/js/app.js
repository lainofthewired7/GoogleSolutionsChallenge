/**
 * Main application entry point — called by Google Maps callback.
 */

async function initApp() {
    // Initialize map centered on Austin
    initMap({ lat: 30.2672, lng: -97.7431 }, 11);

    // Set up UI controls
    initControls();

    // Load default market
    await loadMarket('austin');

    console.log('Projectr Analytics dashboard initialized.');
}
