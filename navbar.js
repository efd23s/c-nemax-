// CineStream+ Shared Navbar & Global Utilities

function renderNavbar(activePage = 'home') {
  const user = streamAuth ? streamAuth.getUser() : { isLoggedIn: false, name: 'Misafir', avatar: '' };
  const favCount = JSON.parse(localStorage.getItem('cinestream_favs') || '[]').length;

  const headerHtml = `
    <header class="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        <!-- Brand Logo & Back Button if not on home -->
        <div class="flex items-center gap-3 sm:gap-6">
          ${activePage !== 'home' ? `
            <button onclick="window.history.length > 1 ? window.history.back() : window.location.href='index.html'" 
                    class="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer" 
                    title="Geri Dön">
              <i class="fa-solid fa-arrow-left text-xs"></i>
              <span class="hidden sm:inline">Geri</span>
            </button>
          ` : ''}

          <!-- Custom 3D Metallic CineStream Pro Logo -->
          <a href="index.html" class="flex items-center gap-2 group py-1" title="CineStream Pro Ana Sayfa">
            <img src="logo.png" 
                 alt="CineStream Pro" 
                 class="h-11 sm:h-13 w-auto object-contain filter drop-shadow-[0_2px_14px_rgba(229,9,20,0.5)] group-hover:scale-105 transition duration-300" 
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120';" />
          </a>

          <!-- Desktop Navigation Links -->
          <nav class="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-300 ml-2">
            <a href="index.html" class="hover:text-white transition flex items-center gap-1.5 ${activePage === 'home' ? 'text-red-500 font-bold border-b-2 border-red-500 pb-1' : ''}">
              <i class="fa-solid fa-house text-xs"></i> Ana Sayfa
            </a>
            <a href="series.html" class="hover:text-white transition flex items-center gap-1.5 ${activePage === 'series' ? 'text-red-500 font-bold border-b-2 border-red-500 pb-1' : ''}">
              <i class="fa-solid fa-tv text-xs"></i> Diziler
            </a>
            <a href="movies.html" class="hover:text-white transition flex items-center gap-1.5 ${activePage === 'movies' ? 'text-red-500 font-bold border-b-2 border-red-500 pb-1' : ''}">
              <i class="fa-solid fa-film text-xs"></i> Filmler
            </a>
            <a href="categories.html" class="hover:text-white transition flex items-center gap-1.5 ${activePage === 'categories' ? 'text-red-500 font-bold border-b-2 border-red-500 pb-1' : ''}">
              <i class="fa-solid fa-layer-group text-xs"></i> Kategoriler
            </a>
            <a href="watchlist.html" class="hover:text-white transition flex items-center gap-1.5 ${activePage === 'watchlist' ? 'text-red-500 font-bold border-b-2 border-red-500 pb-1' : ''}">
              <i class="fa-solid fa-bookmark text-xs"></i> Listem
              <span id="nav-fav-badge" class="${favCount > 0 ? '' : 'hidden'} px-1.5 py-0.2 text-[10px] bg-red-600 text-white rounded-full">${favCount}</span>
            </a>
          </nav>
        </div>

        <!-- Search & User Profile Dropdown -->
        <div class="flex items-center gap-3">
          
          <!-- Universal Live Search -->
          <div class="relative w-36 sm:w-56 md:w-64">
            <div class="relative">
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input type="text" 
                     id="global-search-input" 
                     placeholder="Dizi veya film ara..." 
                     class="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/80 focus:bg-white/10 transition" />
              <button onclick="clearGlobalSearch()" id="global-search-clear" class="hidden absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Global Dropdown Results -->
            <div id="global-search-dropdown" class="hidden absolute left-0 right-0 top-full mt-2 bg-[#121721] border border-white/10 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50 glass">
            </div>
          </div>

          <!-- Watchlist Quick Icon -->
          <a href="watchlist.html" class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition relative" title="Favorilerim">
            <i class="fa-solid fa-heart text-sm text-red-500"></i>
          </a>

          <!-- User Profile & Auth Button -->
          <div class="relative" id="user-menu-container">
            ${user.isLoggedIn ? `
              <div onclick="toggleUserDropdown()" class="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition">
                <img src="${user.avatar}" class="w-8 h-8 rounded-lg object-cover border border-red-500" />
                <span class="text-xs font-bold text-gray-200 hidden md:inline truncate max-w-[90px]">${user.name.split(' ')[0]}</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-gray-400 mr-1"></i>
              </div>

              <!-- Dropdown Menu -->
              <div id="user-dropdown-menu" class="hidden absolute right-0 top-full mt-2 w-48 bg-[#121721] border border-white/10 rounded-xl shadow-2xl p-2 z-50 glass">
                <div class="px-3 py-2 border-b border-white/10 mb-1">
                  <p class="text-xs font-bold text-white truncate">${user.name}</p>
                  <p class="text-[10px] text-gray-400 truncate">${user.email}</p>
                </div>
                <a href="profile.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <i class="fa-solid fa-user-gear text-red-400 text-xs"></i> Profilim ve Ayarlar
                </a>
                <a href="watchlist.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <i class="fa-solid fa-bookmark text-yellow-400 text-xs"></i> İzleme Listem
                </a>
                <button onclick="streamAuth.logout()" class="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition mt-1 cursor-pointer">
                  <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i> Çıkış Yap
                </button>
              </div>
            ` : `
              <button onclick="streamAuth.openAuthModal()" class="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-red-600/40 cursor-pointer">
                <i class="fa-solid fa-user text-xs"></i> Giriş Yap
              </button>
            `}
          </div>

        </div>

      </div>

      <!-- Mobile Subnav Bar -->
      <div class="lg:hidden border-t border-white/5 bg-[#090c10]/95 px-4 py-2.5 flex items-center justify-around text-xs font-semibold text-gray-400">
        <a href="index.html" class="flex flex-col items-center gap-1 ${activePage === 'home' ? 'text-red-500 font-bold' : ''}">
          <i class="fa-solid fa-house"></i>
          <span>Ana Sayfa</span>
        </a>
        <a href="series.html" class="flex flex-col items-center gap-1 ${activePage === 'series' ? 'text-red-500 font-bold' : ''}">
          <i class="fa-solid fa-tv"></i>
          <span>Diziler</span>
        </a>
        <a href="movies.html" class="flex flex-col items-center gap-1 ${activePage === 'movies' ? 'text-red-500 font-bold' : ''}">
          <i class="fa-solid fa-film"></i>
          <span>Filmler</span>
        </a>
        <a href="categories.html" class="flex flex-col items-center gap-1 ${activePage === 'categories' ? 'text-red-500 font-bold' : ''}">
          <i class="fa-solid fa-layer-group"></i>
          <span>Kategoriler</span>
        </a>
        <a href="profile.html" class="flex flex-col items-center gap-1 ${activePage === 'profile' ? 'text-red-500 font-bold' : ''}">
          <i class="fa-solid fa-user"></i>
          <span>Profil</span>
        </a>
      </div>
    </header>
  `;

  const headerContainer = document.getElementById('navbar-container');
  if (headerContainer) {
    headerContainer.innerHTML = headerHtml;
    bindGlobalSearch();
  }
}

function toggleUserDropdown() {
  const menu = document.getElementById('user-dropdown-menu');
  if (menu) menu.classList.toggle('hidden');
}

// Close user menu on outside click
document.addEventListener('click', (e) => {
  const container = document.getElementById('user-menu-container');
  const menu = document.getElementById('user-dropdown-menu');
  if (container && menu && !container.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

// Universal Search
function bindGlobalSearch() {
  const searchInput = document.getElementById('global-search-input');
  const dropdown = document.getElementById('global-search-dropdown');
  const clearBtn = document.getElementById('global-search-clear');
  if (!searchInput || !dropdown) return;

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      dropdown.classList.add('hidden');
      if (clearBtn) clearBtn.classList.add('hidden');
      return;
    }

    if (clearBtn) clearBtn.classList.remove('hidden');

    const results = MEDIA_DATABASE.filter(m => 
      m.title.toLowerCase().includes(q) ||
      (m.turkishTitle && m.turkishTitle.toLowerCase().includes(q)) ||
      m.genres.some(g => g.toLowerCase().includes(q))
    );

    if (results.length > 0) {
      dropdown.innerHTML = results.map(item => `
        <a href="watch.html?id=${item.id}" class="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 transition block">
          <img src="${item.poster}" class="w-10 h-14 object-cover rounded" />
          <div class="flex-1 min-w-0">
            <h5 class="text-sm font-bold text-white truncate">${item.title}</h5>
            <p class="text-xs text-red-400 truncate">${item.turkishTitle || item.genres.join(', ')}</p>
            <span class="text-[10px] text-gray-400">${item.year} • ${item.type === 'movie' ? 'Film' : 'Dizi'}</span>
          </div>
          <span class="text-xs font-bold text-yellow-400 flex items-center gap-1">
            <i class="fa-solid fa-star text-[10px]"></i> ${item.rating}
          </span>
        </a>
      `).join('');
      dropdown.classList.remove('hidden');
    } else {
      dropdown.innerHTML = `
        <div class="p-4 text-center text-xs text-gray-400">
          "${q}" için eşleşen içerik bulunamadı.
        </div>
      `;
      dropdown.classList.remove('hidden');
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

function clearGlobalSearch() {
  const searchInput = document.getElementById('global-search-input');
  const dropdown = document.getElementById('global-search-dropdown');
  const clearBtn = document.getElementById('global-search-clear');
  if (searchInput) searchInput.value = '';
  if (dropdown) dropdown.classList.add('hidden');
  if (clearBtn) clearBtn.classList.add('hidden');
}

// Global Toast System
window.streamToast = function(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';

  let icon = 'fa-circle-info text-cyan-400';
  if (type === 'success') icon = 'fa-circle-check text-green-400';
  if (type === 'error') icon = 'fa-circle-xmark text-red-500';

  toast.innerHTML = `
    <i class="fa-solid ${icon} text-lg"></i>
    <span class="text-xs font-medium text-gray-200">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Global Favorite Toggle
window.toggleFavorite = function(mediaId) {
  let favs = JSON.parse(localStorage.getItem('cinestream_favs') || '[]');
  const idx = favs.indexOf(mediaId);
  const media = MEDIA_DATABASE.find(m => m.id === mediaId);
  const title = media ? media.title : 'İçerik';

  if (idx > -1) {
    favs.splice(idx, 1);
    window.streamToast(`"${title}" izleme listenizden çıkarıldı.`, 'info');
  } else {
    favs.push(mediaId);
    window.streamToast(`"${title}" izleme listenize eklendi!`, 'success');
  }

  localStorage.setItem('cinestream_favs', JSON.stringify(favs));
  
  const badge = document.getElementById('nav-fav-badge');
  if (badge) {
    badge.textContent = favs.length;
    badge.classList.toggle('hidden', favs.length === 0);
  }

  if (window.renderWatchlistPage) {
    window.renderWatchlistPage();
  }
};
