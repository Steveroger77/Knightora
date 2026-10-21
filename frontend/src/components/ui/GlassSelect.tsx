import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface GlassSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  className?: string;
  placeholder?: string;
  distortionScale?: number;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  placeholder = 'Select',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button with zero outline/ring flicker */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all bg-aurora-500/10 hover:bg-aurora-500/20 border border-aurora-500/25 hover:border-aurora-500/40 text-slate-200 hover:text-aurora-300 shadow-sm focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none cursor-pointer select-none"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-aurora-400 flex-shrink-0 transition-transform duration-300 ml-1.5 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Smooth Glassmorphic Dropdown Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 z-[99]">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-aurora-500/35 rounded-xl p-1 shadow-2xl overflow-hidden">
            <ul className="max-h-60 overflow-y-auto custom-scrollbar w-full p-1 space-y-0.5">
              {options.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors truncate ${
                    value === opt.value
                      ? 'bg-aurora-500/25 text-aurora-300 font-semibold border border-aurora-500/30 shadow-glow-sm'
                      : 'text-slate-200 hover:bg-aurora-500/15 hover:text-aurora-300'
                  }`}
                  title={opt.label}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
