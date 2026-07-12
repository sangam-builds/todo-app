/**
 * Authentication Modal Controller Script
 * Handles:
 * 1. Supabase Client initialization.
 * 2. Session verification check on page load.
 * 3. Click interception for '/app' triggers to present the popup modal.
 * 4. Local Login, Sign Up, and Google OAuth trigger via Supabase.
 * 5. Syncing Supabase access token in 'sb-access-token' cookie.
 */

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        let isAuthenticated = false;
        let isSignUpMode = false;
        let supabase;

        // Query Modal DOM Elements
        const modal = document.getElementById('auth-modal');
        const modalTitle = document.getElementById('auth-modal-title');
        const modalSubtitle = document.getElementById('auth-modal-subtitle');
        const authForm = document.getElementById('auth-form');
        const nameGroup = document.getElementById('name-group');
        const authName = document.getElementById('auth-name');
        const authEmail = document.getElementById('auth-email');
        const authPassword = document.getElementById('auth-password');
        const errorMsg = document.getElementById('auth-error-msg');
        const submitBtn = document.getElementById('auth-submit-btn');
        const toggleModeSpan = document.getElementById('toggle-auth-mode');
        const toggleTextNode = toggleModeSpan.parentElement;
        const closeBtn = document.getElementById('close-auth-modal');
        const googleBtn = document.getElementById('google-auth-btn');

        if (!modal) return;

        // 1. Fetch config and bootstrap Supabase client
        const initPromise = fetch('/api/auth/config')
            .then(res => res.json())
            .then(config => {
                // window.supabase is loaded from CDN
                supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);

                // Listen to auth changes and sync tokens to cookies for server-side page protection
                supabase.auth.onAuthStateChange((event, session) => {
                    if (session) {
                        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; secure`;
                        isAuthenticated = true;
                    } else {
                        document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
                        isAuthenticated = false;
                    }
                });

                return supabase;
            })
            .catch(err => {
                console.error('Failed to initialize Supabase client:', err);
            });

        // 2. Validate current session status on load
        initPromise.then(async (supabaseClient) => {
            if (!supabaseClient) return;
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                isAuthenticated = true;
            }
        });

        // 3. Intercept clicks to Dashboard/App endpoints
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a[href="/app"]');
            if (link) {
                if (isAuthenticated) {
                    // Bypass modal and proceed directly to dashboard
                    return;
                }
                e.preventDefault();
                openModal();
            }
        });

        // Modal Open / Close routines
        function openModal() {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Lock background scroll
            authEmail.focus();
        }

        function closeModal() {
            modal.classList.remove('open');
            document.body.style.overflow = ''; // Unlock scroll
            clearForm();
        }

        function clearForm() {
            authForm.reset();
            errorMsg.style.display = 'none';
            errorMsg.textContent = '';
        }

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Esc key closes modal
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });

        // Toggle between Login & Sign Up states inside the popup
        function updateModalUI() {
            clearForm();
            if (isSignUpMode) {
                modalTitle.textContent = 'Create account';
                modalSubtitle.textContent = 'Join TaskFlow and optimize your focus today';
                nameGroup.style.display = 'flex';
                authName.required = true;
                submitBtn.textContent = 'Sign Up';
                toggleTextNode.innerHTML = `Already have an account? <span id="toggle-auth-mode" style="color: var(--primary); font-weight: 700; cursor: pointer; text-decoration: underline;">Log in</span>`;
            } else {
                modalTitle.textContent = 'Welcome back';
                modalSubtitle.textContent = 'Log in to your TaskFlow account';
                nameGroup.style.display = 'none';
                authName.required = false;
                submitBtn.textContent = 'Log In';
                toggleTextNode.innerHTML = `Don't have an account? <span id="toggle-auth-mode" style="color: var(--primary); font-weight: 700; cursor: pointer; text-decoration: underline;">Sign up</span>`;
            }
            
            // Re-bind the click event listener to the newly generated span
            const newToggleSpan = document.getElementById('toggle-auth-mode');
            newToggleSpan.addEventListener('click', () => {
                isSignUpMode = !isSignUpMode;
                updateModalUI();
            });
        }

        // Initialize toggle listener
        toggleModeSpan.addEventListener('click', () => {
            isSignUpMode = !isSignUpMode;
            updateModalUI();
        });

        // 4. Handle email/password registration and authentication via Supabase
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = 'none';
            
            const email = authEmail.value.trim();
            const password = authPassword.value;
            const name = authName.value.trim();

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = isSignUpMode ? 'Creating account...' : 'Logging in...';

                await initPromise; // Wait for client initialization

                let authResult;
                if (isSignUpMode) {
                    authResult = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: { name }
                        }
                    });
                } else {
                    authResult = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });
                }

                if (authResult.error) {
                    throw authResult.error;
                }

                // If signing up and email verification is enabled by Supabase, session is null
                if (isSignUpMode && !authResult.data?.session) {
                    // Update feedback container to success styling
                    errorMsg.style.background = "rgba(16, 185, 129, 0.1)";
                    errorMsg.style.borderColor = "rgba(16, 185, 129, 0.2)";
                    errorMsg.style.color = "#10B981";
                    errorMsg.textContent = "Registration successful! A verification link has been sent to your email.";
                    errorMsg.style.display = 'block';

                    // Toggle to Login Mode after 4 seconds
                    setTimeout(() => {
                        isSignUpMode = false;
                        updateModalUI();
                        // Retain success banner in Login view
                        errorMsg.style.background = "rgba(16, 185, 129, 0.1)";
                        errorMsg.style.borderColor = "rgba(16, 185, 129, 0.2)";
                        errorMsg.style.color = "#10B981";
                        errorMsg.textContent = "Please verify your email via the confirmation link sent, then log in.";
                        errorMsg.style.display = 'block';
                    }, 4000);
                    return;
                }

                // Authentication Successful
                closeModal();
                
                // Redirect user to the /app todo dashboard
                window.location.href = '/app';
            } catch (err) {
                errorMsg.textContent = err.message;
                errorMsg.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = isSignUpMode ? 'Sign Up' : 'Log In';
            }
        });

        // 5. Google OAuth login triggers
        if (googleBtn) {
            googleBtn.addEventListener('click', async () => {
                try {
                    errorMsg.style.display = 'none';
                    await initPromise;
                    const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: window.location.origin + '/app',
                            scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
                            queryParams: {
                                access_type: 'offline',
                                prompt: 'consent'
                            }
                        }
                    });
                    if (error) throw error;
                } catch (err) {
                    errorMsg.textContent = err.message;
                    errorMsg.style.display = 'block';
                }
            });
        }
    });
})();
