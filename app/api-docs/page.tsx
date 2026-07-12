'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Terminal, Copy, Check, Shield } from 'lucide-react';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  headers?: { key: string; val: string; desc: string }[];
  queryParams?: { name: string; type: string; required: boolean; desc: string }[];
  requestBody?: string;
  responseBody: string;
  curl: string;
}

const endpoints: EndpointDoc[] = [
  {
    method: 'POST',
    path: '/api/reports',
    description: 'Submit a new emergency incident report. Automatically runs Gemini AI triage and checks for duplicates.',
    queryParams: [],
    requestBody: `{
  "description": "Fire broke out in a warehouse near Sector 7. Need help!",
  "location": "Sector 7, Uttara",
  "contact": "+8801700000000",
  "name": "Rahim Uddin",
  "language": "en"
}`,
    responseBody: `{
  "success": true,
  "data": {
    "_id": "64b0f924c7a52e74287654a1",
    "description": "Fire broke out in a warehouse near Sector 7. Need help!",
    "location": "Sector 7, Uttara",
    "contact": "+8801700000000",
    "name": "Rahim Uddin",
    "language": "en",
    "category": "fire",
    "urgency": "critical",
    "summary": "A fire has broken out in a warehouse in Sector 7, Uttara.",
    "suggestedAction": "Dispatch fire fighters and emergency services.",
    "confidence": 0.98,
    "possibleDuplicate": false,
    "matchedReportId": null,
    "status": "pending",
    "createdAt": "2026-07-13T03:00:00.000Z",
    "updatedAt": "2026-07-13T03:00:00.000Z"
  }
}`,
    curl: `curl -X POST http://localhost:3000/api/reports \\
  -H "Content-Type: application/json" \\
  -d '{"description": "Fire broke out in a warehouse near Sector 7.", "location": "Sector 7, Uttara"}'`
  },
  {
    method: 'GET',
    path: '/api/reports',
    description: 'Retrieve a paginated list of reports matching filters.',
    queryParams: [
      { name: 'category', type: 'string', required: false, desc: 'Filter by category (medical, fire, crime, etc.)' },
      { name: 'urgency', type: 'string', required: false, desc: 'Filter by urgency level (low, medium, high, critical)' },
      { name: 'status', type: 'string', required: false, desc: 'Filter by status (pending, resolved, etc.)' },
      { name: 'search', type: 'string', required: false, desc: 'Search string matching location or description' },
      { name: 'from', type: 'string (ISO Date)', required: false, desc: 'Filter reports created after this date' },
      { name: 'to', type: 'string (ISO Date)', required: false, desc: 'Filter reports created before this date' },
      { name: 'page', type: 'number', required: false, desc: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', required: false, desc: 'Items per page (default: 20)' }
    ],
    responseBody: `{
  "success": true,
  "data": {
    "reports": [
      {
        "_id": "64b0f924c7a52e74287654a1",
        "description": "Warehouse fire reported",
        "location": "Sector 7, Uttara",
        "category": "fire",
        "urgency": "critical",
        "status": "pending"
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 20
  }
}`,
    curl: `curl -X GET "http://localhost:3000/api/reports?status=pending&urgency=critical"`
  },
  {
    method: 'GET',
    path: '/api/reports/stats/summary',
    description: 'Get total stats, critical counts, pending queue count, and breakdown distributions.',
    queryParams: [],
    responseBody: `{
  "success": true,
  "data": {
    "totalReports": 45,
    "criticalReports": 12,
    "pendingReports": 8,
    "resolvedReports": 25,
    "categoryBreakdown": {
      "medical": 15,
      "fire": 10,
      "accident": 5,
      "crime": 8,
      "flood": 2,
      "utility": 1,
      "public_service": 2,
      "infrastructure": 1,
      "other": 1
    },
    "urgencyBreakdown": {
      "low": 5,
      "medium": 12,
      "high": 16,
      "critical": 12
    }
  }
}`,
    curl: `curl -X GET http://localhost:3000/api/reports/stats/summary`
  },
  {
    method: 'GET',
    path: '/api/reports/{id}',
    description: 'Retrieve detailed information of a single incident report.',
    queryParams: [
      { name: 'id', type: 'string', required: true, desc: 'The unique MongoDB BSON ObjectId of the report' }
    ],
    responseBody: `{
  "success": true,
  "data": {
    "_id": "64b0f924c7a52e74287654a1",
    "description": "Warehouse fire near sector 7",
    "location": "Sector 7, Uttara",
    "category": "fire",
    "urgency": "critical",
    "status": "pending"
  }
}`,
    curl: `curl -X GET http://localhost:3000/api/reports/64b0f924c7a52e74287654a1`
  },
  {
    method: 'PATCH',
    path: '/api/reports/{id}/status',
    description: 'Update the triage status of an incident report. Requires Admin Bearer token.',
    headers: [
      { key: 'Authorization', val: 'Bearer <firebase_id_token>', desc: 'Admin Bearer Authentication token' }
    ],
    requestBody: `{
  "status": "assigned"
}`,
    responseBody: `{
  "success": true,
  "data": {
    "_id": "64b0f924c7a52e74287654a1",
    "status": "assigned"
  }
}`,
    curl: `curl -X PATCH http://localhost:3000/api/reports/64b0f924c7a52e74287654a1/status \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <admin_token>" \\
  -d '{"status": "assigned"}'`
  },
  {
    method: 'DELETE',
    path: '/api/reports/{id}',
    description: 'Permanently delete an incident report from the database. Requires Admin Bearer token.',
    headers: [
      { key: 'Authorization', val: 'Bearer <firebase_id_token>', desc: 'Admin Bearer Authentication token' }
    ],
    responseBody: `{
  "success": true,
  "data": {
    "deleted": true
  }
}`,
    curl: `curl -X DELETE http://localhost:3000/api/reports/64b0f924c7a52e74287654a1 \\
  -H "Authorization: Bearer <admin_token>"`
  }
];

export default function ApiDocsPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const active = endpoints[selectedIdx];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'POST': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'PATCH': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'DELETE': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-200 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="mb-12 border-b border-slate-800/60 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold tracking-wider uppercase mb-3">
              <Shield className="w-4 h-4" />
              <span>CrisisDesk AI Suite</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">OpenAPI Reference Documentation</h1>
            <p className="text-slate-400 text-sm mt-2">Comprehensive API endpoints schema, verification payloads, and authentication rules.</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl text-xs font-bold text-slate-300 transition-all shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portal</span>
          </Link>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 h-fit flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Endpoint Listing</h3>
            {endpoints.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 border ${
                  selectedIdx === idx
                    ? 'bg-blue-600/10 border-blue-500/30 text-white'
                    : 'bg-transparent border-transparent hover:bg-slate-800/30 text-slate-400 hover:text-slate-300'
                }`}
              >
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${getMethodColor(ep.method)}`}>
                  {ep.method}
                </span>
                <span className="text-xs font-mono font-medium truncate">{ep.path}</span>
              </button>
            ))}
          </div>

          {/* Details Content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 md:p-8">
              {/* Endpoint Headline */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-lg ${getMethodColor(active.method)}`}>
                  {active.method}
                </span>
                <span className="text-lg font-mono font-bold text-white">{active.path}</span>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">{active.description}</p>

              {/* Headers Section */}
              {active.headers && active.headers.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Required HTTP Headers</h4>
                  <div className="border border-slate-800/60 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800/30 border-b border-slate-800/60 text-slate-400 font-bold">
                          <th className="p-3">Header Key</th>
                          <th className="p-3">Example Value</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.headers.map((h, i) => (
                          <tr key={i} className="border-b border-slate-800/30 last:border-0 hover:bg-slate-800/10">
                            <td className="p-3 font-mono font-bold text-blue-400">{h.key}</td>
                            <td className="p-3 font-mono text-slate-400">{h.val}</td>
                            <td className="p-3 text-slate-300">{h.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Query Params Section */}
              {active.queryParams && active.queryParams.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Query Parameters</h4>
                  <div className="border border-slate-800/60 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800/30 border-b border-slate-800/60 text-slate-400 font-bold">
                          <th className="p-3">Parameter</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Required</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.queryParams.map((qp, i) => (
                          <tr key={i} className="border-b border-slate-800/30 last:border-0 hover:bg-slate-800/10">
                            <td className="p-3 font-mono font-bold text-blue-400">{qp.name}</td>
                            <td className="p-3 font-mono text-slate-400">{qp.type}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                qp.required ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {qp.required ? 'Required' : 'Optional'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300">{qp.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Curl Command */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    Curl Verification Snippet
                  </h4>
                  <button
                    onClick={() => handleCopy(active.curl)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-all bg-slate-800/50 hover:bg-slate-850 px-2 py-1 rounded-lg border border-slate-700/40 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {active.curl}
                </pre>
              </div>

              {/* Request/Response Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {active.requestBody && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">JSON Request Payload</h4>
                    <pre className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-blue-300 overflow-x-auto">
                      {active.requestBody}
                    </pre>
                  </div>
                )}
                <div className={active.requestBody ? 'md:col-span-1' : 'md:col-span-2'}>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">JSON Response Schema</h4>
                  <pre className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto">
                    {active.responseBody}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
