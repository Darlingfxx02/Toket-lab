/// <reference types="@figma/plugin-typings" />

// This file uses the Figma Plugin API
// For type definitions, refer to https://www.figma.com/plugin-docs/typescript/

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 480 });

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

// Our custom interface to avoid conflicts with Figma's built-in types
interface CustomVariableData {
  id: string;
  name: string;
  resolvedType: string; // Using string to avoid type issues
  valuesByMode: Record<string, any>;
}

interface CollectionData {
  id: string;
  name: string;
  modes: Array<{id: string, name: string}>;
  variables: CustomVariableData[];
}

interface FullVariablesData {
  collections: CollectionData[];
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

// Function to get all variables data with full details
function getAllVariablesData(): FullVariablesData {
  const collectionsData: CollectionData[] = [];

  // Check if variables API is available
  if ('variables' in figma) {
    const localCollections = figma.variables.getLocalVariableCollections();
    
    localCollections.forEach((collection) => {
      const variables = figma.variables.getLocalVariables().filter(
        variable => variable.variableCollectionId === collection.id
      );
      
      const collectionModes = collection.modes.map(mode => ({
        id: mode.modeId,
        name: mode.name
      }));
      
      const variablesData: CustomVariableData[] = variables.map(variable => {
        const valuesByMode: Record<string, any> = {};
        
        // Get values for each mode
        collectionModes.forEach(mode => {
          try {
            const value = variable.valuesByMode[mode.id];
            // Convert complex values (like colors) to a readable format
            if (typeof value === 'object' && value !== null) {
              if ('r' in value && 'g' in value && 'b' in value) {
                // Format color values
                const rgba = value as RGBA; // Cast to RGBA
                valuesByMode[mode.name] = {
                  r: Math.round(rgba.r * 255),
                  g: Math.round(rgba.g * 255),
                  b: Math.round(rgba.b * 255),
                  a: rgba.a !== undefined ? rgba.a : 1
                };
              } else {
                valuesByMode[mode.name] = value;
              }
            } else {
              valuesByMode[mode.name] = value;
            }
          } catch (e) {
            valuesByMode[mode.name] = null;
          }
        });

        return {
          id: variable.id,
          name: variable.name,
          resolvedType: String(variable.resolvedType || "UNKNOWN"),
          valuesByMode
        };
      });
      
      collectionsData.push({
        id: collection.id,
        name: collection.name,
        modes: collectionModes,
        variables: variablesData
      });
    });
  }

  return {
    collections: collectionsData
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
  const variablesData = getAllVariablesData();
  const stylesCount = getAllStylesCount();
  
  const data = {
    variables: variablesData,
    stylesCount: stylesCount,
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
  const variablesData = getAllVariablesData();
  const stylesCount = getAllStylesCount();
  
  const data = {
    variables: variablesData,
    stylesCount: stylesCount,
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

// Function to export data directly to Toket website
async function exportDataToToketWebsite() {
  const variablesData = getAllVariablesData();
  const stylesCount = getAllStylesCount();
  
  const data = {
    variables: variablesData,
    stylesCount: stylesCount,
    timestamp: new Date().toISOString(),
    fileName: figma.root.name || 'Untitled',
  };

  try {
    // Show loading message
    figma.notify('Sending data to Toket website...');
    
    // Send data to UI for further processing
    figma.ui.postMessage({
      type: 'export-to-toket',
      data: JSON.stringify(data, null, 2)
    });
  } catch (error) {
    console.error('Error sending data to Toket website:', error);
    figma.notify('Error sending data to Toket website. Check console for details.');
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
  
  if (msg.type === 'export-to-toket') {
    exportDataToToketWebsite();
  }
  
  if (msg.type === 'close') {
    figma.closePlugin();
  }
}; 