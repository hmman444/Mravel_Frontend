import React from "react";

const InputField = ({
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  autoComplete = "off",
  disabled = false
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-left text-sm font-medium text-gray-700 mb-1"
      >
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`appearance-none rounded-xl block w-full ${
            Icon ? "pl-9" : "pl-3"
          } pr-3 py-3 border ${
            error ? "border-[#FF7E67]" : "border-[#A2D5F2]"
          } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#07689F] focus:border-transparent`}
          aria-invalid={error ? "true" : "false"}
        />
      </div>
      {error && <p className="mt-1 text-sm text-[#FF7E67]">{error}</p>}
    </div>
  );
};

export default InputField;
