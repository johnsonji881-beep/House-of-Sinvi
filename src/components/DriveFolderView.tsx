import React from 'react';
import { DriveFolderConfig } from '../types';
import {
  HardDrive,
  FolderPlus,
  ExternalLink,
  Image,
  FileCode,
  Layers,
  Sparkles,
  Upload,
  RefreshCw,
  Folder,
} from 'lucide-react';

interface DriveFolderViewProps {
  driveConfig: DriveFolderConfig | null;
  onCreateDriveFolderRequest: () => void;
  needsAuth: boolean;
  onLoginPrompt: () => void;
  isLoading: boolean;
}

const SAMPLE_SPEC_FILES = [
  {
    name: 'Elysian_Emerald_Gown_Technical_Sketch.pdf',
    type: 'PDF Spec Sheet',
    size: '4.2 MB',
    date: '2026-07-28',
  },
  {
    name: 'Aethelgard_Organza_Lace_Swatch_HighRes.png',
    type: 'Fabric Swatch Photo',
    size: '8.1 MB',
    date: '2026-07-29',
  },
  {
    name: 'House_of_Sinvi_AW26_Moodboard_Versailles.pdf',
    type: 'Collection Moodboard',
    size: '18.5 MB',
    date: '2026-07-30',
  },
];

export const DriveFolderView: React.FC<DriveFolderViewProps> = ({
  driveConfig,
  onCreateDriveFolderRequest,
  needsAuth,
  onLoginPrompt,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161616] rounded-3xl p-6 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Google Drive Moodboards & Specs
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950/80 text-blue-400 border border-blue-800">
              Drive Integration
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Store high-resolution garment sketches, technical spec drawings, and fabric swatch photos directly inside your dedicated House of SINVI Google Drive folder.
          </p>
        </div>

        {!driveConfig ? (
          <button
            onClick={() => {
              if (needsAuth) onLoginPrompt();
              else onCreateDriveFolderRequest();
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <FolderPlus className="w-4 h-4 text-black" />
            )}
            <span>Create Atelier Drive Folder</span>
          </button>
        ) : (
          <a
            href={driveConfig.folderUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-blue-100 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Google Drive Folder</span>
          </a>
        )}
      </div>

      {/* Drive Status Box */}
      {driveConfig ? (
        <div className="bg-[#161616] rounded-3xl border border-zinc-800 p-6 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-950/80 text-blue-400 rounded-2xl border border-blue-800">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                {driveConfig.folderName}
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Folder ID: {driveConfig.folderId}
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-full">
            Drive Active
          </span>
        </div>
      ) : (
        <div className="bg-[#161616] rounded-3xl border border-dashed border-zinc-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-950/60 text-blue-400 border border-blue-800 flex items-center justify-center mx-auto">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-zinc-200">
              No Drive Spec Folder Initialized Yet
            </h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 font-light">
              Click "Create Atelier Drive Folder" above to automatically provision a dedicated folder in your Google Drive storage for high-resolution garment sketches and embroidery spec sheets.
            </p>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="bg-[#161616] rounded-3xl border border-zinc-800 p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Garment Technical Specs & Moodboards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_SPEC_FILES.map((file, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#0a0a0a] rounded-2xl border border-zinc-800 space-y-3 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Image className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span className="text-xs font-bold text-zinc-100 truncate">
                  {file.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>{file.type}</span>
                <span className="font-mono text-zinc-500">{file.size}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
