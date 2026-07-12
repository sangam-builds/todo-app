// @desc    Get public Supabase configurations
// @route   GET /api/auth/config
// @access  Public
export const getAuthConfig = (req, res) => {
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || 'https://wzgcvnkupeomvkiazqsj.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  });
};
