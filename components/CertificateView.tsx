import React from 'react';
import { Certificate } from '../types';
import { BadgeCheck, Download, Share2, Printer, ArrowLeft } from './ui/Icons';

interface CertificateViewProps {
  certificate: Certificate;
  onBack: () => void;
}

const CertificateView: React.FC<CertificateViewProps> = ({ certificate, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4">
      {/* Toolbar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 text-white">
        <button onClick={onBack} className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Certificate Frame */}
      <div className="bg-white p-2 max-w-4xl w-full shadow-2xl rounded-sm overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="border-4 border-double border-slate-200 p-8 md:p-16 relative flex flex-col items-center text-center h-full bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          
          {/* Decorative Corner */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-indigo-900 opacity-80"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-indigo-900 opacity-80"></div>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-4 text-indigo-900">
              <BadgeCheck className="w-12 h-12" />
              <span className="text-2xl font-bold tracking-widest uppercase">PUB-Latih LMS</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-4">Certificate of Completion</h1>
            <p className="text-lg text-slate-500 italic">This is to certify that</p>
          </div>

          {/* Name */}
          <div className="mb-12 relative">
             <h2 className="text-3xl md:text-5xl font-serif font-bold text-indigo-700 border-b-2 border-slate-300 pb-4 px-8 inline-block">
                {certificate.studentName}
             </h2>
          </div>

          {/* Course */}
          <div className="mb-16 max-w-2xl">
            <p className="text-lg text-slate-500 mb-2">Has successfully completed the course</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
              {certificate.courseTitle}
            </h3>
            <p className="text-slate-500 mt-4">
              Demonstrating exceptional dedication and mastery of the subject matter.
            </p>
          </div>

          {/* Footer */}
          <div className="w-full flex flex-col md:flex-row justify-between items-end mt-auto pt-8 border-t border-slate-200">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <p className="text-sm text-slate-400 uppercase tracking-wide mb-1">Instructor</p>
              <div className="font-serif text-xl text-slate-900 border-b border-slate-400 pb-1 mb-1 w-48">
                {certificate.instructor}
              </div>
            </div>

            <div className="text-center">
               {/* QR Code Placeholder */}
               <div className="w-20 h-20 bg-slate-100 mb-2 mx-auto p-1">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${certificate.serialNumber}`} alt="QR" className="w-full h-full" />
               </div>
               <p className="text-xs text-slate-400">Verify: {certificate.serialNumber}</p>
            </div>

            <div className="text-center md:text-right mt-6 md:mt-0">
              <p className="text-sm text-slate-400 uppercase tracking-wide mb-1">Date Issued</p>
              <div className="font-serif text-xl text-slate-900 border-b border-slate-400 pb-1 mb-1 w-48 text-right">
                {certificate.issueDate.toLocaleDateString()}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CertificateView;