/**
 * Google Maps initialization and layer management.
 */

let map;
let heatmapLayer;
let boundaryLayer;
const overlayLayers = {};

function initMap(center = { lat: 30.2672, lng: -97.7431 }, zoom = 11) {
    map = new google.maps.Map(document.getElementById('map'), {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        styles: getMapStyles(),
    });

    // Initialize heatmap layer (hidden by default)
    heatmapLayer = new google.maps.visualization.HeatmapLayer({
        data: [],
        map: null,
        radius: 30,
        opacity: 0.7,
    });

    return map;
}

function setHeatmapData(points) {
    const data = points.map(p =>
        new google.maps.LatLng(p.lat, p.lng)
    );
    heatmapLayer.setData(data);
}

function toggleHeatmap(visible) {
    heatmapLayer.setMap(visible ? map : null);
}

function loadBoundaries(geojson) {
    if (boundaryLayer) {
        boundaryLayer.forEach(f => map.data.remove(f));
    }
    boundaryLayer = map.data.addGeoJson(geojson);
    map.data.setStyle({
        fillColor: '#6c63ff',
        fillOpacity: 0.1,
        strokeColor: '#6c63ff',
        strokeWeight: 1.5,
        strokeOpacity: 0.6,
    });
}

function toggleBoundaries(visible) {
    map.data.setStyle({ visible });
}

function recenterMap(lat, lng, zoom = 11) {
    map.setCenter({ lat, lng });
    map.setZoom(zoom);
}

function clearAllLayers() {
    heatmapLayer.setData([]);
    heatmapLayer.setMap(null);
    if (boundaryLayer) {
        boundaryLayer.forEach(f => map.data.remove(f));
    }
}

function getMapStyles() {
    return [
        { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
        { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#0e1626' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
    ];
}
