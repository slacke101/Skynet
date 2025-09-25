import React, { useState, useEffect } from 'react';
import { getFlights as getOpenSkyStates, getRecentFlightByIcao24 } from '../api/opensky';
import { parseCallsign, getAirlineName } from '../utils/callsign';

function CurrentFlights() {
  const [flights, setFlights] = useState([]);
  const [enriched, setEnriched] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const states = await getOpenSkyStates();

        const flightsParsed = states
          ?.filter(flight => flight[1]?.trim()) // filter flights with callsigns
          .map((flight, index) => ({
            id: index,
            callsign: flight[1].trim(),
            country: flight[2],
            longitude: flight[5],
            latitude: flight[6],
            altitude: flight[7],
            icao24: flight[0],
            velocity: flight[9],
            heading: flight[10],
            geoAltitude: flight[13],
            squawk: flight[14],
          })) || [];

        // Derive airline + flight number
        const withDerived = flightsParsed.map((f) => {
          const { airlineIcao, flightNumber, cleanedCallsign } = parseCallsign(f.callsign);
          const airline = getAirlineName(airlineIcao);
          return { ...f, cleanedCallsign, airlineIcao, airline, flightNumber };
        });

        setFlights(withDerived);
        setError(null);
      } catch (err) {
        setError(err.message);
        setFlights([]);
      }
    };

    fetchFlights();

    // Optionally, refresh every 60 seconds:
    const interval = setInterval(fetchFlights, 60000);
    return () => clearInterval(interval);
  }, []);

  // Opportunistically enrich a few visible flights with recent flight info (origin/dest)
  useEffect(() => {
    let isCancelled = false;
    async function enrich() {
      const sample = flights.slice(0, 10);
      for (const f of sample) {
        if (!f?.icao24 || enriched[f.icao24]) continue;
        const info = await getRecentFlightByIcao24(f.icao24);
        if (isCancelled) return;
        if (info?.latest) {
          setEnriched((prev) => ({ ...prev, [f.icao24]: info.latest }));
        } else {
          setEnriched((prev) => ({ ...prev, [f.icao24]: null }));
        }
      }
    }
    if (flights.length) enrich();
    return () => { isCancelled = true; };
  }, [flights]);

  return (
    <section className="page-section">
      <div className="section-card">
        <h1>Current Flights</h1>
        <p>View live updates on all active flights from OpenSky Network.</p>

        {error && <p style={{color: 'red'}}>{error}</p>}

        {flights.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, maxHeight: '400px', overflowY: 'auto' }}>
            {flights.map((flight) => {
              const extra = enriched[flight.icao24];
              const dep = extra?.estDepartureAirport || extra?.estDepartureAirportHorizDistance ? extra?.estDepartureAirport : null;
              const arr = extra?.estArrivalAirport || extra?.estArrivalAirportHorizDistance ? extra?.estArrivalAirport : null;
              return (
              <li key={flight.id} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '0.75rem' }}>
                <div style={{ fontWeight: 600 }}>
                  {flight.airline ? `${flight.airline} ` : ''}{flight.flightNumber ? flight.flightNumber : flight.cleanedCallsign}
                </div>
                <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                  {dep && arr ? `Route: ${dep} → ${arr} | ` : ''}
                  Origin country: {flight.country} | Alt: {Math.round(flight.geoAltitude ?? flight.altitude ?? 0)} m | Pos: {flight.latitude?.toFixed(2)}, {flight.longitude?.toFixed(2)} | Speed: {Math.round((flight.velocity || 0) * 1.94384)} kt | Heading: {Math.round(flight.heading || 0)}°
                </div>
              </li>
            );})}
          </ul>
        ) : !error ? (
          <p>Loading flights...</p>
        ) : null}

        <a href="/" className="back-link">Back to Home</a>
      </div>
    </section>
  );
}

export default CurrentFlights;
