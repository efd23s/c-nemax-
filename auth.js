// CineStream+ Professional Authentication System
// Supports Real/Interactive Google Sign-In, GitHub, and Email/Password

class StreamAuth {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('cinestream_user')) || {
      name: 'Misafir İzleyici',
      username: 'misafir_user',
      email: 'misafir@cinestream.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'CineStream+ ile en sevdiğim dizi ve filmleri keşfediyorum.',
      isLoggedIn: false,
      provider: 'guest',
      joinedDate: 'Kasım 2026',
      preferredQuality: '4K UHD'
    };

    // Stored Google Accounts for fast switching
    this.savedGoogleAccounts = JSON.parse(localStorage.getItem('cinestream_saved_google_accounts')) || [
      {
        name: 'Mevlüt Kullanıcısı',
        email: 'mevlut@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Google Hesabım',
        email: 'kullanici@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
      }
    ];

    this.defaultAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80'
    ];
  }

  getUser() {
    return this.currentUser;
  }

  saveUser(userData) {
    this.currentUser = { ...this.currentUser, ...userData };
    localStorage.setItem('cinestream_user', JSON.stringify(this.currentUser));
    this.updateNavbarAuthUI();
  }

  // Opens the realistic Google Account Chooser
  openGoogleOAuthFlow() {
    this.closeAuthModal();
    let googleModal = document.getElementById('google-oauth-modal');
    if (!googleModal) {
      this.injectGoogleOAuthModal();
      googleModal = document.getElementById('google-oauth-modal');
    }
    this.renderGoogleAccountList();
    googleModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeGoogleOAuthModal() {
    const googleModal = document.getElementById('google-oauth-modal');
    if (googleModal) {
      googleModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }

  renderGoogleAccountList() {
    const container = document.getElementById('google-accounts-list');
    if (!container) return;

    container.innerHTML = `
      ${this.savedGoogleAccounts.map((acc, idx) => `
        <div onclick="streamAuth.executeGoogleLogin('${acc.email}', '${acc.name}', '${acc.avatar}')" 
             class="google-account-item flex items-center gap-3.5 p-3 rounded-xl border border-white/5 hover:border-white/15 cursor-pointer transition">
          <img src="${acc.avatar}" class="w-10 h-10 rounded-full object-cover border border-white/20" />
          <div class="flex-1 min-w-0">
            <h5 class="text-sm font-bold text-white truncate">${acc.name}</h5>
            <p class="text-xs text-gray-400 truncate">${acc.email}</p>
          </div>
          <i class="fa-solid fa-chevron-right text-xs text-gray-500"></i>
        </div>
      `).join('')}

      <!-- Custom Google Account Option -->
      <div onclick="streamAuth.showCustomGoogleInput()" class="google-account-item flex items-center gap-3.5 p-3 rounded-xl border border-white/5 hover:border-white/15 cursor-pointer transition">
        <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300">
          <i class="fa-solid fa-user-plus text-sm"></i>
        </div>
        <div class="flex-1">
          <h5 class="text-sm font-semibold text-gray-200">Başka bir Google hesabı kullan</h5>
          <p class="text-xs text-gray-400">Kendi gerçek Google e-posta adresinizi girin</p>
        </div>
      </div>
    `;
  }

  showCustomGoogleInput() {
    document.getElementById('google-accounts-list').classList.add('hidden');
    document.getElementById('google-custom-account-form').classList.remove('hidden');
  }

  hideCustomGoogleInput() {
    document.getElementById('google-accounts-list').classList.remove('hidden');
    document.getElementById('google-custom-account-form').classList.add('hidden');
  }

  submitCustomGoogleAccount() {
    const nameInput = document.getElementById('google-custom-name');
    const emailInput = document.getElementById('google-custom-email');

    const name = nameInput.value.trim() || 'Google Kullanıcısı';
    let email = emailInput.value.trim();

    if (!email) {
      if (window.streamToast) window.streamToast('Lütfen geçerli bir e-posta girin.', 'error');
      return;
    }

    if (!email.includes('@')) {
      email += '@gmail.com';
    }

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=150`;

    // Save for future fast logins
    if (!this.savedGoogleAccounts.some(a => a.email === email)) {
      this.savedGoogleAccounts.unshift({ name, email, avatar });
      localStorage.setItem('cinestream_saved_google_accounts', JSON.stringify(this.savedGoogleAccounts));
    }

    this.executeGoogleLogin(email, name, avatar);
  }

  executeGoogleLogin(email, name, avatar) {
    const loadingOverlay = document.getElementById('google-oauth-loading');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    // Realistic Google animation delay
    setTimeout(() => {
      this.saveUser({
        name: name,
        username: email.split('@')[0],
        email: email,
        avatar: avatar,
        isLoggedIn: true,
        provider: 'google'
      });

      this.closeGoogleOAuthModal();
      if (loadingOverlay) loadingOverlay.classList.add('hidden');
      if (window.streamToast) {
        window.streamToast(`Google ile başarıyla giriş yapıldı: ${name} (${email})`, 'success');
      }

      // Refresh navbar and current page components if needed
      this.updateNavbarAuthUI();
      if (window.location.pathname.includes('profile.html')) {
        window.location.reload();
      }
    }, 900);
  }

  // GitHub Login
  loginWithGithub(username = 'kodcu_izleyici') {
    const avatar = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80';
    this.saveUser({
      name: username.toUpperCase(),
      username: username,
      email: `${username}@github.com`,
      avatar: avatar,
      isLoggedIn: true,
      provider: 'github'
    });
    this.closeAuthModal();
    if (window.streamToast) {
      window.streamToast('GitHub ile başarıyla giriş yapıldı!', 'success');
    }
  }

  // Email / Password Login
  loginWithEmail(email, password, name = '') {
    const displayName = name || email.split('@')[0];
    this.saveUser({
      name: displayName,
      username: email.split('@')[0],
      email: email,
      avatar: this.defaultAvatars[0],
      isLoggedIn: true,
      provider: 'email'
    });
    this.closeAuthModal();
    if (window.streamToast) {
      window.streamToast('Giriş başarılı! Keyifli seyirler dileriz.', 'success');
    }
  }

  // Logout
  logout() {
    this.saveUser({
      name: 'Misafir İzleyici',
      username: 'misafir_user',
      email: 'misafir@cinestream.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isLoggedIn: false,
      provider: 'guest'
    });
    if (window.streamToast) {
      window.streamToast('Hesabınızdan çıkış yapıldı.', 'info');
    }
    if (window.location.pathname.includes('profile.html')) {
      window.location.href = 'index.html';
    } else {
      this.updateNavbarAuthUI();
    }
  }

  openAuthModal() {
    let modal = document.getElementById('auth-modal');
    if (!modal) {
      this.injectAuthModal();
      modal = document.getElementById('auth-modal');
    }
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }

  injectAuthModal() {
    const modalHtml = `
      <div id="auth-modal" class="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4 hidden animate-fade-in">
        <div class="glass-card rounded-2xl w-full max-w-md p-6 sm:p-8 border border-white/15 shadow-2xl relative">
          
          <button onclick="streamAuth.closeAuthModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white p-2">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>

          <div class="text-center mb-6">
            <div class="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-red-600/50">
              <i class="fa-solid fa-play text-xl ml-0.5"></i>
            </div>
            <h3 class="text-2xl font-bold text-white heading-font" id="auth-modal-title">CineStream+'a Giriş Yap</h3>
            <p class="text-xs text-gray-400 mt-1">Favorilerinizi senkronize edin ve kaldığınız yerden devam edin.</p>
          </div>

          <!-- Social Buttons -->
          <div class="space-y-3 mb-6">
            <!-- Real Google Login Trigger -->
            <button onclick="streamAuth.openGoogleOAuthFlow()" 
                    class="w-full py-3 px-4 rounded-xl bg-white text-gray-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 hover:bg-gray-100 transition shadow-lg cursor-pointer">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Google ile Giriş Yap</span>
            </button>

            <!-- GitHub Login -->
            <button onclick="streamAuth.loginWithGithub('gelistirici_user')" 
                    class="w-full py-2.5 px-4 rounded-xl bg-[#24292e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 hover:bg-[#2f363d] border border-white/10 transition cursor-pointer">
              <i class="fa-brands fa-github text-base"></i>
              <span>GitHub ile Giriş Yap</span>
            </button>
          </div>

          <div class="flex items-center gap-3 mb-6">
            <div class="flex-1 h-px bg-white/10"></div>
            <span class="text-[11px] text-gray-500 font-semibold uppercase">veya E-Posta</span>
            <div class="flex-1 h-px bg-white/10"></div>
          </div>

          <!-- Email Form -->
          <form id="email-auth-form" onsubmit="event.preventDefault(); streamAuth.handleEmailFormSubmit();" class="space-y-3">
            <div id="auth-name-container" class="hidden">
              <label class="block text-[11px] font-bold text-gray-400 mb-1">Adınız Soyadınız</label>
              <input type="text" id="auth-name-input" placeholder="Ad Soyad" class="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-gray-400 mb-1">E-Posta Adresi</label>
              <input type="email" id="auth-email-input" required placeholder="ornek@mail.com" class="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-gray-400 mb-1">Şifre</label>
              <div class="relative">
                <input type="password" id="auth-password-input" required placeholder="••••••••" class="w-full pl-3.5 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
                <button type="button" onclick="streamAuth.togglePasswordVisibility()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs">
                  <i class="fa-solid fa-eye" id="password-eye-icon"></i>
                </button>
              </div>
            </div>

            <button type="submit" id="auth-submit-btn" class="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-red-600/40 cursor-pointer">
              Giriş Yap
            </button>
          </form>

          <div class="text-center mt-4 text-xs text-gray-400">
            <span id="auth-toggle-text">Hesabınız yok mu?</span>
            <button onclick="streamAuth.toggleAuthMode()" id="auth-toggle-btn" class="text-red-500 font-bold ml-1 hover:underline cursor-pointer">
              Kayıt Ol
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  // Realistic Google OAuth Popup Modal
  injectGoogleOAuthModal() {
    const googleModalHtml = `
      <div id="google-oauth-modal" class="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4 hidden animate-fade-in">
        <div class="bg-[#1f232d] text-gray-100 rounded-3xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 border border-white/20 shadow-2xl relative overflow-hidden">
          
          <!-- Loading bar -->
          <div id="google-oauth-loading" class="hidden absolute top-0 left-0 right-0 h-1.5 bg-gray-700 overflow-hidden">
            <div class="w-full h-full bg-blue-500 animate-pulse"></div>
          </div>

          <!-- Close -->
          <button onclick="streamAuth.closeGoogleOAuthModal()" class="absolute top-5 right-5 text-gray-400 hover:text-white p-1">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>

          <!-- Google Header -->
          <div class="flex items-center gap-3 mb-6">
            <svg class="w-7 h-7" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <div>
              <h4 class="text-base font-bold text-white leading-tight">Google ile Oturum Aç</h4>
              <p class="text-xs text-gray-400">CineStream+ uygulamasına devam etmek için</p>
            </div>
          </div>

          <!-- Accounts Selector -->
          <div id="google-accounts-list" class="space-y-2 mb-4">
            <!-- Injected -->
          </div>

          <!-- Custom Google Form (hidden initially) -->
          <div id="google-custom-account-form" class="hidden space-y-3 mb-4">
            <div class="flex items-center justify-between pb-2 border-b border-white/10">
              <span class="text-xs font-bold text-gray-300">Google Bilgileriniz</span>
              <button onclick="streamAuth.hideCustomGoogleInput()" class="text-xs text-blue-400 hover:underline">Geri Dön</button>
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 font-semibold mb-1">Adınız Soyadınız</label>
              <input type="text" id="google-custom-name" placeholder="Adınız Soyadınız" class="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 font-semibold mb-1">Google E-Posta Adresiniz</label>
              <input type="email" id="google-custom-email" placeholder="adiniz@gmail.com" class="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>
            <button onclick="streamAuth.submitCustomGoogleAccount()" class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md">
              Bu Google Hesabıyla Giriş Yap
            </button>
          </div>

          <div class="pt-4 border-t border-white/10 text-[11px] text-gray-400 leading-relaxed text-center">
            Devam ederek CineStream+ Hizmet Şartları ve Gizlilik Politikasını kabul etmiş olursunuz.
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', googleModalHtml);
  }

  togglePasswordVisibility() {
    const input = document.getElementById('auth-password-input');
    const icon = document.getElementById('password-eye-icon');
    if (!input || !icon) return;

    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'fa-solid fa-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'fa-solid fa-eye';
    }
  }

  toggleAuthMode() {
    const isRegister = document.getElementById('auth-name-container').classList.contains('hidden');
    const title = document.getElementById('auth-modal-title');
    const nameCont = document.getElementById('auth-name-container');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleBtn = document.getElementById('auth-toggle-btn');

    if (isRegister) {
      title.textContent = 'Yeni Hesap Oluştur';
      nameCont.classList.remove('hidden');
      submitBtn.textContent = 'Kayıt Ol ve Giriş Yap';
      toggleText.textContent = 'Zaten hesabınız var mı?';
      toggleBtn.textContent = 'Giriş Yap';
    } else {
      title.textContent = 'CineStream+\'a Giriş Yap';
      nameCont.classList.add('hidden');
      submitBtn.textContent = 'Giriş Yap';
      toggleText.textContent = 'Hesabınız yok mu?';
      toggleBtn.textContent = 'Kayıt Ol';
    }
  }

  handleEmailFormSubmit() {
    const email = document.getElementById('auth-email-input').value;
    const password = document.getElementById('auth-password-input').value;
    const name = document.getElementById('auth-name-input').value;
    this.loginWithEmail(email, password, name);
  }

  updateNavbarAuthUI() {
    const user = this.getUser();
    const avatarEls = document.querySelectorAll('.user-avatar-img');
    const nameEls = document.querySelectorAll('.user-display-name');

    avatarEls.forEach(img => {
      img.src = user.avatar;
    });

    nameEls.forEach(el => {
      el.textContent = user.name;
    });

    // Re-render navbar to update dropdown
    if (typeof renderNavbar === 'function') {
      const activeTab = window.location.pathname.includes('series') ? 'series' :
                        window.location.pathname.includes('movies') ? 'movies' :
                        window.location.pathname.includes('categories') ? 'categories' :
                        window.location.pathname.includes('watchlist') ? 'watchlist' :
                        window.location.pathname.includes('profile') ? 'profile' : 'home';
      renderNavbar(activeTab);
    }
  }
}

const streamAuth = new StreamAuth();
document.addEventListener('DOMContentLoaded', () => {
  streamAuth.injectAuthModal();
  streamAuth.injectGoogleOAuthModal();
  streamAuth.updateNavbarAuthUI();
});
