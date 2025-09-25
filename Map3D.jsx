// src/components/Map3D.jsx
import React, { useEffect, useState, useRef } from "react";
import { Viewer, Entity } from "resium";
import {
  Ion,
  Cartesian3,
  Transforms,
  HeadingPitchRoll,
  Color,
  PolylineDashMaterialProperty,
} from "cesium";

// Set your Cesium Ion access token
Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjODE0MWRkNS00M2QzLTQ5OWUtODMyNi01NDQwNWIzZWNkOTgiLCJpZCI6MzI5NzUzLCJpYXQiOjE3NTQ1NzI5MzN9.sGhDisppCS4dPm5Qoxf3GBmjXABPEbG8rV0gphR_czc";

// Use the OpenSky API wrapper
import { getFlights as getOpenSkyStates, getTracksByIcao24 } from "../api/opensky";

function Map3D() {
  const [flights, setFlights] = useState([]);
  const viewerRef = useRef(null);
  const [initialCameraSet, setInitialCameraSet] = useState(false);
  const [autoZoomDone, setAutoZoomDone] = useState(false);
  const lastClickRef = useRef(0);
  const [track, setTrack] = useState(null);

  // Fetch flights every 15 seconds
  useEffect(() => {
    async function fetchFlights() {
      try {
        const states = await getOpenSkyStates();
        if (Array.isArray(states)) {
          const flightData = states
            .map((state) => ({
              icao24: state[0],
              callsign: state[1]?.trim() || "Unknown",
              lon: state[5],
              lat: state[6],
              // Prefer geo_altitude (index 13), fallback to baro_altitude (index 7), then default
              alt: state[13] ?? state[7] ?? 3000,
              // true_track (index 10)
              heading: state[10] ?? 0,
            }))
            .filter((f) => Number.isFinite(f.lon) && Number.isFinite(f.lat));
          setFlights(flightData);
          // In requestRenderMode, explicitly request a render when data changes
          try {
            const scene = viewerRef.current?.cesiumElement?.scene;
            scene?.requestRender?.();
          } catch {}
        } else {
          setFlights([]);
        }
      } catch (err) {
        console.error("Error fetching flights:", err);
      }
    }

    fetchFlights();
    const interval = setInterval(fetchFlights, 60000);
    return () => clearInterval(interval);
  }, []);

  // When new flights arrive for the first time, zoom to them
  useEffect(() => {
    if (
      flights.length > 0 &&
      viewerRef.current?.cesiumElement &&
      !autoZoomDone
    ) {
      try {
        viewerRef.current.cesiumElement.zoomTo(
          viewerRef.current.cesiumElement.entities,
          new HeadingPitchRoll(0, -Math.PI / 4, 0)
        );
        setAutoZoomDone(true);
      } catch (err) {
        console.warn("ZoomTo flights failed", err);
      }
    }
  }, [flights, autoZoomDone]);

  // Fly camera to default position once viewer and camera are ready
  useEffect(() => {
    if (
      viewerRef.current &&
      viewerRef.current.cesiumElement &&
      !initialCameraSet
    ) {
      // Delay flyTo to ensure Cesium fully initialized
      setTimeout(() => {
        viewerRef.current.cesiumElement.camera.flyTo({
          destination: Cartesian3.fromDegrees(-98.5, 39.8, 5000000),
          duration: 3,
        });
        setInitialCameraSet(true);
      }, 100);
    }
  }, [initialCameraSet]);

  return (
    <Viewer
      ref={viewerRef}
      full
      baseLayerPicker={false}
      timeline={false}
      animation={false}
      requestRenderMode={true}
      targetFrameRate={30}
      style={{ height: "100%", width: "100%" }}
      // Remove automatic camera reset on user interaction:
      onCameraChanged={() => {
        // no camera reset code here
      }}
    >
      {flights.map((flight, idx) => {
        const position = Cartesian3.fromDegrees(
          flight.lon,
          flight.lat,
          flight.alt
        );
        const orientation = Transforms.headingPitchRollQuaternion(
          position,
          new HeadingPitchRoll(
            (flight.heading * Math.PI) / 180,
            0,
            0
          )
        );

        return (
          <Entity
            key={idx}
            name={flight.callsign}
            position={position}
            orientation={orientation}
            model={{
              uri: "/models/scene.gltf",
              minimumPixelSize: 64,
              maximumScale: 200,
            }}
            // Add a red point as a fallback/visibility aid
            point={{
              pixelSize: 12,
              color: Color.RED,
              outlineColor: Color.WHITE,
              outlineWidth: 1,
            }}
            description={`<p><strong>Callsign:</strong> ${flight.callsign}</p>
              <p><strong>Altitude:</strong> ${Math.round(flight.alt)} m</p>
              <p><strong>Heading:</strong> ${Math.round(flight.heading)}°</p>`}
            onClick={async () => {
              const now = Date.now();
              if (now - lastClickRef.current < 400) {
                if (flight.icao24) {
                  const icao = String(flight.icao24).toLowerCase();
                  window.location.hash = `#/flight?icao24=${encodeURIComponent(icao)}`;
                }
              }
              // fetch and display track on single click
              if (flight.icao24) {
                const icao = String(flight.icao24).toLowerCase();
                // Fetch a longer time window so we capture the full route (up to 12 h)
                const t = await getTracksByIcao24(icao, 12 * 3600);
                if (t && Array.isArray(t.path) && t.path.length > 1) {
                  const positions = [];
                  for (const p of t.path) {
                    // Each entry in path: [time, lon, lat, baro_altitude]
                    positions.push(p[1], p[2], p[3] || 1000); // lon, lat, altitude (fallback 1 km)
                  }
                  setTrack({ icao, positions, start: t.path[0], end: t.path[t.path.length - 1] });
                  try {
                    viewerRef.current?.cesiumElement?.scene?.requestRender?.();
                  } catch {}
                }
              }
              lastClickRef.current = now;
            }}
          />
        );
      })}
      {track?.positions && (
        <>
          <Entity
            polyline={{
              positions: Cartesian3.fromDegreesArrayHeights(track.positions),
              width: 3,
              // Use a dashed material for better visibility
              material: new PolylineDashMaterialProperty({
                color: Color.CYAN,
                dashLength: 16,
              }),
            }}
          />
          {track.start && (
            <Entity
              position={Cartesian3.fromDegrees(track.start[1], track.start[2], track.start[3] || 0)}
              point={{ pixelSize: 10, color: Color.LIME, outlineColor: Color.WHITE, outlineWidth: 1 }}
            />
          )}
          {track.end && (
            <Entity
              position={Cartesian3.fromDegrees(track.end[1], track.end[2], track.end[3] || 0)}
              point={{ pixelSize: 10, color: Color.ORANGE, outlineColor: Color.WHITE, outlineWidth: 1 }}
            />
          )}
        </>
      )}
    </Viewer>
  );
}

export default Map3D;
