# node-red-trexmes-stimulsoft

This is a [Node-Red][1] package renders the "mrt" extension report files produced by the [Stimulsoft][2] reporting tool and allows them to be exported as Html or PDF. Only reports created with MSSql connection are supported in this version.

# Install

Run the following command in the root directory of your Node-RED install

    npm install node-red-trexmes-stimulsoft

# Usage
**MSSQL server connection settings**
First of all, the Mssql connection information to which the report file will connect and receive data must be entered in the node (server, database, username and password).

It is mandatory to pass "msg.report.licenseKey", "msg.report.reportXml" as payload to the node. Also, if the report content contains variables, they should be passed like "msg.report.variables.SampleVar".

**Export File Type :** This selection list determines the file type to be exported after rendering. These are Html or PDF.

# Requirements

The package currently requires [Node.js 18.16][1] or higher.

# Authors

[Asaf Yurdakul][3]

[1]:http://nodered.org
[2]:https://www.stimulsoft.com/en/
[3]:https://github.com/asafyurdakul

