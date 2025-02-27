/******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
  *****************************************************************************/

 const fs = require("fs");
const { exec } = require("child_process");

function readFile(fPath) {
    return new Promise((resolve, reject) => {
        fs.readFile(fPath, { "encoding": "utf8"}, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
}
(async function() {
    let retVal = await readFile("./build/index.html")

    /** Inject - all of this splitting due to odd special characters that trip up 
     * javascript index counting
    */
    let idx = retVal.indexOf("ACEREPORT=");
    let l = "ACEREPORT=".length;
    let split1 = retVal.substring(0, idx+l);
    let split2 = retVal.substring(idx+l+2);

    let jsxFile = `
// This file is automatically generated by the report-react build, which is
// run when the extension build is run
export function genReport(report : any) {
    let retVal = \`${encodeURIComponent(split1)}\`
    + encodeURIComponent(JSON.stringify(report))
    + \`${encodeURIComponent(split2)}\`;
    return decodeURIComponent(retVal);
}`

    fs.writeFileSync("./build/genReport.tsx", (jsxFile), { "encoding": "utf8" });
    console.log(`Package written as "./build/genReport.tsx"`);

    let jsFile = `
    // This file is automatically generated by the report-react build, which is
    // run when the extension build is run
    module.exports = {
        genReport: function(report) {
            let retVal = \`${encodeURIComponent(split1)}\`
            + encodeURIComponent(JSON.stringify(report))
            + \`${encodeURIComponent(split2)}\`;
            return decodeURIComponent(retVal);
        }
    }`
    
    fs.writeFileSync("./build/genReport.js", (jsFile), { "encoding": "utf8" });
    console.log(`Package written as "./build/genReport.js"`);
})()