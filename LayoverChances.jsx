import React, { useState } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { AIRPORT_OPTIONS } from '../data/airports';
import './LayoverChances.css';

function LayoverChances() {
  const [flightDetails, setFlightDetails] = useState({ departure: '', arrival: '', layoverTime: '', seatRow: '', arrTerminal: '', depTerminal: '', sameTerminalFlag: 'yes' });
  const [prediction, setPrediction] = useState('');
  const [prob, setProb] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasRealTermList, setHasRealTermList] = useState(true);

  const loadAirportOptions = async (inputValue) => {
    if (!inputValue) return [];
    const API_BASE = import.meta.env.VITE_API_BASE || '';
    const res = await fetch(`${API_BASE}/api/airports?q=${encodeURIComponent(inputValue)}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.map(a => ({ value: a.iata, label: `${a.iata} - ${a.name}` }));
  };

  const loadTerminalOptions = async (inputValue, airportIata) => {
    if (!airportIata) return [];
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(`${API_BASE}/api/terminals?airport=${airportIata}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (Array.isArray(json) && json.length) {
        setHasRealTermList(true);
        return json.map(t => ({ value: t, label: t }));
      }
      setHasRealTermList(false);
      return [];
    } catch {
      setHasRealTermList(false);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { departure, arrival, layoverTime, seatRow } = flightDetails;
    const timeInMinutes = parseInt(layoverTime) || 0;
    const rowNum = parseInt(seatRow) || 0;
    if (!departure || !arrival || !timeInMinutes || timeInMinutes < 10 || rowNum < 1) {
      setPrediction('Please fill all fields (layover ≥ 10 min, seat row 1-60).');
      setProb(null);
      return;
    }

    setLoading(true);
    setPrediction('');
    setProb(null);
    try {
      // fetch walking minutes
      let walkingMinutes = 0;
      if (flightDetails.arrTerminal && flightDetails.depTerminal) {
        const API_BASE = import.meta.env.VITE_API_BASE || '';
        const resWalk = await fetch(`${API_BASE}/api/airport-walk?airport=${flightDetails.departure}&from=${flightDetails.arrTerminal}&to=${flightDetails.depTerminal}`);
        if (resWalk.ok) {
          const jw = await resWalk.json();
          walkingMinutes = jw.minutes || 0;
        }
      }

      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const payload = {
        connection_minutes: timeInMinutes,
        seat_row: rowNum,
        walking_minutes: walkingMinutes,
        mct_minutes: 45,
        same_terminal: hasRealTermList ? (flightDetails.arrTerminal && flightDetails.depTerminal && flightDetails.arrTerminal===flightDetails.depTerminal ? 1:0) : (flightDetails.sameTerminalFlag==='yes'?1:0),
        dep_otp_airline: 0.8,
        arr_otp_airline: 0.8,
        time_of_day: 14,
        dow: 2,
      };
      const res = await fetch(`${API_BASE.replace(/:3001$/, ':8000') || ''}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setProb(data.probability_make_layover);
        setPrediction(''); // no label
      } else {
        setPrediction('Prediction service unavailable.');
      }
    } catch (err) {
      setPrediction('Prediction service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section layover-bg">
      <div className="section-card">
        <h1>Layover Chances</h1>
        <p>Calculate your layover success with real-time predictions.</p>
        <form onSubmit={handleSubmit} className="luggage-form">
          <AsyncSelect
            cacheOptions
            loadOptions={loadAirportOptions}
            defaultOptions
            value={flightDetails.departure ? { value: flightDetails.departure, label: flightDetails.departure } : null}
            onChange={(opt)=> setFlightDetails({ ...flightDetails, departure: opt?.value || '', arrTerminal:'', depTerminal:''})}
            placeholder="Departure Airport"
          />
          <AsyncSelect
            cacheOptions
            loadOptions={loadAirportOptions}
            defaultOptions
            value={flightDetails.arrival ? { value: flightDetails.arrival, label: flightDetails.arrival } : null}
            onChange={(opt)=> setFlightDetails({ ...flightDetails, arrival: opt?.value || ''})}
            placeholder="Arrival Airport"
          />
          <input
            type="number"
            value={flightDetails.seatRow}
            onChange={(e)=> setFlightDetails({ ...flightDetails, seatRow: e.target.value })}
            placeholder="Seat Row (1-60)"
            min="1" max="60"
          />
          {hasRealTermList ? (
            <>
              <AsyncSelect
                key={`arr-${flightDetails.departure}`}
                cacheOptions
                loadOptions={(inp)=>loadTerminalOptions(inp, flightDetails.departure)}
                defaultOptions
                value={flightDetails.arrTerminal? {value:flightDetails.arrTerminal,label:flightDetails.arrTerminal}:null}
                onChange={(opt)=> setFlightDetails({...flightDetails, arrTerminal: opt?.value||''})}
                placeholder="Arrival Terminal"
                isDisabled={!flightDetails.departure}
              />
              <AsyncSelect
                key={`dep-${flightDetails.departure}`}
                cacheOptions
                loadOptions={(inp)=>loadTerminalOptions(inp, flightDetails.departure)}
                defaultOptions
                value={flightDetails.depTerminal? {value:flightDetails.depTerminal,label:flightDetails.depTerminal}:null}
                onChange={(opt)=> setFlightDetails({...flightDetails, depTerminal: opt?.value||''})}
                placeholder="Departure Terminal"
                isDisabled={!flightDetails.departure}
              />
            </>
          ) : (
            <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
              <span style={{fontSize:'0.9rem'}}>Same terminal?</span>
              <label style={{display:'flex',alignItems:'center',gap:'0.25rem'}}>
                <input type="radio" value="yes" checked={flightDetails.sameTerminalFlag==='yes'} onChange={()=>setFlightDetails({...flightDetails,sameTerminalFlag:'yes'})} /> Yes
              </label>
              <label style={{display:'flex',alignItems:'center',gap:'0.25rem'}}>
                <input type="radio" value="no" checked={flightDetails.sameTerminalFlag==='no'} onChange={()=>setFlightDetails({...flightDetails,sameTerminalFlag:'no'})} /> No / Not sure
              </label>
            </div>
          )}
          <input
            type="number"
            value={flightDetails.layoverTime}
            onChange={(e) => setFlightDetails({ ...flightDetails, layoverTime: e.target.value })}
            placeholder="Layover Time (minutes)"
          />
          <button type="submit" className="page-btn">Predict Layover</button>
        </form>
        {loading && <p style={{ marginTop: '1rem' }}>Calculating...</p>}
        {prob !== null && (
          <p style={{ marginTop: '0.5rem' }}>Probability of making layover: {(prob * 100).toFixed(0)}%</p>
        )}
        {prediction && <p style={{ marginTop: '0.25rem', opacity: 0.9 }}>{prediction}</p>}
        <a href="#" onClick={() => window.location.href = '/'} className="back-link">Back to Home</a>
      </div>
    </section>
  );
}

export default LayoverChances;