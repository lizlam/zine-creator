import React, { useState, useRef } from 'react';
import ZineEditor from './ZineEditor';
import './styles.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function App() {
  const [showLabels, setShowLabels] = useState(true);

  const [pages, setPages] = useState(
    Array(8).fill(null).map(() => ({
      text: '',
      image: null,
      imagePos: { x: 0, y: 0 },
    }))
  );

  // Update text of page
  const handleTextChange = (index, newText) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[index] = {
        ...newPages[index],
        text: newText,
      };
      return newPages;
    });
  };

  // Update image of page and reset position
  const handleImageChange = (index, newImage) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[index] = {
        ...newPages[index],
        image: newImage,
        imagePos: { x: 0, y: 0 },
      };
      return newPages;
    });
  };

  // Update image position on drag
  const handleImagePosChange = (index, newPos) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[index] = {
        ...newPages[index],
        imagePos: newPos,
      };
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

  // Top row upside down (left to right): 7, 6, 5, 4
  // Bottom row right side up (left to right): 8, 1, 2, 3
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
        {printOrder.map((pageNum, i) => {
          const pageIndex = pageNum - 1;
          const isTopRow = i < 4;
          let label = `Page ${pageNum}`;
          if (pageNum === 1) label = 'Front Cover';
          else if (pageNum === 8) label = 'Back Cover';

          const page = pages[pageIndex];

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
                  onPosChange={handleImagePosChange}
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

function DraggableImage({ index, src, pos, onPosChange }) {
  const dragData = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const onMouseDown = (e) => {
    e.preventDefault();
    dragData.current.dragging = true;
    dragData.current.startX = e.clientX;
    dragData.current.startY = e.clientY;
    dragData.current.origX = pos.x;
    dragData.current.origY = pos.y;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!dragData.current.dragging) return;
    const deltaX = e.clientX - dragData.current.startX;
    const deltaY = e.clientY - dragData.current.startY;
    onPosChange(index, {
      x: dragData.current.origX + deltaX,
      y: dragData.current.origY + deltaY,
    });
  };

  const onMouseUp = () => {
    dragData.current.dragging = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <img
      src={src}
      alt="page"
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        maxWidth: '200%',
        maxHeight: '200%',
        userSelect: 'none',
        cursor: 'grab',
      }}
      draggable={false}
    />
  );
}

export default App;

