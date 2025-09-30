export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`px-6 py-2 rounded-lg font-semibold transition-colors 
                  bg-primary text-white hover:bg-primaryHover 
                  dark:bg-secondary dark:text-gray-900 dark:hover:bg-secondaryDark
                  ${className}`}
    >
      {children}
    </button>
  );
}
