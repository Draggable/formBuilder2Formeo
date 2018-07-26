# formBuilder2Formeo
*Utility for converting formBuilder template data to Formeo template data*

## Purpose
Formeo 1.0 is nearing release and with it will come features long requested for formBuilder such as conditional fields, columns/inline fields and repeated groups to name a few. The purpose of this project is to provide a migration solution to developers looking to upgrade from formBuilder to Formeo by converting formBuilder's incompatible templates to a structure comaptible with Formeo's.

In brief, this tool is a one-way conversion from formBuilder to Formeo. eg. `<formBuilderData />` --> `{ FormeoData }`

## Usage
This project provides the converter and a basic app to visualize the changes and help debug the converter's output. In `src/` you'll find `convert-data.js` which can be used directly for batch conversions and `xml-parser.js` if you're converting from XML formatted data.

To run the project:
```bash
$ yarn
$ yarn start
```
