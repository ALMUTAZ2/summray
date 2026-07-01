/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Loader2, Send, Download, UploadCloud, X, Mic, FileDown, Copy, Check, Video } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isWebexConnected, setIsWebexConnected] = useState(false);
  const [isCheckingWebex, setIsCheckingWebex] = useState(true);
  const [meetings, setMeetings] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const pdfReportRef = useRef<HTMLDivElement>(null);

  const fetchMeetings = () => {
    fetch('/api/meetings')
      .then(res => res.json())
      .then(data => setMeetings(data))
      .catch(err => console.error("Failed to fetch meetings:", err));
  };

  useEffect(() => {
    // Check if Webex is connected
    fetch('/api/auth/webex/status')
      .then(res => res.json())
      .then(data => {
        setIsWebexConnected(data.isConnected);
        setIsCheckingWebex(false);
        if (data.isConnected) {
          fetchMeetings();
          // Poll for new meetings every 30 seconds
          const interval = setInterval(fetchMeetings, 30000);
          return () => clearInterval(interval);
        }
      })
      .catch(err => {
        console.error("Failed to check Webex status:", err);
        setIsCheckingWebex(false);
      });
  }, []);

  const handleConnectWebex = () => {
    window.location.href = '/api/auth/webex/login';
  };

  const handleDisconnectWebex = async () => {
    try {
      await fetch('/api/auth/webex/disconnect', { method: 'POST' });
      setIsWebexConnected(false);
    } catch (err) {
      console.error("Failed to disconnect Webex:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      setTranscript(''); // Clear transcript if file is selected
    }
  };

  const clearAudioFile = () => {
    setAudioFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateReport = async () => {
    if (!transcript.trim() && !audioFile) {
      setError('الرجاء إدخال نص الاجتماع أو رفع ملف صوتي أولاً.');
      return;
    }

    setIsLoading(true);
    setError('');
    setReport('');
    setProgress(0);
    setProgressMessage('تهيئة الطلب...');

    try {
      const formData = new FormData();
      if (audioFile) {
        formData.append('audio', audioFile);
      } else {
        formData.append('transcript', transcript);
      }

      const promise = new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 30); // 30% for upload
            setProgress(percentComplete);
            setProgressMessage(percentComplete < 30 ? 'جاري رفع الملف إلى الخادم...' : 'اكتمل الرفع، يتم الآن تهيئة المعالجة...');
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              reject(new Error("استجابة غير صالحة من الخادم."));
            }
          } else {
            try {
               const errorData = JSON.parse(xhr.responseText);
               reject(new Error(errorData?.error || 'حدث خطأ أثناء إنشاء التقرير.'));
            } catch (e) {
               reject(new Error(`خطأ في الخادم (الكود: ${xhr.status})`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error('فشل الاتصال بالخادم. تأكد من اتصالك بالإنترنت.'));
        };

        xhr.open('POST', '/api/generate-report', true);
        xhr.send(formData);
      });

      // Simulate AI processing progress
      let simProgress = 30;
      const interval = setInterval(() => {
        if (simProgress < 90) {
          simProgress += Math.random() * 5;
          setProgress(Math.min(90, Math.round(simProgress)));
          
          if (simProgress < 50) {
             setProgressMessage('جاري تحليل المحتوى بواسطة الذكاء الاصطناعي...');
          } else if (simProgress < 75) {
             setProgressMessage('جاري استخراج القرارات والتكليفات...');
          } else {
             setProgressMessage('جاري صياغة التقرير الختامي وتنسيقه...');
          }
        }
      }, 1000);

      const data = await promise;
      
      clearInterval(interval);
      setProgress(100);
      setProgressMessage('تم بنجاح!');
      
      setTimeout(() => {
         setReport(data.report);
         if (data.transcript) {
           setTranscript(data.transcript);
         }
         setIsLoading(false);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'فشل الاتصال بالخادم.');
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!pdfReportRef.current) return;
    setIsGeneratingPDF(true);
    
    try {
      const element = pdfReportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('تقرير_الحوكمة_الختامي.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('حدث خطأ أثناء إنشاء ملف PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
      <header className="bg-blue-900 text-white border-b border-blue-800 shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-inner text-white">
                D
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">DGP Platform</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">الحوكمة الرقمية</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!isCheckingWebex && (
                <div className="flex items-center">
                  {isWebexConnected ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Webex connected successfully.
                      </span>
                      <button 
                        onClick={handleDisconnectWebex}
                        className="px-3 py-1 text-[10px] font-bold border border-slate-700 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleConnectWebex}
                      className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded shadow flex items-center gap-2 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Connect Webex
                    </button>
                  )}
                </div>
              )}
              <div className="h-6 w-px bg-slate-700 mx-1"></div>
              <button className="px-4 py-1.5 text-xs font-bold border border-slate-700 rounded text-slate-300 hover:bg-slate-800 transition-colors">
                الإعدادات
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 shrink-0">
          <span>الرئيسية</span>
          <span>/</span>
          <span>التقارير الذكية</span>
          <span>/</span>
          <span className="text-slate-900 font-medium">توليد تقرير الحوكمة</span>
        </div>

        {meetings.length > 0 && (
          <div className="mb-6 bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden shrink-0">
            <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <Video className="w-4 h-4" />
                سجلات الاجتماعات (Webex)
              </h2>
            </div>
            <div className="p-4 flex overflow-x-auto gap-4">
              {meetings.map((meeting) => (
                <div 
                  key={meeting.id}
                  onClick={() => {
                    setTranscript(meeting.transcript);
                    setReport(meeting.report);
                  }}
                  className="min-w-[280px] cursor-pointer p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all bg-slate-50"
                >
                  <h3 className="font-bold text-sm text-slate-800 mb-1 truncate">{meeting.topic}</h3>
                  <p className="text-xs text-slate-500 mb-3">{new Date(meeting.createTime).toLocaleString('ar-EG')}</p>
                  <div className="flex gap-2">
                    {meeting.report ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                        <Check className="w-3 h-3" />
                        تقرير جاهز
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        قيد المعالجة
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
          
          {/* Input Section */}
          <div className="bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex justify-between items-center shrink-0">
              <div className="text-right">
                <h2 className="text-lg font-bold text-slate-900 mb-1">محتوى الاجتماع</h2>
                <p className="text-xs text-slate-500 uppercase tracking-wider">النص المستخرج والملفات</p>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col min-h-0">
              {audioFile ? (
                <div className="flex-1 w-full flex flex-col gap-4 min-h-0">
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-500 bg-emerald-50 rounded-lg text-emerald-700 shrink-0">
                    <Mic className="w-8 h-8 mb-2 text-emerald-500 opacity-80" />
                    <p className="font-bold text-sm mb-1">{audioFile.name}</p>
                    <button
                      onClick={clearAudioFile}
                      className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-200 rounded text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      إلغاء الملف
                    </button>
                  </div>
                  {transcript && (
                    <div className="flex-1 flex flex-col min-h-0">
                      <p className="text-xs font-bold text-slate-500 mb-2">النص المستخرج (التفريغ):</p>
                      <textarea
                        className="flex-1 w-full p-4 border border-slate-200 bg-slate-50/50 rounded-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-sans text-sm leading-relaxed"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  className="flex-1 w-full p-4 border border-slate-200 bg-slate-50/50 rounded-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-sans text-sm leading-relaxed"
                  placeholder="أدخل النص المستخرج من التسجيل الصوتي للاجتماع هنا..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
              )}
              
              {!audioFile && (
                <div className="mt-4 flex items-center justify-center w-full">
                  <label htmlFor="audio-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-6 h-6 text-slate-500 mb-2" />
                      <p className="text-sm text-slate-600 font-medium">أو قم برفع ملف صوتي للاجتماع (MP3, WAV, M4A)</p>
                    </div>
                    <input id="audio-upload" type="file" accept="audio/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  </label>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border-r-4 border-red-500 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {isLoading && (
                <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>{progressMessage}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={generateReport}
                disabled={isLoading || (!transcript.trim() && !audioFile)}
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3 px-4 rounded shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري المعالجة والتحليل...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    توليد التقرير الختامي
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex justify-between items-center shrink-0">
              <div className="text-right">
                <h2 className="text-lg font-bold text-slate-900 mb-1">تقرير الحوكمة الختامي</h2>
                <div className="flex items-center gap-2 mt-1">
                  {report ? (
                     <>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">جاهز للتحويل</p>
                     </>
                  ) : (
                     <p className="text-xs text-slate-500 uppercase tracking-wider">بانتظار المعالجة</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {report && (
                  <>
                    <button 
                      onClick={handleCopy}
                      className="px-4 py-1.5 text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 rounded shadow-sm flex items-center gap-2 transition-colors"
                      title="نسخ التقرير"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      نسخ التقرير
                    </button>
                    <button 
                      onClick={handleDownloadPDF}
                      disabled={isGeneratingPDF}
                      className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                      title="تحميل كملف PDF"
                    >
                      {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                      تصدير PDF
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto bg-white">
              {report ? (
                <>
                  <div ref={reportRef} className="bg-white p-8 border border-slate-100 shadow-sm min-h-full">
                    <div className="prose prose-slate prose-sm md:prose-base prose-rtl max-w-none 
                      prose-headings:text-slate-400 prose-headings:text-xs prose-headings:font-bold prose-headings:uppercase 
                      prose-h3:flex prose-h3:items-center prose-h3:gap-2 
                      prose-h3:before:content-[''] prose-h3:before:w-8 prose-h3:before:h-px prose-h3:before:bg-slate-200
                      prose-a:text-emerald-600 
                      prose-table:w-full prose-table:text-sm prose-table:border-collapse
                      prose-thead:bg-slate-900 prose-thead:text-white prose-th:p-3 prose-th:font-medium prose-th:border-0
                      prose-tbody:divide-y prose-tbody:divide-slate-100 prose-td:p-3 prose-td:border-0
                      prose-li:marker:text-emerald-500
                      prose-strong:text-slate-900 prose-strong:font-bold
                      prose-p:text-slate-600 prose-p:leading-relaxed"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {report}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  {/* Hidden element exclusively for PDF generation with standard CSS (no oklch) */}
                  <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                    <div ref={pdfReportRef} style={{ width: '800px', backgroundColor: '#ffffff', color: '#1e293b', padding: '40px', direction: 'rtl', fontFamily: 'sans-serif' }}>
                      <style>{`
                        .pdf-content h1, .pdf-content h2, .pdf-content h3 { color: #0f172a; margin-top: 1em; margin-bottom: 0.5em; font-weight: bold; }
                        .pdf-content h1 { font-size: 24px; }
                        .pdf-content h2 { font-size: 20px; }
                        .pdf-content h3 { font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                        .pdf-content p { margin-bottom: 1em; line-height: 1.6; font-size: 14px; }
                        .pdf-content table { width: 100%; border-collapse: collapse; margin-bottom: 1em; font-size: 14px; }
                        .pdf-content th, .pdf-content td { border: 1px solid #cbd5e1; padding: 8px; text-align: right; }
                        .pdf-content th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; }
                        .pdf-content a { color: #059669; text-decoration: none; }
                        .pdf-content ul { list-style-type: disc; margin-right: 20px; margin-bottom: 1em; font-size: 14px; }
                        .pdf-content ol { list-style-type: decimal; margin-right: 20px; margin-bottom: 1em; font-size: 14px; }
                        .pdf-content li { margin-bottom: 0.5em; }
                        .pdf-content strong { font-weight: bold; color: #0f172a; }
                      `}</style>
                      <div className="pdf-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {report}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">سيظهر التقرير المنسق هنا بعد اكتمال المعالجة</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
