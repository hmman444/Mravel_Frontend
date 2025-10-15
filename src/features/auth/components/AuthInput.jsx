export default function AuthInput({ icon: Icon, ...props }) {
  return (
    <label className="block ">
      <span className="text-sm text-gray-600">{props.label}</span>
      <div className="relative">
        {Icon && (
          <Icon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        )}
        <input
          {...props}
          className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </label>
  );
}
