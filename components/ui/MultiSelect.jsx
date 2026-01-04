import React from "react";
import Select from "react-select";

export default function MultiSelect({
  label,
  name,
  options,
  value,
  onChange,
  valueKey = "id",
}) {
  const handleChange = (selected) => {
    // نحول selected (array of objects) لـ array of ids
    const values = selected ? selected.map((opt) => opt.value) : [];
    onChange(name, values);
  };

  const formattedOptions = options.map((opt) => ({
    value: opt[valueKey],
    label: opt.name_ar ?? opt.name, // يدعم العربي لو موجود
  }));

  const selectedValues = formattedOptions.filter((o) =>
    value.includes(o.value)
  );

  const darkSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#1f2937", // gray-800
      borderColor: state.isFocused ? "#3b82f6" : "#374151", // blue-500 or gray-700
      borderWidth: "2px",
      borderRadius: "0.5rem",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
      minHeight: "42px",
      color: "#f9fafb", // text-gray-50
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#111827", // gray-900
      color: "#f9fafb",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6" // blue-500
        : state.isFocused
        ? "#1e40af" // blue-800
        : "#111827", // gray-900
      color: state.isSelected ? "#ffffff" : "#f9fafb",
      cursor: "pointer",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#374151", // gray-700
      borderRadius: "0.5rem",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#f9fafb",
      fontWeight: "500",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#f9fafb",
      "&:hover": {
        backgroundColor: "#ef4444", // red-500
        color: "#ffffff",
        borderRadius: "0.5rem",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#f9fafb",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af", // gray-400
    }),
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold">{label}</label>
      <Select
        isMulti
        options={formattedOptions}
        value={selectedValues}
        onChange={handleChange}
        styles={darkSelectStyles}
        classNamePrefix="select"
      />
    </div>
  );
}
