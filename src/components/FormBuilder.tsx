import React, { useState } from 'react';
import { WorkspaceForm, FormResponseItem, CoutureOrder } from '../types';
import {
  FileText,
  Plus,
  ExternalLink,
  RefreshCw,
  UserCheck,
  Calendar,
  DollarSign,
  Sparkles,
  CheckCircle,
  Copy,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface FormBuilderProps {
  forms: WorkspaceForm[];
  formResponses: FormResponseItem[];
  onCreateFormRequest: () => void;
  onFetchResponsesRequest: (formId: string) => void;
  onConvertResponseToOrder: (responseItem: FormResponseItem) => void;
  needsAuth: boolean;
  onLoginPrompt: () => void;
  isLoading: boolean;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  forms,
  formResponses,
  onCreateFormRequest,
  onFetchResponsesRequest,
  onConvertResponseToOrder,
  needsAuth,
  onLoginPrompt,
  isLoading,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopyLink = (uri: string) => {
    navigator.clipboard.writeText(uri);
    setCopiedLink(uri);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161616] rounded-3xl p-6 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Google Forms Client Intake
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-950/80 text-purple-400 border border-purple-800">
              Forms Integration
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Generate bespoke Google Forms for client style consultations, gather intake submissions, and convert them directly into Atelier Orders.
          </p>
        </div>

        <button
          onClick={() => {
            if (needsAuth) onLoginPrompt();
            else onCreateFormRequest();
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Plus className="w-4 h-4 text-black" />
          )}
          <span>Create Consultation Form</span>
        </button>
      </div>

      {/* Forms Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Active Consultation Forms ({forms.length})
        </h3>

        {forms.length === 0 ? (
          <div className="bg-[#161616] rounded-3xl border border-dashed border-zinc-800 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/60 text-purple-400 border border-purple-800 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-200">
                No Google Forms Generated Yet
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 font-light">
                Click "Create Consultation Form" above to generate a live Google Form with bespoke consultation questions for your VIP clients.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forms.map((form) => (
              <div
                key={form.formId}
                className="bg-[#161616] rounded-3xl border border-zinc-800 p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-zinc-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800">
                        Form ID: {form.formId.slice(0, 10)}...
                      </span>
                      <h4 className="text-base font-bold text-zinc-100 mt-2">
                        {form.title}
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 font-light">{form.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Client Submissions:</span>
                    <span className="font-bold text-zinc-200">
                      {formResponses.length} Responses
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={form.responderUri}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 font-semibold text-xs rounded-2xl border border-purple-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Form</span>
                    </a>

                    <button
                      onClick={() => handleCopyLink(form.responderUri)}
                      className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl transition-colors"
                      title="Copy Share Link"
                    >
                      {copiedLink === form.responderUri ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (needsAuth) onLoginPrompt();
                        else onFetchResponsesRequest(form.formId);
                      }}
                      className="p-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black rounded-2xl transition-colors"
                      title="Fetch Incoming Responses"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Responses Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Client Form Submissions ({formResponses.length})
            </h3>
            <p className="text-xs text-zinc-400 font-light mt-0.5">
              Review incoming client fitting preferences and convert them directly into Atelier Orders.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {formResponses.map((response) => (
            <div
              key={response.responseId}
              className="bg-[#161616] rounded-3xl border border-zinc-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-100">
                    {response.clientName}
                  </span>
                  <span className="text-xs text-zinc-400">({response.clientEmail})</span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full font-medium">
                    {new Date(response.createTime).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-zinc-300 bg-[#0a0a0a] p-3.5 rounded-2xl border border-zinc-800/80">
                  <div>
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">Requested Garment:</span>
                    <span className="font-semibold text-zinc-100">{response.garmentType}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">Budget Range:</span>
                    <span className="font-semibold text-emerald-400">{response.budgetRange}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">Event Date:</span>
                    <span className="font-semibold text-zinc-100">{response.eventDate}</span>
                  </div>
                </div>

                {response.specialRequests && (
                  <p className="text-xs text-zinc-400 bg-[#0a0a0a] p-3 rounded-2xl border border-zinc-800/80 italic font-light">
                    "{response.specialRequests}"
                  </p>
                )}
              </div>

              <div>
                {response.convertedToOrder ? (
                  <div className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-2xl">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Order Created</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onConvertResponseToOrder(response)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    <span>Convert to Order</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
