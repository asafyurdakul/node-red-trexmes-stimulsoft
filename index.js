const { isArray } = require("util");

/**

Copyright 2023 Asaf Yurdakul and Mert Software & Electronic A.Ş, Bursa Turkiye.

Licensed under the GNU General Public License, Version 3.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.gnu.org/licenses/gpl-3.0.html

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

 **/
module.exports = function (RED) {
    "use strict";

    var fs = require("fs");
    var path = require("path");
    var Stimulsoft = require("stimulsoft-reports-js");

    function produceConnString(config) {
        return `Data Source=${config.server};Initial Catalog=${config.dbname};User Id=${config.username};Password=${config.password}`;
    }

    function produceReportObject(msg, node, config) {

        let params = msg.report;

        if (params !== undefined) {
            if(params.licenseKey === undefined || params.licenseKey === "") {
                node.error("Stimulsoft license key is not defined!!!");
                return null;
            }

            try {
                Stimulsoft.Base.StiLicense.Key = params.licenseKey;
            }
            catch (error) {
                node.error("Stimulsoft license key is not valid!!!");
                return null;
            }
            
            let report = Stimulsoft.Report.StiReport.createNewReport();
            report.load(params.reportXml);            

            let connectionString = produceConnString(config);            
            //node.warn(connectionString);

            if (report.dictionary.databases.list.length > 0) {
                report.dictionary.databases.list[0].connectionString = connectionString;
            }

            if (params.variables !== undefined) {                             
                var jsonParams = params.variables;

                if (typeof jsonParams == "object"){
                    for (const key in jsonParams) {
                        if (jsonParams.hasOwnProperty(key)) {
                            const element = jsonParams[key];
                            //node.warn(element);

                            for (let i = 0; i < report.dictionary.variables.list.length; i++) {
                                const variable = report.dictionary.variables.list[i];
                                //node.warn(variable._name);
                                if (variable._name === key) {
                                    variable.val = element;
                                }
                            }

                        }
                    }
                        
                }                    
            }

            sendDataToFrontEnd(node, report.dictionary.variables.list);

            return report;
        }
        else {
            return null;
        }

    }

    function exportHTML(report, msg, node) {
        report.renderAsync(() => {
            var htmlString = report.exportDocument(Stimulsoft.Report.StiExportFormat.Html);
            msg.payload = htmlString;
            node.send(msg);
        });
    }

    function exportPDF(report, msg, node) {
        report.renderAsync(() => {
            report.exportDocumentAsync((pdfData) => {        
                var buffer = Buffer.from(pdfData)
                msg.payload = buffer;
                node.send(msg);                
            },
            Stimulsoft.Report.StiExportFormat.Pdf);
        });
    }


    function sendDataToFrontEnd(node, variables) {
        var d = {
            id: node.id,
            message: produceStringMessage(variables)
        };
        node.warn(d);
        try {
            RED.comms.publish("stimulsoft-reports-message", d);
        }
        catch (e) {
            node.error("Error sending stimulsoft-reports data", d);
        }
    }


    function produceStringMessage(variableList) {
        let str = '';
        variableList.forEach(variable => {  
            str = str + variable._name + ": " + variable.val+'\n';            
        });        
        //node.warn(str);
        return str;
    }


    function StimulsoftRender(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", async function (msg) {

            let reportObject = produceReportObject(msg, node, config);
            if(reportObject !== null) {
                if(config.modefiletype == "0") {
                    exportHTML(reportObject, msg, node);
                }
                else {
                    exportPDF(reportObject, msg, node);              
                }                
            }

        });

    }
    RED.nodes.registerType("stimulsoft-render", StimulsoftRender);


}
