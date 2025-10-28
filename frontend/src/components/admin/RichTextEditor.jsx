import React from "react";

const RichTextEditor = ({ value, onChange, label, placeholder, ...rest }) => {
  return (
    <div className="form-group">
      <label className="form-label mb-1 font-semibold text-sm block">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows="6"
        // FIX: Use highlight/dark-highlight for better integration
        className="form-input w-full p-3 rounded-lg bg-highlight dark:bg-dark-highlight border border-muted dark:border-gray-600 transition-colors"
        placeholder={placeholder}
        {...rest}
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Note: Integrate a full rich text editor library (like TinyMCE or
        Draft.js) here in a production environment.
      </p>
    </div>
  );
};

export default RichTextEditor;
