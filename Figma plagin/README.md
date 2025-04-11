# Figma Variables & Styles Counter

A Figma plugin that counts all variables and styles in your current project and displays their total count.

## Features

- Counts all local variables in each collection
- Counts all local styles (color, text, effect, grid)
- Shows totals for each category
- Refresh button to update counts as you work
- Export data to desktop application for further analysis

## Installation

### Development

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. In Figma, go to Plugins > Development > Import plugin from manifest...
5. Select the `manifest.json` file from this repository

### Usage

1. In Figma, go to Plugins > Variables & Styles Counter
2. The plugin will show a window with counts of all variables and styles
3. Click "Refresh" to update the counts if you've made changes
4. Click "Export" to send the data to the desktop application (must be running)
5. Click "Close" to close the plugin

### Using with Desktop Application

1. First, start the desktop application by running `npm start` in the figma-variables-desktop directory
2. Make sure the desktop application is running on port 3000
3. In Figma, open the Variables & Styles Counter plugin
4. Click the "Export" button to send data to the desktop application
5. The desktop application will automatically update with the latest data

## Building for Production

To build the plugin for production:

```
npm run build
```

This will create the necessary files in the `dist` directory. 