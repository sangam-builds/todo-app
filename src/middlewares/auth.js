import supabase from '../config/supabase.js';
import prisma from '../config/db.js';

// Middleware to parse and verify the Supabase JWT token from Authorization header or cookies
export const parseUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.['sb-access-token'];
  
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (cookieToken) {
    token = cookieToken;
  }

  req.user = null;

  if (token) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        // Sync user profile in PostgreSQL database to satisfy foreign keys
        let dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        });

        if (!dbUser) {
          // Check if there is an existing user with the same email (from old local auth system)
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          if (existingUser) {
            console.log(`Migrating user ID for ${user.email} from ${existingUser.id} to ${user.id}`);
            // Perform a raw database update to safely rewrite the primary key
            await prisma.$executeRaw`UPDATE "User" SET id = ${user.id} WHERE id = ${existingUser.id}`;
            
            dbUser = await prisma.user.findUnique({
              where: { id: user.id }
            });
          } else {
            // Create a brand new user
            dbUser = await prisma.user.create({
              data: {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.email.split('@')[0],
                picture: user.user_metadata?.avatar_url || null,
              }
            });
          }
        }
        req.user = dbUser;
      }
    } catch (error) {
      console.warn('Supabase authentication token verification failed:', error.message);
    }
  }
  next();
};

// Middleware to block unauthorized access on protected routes
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
};
