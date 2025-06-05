# Salesforce HTTP MCP Server

A Model Context Protocol (MCP) server for Salesforce integration with LangChain.

## Features

- **Tool Manifest**: Exposes available tools via `/mcp` and `/sse`
- **Tool Execution**: Executes SOQL queries via `/mcp/tool`
- **Authentication**: API key protection
- **Rate Limiting**: Prevents abuse

## Setup

1. **Clone the repository**
git clone https://github.com/mrpaapi/salesforce-http-mcp-server.git
cd salesforce-http-mcp-server

2. **Install Dependencies**
npm install

3. **Configure environment Variables**
cp .env.example .env - Edit .env with your Salesforce credentials

4. **Start the Server**
npm start

##Usage

- **Get Tool Manifest**
curl http://localhost:3000/sse -H "Accept: text/event-stream"

- **Execute query**
curl -X POST http://localhost:3000/mcp/tool
-H "Content-Type: application/json"
-H "x-mcp-key: your-api-key"
-d '{"name":"salesforce_query","parameters":{"query":"SELECT Id FROM Account LIMIT 1"}}'
