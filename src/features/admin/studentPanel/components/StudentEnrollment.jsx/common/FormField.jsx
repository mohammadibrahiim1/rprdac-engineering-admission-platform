// ─── FormField ───────────────────────────────────────────────────────────────
export default function FormField({
  label,
  required,
  children,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm pb-1 font-semibold text-[#37352f] tracking-wider capitalize">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}
