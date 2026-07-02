import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function AdminWebhooks() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/diagnostics');
      if (res.ok) {
        setData(await res.json());
      } else {
        setError("فشل في جلب البيانات");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigure = async () => {
    setIsConfiguring(true);
    try {
      const res = await fetch('/api/admin/webhooks/setup', { method: 'POST' });
      if (res.ok) {
        await fetchDiagnostics();
      } else {
        const errData = await res.json();
        setError(errData.error || "فشل إعداد Webhook");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsConfiguring(false);
    }
  };

  const [testResults, setTestResults] = useState<any[]>([]);

  const handleTest = async () => {
    setIsConfiguring(true);
    setTestResults([]);
    try {
      const res = await fetch('/api/admin/webhooks/test', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTestResults(data.results);
      } else {
        const errData = await res.json();
        setError(errData.error || "فشل اختبار Webhooks");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsConfiguring(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">تشخيص Webex Webhooks</h1>
          <a href="/" className="text-blue-600 hover:underline">العودة للرئيسية</a>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <DiagnosticItem label="OAuth Connected" status={data?.oauthConnected} />
          <DiagnosticItem label="Access Token Valid" status={data?.accessTokenValid} />
          <DiagnosticItem label="Refresh Token Valid" status={data?.refreshTokenValid} />
          <DiagnosticItem label="Webhook Registered" status={data?.webhookRegistered} details={data?.webhookDetails} />
          
          <div className="pt-4 border-t border-gray-100">
            <DiagnosticValue label="Last Webhook Received" value={data?.lastWebhookReceived ? new Date(data.lastWebhookReceived).toLocaleString('ar-EG') : 'لم يتم الاستلام'} />
            <DiagnosticValue label="Last Transcript Imported" value={data?.lastTranscriptImported ? new Date(data.lastTranscriptImported).toLocaleString('ar-EG') : 'لم يتم الاستيراد'} />
            <DiagnosticValue label="Last Summary Generated" value={data?.lastSummaryGenerated ? new Date(data.lastSummaryGenerated).toLocaleString('ar-EG') : 'لم يتم التوليد'} />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleConfigure}
            disabled={isConfiguring || !data?.oauthConnected}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {isConfiguring ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            إعادة تكوين Webhooks
          </button>
          
          <button 
            onClick={handleTest}
            disabled={isConfiguring || !data?.oauthConnected}
            className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-700 disabled:opacity-50"
          >
            {isConfiguring ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            اختبار الموارد
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">نتائج الاختبار</h2>
            <div className="space-y-4">
              {testResults.map((r, i) => (
                <div key={i} className="p-4 rounded border bg-gray-50 text-left" dir="ltr">
                  <div className="font-bold text-lg">{r.resource} - Status: {r.status}</div>
                  <pre className="text-xs text-gray-500 overflow-x-auto mt-2">
                    {r.body}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DiagnosticItem({ label, status, details }: { label: string, status?: boolean, details?: any }) {
  return (
    <div className="flex flex-col py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        {status ? <CheckCircle className="text-green-500 w-5 h-5" /> : <XCircle className="text-red-500 w-5 h-5" />}
        <span className="font-medium text-gray-700" dir="ltr">{label}</span>
      </div>
      {details && (
        <pre className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded w-full overflow-x-auto text-left" dir="ltr">
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}

function DiagnosticValue({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-600" dir="ltr">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
