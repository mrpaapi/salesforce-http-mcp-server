module.exports = (req, res, next) => {
    const key = req.headers['x-mcp-key'];
    if (key !== process.env.MCP_API_KEY) {
        return res.status(401).json({ error: 'Invalid API Key' });
    }
    next();
};
