import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

// Get dynamically configured OAuth client instance
const getOAuthClient = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
};

// @desc    Redirect to Google OAuth consent screen
// @route   GET /api/auth/google
// @access  Public
export const googleLogin = (req, res) => {
  try {
    const client = getOAuthClient();
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar'
      ],
      prompt: 'consent'
    });
    res.redirect(url);
  } catch (error) {
    console.error('Failed to initialize Google OAuth login:', error.message);
    res.status(500).json({ error: 'Failed to initialize login' });
  }
};

// @desc    Handle Google callback code exchange and session issuance
// @route   GET /api/auth/google/callback
// @access  Public
// export const googleCallback = async (req, res) => {
export const googleCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect('/app?error=no_auth_code_provided');
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    
    // Verify ID Token and extract user profile info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.redirect('/app?error=invalid_profile_payload');
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || payload.email.split('@')[0];
    const picture = payload.picture;
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    // 7. Add logging to debug OAuth data
    console.log({
      googleId,
      email,
      name,
      picture,
      accessToken,
      refreshToken,
    });

    // Upsert the user profile in PostgreSQL database
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        googleId,
        name,
        picture,
        accessToken,
        refreshToken: refreshToken || undefined,
      },
      create: {
        email,
        name,
        googleId,
        picture,
        accessToken,
        refreshToken,
      }
    });

    // Create session JWT token
    const secret = process.env.JWT_SECRET || 'placeholder-jwt-session-secret-key-32-chars-long';
    const sessionToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      },
      secret,
      { expiresIn: '7d' }
    );

    // Set JWT token as secure cookie
    res.cookie('token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Redirect user back to the main dashboard
    res.redirect('/app');
  } catch (error) {
    console.error('Google OAuth callback failed:', error.message);
    res.redirect('/app?error=authentication_failed');
  }
};

// @desc    Get current session status and logged-in user profile
// @route   GET /api/auth/me
// @access  Public
export const getCurrentUser = (req, res) => {
  if (req.user) {
    res.status(200).json({ authenticated: true, user: req.user });
  } else {
    res.status(200).json({ authenticated: false });
  }
};

// @desc    Clear session cookies and log out the user
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Successfully logged out' });
};
