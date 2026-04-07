import { useEffect, useMemo, useState } from 'react';
import { PromptVersion } from '../../../lib/types';

interface PromptDiffPanelProps {
  versions: PromptVersion[];
  initialLeftId?: string;
}

type DiffKind = 'same' | 'changed' | 'added' | 'removed';

interface DiffRow {
  line: number;
  left: string;
  right: string;
  kind: DiffKind;
}

function buildLineDiff(leftContent: string, rightContent: string): DiffRow[] {
  const leftLines = leftContent.split(/\r?\n/);
  const rightLines = rightContent.split(/\r?\n/);
  const maxLength = Math.max(leftLines.length, rightLines.length);
  const rows: DiffRow[] = [];

  for (let i = 0; i < maxLength; i += 1) {
    const left = leftLines[i] ?? '';
    const right = rightLines[i] ?? '';

    let kind: DiffKind = 'same';

    if (!left && right) {
      kind = 'added';
    } else if (left && !right) {
      kind = 'removed';
    } else if (left !== right) {
      kind = 'changed';
    }

    rows.push({
      line: i + 1,
      left,
      right,
      kind,
    });
  }

  return rows;
}

export function PromptDiffPanel({ versions, initialLeftId }: PromptDiffPanelProps) {
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');

  useEffect(() => {
    if (versions.length === 0) {
      setLeftId('');
      setRightId('');
      return;
    }

    const active = versions.find((version) => version.status === 'active') || versions[0];
    const initialLeft = versions.find((version) => version.id === initialLeftId) || active;
    const fallbackRight = versions.find((version) => version.id !== initialLeft.id) || initialLeft;

    setLeftId(initialLeft.id);
    setRightId(fallbackRight.id);
  }, [initialLeftId, versions]);

  const leftVersion = useMemo(
    () => versions.find((version) => version.id === leftId) || null,
    [leftId, versions]
  );

  const rightVersion = useMemo(
    () => versions.find((version) => version.id === rightId) || null,
    [rightId, versions]
  );

  const diffRows = useMemo(() => {
    if (!leftVersion || !rightVersion) {
      return [];
    }

    return buildLineDiff(leftVersion.content || '', rightVersion.content || '');
  }, [leftVersion, rightVersion]);

  const changedCount = diffRows.filter((row) => row.kind !== 'same').length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Compare Prompt Versions</h3>
          <p className="mt-1 text-sm text-gray-600">Review line-level differences between any two prompt versions.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">
            Left version
            <select
              value={leftId}
              onChange={(event) => setLeftId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {versions.map((version) => (
                <option key={`left-${version.id}`} value={version.id}>
                  {version.name} ({version.status})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-gray-700">
            Right version
            <select
              value={rightId}
              onChange={(event) => setRightId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {versions.map((version) => (
                <option key={`right-${version.id}`} value={version.id}>
                  {version.name} ({version.status})
                </option>
              ))}
            </select>
          </label>
        </div>

        {leftVersion && rightVersion ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            Showing {changedCount} changed lines between
            <span className="font-semibold"> {leftVersion.name}</span>
            {' '}and
            <span className="font-semibold"> {rightVersion.name}</span>.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-600">Left</p>
            <div className="max-h-96 overflow-auto rounded-lg border border-gray-200 bg-white">
              {diffRows.map((row) => (
                <div
                  key={`left-line-${row.line}`}
                  className={`grid grid-cols-[56px_1fr] border-b border-gray-100 px-2 py-1 text-xs ${
                    row.kind === 'removed'
                      ? 'bg-red-50'
                      : row.kind === 'changed'
                      ? 'bg-yellow-50'
                      : 'bg-white'
                  }`}
                >
                  <span className="text-gray-400">{row.line}</span>
                  <span className="whitespace-pre-wrap font-mono text-gray-800">{row.left || ' '}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-600">Right</p>
            <div className="max-h-96 overflow-auto rounded-lg border border-gray-200 bg-white">
              {diffRows.map((row) => (
                <div
                  key={`right-line-${row.line}`}
                  className={`grid grid-cols-[56px_1fr] border-b border-gray-100 px-2 py-1 text-xs ${
                    row.kind === 'added'
                      ? 'bg-green-50'
                      : row.kind === 'changed'
                      ? 'bg-yellow-50'
                      : 'bg-white'
                  }`}
                >
                  <span className="text-gray-400">{row.line}</span>
                  <span className="whitespace-pre-wrap font-mono text-gray-800">{row.right || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
