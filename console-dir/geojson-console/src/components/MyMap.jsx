import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  FeatureGroup,
} from "react-leaflet";
import L from "leaflet";
import karnataka from "./../data/karnataka.json";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./MyMap.css";
import { EditControl } from "react-leaflet-draw";

const geoJsonData = {
  type: "FeatureCollection",
  features: [karnataka],
};

function FitGeoJsonBounds({ geoJsonData }) {
  const map = useMap();

  useEffect(() => {
    const geoJsonLayer = L.geoJSON(geoJsonData);
    const bounds = geoJsonLayer.getBounds();
    map.fitBounds(bounds);
  }, [geoJsonData, map]);

  return null;
}

const BasicMap = () => {
  const mapRef = useRef();
  const [mapLayers, setMapLayers] = useState([]);
  const [intersectingTiles] = useState(null); // Store intersecting tiles
  const [showGeoJson, setShowGeoJson] = useState(true); // Toggle to show/hide the initial geoJSON

  const _created = (e) => {
    console.log(e);

    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const rawLatLngs = layer.getLatLngs()[0]; // Get the latlngs array from the polygon

      // Convert it into the desired format [lng, lat]
      const aoiCoordinates = rawLatLngs.map((point) => [point.lng, point.lat]);

      console.log("Formatted Coordinates:", aoiCoordinates); // To check the format

      // Now update the state with the formatted coordinates
      setMapLayers((layers) => [...layers, { aoiCoordinates }]);
      if (
        aoiCoordinates[0][0] !== aoiCoordinates[aoiCoordinates.length - 1][0] ||
        aoiCoordinates[0][1] !== aoiCoordinates[aoiCoordinates.length - 1][1]
      ) {
        // Manually close the polygon if needed
        aoiCoordinates.push(aoiCoordinates[0]);
      }

      setMapLayers((layers) => [...layers, { aoiCoordinates }]);
      setShowGeoJson(false);
      fetchIntersectingTiles(aoiCoordinates);
    }
  };

  const fetchIntersectingTiles = async (aoiCoordinates) => {
    try {
      const response = await fetch("http://localhost:5000/tiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: [JSON.stringify({ aoiCoordinates })], // Send the coordinates in the request body
      });

      if (response.ok) {
        const data = await response.json();
        // You can now process and display the intersecting tiles
        displayIntersectingTiles(data);
      } else {
        console.error("Failed to fetch intersecting tiles");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const displayIntersectingTiles = (tilesGeoJson) => {
    const map = mapRef.current;
    if (map) {
      L.geoJSON(tilesGeoJson, {
        // Add the tiles to the map
        style: {
          color: "red", // Set the border color to red
          fillColor: "red", // Set the fill color to red
          weight: 2, // Set the border thickness
          fillOpacity: 0.5, // Adjust the opacity of the fill color
        },
      }).addTo(map);
    }
  };

  useEffect(() => {
    if (intersectingTiles) {
      displayIntersectingTiles(intersectingTiles); // Display intersecting tiles when available
    }
  }, [intersectingTiles]);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>My Map</h1>
      <button>"Select AOI"</button>
      <MapContainer
        style={{ height: "60vh", width: "60%" }}
        zoom={2}
        center={[30, 100]}
        ref={mapRef}
        className="map"
      >
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={_created}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
            }}
          />
        </FeatureGroup>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {showGeoJson && <GeoJSON data={karnataka.features} />}
        {showGeoJson && <FitGeoJsonBounds geoJsonData={geoJsonData} />}
      </MapContainer>
    </div>
  );
};

export default BasicMap;
