export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center
        text-[14px] px-3 py-1 rounded-full
        font-medium tracking-wide

        bg-gradient-to-r from-sky-500 to-blue-600
        text-white

        shadow-sm hover:shadow-md
        hover:-translate-y-0.5 active:translate-y-0

        transition-all duration-200 ease-out

        focus:outline-none focus:ring-2 focus:ring-sky-400/60

        disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0

        ${className}
      `}
    >
       {children}
    </button>
  );
}
