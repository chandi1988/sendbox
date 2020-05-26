import React, { Component } from "react";
import ReactDOM from "react-dom";

import FlatfileImporter from "flatfile-csv-importer";

import "./styles.css";

const LICENSE_KEY = "LICENSE_KEY_HERE";

FlatfileImporter.setVersion(2);

class App extends Component {
  constructor() {
    super();
    this.launch = this.launch.bind(this);
    this.importer = new FlatfileImporter(LICENSE_KEY, {
      fields: [
        {
          label: "Robot Name",
          key: "name",
          description: "The designation of the robot.",
          validators: [
            {
              validate: "required_without",
              fields: ["id", "shield-color"],
              error: "Must be present if no id or shield color"
            }
          ]
        },
        {
          label: "Shield Color",
          key: "shield-color",
          description: "Chromatic value",
          validators: [
            {
              validate: "regex_matches",
              regex: "^[a-zA-Z]+$",
              error: "No numbers or special characters allowed."
            }
          ]
        },
        {
          label: "Robot Helmet Style",
          key: "helmet-style"
        },
        {
          label: "Call Sign",
          key: "sign",
          alternates: ["nickname", "wave"],
          validators: [
            {
              validate: "regex_matches",
              regex: "^[a-zA-Z]{4}$",
              error:
                "Must be 4 characters exactly. Cannot contain number or special characters."
            },
            {
              validate: "required",
              error: "This is a required field"
            }
          ]
        },
        {
          label: "Robot ID Code",
          key: "id",
          description: "Digital identity",
          validators: [
            {
              validate: "regex_matches",
              regex: "^[0-9]*$",
              error: "Must conatin only numbers."
            },
            {
              validate: "required_without",
              fields: ["name"],
              error: "ID must be present if name is absent."
            }
          ]
        }
      ],
      type: "Robot",
      allowInvalidSubmit: true,
      managed: true,
      allowCustom: true,
      disableManualInput: false
    });
    this.state = {
      results: "Your raw output will appear here."
    };

    this.importer.registerRecordHook((record, index) => {
      let out = {};
      if (record.name.includes(" ")) {
        out.name = {
          value: record.name.replace(" ", "_"),
          info: [
            {
              message:
                "No spaces allowed. Replaced all spaces with underscores",
              level: "warning"
            }
          ]
        };
      }
      return out;
    });

    this.importer.setCustomer({
      userId: "19235",
      name: "John Doe"
    });
  }

  launch() {
    this.importer
      .requestDataFromUser()
      .then(results => {
        this.importer.displayLoader();
        setTimeout(() => {
          this.importer.displaySuccess("Success!");
          this.setState({
            results: JSON.stringify(results.validData, null, 2)
          });
        }, 1500);
      })
      .catch(function(error) {
        console.info(error || "window close");
      });
  }

  render() {
    return (
      <div className="App">
        {LICENSE_KEY ? null : (
          <div className="licenseAsk">
            Obtain your license key from the
            <a href="https://flatfile.io/app" target="_blank">
              Flatfile Dashboard &rarr;
            </a>
            <p>
              Once you've found it, set the <code>LICENSE_KEY</code> variable on
              Line 8 before continuing.
            </p>
          </div>
        )}
        <input
          type="button"
          id="launch"
          className={LICENSE_KEY ? null : "disabled"}
          value="Launch Importer"
          onClick={this.launch}
        />
        <div className="download">
          <a href="robots.csv" target="_blank" rel="noopener noreferrer">
            Download a sample csv file here
          </a>
        </div>
        <textarea id="raw_output" readOnly value={this.state.results} />
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
