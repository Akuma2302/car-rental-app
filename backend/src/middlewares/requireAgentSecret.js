const env = require('../config/env');

/**
 * Guards POST /api/agent/sweep. This endpoint is meant to be called by an
 * external cron service (e.g. cron-job.org), not a browser session, so it
 * can't use requireAdmin's JWT check — instead it checks a shared secret
 * sent as a header. See backend/README.md "AI Agent" section for how to
 * configure the cron job with this header.
 */
function requireAgentSecret(req, res, next) {
  if (!env.agentSweepSecret) {
    return res.status(503).json({ message: 'AGENT_SWEEP_SECRET is not configured on the server' });
  }
  const provided = req.headers['x-agent-secret'];
  if (provided !== env.agentSweepSecret) {
    return res.status(401).json({ message: 'Invalid or missing agent secret' });
  }
  return next();
}

module.exports = requireAgentSecret;
