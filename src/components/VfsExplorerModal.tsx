'use client';

import React, { useState } from 'react';
import { VirtualFileSystem, VFSNode } from '@/lib/vfs';
import { Folder, FileText, ChevronRight, ChevronDown, X, Lock, Shield, HardDrive } from 'lucide-react';

interface VfsExplorerModalProps {
  vfs: VirtualFileSystem;
  isOpen: boolean;
  onClose: () => void;
  onSelectPath?: (path: string) => void;
}

export function VfsExplorerModal({ vfs, isOpen, onClose, onSelectPath }: VfsExplorerModalProps) {
  const [selectedNode, setSelectedNode] = useState<{ path: string; node: VFSNode } | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({
    '/': true,
    '/home': true,
    '/home/student': true,
    '/home/student/projects': true,
    '/var': true,
    '/var/log': true,
    '/etc': true,
  });

  if (!isOpen) return null;

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderTree = (path: string) => {
    const node = vfs.getNode(path);
    if (!node || node.type !== 'dir' || !node.children) return null;

    const children = Array.from(node.children.entries()).sort((a, b) => {
      if (a[1].type !== b[1].type) return a[1].type === 'dir' ? -1 : 1;
      return a[0].localeCompare(b[0]);
    });

    return (
      <div className="pl-4 space-y-1">
        {children.map(([name, child]) => {
          const childPath = path === '/' ? `/${name}` : `${path}/${name}`;
          const isDir = child.type === 'dir';
          const isExpanded = !!expandedPaths[childPath];
          const isSelected = selectedNode?.path === childPath;

          return (
            <div key={childPath} className="space-y-1 text-xs">
              <div
                onClick={() => {
                  setSelectedNode({ path: childPath, node: child });
                  if (isDir) toggleExpand(childPath);
                }}
                className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition select-none ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                {isDir ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(childPath);
                    }}
                    className="p-0.5 text-slate-500 hover:text-slate-300"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>
                ) : (
                  <span className="w-3.5" />
                )}

                {isDir ? (
                  <Folder className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}

                <span className="truncate">{name}</span>
                <span className="ml-auto text-[10px] text-slate-500 font-mono">
                  {VirtualFileSystem.modeToString(child.mode, isDir)}
                </span>
              </div>

              {isDir && isExpanded && renderTree(childPath)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[600px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HardDrive className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">Virtual Filesystem Inspector</h3>
              <p className="text-xs text-slate-400">Live in-memory Linux FHS tree and node metadata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content split pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Tree View */}
          <div className="w-1/2 border-r border-slate-800 p-4 overflow-y-auto space-y-1">
            <div
              onClick={() => {
                const rootNode = vfs.getNode('/');
                if (rootNode) setSelectedNode({ path: '/', node: rootNode });
                toggleExpand('/');
              }}
              className="flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer text-xs font-bold text-slate-200 hover:bg-slate-800"
            >
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              <Folder className="w-4 h-4 text-emerald-400" />
              <span>/ (Root Filesystem)</span>
            </div>
            {renderTree('/')}
          </div>

          {/* Right: Selected Node Details & File Content */}
          <div className="w-1/2 p-5 overflow-y-auto bg-slate-950/40 space-y-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                    Selected Node
                  </span>
                  <h4 className="text-sm font-mono font-bold text-slate-100 break-all">
                    {selectedNode.path}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Type</span>
                    <span className="capitalize text-slate-200 font-medium">{selectedNode.node.type}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Permissions</span>
                    <span className="font-mono text-cyan-300">
                      {VirtualFileSystem.modeToString(selectedNode.node.mode, selectedNode.node.type === 'dir')} (0{selectedNode.node.mode.toString(8)})
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Owner : Group</span>
                    <span className="text-slate-200 font-medium">
                      {selectedNode.node.owner} : {selectedNode.node.group}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Size</span>
                    <span className="text-slate-200 font-medium">
                      {selectedNode.node.type === 'dir' ? '4096 bytes' : `${selectedNode.node.content.length} bytes`}
                    </span>
                  </div>
                </div>

                {selectedNode.node.type === 'file' ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      File Contents Preview:
                    </span>
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                      {selectedNode.node.content || '<empty file>'}
                    </pre>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-400">
                    Directory contains {selectedNode.node.children?.size || 0} direct entries.
                  </div>
                )}

                {onSelectPath && (
                  <button
                    onClick={() => {
                      onSelectPath(`cd ${selectedNode.path}`);
                      onClose();
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition"
                  >
                    CD to this Directory in Sandbox
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-6 space-y-2">
                <Folder className="w-10 h-10 stroke-[1.5]" />
                <p className="text-xs">Click any file or directory in the tree to inspect permissions, size, and contents.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
