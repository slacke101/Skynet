import React, { useEffect, useMemo, useState } from 'react';
import { getFlightInfoByIcao24 } from '../api/opensky';

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.hash.split('?')[1] || ''), []);
}

export default function FlightDetails() {
  const q = useQuery();
  const icao24 = q.get('icao24') || '';
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchInfo() {
      if (!icao24) return;
      setLoading(true);
      setError(null);
      try {
        const json = await getFlightInfoByIcao24(icao24);
        if (!json) throw new Error('No data');
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInfo();
    return () => { cancelled = true; };
  }, [icao24]);

  const latest = data?.latest;

  return (
    <section className="page-section">
      <div className="section-card">
        <h1>Flight Details</h1>
        {!icao24 && <p>No aircraft selected.</p>}
        {icao24 && <p>ICAO24: <strong>{icao24}</strong></p>}
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: 'salmon' }}>{error}</p>}
        {latest && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <h3>Route</h3>
              <p>
                {latest.estDepartureAirport || 'Unknown'} → {latest.estArrivalAirport || 'Unknown'}
              </p>
              <p>Departure: {latest.firstSeen ? new Date(latest.firstSeen * 1000).toLocaleString() : '—'}</p>
              <p>Arrival (est): {latest.lastSeen ? new Date(latest.lastSeen * 1000).toLocaleString() : '—'}</p>
            </div>
            <div>
              <h3>Identifiers</h3>
              <p>Callsign: {latest.callsign || '—'}</p>
              <p>ICAO24: {latest.icao24 || icao24}</p>
            </div>
          </div>
        )}

        <a href="#/" className="back-link" style={{ marginTop: '1rem', display: 'inline-block' }}>⬅ Back</a>
      </div>
    </section>
  );
}


