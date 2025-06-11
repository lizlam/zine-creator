import React, { useState, useRef } from 'react';
import ZineEditor from './ZineEditor';
import './styles.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function App() {
  const [pages, setPages] = useState(
    Array(8).fill(null).map(() => ({
      text: '',
      image: null,
      imagePos: { x: 0, y: 0 },
      imageSize: { width: 100, height: 100 },
    }))
  );

  const [showLabels, setShowLabels] = useState(true);

  const handleTextChange = (index, newText) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[index] = { ...newPages[index], text: newText };
      return newPages;
    });
  };

  const handleImageChange = (index, newImage) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[index] = {
        ...newPages[index],
        image: newImage,
        imagePos: { x: 0, y: 0 },
        imageSize: { width: 100, height: 100 },
      };
      return newPages;
    });
  };

  const handleImagePosChange = (index, newPos) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[index] = { ...newPages[index], imagePos: newPos };
      return newPages;
    });
  };

  const handleImageSizeChange = (index, newSize) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[index] = { ...newPages[index], imageSize: newSize };
      return newPages;
    });
  };

  const exportToPDF = async () => {
    const element = document.getElementById('print-layout');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [11, 8.5],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, 11, 8.5);
    pdf.save('zine.pdf');
  };

  const printOrder = [7, 6, 5, 4, 8, 1, 2, 3];

  return (
    <div className="app">
      <h1>8-Page Zine Creator</h1>
      <ZineEditor
        pages={pages}
        onTextChange={handleTextChange}
        onImageChange={handleImageChange}
      />
      <div id="print-layout" className="sheet">
        {/* Fold lines */}
        <div className="fold-line-vertical" />
        <div className="fold-line-vertical" />

        {printOrder.map((pageNum, i) => {
          const pageIndex = pageNum - 1;
          const isTopRow = i < 4;
          const page = pages[pageIndex];
          let label = `Page ${pageNum}`;
          if (pageNum === 1) label = 'Front Cover';
          if (pageNum === 8) label = 'Back Cover';

          return (
            <div
              key={i}
              className={`zine-page ${isTopRow ? 'upside-down' : ''}`}
            >
              {showLabels && <div className="page-label">{label}</div>}
              <div className="page-text">{page.text}</div>
              {page.image && (
                <DraggableImage
                  index={pageIndex}
                  src={page.image}
                  pos={page.imagePos}
                  size={page.imageSize}
                  onPosChange={handleImagePosChange}
                  onSizeChange={handleImageSizeChange}
                />
              )}
            </div>
          );
        })}
      </div>

      <button onClick={exportToPDF}>Export to PDF</button>
      <button onClick={() => setShowLabels((prev) => !prev)}>
        {showLabels ? 'Hide Labels' : 'Show Labels'}
      </button>
    </div>
  );
}

function DraggableImage({ index, src, pos, size, onPosChange, onSizeChange }) {
  const dragData = useRef({});
  const resizeData = useRef({});

  const onMouseDown = (e) => {
    e.preventDefault();
    dragData.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (dragData.current.dragging) {
      const dx = e.clientX - dragData.current.startX;
      const dy = e.clientY - dragData.current.startY;
      onPosChange(index, {
        x: dragData.current.origX + dx,
        y: dragData.current.origY + dy,
      });
    } else if (resizeData.current.resizing) {
      const dx = e.clientX - resizeData.current.startX;
      const dy = e.clientY - resizeData.current.startY;
      onSizeChange(index, {
        width: Math.max(20, resizeData.current.origWidth + dx),
        height: Math.max(20, resizeData.current.origHeight + dy),
      });
    }
  };

  const onMouseUp = () => {
    dragData.current.dragging = false;
    resizeData.current.resizing = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  const onResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizeData.current = {
      resizing: true,
      startX: e.clientX,
      startY: e.clientY,
      origWidth: size.width,
      origHeight: size.height,
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
        userSelect: 'none',
      }}
      onMouseDown={onMouseDown}
    >
      <img
        src={src}
        alt="zine"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        draggable={false}
      />
      <div
        onMouseDown={onResizeMouseDown}
        style={{
          position: 'absolute',
          width: '12px',
          height: '12px',
          background: 'rgba(0,0,0,0.5)',
          right: 0,
          bottom: 0,
          cursor: 'nwse-resize',
          userSelect: 'none',
        }}
      />
    </div>
  );
}

export default App;

