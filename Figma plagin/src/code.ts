/// <reference types="@figma/plugin-typings" />

// This file uses the Figma Plugin API
// For type definitions, refer to https://www.figma.com/plugin-docs/typescript/

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 400 });

interface VariablesCount {
  collections: Record<string, number>;
  total: number;
}

interface StylesCount {
  paint: number;
  text: number;
  effect: number;
  grid: number;
  total: number;
}

// When the plugin is launched, get variables and styles information
figma.ui.postMessage({
  type: 'init',
  variablesCount: getAllVariablesCount(),
  stylesCount: getAllStylesCount()
});

// Function to count all variables in the document
function getAllVariablesCount(): VariablesCount {
  let collections: Record<string, number> = {};
  let totalCount = 0;

  // Check if variables API is available
  if ('variables' in figma) {
    const localCollections = figma.variables.getLocalVariableCollections();
    
    localCollections.forEach((collection) => {
      // Get all variables in the document
      const variables = figma.variables.getLocalVariables().filter(
        variable => variable.variableCollectionId === collection.id
      );
      collections[collection.name] = variables.length;
      totalCount += variables.length;
    });
  }

  return {
    collections: collections,
    total: totalCount
  };
}

// Function to count all styles in the document
function getAllStylesCount(): StylesCount {
  const paintStyles = figma.getLocalPaintStyles().length;
  const textStyles = figma.getLocalTextStyles().length;
  const effectStyles = figma.getLocalEffectStyles().length;
  const gridStyles = figma.getLocalGridStyles().length;

  return {
    paint: paintStyles,
    text: textStyles,
    effect: effectStyles,
    grid: gridStyles,
    total: paintStyles + textStyles + effectStyles + gridStyles
  };
}

// Function to export data as a downloadable JSON file
function exportDataAsFile() {
  const variablesCount = getAllVariablesCount();
  const stylesCount = getAllStylesCount();
  
  const data = {
    variablesCount,
    stylesCount,
    timestamp: new Date().toISOString(),
    fileName: figma.root.name || 'Untitled',
  };
  
  // Convert data to JSON string
  const jsonString = JSON.stringify(data, null, 2);
  
  // Send to UI for download
  figma.ui.postMessage({
    type: 'export-data',
    data: jsonString
  });
  
  figma.notify('Data prepared for export. Click "Download" in the plugin UI.');
}

// Function to export data directly to desktop application
async function exportDataToDesktopApp() {
  const variablesCount = getAllVariablesCount();
  const stylesCount = getAllStylesCount();
  
  const data = {
    variablesCount,
    stylesCount,
    timestamp: new Date().toISOString(),
    fileName: figma.root.name || 'Untitled',
  };

  try {
    // Show loading message
    figma.notify('Sending data to desktop application...');
    
    // Send data to desktop application
    figma.ui.postMessage({
      type: 'export-to-desktop',
      data: JSON.stringify(data, null, 2)
    });
  } catch (error) {
    console.error('Error sending data to desktop app:', error);
    figma.notify('Error sending data to desktop application. Check console for details.');
  }
}

// Handle messages from the UI
figma.ui.onmessage = (msg: { type: string }) => {
  if (msg.type === 'refresh') {
    figma.ui.postMessage({
      type: 'update',
      variablesCount: getAllVariablesCount(),
      stylesCount: getAllStylesCount()
    });
  }
  
  if (msg.type === 'export') {
    exportDataAsFile();
  }
  
  if (msg.type === 'export-to-desktop') {
    exportDataToDesktopApp();
  }
  
  if (msg.type === 'close') {
    figma.closePlugin();
  }
}; 