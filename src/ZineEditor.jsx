import React from 'react';

function ZineEditor({ pages, onTextChange, onImageChange }) {
  const handleTextChange = (index, value) => {
    onTextChange(index, value);
  };

  const handleImageUpload = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onImageChange(index, reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="editor">
      {pages.map((page, index) => (
        <div key={index} className="editor-page">
          <label>Page {index + 1}</label>
          <textarea
            placeholder="Enter text here"
            value={page.text}
            onChange={(e) => handleTextChange(index, e.target.value)}
            rows={4}
            cols={20}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(index, e)}
          />
        </div>
      ))}
    </div>
  );
}

export default ZineEditor;

