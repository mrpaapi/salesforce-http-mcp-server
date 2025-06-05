require('dotenv').config();
const express = require('express');
const debug = require('debug')('mcp:salesforce');
const jsforce = require('jsforce');
const auth = require('./auth-middleware');
const rateLimit = require('./rate-limit');
const app = express();
const PORT = process.env.PORT || 3000;

// Salesforce Connection Setup
const conn = new jsforce.Connection({
    loginUrl: process.env.SF_LOGIN_URL,
    clientId: process.env.SF_CLIENT_ID,
    clientSecret: process.env.SF_CLIENT_SECRET
});

// Authentication Flow
conn.login(
    process.env.SF_USERNAME,
    process.env.SF_PASSWORD + process.env.SF_SECURITY_TOKEN,
    (err, userInfo) => {
        if (err) debug('Auth Error:', err);
        else debug(`Authenticated as ${userInfo.username}`);
    }
);

// MCP Tool Manifest
const manifest = {
    tools: [
        {
            name: "salesforce_query",
            description: "Execute SOQL queries",
            parameters: {
                query: {
                    type: "string",
                    description: "Valid SOQL statement",
                    example: "SELECT Id FROM Account LIMIT 5"
                }
            }
        }
    ]
};

// SSE Endpoint
app.get('/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.flushHeaders();

    // Send initial manifest
    res.write(`event: manifest\ndata: ${JSON.stringify(manifest)}\n\n`);

    // Heartbeat
    const heartbeat = setInterval(() => res.write(':ping\n'), 30000);
    req.on('close', () => clearInterval(heartbeat));
});

// Tool Execution Endpoint
app.use('/mcp/*', auth);
app.use('/mcp/tool', rateLimit);
app.post('/mcp/tool', express.json(), async (req, res) => {
    const { name, parameters } = req.body;

    try {
        if (name === 'salesforce_query') {
            const result = await conn.query(parameters.query);
            res.json({
                status: "success",
                records: result.records
            });
        }
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
});

app.listen(PORT, () => debug(`Server running on port ${PORT}`));
