'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api, Report } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import {
  Send,
  MapPin,
  FileText,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  HeartHandshake,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

// ── 3-Level Location Data: Zilla → City/Upazila → Road/Area ──
const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  'Dhaka': {
    'Dhanmondi': ['Road 2', 'Road 7', 'Road 27', 'Satmasjid Road', 'Mirpur Road'],
    'Gulshan': ['Gulshan Avenue 1', 'Gulshan Avenue 2', 'Gulshan Circle 1', 'Gulshan Circle 2', 'Kamal Ataturk Avenue'],
    'Mirpur': ['Mirpur-1', 'Mirpur-2', 'Mirpur-10', 'Mirpur-12', 'Pallabi'],
    'Uttara': ['Sector 1', 'Sector 3', 'Sector 6', 'Sector 10', 'Sector 13'],
    'Banani': ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'],
    'Mohammadpur': ['Asad Gate', 'Bosila', 'Tajmahal Road', 'Geneva Camp Road', 'Katashur'],
    'Motijheel': ['Dilkusha', 'Shapla Chattar', 'Purana Paltan', 'Naya Paltan', 'Kakrail'],
    'Wari': ['Tipu Sultan Road', 'Islampur Road', 'Farashganj', 'Narinda', 'Rahmatganj'],
    'Khilgaon': ['Khilgaon Chowrasta', 'Taltala', 'Shahjadpur', 'Rayer Bazar', 'Goran'],
    'Savar': ['Ashulia', 'Hemayetpur', 'Savar Bazar', 'Nayarhat', 'Dhamsona'],
  },
  'Chittagong': {
    'Agrabad': ['Agrabad C/A', 'Agrabad Access Road', 'Sheikh Mujib Road', 'Halishahar Road', 'Port Connecting Road'],
    'GEC Circle': ['GEC More', 'Nasirabad', 'Jamal Khan', 'Anderkilla', 'Chawkbazar'],
    'Patenga': ['Patenga Beach Road', 'Shah Amanat Airport Road', 'Halishahar', 'Bandar', 'Kattali'],
    'Hathazari': ['Hathazari Bazar', 'Jangal Road', 'Fatikchari Road', 'Nazirhat Road', 'Mawlana Bazar'],
    'Pahartali': ['Pahartali Bazar', 'Muradpur', 'Oxygen More', 'Bahaddarhat', 'Chandgaon'],
    'Kotwali': ['Boro Bazar', 'Chawkbazar', 'Firinghee Bazar', 'Patharghata', 'Reazuddin Bazar'],
  },
  'Sylhet': {
    'Zindabazar': ['Zindabazar Road', 'Bondor Road', 'Jail Road', 'Chowhatta', 'Ambarkhana'],
    'Subhanighat': ['Subhanighat Road', 'Keane Bridge', 'Surma River Bank', 'Madrasa Ghat', 'Jail Road East'],
    'Moglabazar': ['Moglabazar Road', 'Taltala', 'Kumarpara', 'Mirabazar', 'Majortila'],
    'Shahporan': ['Airport Road', 'Tilagor', 'Shahporan Gate', 'Khadim Nagar', 'Tultikor'],
    'Akhalia': ['Shahjalal University Road', 'Akhalia Bazar', 'Modina Market', 'Surma Road', 'Pirojpur'],
  },
  'Rajshahi': {
    'Boalia': ['Saheb Bazar Road', 'Greater Road', 'Railway Station Road', 'Court Area', 'Alupatti'],
    'Motihar': ['Rajshahi University Road', 'Binodpur', 'Talaimari', 'Seroil', 'Kazla'],
    'Shah Makhdum': ['Padma Garden', 'Padma Residential Area', 'Barindra Road', 'Srirampur Road', 'Haripur'],
    'Rajpara': ['Rajpara Bazar', 'Laxmipur', 'Sapura', 'Shiroil', 'Natore Road'],
  },
  'Khulna': {
    'Daulatpur': ['Boyra', 'Khalishpur', 'Khan A Sabur Road', 'Rupsha Stand', 'Daulatpur Bazar'],
    'Sonadanga': ['Sonadanga Bus Stand', 'Hadis Park', 'Sonadanga R/A', 'KDA Avenue', 'Nirala R/A'],
    'Kotwali': ['Boro Bazar', 'Lower Jessore Road', 'Sher-e-Bangla Road', 'Khulna Press Club', 'Jessore Road'],
    'Khalispur': ['Gallamari', 'Rupsha Bridge', 'Rupsha Ferry Ghat', 'Khalispur Road', 'Shiromoni'],
  },
  'Barisal': {
    'Kotwali': ['Sadar Road', 'Band Road', 'Nathullabad', 'Rupatali', 'Chaurhali'],
    'Barisal Sadar': ['Barisal Launch Ghat', 'Circuit House Road', 'Amtala', 'Notun Bazar', 'Barisal Hospital Road'],
    'Airport': ['Airport Road', 'Natuabazar', 'Katpotti', 'Lalmohon Road', 'Nalchity Road'],
  },
  'Comilla': {
    'Kotbari': ['Victoria College Road', 'Kotbari Road', 'Comilla Cantonment', 'Moynamoti Road', 'Bangladesh Academy Road'],
    'Comilla Sadar': ['Kandirpar', 'Rajganj Bazar', 'Laksam Road', 'Shasan Road', 'Dharmasagar East Bank'],
    'Burichang': ['Burichang Bazar', 'Mainamati Road', 'Burichang Upazila', 'Shashidal', 'Mokam'],
  },
  'Mymensingh': {
    'Mymensingh Sadar': ['Ganginar Par', 'Maskanda', 'Shambhuganj', 'Chorpara', 'Valuka Road'],
    'Trishal': ['Trishal Bazar', 'Dhala Road', 'Kazi Nazrul Islam Road', 'Trishal College Road', 'Darirampur'],
    'Muktagacha': ['Muktagacha Bazar', 'Char Muktagacha', 'Bhabki', 'Kashimpur', 'Tarakanda Road'],
  },
  'Rangpur': {
    'Rangpur Sadar': ['Shapla Chattar', 'Jaldhaka Road', 'Station Road', 'Jail Road', 'Modern More'],
    'Mithapukur': ['Mithapukur Bazar', 'Payrabond', 'Nawdabas', 'Bishna', 'Lashmitari'],
    'Badarganj': ['Badarganj Bazar', 'Buraburi Road', 'Kaliganj Road', 'Katakhali', 'Chandipur'],
  },
};

// Shared dropdown CSS
const SELECT_CLASS =
  'w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-blue-500/70 hover:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-white transition-all appearance-none cursor-pointer pr-10 disabled:opacity-40 disabled:cursor-not-allowed';

function ChevronDown() {
  return (
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    </div>
  );
}

export default function CitizenSubmitPage() {
  const { isAdmin } = useAuth();

  // Form fields
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);

  // Cascading location state
  const [selectedZilla, setSelectedZilla] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRoad, setSelectedRoad] = useState('');
  const [exactLocation, setExactLocation] = useState('');
  const [gpsLocation, setGpsLocation] = useState(''); // filled only when GPS is used
  const [gpsLoading, setGpsLoading] = useState(false);

  // Derived data
  const zillaList = Object.keys(LOCATION_DATA);
  const cityList = selectedZilla ? Object.keys(LOCATION_DATA[selectedZilla] ?? {}) : [];
  const roadList =
    selectedZilla && selectedCity ? LOCATION_DATA[selectedZilla]?.[selectedCity] ?? [] : [];

  // Composed location string for the API
  const composedLocation = gpsLocation
    ? gpsLocation
    : [exactLocation, selectedRoad, selectedCity, selectedZilla].filter(Boolean).join(', ');

  const isLocationReady = !!composedLocation;

  // Handlers
  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedZilla(e.target.value);
    setSelectedCity('');
    setSelectedRoad('');
    setGpsLocation('');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
    setSelectedRoad('');
    setGpsLocation('');
  };

  const handleRoadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoad(e.target.value);
    setGpsLocation('');
  };

  const handleAutoDetectLocation = async () => {
    setGpsLoading(true);

    const enrichWithNominatim = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await res.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      } catch (e) {
        console.error('Nominatim error:', e);
      }
      return `GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    };

    const fallbackToIP = async () => {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await res.json();
        if (data && data.city) {
          return `${data.city}, ${data.region}, ${data.country} (IP Approx)`;
        }
      } catch (e) {
        console.error('IP fallback error:', e);
      }
      return null;
    };

    const onFallback = async () => {
      const ipLoc = await fallbackToIP();
      if (ipLoc) {
        setGpsLocation(ipLoc);
        setExactLocation('');
        setSelectedZilla('');
        setSelectedCity('');
        setSelectedRoad('');
      } else {
        alert('Could not auto-detect location. Please select manually.');
      }
      setGpsLoading(false);
    };

    if (!navigator.geolocation) {
      console.warn('Geolocation not supported by browser.');
      await onFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const address = await enrichWithNominatim(pos.coords.latitude, pos.coords.longitude);
        setGpsLocation(address);
        setExactLocation('');
        setSelectedZilla('');
        setSelectedCity('');
        setSelectedRoad('');
        setGpsLoading(false);
      },
      async (err) => {
        console.warn('GPS error:', err);
        await onFallback();
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const submitMutation = useMutation({
    mutationFn: () =>
      api.createReport({
        description,
        location: composedLocation,
        name: name || undefined,
        contact: contact || undefined,
        language: 'en',
      }),
    onSuccess: (data) => {
      setSubmittedReport(data);
      setToastMessage(null);
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: err.message || 'An error occurred while submitting. Please try again.' });
      setTimeout(() => setToastMessage(null), 6000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !isLocationReady) return;
    setToastMessage(null);
    submitMutation.mutate();
  };

  const handleReset = () => {
    setDescription('');
    setName('');
    setContact('');
    setSelectedZilla('');
    setSelectedCity('');
    setSelectedRoad('');
    setGpsLocation('');
    setSubmittedReport(null);
    setShowAdvice(false);
    setGpsLoading(false);
    submitMutation.reset();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none">
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">

          {/* ── Left Branding Column ── */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border border-blue-800/40 rounded-full text-blue-400 text-xs font-semibold self-start shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              <span>Live Emergency Dispatch Portal</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
              AI-Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-indigo-400">
                Crisis Dispatch
              </span>
            </h1>

            <p className="text-slate-400 text-sm md:text-[15px] leading-relaxed max-w-md">
              CrisisDesk AI integrates natural language understanding to immediately analyze, categorize, and deduplicate emergency reports from citizens—helping response teams prioritize life-saving actions.
            </p>

            <div className="flex flex-col gap-6 mt-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Real-Time Classification</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Instantly groups reports into fire, flood, utilities, or medical emergencies.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Automated Severity Triage</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Directs attention to critical threats first based on semantic description analysis.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Duplicate Incident Merging</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Correlates nearby reports to prevent dispatcher dashboard congestion.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Form Column ── */}
          <div className="lg:col-span-7 w-full">
            {submittedReport ? (
              /* ── Success Screen ── */
              <div className="bg-slate-900/40 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl flex flex-col gap-6">
                <div className="flex items-center gap-4 text-emerald-400 mb-2">
                  <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-900/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Incident Report Filed</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Categorized and queued for response teams.</p>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-900 flex flex-col gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge type="status" value={submittedReport.status} />
                    <StatusBadge type="urgency" value={submittedReport.urgency} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Generated Abstract</p>
                    <p className="text-sm font-medium text-slate-300 mt-1.5 italic leading-relaxed">
                      &ldquo;{submittedReport.summary || 'Summary processing pending.'}&rdquo;
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-900">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Category</p>
                      <p className="text-sm font-bold text-slate-200 capitalize mt-1">
                        {submittedReport.category ? submittedReport.category.replace('_', ' ') : 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Incident Location</p>
                      <p className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        {submittedReport.location}
                      </p>
                    </div>
                  </div>
                </div>

                {submittedReport.possibleDuplicate && (
                  <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-2xl text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <p className="leading-relaxed">
                      <strong>Duplicate Detected:</strong> A similar incident was already reported nearby. Coordinators will merge these files.
                    </p>
                  </div>
                )}

                {/* What should I do right now? */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvice(!showAdvice)}
                    className="w-full py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 focus:outline-none rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>{showAdvice ? 'Hide Safety Instructions' : 'What should I do right now? / এই মুহূর্তে আপনার করণীয় কী?'}</span>
                  </button>
                  {showAdvice && (
                    <div className="mt-3 p-5 bg-slate-950/50 border border-amber-500/20 rounded-2xl select-text">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 select-none">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        Immediate Action Guide
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                        {(submittedReport as any).citizenAdvice ||
                          'Stay calm. Keep away from immediate danger. If safe, administer first-aid and wait for emergency services to arrive.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold rounded-xl text-sm border border-slate-800 transition-all cursor-pointer text-center"
                  >
                    File Another Report
                  </button>
                </div>
              </div>
            ) : (
              /* ── Submission Form ── */
              <div className="bg-slate-900/30 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl">
                <div className="mb-8">
                  <h2 className="text-xl font-bold tracking-tight text-white">Emergency Citizen Portal</h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Provide precise location and incident details below. CrisisDesk AI parses and triages your report automatically.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                  {/* ── Cascading Location Section ── */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      Incident Location <span className="text-red-500 font-bold">*</span>
                    </label>

                    {/* Level 1: Zilla */}
                    <div className="relative">
                      <select
                        value={selectedZilla}
                        onChange={handleZillaChange}
                        className={SELECT_CLASS}
                      >
                        <option value="" disabled>— Select District (Zilla) —</option>
                        {zillaList.map((z) => (
                          <option key={z} value={z}>{z}</option>
                        ))}
                      </select>
                      <ChevronDown />
                    </div>

                    {/* Level 2: City / Upazila */}
                    <div className="relative">
                      <select
                        value={selectedCity}
                        onChange={handleCityChange}
                        disabled={!selectedZilla}
                        className={SELECT_CLASS}
                      >
                        <option value="" disabled>— Select City / Upazila —</option>
                        {cityList.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown />
                    </div>

                    {/* Level 3: Road / Area */}
                    <div className="relative">
                      <select
                        value={selectedRoad}
                        onChange={handleRoadChange}
                        disabled={!selectedCity}
                        className={SELECT_CLASS}
                      >
                        <option value="" disabled>— Select Road / Area —</option>
                        {roadList.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <ChevronDown />
                    </div>

                    {/* Level 4: Exact Location (Building, House, Road No.) */}
                    <div className="relative">
                      <input
                        type="text"
                        value={exactLocation}
                        onChange={(e) => {
                          setExactLocation(e.target.value);
                          setGpsLocation('');
                        }}
                        disabled={!selectedRoad}
                        placeholder="House/Building No., Road No., etc. (Optional)"
                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-blue-500/70 hover:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* GPS Auto-Detect Button */}
                    <button
                      type="button"
                      onClick={handleAutoDetectLocation}
                      disabled={gpsLoading}
                      className="w-full py-2.5 px-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 focus:outline-none rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none"
                    >
                      {gpsLoading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          <span>Detecting GPS location...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-3.5 h-3.5" />
                          <span>Auto-Detect my location (GPS)</span>
                        </>
                      )}
                    </button>

                    {/* Composed Location Preview */}
                    {composedLocation && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/5 border border-blue-500/15 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="text-xs text-blue-300 font-medium truncate">{composedLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      Description of Emergency <span className="text-red-500 font-bold">*</span>
                    </label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is happening? (You can write in English, Bangla, or mixed)"
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-blue-500/70 hover:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-600 transition-all resize-none"
                    />
                  </div>

                  {/* Optional: Name + Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-blue-500/70 hover:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-600 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        Contact Number <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="e.g. 017xxxxxxxx"
                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-blue-500/70 hover:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  {toastMessage && (
                    <div className={`p-4 border rounded-xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${toastMessage.type === 'error' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
                      <AlertTriangle className={`w-5 h-5 shrink-0 ${toastMessage.type === 'error' ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <span className="font-medium leading-relaxed">{toastMessage.text}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitMutation.isPending || !description || !isLocationReady || !contact}
                    className="w-full py-3.5 mt-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-950/10 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Send className="w-4 h-4" />
                    {submitMutation.isPending ? 'Submitting & Triaging...' : 'Submit Emergency Report'}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900/60 text-center text-[11px] text-slate-600 z-10 relative">
        <p>&copy; {new Date().getFullYear()} CrisisDesk AI. Citizen emergency reporting portal.</p>
      </footer>
    </div>
  );
}
