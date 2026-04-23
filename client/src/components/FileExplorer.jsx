import React, { useState } from 'react';

/**
 * Modern File Explorer
 */
export default function FileExplorer({ files, onFileSelect, activeFile, onRefresh, onFileCreate }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newFileName.trim() || !onFileCreate) return;
    onFileCreate(newFileName.trim());
    setNewFileName('');
    setIsCreating(false);
  };

  return (
    <div className="bg-hb-card h-full border-r border-hb-border/50 w-64 flex flex-col shrink-0">
      <div className="p-4 border-b border-hb-border/30 flex items-center justify-between bg-hb-bg/20">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Resource Grid</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="w-7 h-7 rounded-lg bg-hb-border/30 hover:bg-hb-primary/20 hover:text-hb-primary text-gray-500 transition-all flex items-center justify-center text-xs"
            title="New File"
          >
            +
          </button>
          <button 
            onClick={onRefresh}
            className="w-7 h-7 rounded-lg bg-hb-border/30 hover:bg-hb-accent/20 hover:text-hb-accent text-gray-500 transition-all flex items-center justify-center text-[10px]"
            title="Sync Grid"
          >
            🔄
          </button>
        </div>
      </div>

      <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="px-2 mb-3">
            <input
              autoFocus
              type="text"
              placeholder="RESOURCE.JS"
              className="w-full bg-hb-bg border-2 border-hb-primary/50 text-white text-[10px] font-black px-3 py-2 rounded-xl outline-none uppercase tracking-widest shadow-glow-primary/10"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={() => {
                if (!newFileName.trim()) setIsCreating(false);
              }}
            />
          </form>
        )}

        <div className="space-y-1">
          {files.length === 0 && !isCreating ? (
            <div className="py-12 px-4 text-center opacity-20">
               <div className="text-3xl mb-2">📡</div>
               <p className="text-[9px] font-black uppercase tracking-widest">No Signals</p>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.path}
                onClick={() => onFileSelect(file)}
                className={`group flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl transition-all duration-300 ${
                  activeFile?.path === file.path 
                    ? 'bg-modern-gradient text-white shadow-glow-primary translate-x-1' 
                    : 'text-gray-500 hover:bg-hb-border/20 hover:text-gray-200'
                }`}
              >
                <span className="text-sm">
                  {file.type === 'dir' ? '📁' : '📄'}
                </span>
                <span className="truncate flex-1 text-[11px] font-bold tracking-tight uppercase">
                  {file.name}
                </span>
                {activeFile?.path === file.path && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="p-4 bg-hb-bg/40 border-t border-hb-border/30">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-hb-border/20 border border-hb-border/50">
             <div className="w-2 h-2 rounded-full bg-hb-success shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
             <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Git Stream Active</span>
          </div>
      </div>
    </div>
  );
}
