// ─── Toggle ──────────────────────────────────────────────────────────────────

export default function Toggle({ id, checked, onChange, label }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 cursor-pointer select-none group"
    >
      <div
        className={`relative w-8 h-4 rounded-full transition-colors duration-200 flex-shrink-0 ${
          checked ? 'bg-[#2383e2]' : 'bg-[#d5d4d0]'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-[12px] text-[#6b6a68] group-hover:text-[#37352f] transition-colors">
        {label}
      </span>
    </label>
  );
}
