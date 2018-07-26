import React, { Component } from "react";
import ReactDOM from "react-dom";
import Highlight from "react-highlight.js";
import Clipboard from "react-clipboard.js";
import convertData from "./convert-data";
import parseXML from "./xml-parser";
import formBuilderData from "./xml-test-data";
import "./styles.css";

const formatJSON = json => JSON.stringify(JSON.parse(json), null, "  ");

class App extends Component {
  state = {
    fbData: formBuilderData,
    formeoData: convertData(formBuilderData)
  };
  handleFormbuilderData = evt => {
    evt.persist();
    const value = evt.target.value;
    const formeoDataVal = /^<form-template>/.test(value)
      ? JSON.stringify(parseXML(value))
      : value;
    const formeoData = convertData(formatJSON(formeoDataVal));
    this.setState({ fbData: value, formeoData });
  };
  render() {
    const { fbData, formeoData } = this.state;
    return (
      <div className="App">
        <h1>Convert formBuilder to Formeo data structure</h1>
        <div className="data-wrap">
          <div className="form-builder-data">
            <h2>formBuilder Data</h2>
            <textarea onChange={this.handleFormbuilderData} value={fbData} />
          </div>
          <div className="formeo-data">
            <h2>
              Formeo Data
              <Clipboard data-clipboard-text={JSON.stringify(formeoData)}>
                copy to clipboard
              </Clipboard>
            </h2>

            <Highlight language="json">
              {JSON.stringify(formeoData, null, "  ")}
            </Highlight>
          </div>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
