// src/components/VirtualizedProductGrid.jsx
import React, { useRef, useEffect, useState } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const VirtualizedProductGrid = ({ 
  products, 
  renderProduct, 
  columnWidth = 300,
  rowHeight = 450,
  gap = 16 
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Calcular columnas basado en ancho de pantalla
  const calculateColumns = (width) => {
    return Math.max(1, Math.floor(width / (columnWidth + gap)));
  };
  
  const columnCount = calculateColumns(dimensions.width);
  const rowCount = Math.ceil(products.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    
    if (index >= products.length) {
      return null;
    }
    
    const product = products[index];
    
    return (
      <div 
        style={{
          ...style,
          padding: gap / 2,
          boxSizing: 'border-box'
        }}
      >
        {renderProduct(product, index)}
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => {
        // Actualizar dimensiones cuando cambien
        if (width !== dimensions.width || height !== dimensions.height) {
          setDimensions({ width, height });
        }
        
        return (
          <Grid
            columnCount={columnCount}
            columnWidth={Math.floor(width / columnCount)}
            height={height}
            rowCount={rowCount}
            rowHeight={rowHeight}
            width={width}
            overscanRowCount={2}
            style={{
              overflowX: 'hidden'
            }}
          >
            {Cell}
          </Grid>
        );
      }}
    </AutoSizer>
  );
};

export default VirtualizedProductGrid;