'use client';

export default function Background3D() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-50">
      {/* Soft Indigo Ambient Radial Blur Header Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-200/40 via-purple-200/30 to-blue-100/40 rounded-full blur-3xl opacity-70" />
    </div>
  );
}
