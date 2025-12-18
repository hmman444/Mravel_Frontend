export default function AuthInput({ icon: Icon, label, className = "", ...props }) {
  const hasIcon = !!Icon;
  return (
    <label className="block">
      {label && <span className="text-sm text-slate-600">{label}</span>}
      <div className="relative mt-1">
        {Icon && (
          <Icon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        )}
        <input
          {...props}
          className={[
            "block w-full py-2.5 border border-slate-200 rounded-xl",
            "focus:outline-none focus:ring-2 focus:ring-sky-400",
            hasIcon ? "pl-10 pr-4" : "px-4",
            className,
          ].join(" ")}
        />
      </div>
    </label>
  );
}