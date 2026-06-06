const express = require('express');
const jsforce = require('jsforce');
const router = express.Router();

const oauth2 = new jsforce.OAuth2({
  clientId: process.env.SALESFORCE_CONSUMER_KEY,
  clientSecret: process.env.SALESFORCE_CONSUMER_SECRET,
  redirectUri: process.env.SALESFORCE_REDIRECT_URI
});

// @route   GET api/auth/login
// @desc    Redirect to Salesforce OAuth
router.get('/login', (req, res) => {
  const { environment } = req.query;
  console.log(`Login request received for environment: ${environment}`);
  
  const loginUrl = environment === 'Sandbox' ? 'https://test.salesforce.com' : 'https://login.salesforce.com';
  
  try {
    const authUrl = oauth2.getAuthorizationUrl({
      scope: 'api id web refresh_token',
      state: environment,
      loginUrl: loginUrl
    });
    
    console.log(`Redirecting to Salesforce: ${authUrl}`);
    res.redirect(authUrl);
  } catch (err) {
    console.error('Error generating auth URL:', err);
    res.status(500).json({ error: 'Failed to initialize Salesforce login' });
  }
});

// @route   GET api/auth/callback
// @desc    Salesforce OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state: environment } = req.query;
  const conn = new jsforce.Connection({ oauth2: oauth2 });

  try {
    const userInfo = await conn.authorize(code);
    
    // Get additional user and org info
    const user = await conn.sobject('User').retrieve(userInfo.id.split('/').pop());
    const org = await conn.sobject('Organization').retrieve(userInfo.organizationId);

    // In a real app, we'd create a JWT here. 
    // For this migration, we'll redirect back to the frontend with the info.
    const params = new URLSearchParams({
      access_token: conn.accessToken,
      instance_url: conn.instanceUrl,
      org_id: userInfo.organizationId,
      org_name: org.Name,
      username: user.Username,
      environment: environment
    });

    res.redirect(`http://localhost:5173/oauth-callback?${params.toString()}`);
  } catch (err) {
    console.error('OAuth Error:', err);
    res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(err.message)}`);
  }
});

module.exports = router;
