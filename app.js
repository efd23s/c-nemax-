// CineStream+ Advanced Application Logic

class StreamApp {
  constructor() {
    this.mediaList = MEDIA_DATABASE;
    this.currentHeroIndex = 0;
    this.heroInterval = null;
    
    // State
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.currentMedia = null;
    this.currentSeasonNumber = 1;
    this.currentEpisodeNumber = 1;
    this.currentSourceIndex = 0;
    this.cinemaMode = false;

    // Local Storage Data
    this.favorites = JSON.parse(localStorage.getItem('cinestream_favs') || '[]');
    this.history = JSON.parse(localStorage.getItem('cinestream_history') || '[]');
    this.likes = JSON.parse(localStorage.getItem('cinestream_likes') || '{}');
    this.comments = JSON.parse(localStorage.getItem('cinestream_comments') || '{}');

    // Default comments for rich initial experience
    this.initDefaultComments();

    // DOM Elements
    this.initDOMElements();
    
    // Bind Event Listeners
    this.bindEvents();

    // Initialize UI
    this.renderHero(0);
    this.startHeroCarousel();
    this.renderCategoryChips();
    this.renderMediaSections();
    this.renderFavoritesCount();
  }

  initDOMElements() {
    this.heroContainer = document.getElementById('hero-section');
    this.contentGrid = document.getElementById('main-content-grid');
    this.continueWatchingSection = document.getElementById('continue-watching-section');
    this.continueWatchingGrid = document.getElementById('continue-watching-grid');
    this.categoryChipsContainer = document.getElementById('category-chips');
    this.searchInput = document.getElementById('search-input');
    this.searchResultsDropdown = document.getElementById('search-results-dropdown');
    
    // Player Modal Elements
    this.playerModal = document.getElementById('player-modal');
    this.modalIframeContainer = document.getElementById('modal-iframe-container');
    this.modalTitle = document.getElementById('modal-title');
    this.modalSubtitle = document.getElementById('modal-subtitle');
    this.modalBadgeYear = document.getElementById('modal-badge-year');
    this.modalBadgeQuality = document.getElementById('modal-badge-quality');
    this.modalBadgeAge = document.getElementById('modal-badge-age');
    this.modalSourceSelector = document.getElementById('modal-source-selector');
    this.modalSeasonTabs = document.getElementById('modal-season-tabs');
    this.modalEpisodesContainer = document.getElementById('modal-episodes-container');
    this.modalEpisodesList = document.getElementById('modal-episodes-list');
    this.modalSynopsis = document.getElementById('modal-synopsis');
    this.modalMetaDirector = document.getElementById('modal-meta-director');
    this.modalMetaWriters = document.getElementById('modal-meta-writers');
    this.modalMetaCast = document.getElementById('modal-meta-cast');
    this.modalMetaCountry = document.getElementById('modal-meta-country');
    this.modalMetaDuration = document.getElementById('modal-meta-duration');
    this.modalMetaGenres = document.getElementById('modal-meta-genres');
    this.modalStatsViews = document.getElementById('modal-stats-views');
    this.modalStatsLikes = document.getElementById('modal-stats-likes');
    this.modalBtnLike = document.getElementById('modal-btn-like');
    this.modalBtnFav = document.getElementById('modal-btn-fav');
    this.modalBtnShare = document.getElementById('modal-btn-share');
    this.modalBtnCinema = document.getElementById('modal-btn-cinema');
    this.modalBtnExternal = document.getElementById('modal-btn-external');
    this.modalCommentsList = document.getElementById('modal-comments-list');
    this.modalCommentForm = document.getElementById('modal-comment-form');
    this.modalPrevEpBtn = document.getElementById('modal-btn-prev-ep');
    this.modalNextEpBtn = document.getElementById('modal-btn-next-ep');
    
    // Toast Container
    this.toastContainer = document.getElementById('toast-container');
    this.favCounterBadge = document.getElementById('fav-count-badge');
  }

  initDefaultComments() {
    if (Object.keys(this.comments).length === 0) {
      this.comments = {
        'hellbound': [
          { user: "Ahmet K.", text: "Kore gerilim dizilerinin açık ara en iyilerinden. 2. Sezonun çıkması harika oldu!", date: "2 gün önce" },
          { user: "Selin Y.", text: "Konsept muazzam. İnsan psikolojisini ve dini fanatizmi çok sarsıcı işliyor.", date: "5 gün önce" }
        ],
        'badland-hunters': [
          { user: "Murat Ç.", text: "Ma Dong-seok (Don Lee) her zamanki gibi yumruklarını konuşturmuş! Türkçe dublaj seslendirmesi de gayet başarılı.", date: "1 gün önce" },
          { user: "Kaan D.", text: "Kıyamet sonrası atmosferi çok iyi yansıtmışlar. Aksiyon bir an bile düşmüyor.", date: "3 gün önce" }
        ],
        'dp': [
          { user: "Emre T.", text: "Askeri sistemin karanlık yüzünü bu kadar cesurca anlatan nadir başyapıtlardan.", date: "Dün" }
        ],
        'the-east-palace': [
          { user: "Zeynep B.", text: "Gizem ve korku unsurları saray entrikalarıyla mükemmel harmanlanmış.", date: "Bugün" }
        ]
      };
      localStorage.setItem('cinestream_comments', JSON.stringify(this.comments));
    }
  }

  bindEvents() {
    // Realtime search
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    // Close search dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!this.searchInput.contains(e.target) && !this.searchResultsDropdown.contains(e.target)) {
        this.searchResultsDropdown.classList.add('hidden');
      }
    });

    // Close Modal on ESC or overlay click
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.playerModal.classList.contains('hidden')) {
        this.closeModal();
      }
    });

    document.getElementById('modal-close-btn').addEventListener('click', () => {
      this.closeModal();
    });

    // Cinema Mode Toggle
    this.modalBtnCinema.addEventListener('click', () => {
      this.toggleCinemaMode();
    });

    // Like Button
    this.modalBtnLike.addEventListener('click', () => {
      this.toggleLike();
    });

    // Favorite Button in Modal
    this.modalBtnFav.addEventListener('click', () => {
      if (this.currentMedia) {
        this.toggleFavorite(this.currentMedia.id);
        this.updateModalFavBtn();
      }
    });

    // Share Button
    this.modalBtnShare.addEventListener('click', () => {
      this.shareCurrentMedia();
    });

    // Open External Link Button
    this.modalBtnExternal.addEventListener('click', () => {
      const srcUrl = this.getCurrentSourceUrl();
      if (srcUrl) {
        window.open(srcUrl, '_blank');
      }
    });

    // Previous / Next Episode buttons
    this.modalPrevEpBtn.addEventListener('click', () => this.navigateEpisode(-1));
    this.modalNextEpBtn.addEventListener('click', () => this.navigateEpisode(1));

    // Comment form submission
    this.modalCommentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCommentSubmit();
    });

    // Nav navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = link.getAttribute('data-filter');
        this.setFilter(filter);
        
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('text-red-500', 'font-bold'));
        link.classList.add('text-red-500', 'font-bold');
      });
    });
  }

  // Hero Section Logic
  renderHero(index) {
    const media = this.mediaList[index % this.mediaList.length];
    if (!media) return;

    this.currentHeroIndex = index;

    const isFav = this.favorites.includes(media.id);
    const badgesHtml = media.genres.map(g => `<span class="px-2.5 py-1 text-xs rounded-full bg-black/50 border border-white/20 text-gray-200 backdrop-blur-md">${g}</span>`).join(' ');

    this.heroContainer.innerHTML = `
      <div class="relative w-full h-[580px] lg:h-[680px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <!-- Hero Background Image -->
        <img src="${media.backdrop || media.poster}" 
             alt="${media.title}" 
             class="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition duration-1000 ease-out" />
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 hero-gradient"></div>

        <!-- Content Info -->
        <div class="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16 max-w-3xl z-10">
          <div class="flex items-center gap-3 mb-3">
            <span class="px-3 py-1 rounded bg-red-600 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-red-600/50">
              ${media.type === 'movie' ? 'Öne Çıkan Film' : 'Trend Dizi'}
            </span>
            <span class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-yellow-500/40 text-yellow-400 text-xs font-bold">
              <i class="fa-solid fa-star"></i> ${media.rating} IMDb
            </span>
            <span class="px-2.5 py-1 rounded bg-black/60 border border-white/20 text-gray-300 text-xs font-semibold">
              ${media.year}
            </span>
            <span class="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-xs text-gray-300">
              ${media.quality}
            </span>
          </div>

          <h1 class="text-3xl md:text-5xl lg:text-6xl font-black text-white heading-font tracking-tight drop-shadow-md mb-2">
            ${media.title}
          </h1>

          ${media.turkishTitle ? `<h2 class="text-lg md:text-xl text-red-400 font-semibold mb-3">${media.turkishTitle}</h2>` : ''}

          <div class="flex flex-wrap gap-2 mb-4">
            ${badgesHtml}
          </div>

          <p class="text-gray-300 text-sm md:text-base line-clamp-3 mb-6 max-w-2xl text-shadow leading-relaxed">
            ${media.synopsis}
          </p>

          <!-- Buttons -->
          <div class="flex flex-wrap items-center gap-3 md:gap-4">
            <button onclick="streamApp.openPlayer('${media.id}')" 
                    class="btn-primary-glow flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-white font-bold text-sm md:text-base cursor-pointer">
              <i class="fa-solid fa-play text-base"></i> Hemen İzle
            </button>
            
            ${media.trailerUrl ? `
              <button onclick="streamApp.openPlayer('${media.id}', 1, 1, 'trailer')" 
                      class="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-sm md:text-base backdrop-blur-md transition cursor-pointer">
                <i class="fa-solid fa-film"></i> Fragman
              </button>
            ` : ''}

            <button onclick="streamApp.toggleFavorite('${media.id}')" 
                    class="p-3.5 rounded-xl bg-black/50 hover:bg-black/70 border border-white/20 text-white transition cursor-pointer"
                    title="${isFav ? 'Listemden Çıkar' : 'Listeme Ekle'}">
              <i class="${isFav ? 'fa-solid text-red-500' : 'fa-regular'} fa-bookmark text-lg"></i>
            </button>

            <button onclick="streamApp.openPlayer('${media.id}')" 
                    class="p-3.5 rounded-xl bg-black/50 hover:bg-black/70 border border-white/20 text-white transition cursor-pointer"
                    title="Detaylı Bilgi">
              <i class="fa-solid fa-circle-info text-lg"></i>
            </button>
          </div>
        </div>

        <!-- Carousel Indicators -->
        <div class="absolute bottom-6 right-6 md:right-12 z-20 flex items-center gap-2">
          ${this.mediaList.map((m, i) => `
            <button onclick="streamApp.renderHero(${i}); streamApp.resetHeroTimer();" 
                    class="w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${i === index ? 'w-8 bg-red-600 shadow-md shadow-red-600/50' : 'bg-white/40 hover:bg-white/70'}">
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  startHeroCarousel() {
    this.heroInterval = setInterval(() => {
      this.currentHeroIndex = (this.currentHeroIndex + 1) % this.mediaList.length;
      this.renderHero(this.currentHeroIndex);
    }, 7000);
  }

  resetHeroTimer() {
    clearInterval(this.heroInterval);
    this.startHeroCarousel();
  }

  // Category Filtering Chips
  renderCategoryChips() {
    const categories = [
      { id: 'all', label: 'Tümü', icon: 'fa-layer-group' },
      { id: 'series', label: 'Diziler', icon: 'fa-tv' },
      { id: 'movie', label: 'Filmler', icon: 'fa-film' },
      { id: 'favorites', label: 'Favori Listem', icon: 'fa-bookmark' },
      { id: 'Aksiyon', label: 'Aksiyon', icon: 'fa-fire' },
      { id: 'Korku', label: 'Korku & Gerilim', icon: 'fa-ghost' },
      { id: 'Bilim-Kurgu', label: 'Bilim-Kurgu', icon: 'fa-robot' },
      { id: 'Dram', label: 'Dram', icon: 'fa-masks-theater' },
      { id: 'Tarihi', label: 'Tarihi & Doğaüstü', icon: 'fa-landmark' }
    ];

    this.categoryChipsContainer.innerHTML = categories.map(cat => `
      <button onclick="streamApp.setFilter('${cat.id}')" 
              class="filter-chip px-4 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 whitespace-nowrap text-gray-300 ${this.activeFilter === cat.id ? 'active' : ''}">
        <i class="fa-solid ${cat.icon}"></i> ${cat.label}
      </button>
    `).join('');
  }

  setFilter(filterId) {
    this.activeFilter = filterId;
    this.renderCategoryChips();
    this.renderMediaSections();
    
    // Smooth scroll to content
    const gridEl = document.getElementById('media-listing-container');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Render Main Media Cards
  renderMediaSections() {
    this.renderContinueWatching();

    let filtered = [...this.mediaList];

    if (this.activeFilter === 'series') {
      filtered = filtered.filter(m => m.type === 'series');
    } else if (this.activeFilter === 'movie') {
      filtered = filtered.filter(m => m.type === 'movie');
    } else if (this.activeFilter === 'favorites') {
      filtered = filtered.filter(m => this.favorites.includes(m.id));
    } else if (this.activeFilter !== 'all') {
      filtered = filtered.filter(m => m.genres.some(g => g.toLowerCase().includes(this.activeFilter.toLowerCase())));
    }

    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(q) || 
        (m.turkishTitle && m.turkishTitle.toLowerCase().includes(q)) ||
        (m.originalTitle && m.originalTitle.toLowerCase().includes(q)) ||
        m.genres.some(g => g.toLowerCase().includes(q)) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        m.synopsis.toLowerCase().includes(q)
      );
    }

    const titleEl = document.getElementById('section-title');
    if (titleEl) {
      if (this.activeFilter === 'favorites') {
        titleEl.innerHTML = `<i class="fa-solid fa-bookmark text-red-500 mr-2"></i> Favori Listem (${filtered.length})`;
      } else if (this.searchQuery) {
        titleEl.innerHTML = `<i class="fa-solid fa-search text-red-500 mr-2"></i> Arama Sonuçları: "${this.searchQuery}" (${filtered.length})`;
      } else {
        titleEl.innerHTML = `<i class="fa-solid fa-fire text-red-500 mr-2"></i> Keşfet ve İzle`;
      }
    }

    if (filtered.length === 0) {
      this.contentGrid.innerHTML = `
        <div class="col-span-full py-16 text-center text-gray-400">
          <i class="fa-regular fa-folder-open text-5xl mb-4 text-gray-600"></i>
          <p class="text-lg font-medium text-gray-300">Bu kategoride veya aramada henüz içerik bulunamadı.</p>
          <button onclick="streamApp.setFilter('all'); streamApp.clearSearch();" class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition">
            Tüm İçerikleri Göster
          </button>
        </div>
      `;
      return;
    }

    this.contentGrid.innerHTML = filtered.map(item => this.createMediaCardHTML(item)).join('');
  }

  createMediaCardHTML(item) {
    const isFav = this.favorites.includes(item.id);
    const totalSeasons = item.seasons ? item.seasons.length : null;
    const episodesCount = item.seasons ? item.seasons.reduce((acc, s) => acc + s.episodes.length, 0) : null;

    return `
      <div class="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between border border-white/5 relative">
        <!-- Poster & Badges Container -->
        <div class="relative aspect-[2/3] overflow-hidden bg-gray-900 cursor-pointer" onclick="streamApp.openPlayer('${item.id}')">
          <img src="${item.poster}" 
               alt="${item.title}" 
               class="w-full h-full object-cover transform group-hover:scale-108 transition duration-500 ease-out" 
               loading="lazy" 
               onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop'" />

          <!-- Hover Overlay with Play Button -->
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center backdrop-blur-xs">
            <div class="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition duration-300 shadow-xl shadow-red-600/50">
              <i class="fa-solid fa-play text-xl ml-1"></i>
            </div>
          </div>

          <!-- Top Badges -->
          <div class="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${item.type === 'movie' ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'} shadow-md">
              ${item.type === 'movie' ? 'FİLM' : `${totalSeasons} SEZON`}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 backdrop-blur-md border border-white/10 text-gray-200">
              ${item.quality}
            </span>
          </div>

          <!-- Rating Badge -->
          <div class="absolute top-2.5 right-2.5 z-10">
            <span class="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-black/80 backdrop-blur-md border border-yellow-500/40 text-yellow-400">
              <i class="fa-solid fa-star text-[10px]"></i> ${item.rating}
            </span>
          </div>

          <!-- Bookmark Quick Button -->
          <button onclick="event.stopPropagation(); streamApp.toggleFavorite('${item.id}');" 
                  class="absolute bottom-2.5 right-2.5 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black border border-white/20 text-white flex items-center justify-center transition shadow-lg"
                  title="${isFav ? 'Listemden Çıkar' : 'Listeme Ekle'}">
            <i class="${isFav ? 'fa-solid text-red-500' : 'fa-regular text-gray-300'} fa-bookmark text-sm"></i>
          </button>
        </div>

        <!-- Info Body -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>${item.year}</span>
              <span>${item.type === 'movie' ? item.duration : `${episodesCount} Bölüm`}</span>
            </div>

            <h3 class="text-base font-bold text-white group-hover:text-red-400 transition cursor-pointer truncate" onclick="streamApp.openPlayer('${item.id}')">
              ${item.title}
            </h3>

            ${item.turkishTitle ? `
              <p class="text-xs text-red-300/80 font-medium truncate mb-2">${item.turkishTitle}</p>
            ` : ''}

            <p class="text-xs text-gray-400 line-clamp-2 mt-1 mb-3">
              ${item.synopsis}
            </p>
          </div>

          <!-- Bottom Tags -->
          <div class="pt-2 border-t border-white/5 flex items-center justify-between">
            <div class="flex flex-wrap gap-1 max-w-[70%] overflow-hidden">
              ${item.genres.slice(0, 2).map(g => `<span class="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">${g}</span>`).join('')}
            </div>
            
            <button onclick="streamApp.openPlayer('${item.id}')" class="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1 cursor-pointer">
              İzle <i class="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Continue Watching Section (LocalStorage based)
  renderContinueWatching() {
    if (!this.continueWatchingSection || !this.continueWatchingGrid) return;

    if (this.history.length === 0) {
      this.continueWatchingSection.classList.add('hidden');
      return;
    }

    this.continueWatchingSection.classList.remove('hidden');
    this.continueWatchingGrid.innerHTML = this.history.slice(0, 4).map(item => {
      const media = this.mediaList.find(m => m.id === item.id);
      if (!media) return '';

      return `
        <div class="glass-card rounded-xl overflow-hidden flex items-center gap-3 p-2.5 border border-white/10 group cursor-pointer hover:border-red-500/50"
             onclick="streamApp.openPlayer('${media.id}', ${item.seasonNumber || 1}, ${item.episodeNumber || 1}, '${item.sourceType || 0}')">
          <div class="w-20 h-14 rounded-lg overflow-hidden relative flex-shrink-0 bg-gray-900">
            <img src="${media.backdrop || media.poster}" class="w-full h-full object-cover group-hover:scale-105 transition" />
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <i class="fa-solid fa-play text-xs text-white"></i>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold text-white truncate">${media.title}</h4>
            <p class="text-xs text-red-400 truncate">${item.detailText || 'İzleniyor'}</p>
            <p class="text-[10px] text-gray-500">${item.watchedAt || 'Az önce'}</p>
          </div>
          <button onclick="event.stopPropagation(); streamApp.removeFromHistory('${item.id}');" class="text-gray-500 hover:text-red-500 p-2" title="Kaldır">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  addToHistory(media, seasonNum, epNum, sourceInfo) {
    let detailText = '';
    if (media.type === 'movie') {
      detailText = sourceInfo ? sourceInfo.name : 'Film';
    } else {
      detailText = `${seasonNum}. Sezon ${epNum}. Bölüm`;
    }

    this.history = this.history.filter(h => h.id !== media.id);
    this.history.unshift({
      id: media.id,
      seasonNumber: seasonNum,
      episodeNumber: epNum,
      sourceType: sourceInfo ? sourceInfo.type : 0,
      detailText: detailText,
      watchedAt: 'Az önce'
    });

    if (this.history.length > 8) this.history.pop();
    localStorage.setItem('cinestream_history', JSON.stringify(this.history));
    this.renderContinueWatching();
  }

  removeFromHistory(mediaId) {
    this.history = this.history.filter(h => h.id !== mediaId);
    localStorage.setItem('cinestream_history', JSON.stringify(this.history));
    this.renderContinueWatching();
    this.showToast('İzleme geçmişinden kaldırıldı.', 'info');
  }

  // Realtime Search
  handleSearch(query) {
    this.searchQuery = query;
    if (query.trim().length === 0) {
      this.searchResultsDropdown.classList.add('hidden');
      this.renderMediaSections();
      return;
    }

    const q = query.toLowerCase();
    const results = this.mediaList.filter(m => 
      m.title.toLowerCase().includes(q) || 
      (m.turkishTitle && m.turkishTitle.toLowerCase().includes(q)) ||
      m.genres.some(g => g.toLowerCase().includes(q))
    );

    if (results.length > 0) {
      this.searchResultsDropdown.innerHTML = results.map(item => `
        <div class="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 transition"
             onclick="streamApp.openPlayer('${item.id}'); document.getElementById('search-results-dropdown').classList.add('hidden');">
          <img src="${item.poster}" class="w-10 h-14 object-cover rounded" />
          <div class="flex-1 min-w-0">
            <h5 class="text-sm font-bold text-white truncate">${item.title}</h5>
            <p class="text-xs text-red-400 truncate">${item.turkishTitle || item.genres.join(', ')}</p>
            <span class="text-[10px] text-gray-400">${item.year} • ${item.type === 'movie' ? 'Film' : 'Dizi'}</span>
          </div>
          <span class="text-xs font-bold text-yellow-400 flex items-center gap-1">
            <i class="fa-solid fa-star text-[10px]"></i> ${item.rating}
          </span>
        </div>
      `).join('');
      this.searchResultsDropdown.classList.remove('hidden');
    } else {
      this.searchResultsDropdown.innerHTML = `
        <div class="p-4 text-center text-xs text-gray-400">
          "${query}" için eşleşen sonuç bulunamadı.
        </div>
      `;
      this.searchResultsDropdown.classList.remove('hidden');
    }

    this.renderMediaSections();
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchInput.value = '';
    this.searchResultsDropdown.classList.add('hidden');
    this.renderMediaSections();
  }

  // Player & Detail Modal
  openPlayer(mediaId, seasonNum = 1, epNum = 1, sourceKey = 0) {
    const media = this.mediaList.find(m => m.id === mediaId);
    if (!media) return;

    this.currentMedia = media;
    this.currentSeasonNumber = seasonNum;
    this.currentEpisodeNumber = epNum;

    // Reset cinema mode
    this.cinemaMode = false;
    document.body.classList.remove('cinema-mode');

    // Populate Metadata
    this.modalTitle.textContent = media.title;
    this.modalSubtitle.textContent = media.turkishTitle || media.originalTitle || '';
    this.modalBadgeYear.textContent = media.year;
    this.modalBadgeQuality.textContent = media.quality;
    this.modalBadgeAge.textContent = media.ageRating;
    this.modalSynopsis.textContent = media.synopsis;

    this.modalMetaDirector.textContent = media.director || 'Belirtilmedi';
    this.modalMetaWriters.textContent = media.writers ? media.writers.join(', ') : 'Belirtilmedi';
    this.modalMetaCast.textContent = media.cast ? media.cast.join(', ') : 'Kadro bilgisi mevcut değil';
    this.modalMetaCountry.textContent = media.country || 'Belirtilmedi';
    this.modalMetaDuration.textContent = media.type === 'movie' ? media.duration : `${media.seasons ? media.seasons.length : 1} Sezon`;
    this.modalMetaGenres.textContent = media.genres.join(', ');

    // Stats
    const currentLikes = this.likes[media.id] !== undefined ? this.likes[media.id] : (media.likes || 120);
    this.modalStatsViews.textContent = media.views || '12.450';
    this.modalStatsLikes.textContent = currentLikes;

    this.updateModalFavBtn();

    // Render Sources & Episodes
    if (media.type === 'movie') {
      this.modalEpisodesContainer.classList.add('hidden');
      this.renderMovieSources(sourceKey);
    } else {
      this.modalEpisodesContainer.classList.remove('hidden');
      this.renderSeasonTabs();
      this.renderEpisodesList();
      this.renderSeriesSources(sourceKey);
    }

    // Load active video into iframe
    this.updateVideoPlayer();

    // Render Comments
    this.renderComments();

    // Show Modal
    this.playerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Smooth scroll top inside modal
    const modalContent = document.getElementById('modal-content-scroll');
    if (modalContent) modalContent.scrollTop = 0;
  }

  closeModal() {
    this.playerModal.classList.add('hidden');
    this.modalIframeContainer.innerHTML = ''; // Stop video playback
    document.body.style.overflow = 'auto';
    document.body.classList.remove('cinema-mode');
  }

  // Render Movie Sources (Dublaj / Altyazı / Fragman)
  renderMovieSources(activeKey = 0) {
    const sources = this.currentMedia.sources || [];
    let activeIdx = 0;

    if (activeKey === 'trailer') {
      activeIdx = sources.findIndex(s => s.type === 'fragman');
      if (activeIdx === -1) activeIdx = 0;
    } else if (typeof activeKey === 'number') {
      activeIdx = activeKey;
    }

    this.currentSourceIndex = activeIdx;

    this.modalSourceSelector.innerHTML = `
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs text-gray-400 font-bold mr-1"><i class="fa-solid fa-sliders text-red-500 mr-1"></i> Yayın Kaynağı:</span>
        ${sources.map((src, idx) => `
          <button onclick="streamApp.switchSource(${idx})" 
                  class="source-pill px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 ${idx === activeIdx ? 'active' : 'bg-white/5 hover:bg-white/15 text-gray-300'}">
            <i class="fa-solid ${src.type === 'dublaj' ? 'fa-microphone' : src.type === 'altyazi' ? 'fa-closed-captioning' : 'fa-film'} mr-1.5"></i>
            ${src.name}
          </button>
        `).join('')}
      </div>
    `;
  }

  // Render Series Sources (Kaynak 1, Kaynak 2 vs.)
  renderSeriesSources(activeIdx = 0) {
    const season = this.currentMedia.seasons.find(s => s.seasonNumber === this.currentSeasonNumber);
    const episode = season ? season.episodes.find(e => e.episodeNumber === this.currentEpisodeNumber) : null;

    if (!episode || !episode.sources || episode.sources.length === 0) {
      this.modalSourceSelector.innerHTML = '';
      return;
    }

    this.currentSourceIndex = typeof activeIdx === 'number' ? activeIdx : 0;

    this.modalSourceSelector.innerHTML = `
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs text-gray-400 font-bold mr-1"><i class="fa-solid fa-server text-cyan-400 mr-1"></i> Sunucu / Kaynak:</span>
        ${episode.sources.map((src, idx) => `
          <button onclick="streamApp.switchSource(${idx})" 
                  class="source-pill px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 ${idx === this.currentSourceIndex ? 'active' : 'bg-white/5 hover:bg-white/15 text-gray-300'}">
            <i class="fa-solid fa-play-circle mr-1"></i> ${src.name}
          </button>
        `).join('')}
      </div>
    `;
  }

  // Render Season Tabs
  renderSeasonTabs() {
    const seasons = this.currentMedia.seasons || [];
    this.modalSeasonTabs.innerHTML = seasons.map(s => `
      <button onclick="streamApp.selectSeason(${s.seasonNumber})" 
              class="tab-btn px-4 py-2 rounded-xl text-xs font-bold border border-white/10 ${s.seasonNumber === this.currentSeasonNumber ? 'active' : 'bg-white/5 hover:bg-white/10 text-gray-300'}">
        <i class="fa-solid fa-layer-group mr-1.5"></i> ${s.title}
      </button>
    `).join('');
  }

  selectSeason(seasonNum) {
    this.currentSeasonNumber = seasonNum;
    this.currentEpisodeNumber = 1;
    this.currentSourceIndex = 0;
    this.renderSeasonTabs();
    this.renderEpisodesList();
    this.renderSeriesSources(0);
    this.updateVideoPlayer();
  }

  // Render Episodes List
  renderEpisodesList() {
    const season = this.currentMedia.seasons.find(s => s.seasonNumber === this.currentSeasonNumber);
    if (!season) return;

    this.modalEpisodesList.innerHTML = season.episodes.map(ep => {
      const isCurrent = ep.episodeNumber === this.currentEpisodeNumber;
      return `
        <div onclick="streamApp.selectEpisode(${ep.episodeNumber})" 
             class="episode-card p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between cursor-pointer mb-2 ${isCurrent ? 'active' : ''}">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isCurrent ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-400'}">
              ${ep.episodeNumber}
            </div>
            <div>
              <h5 class="text-xs font-bold ${isCurrent ? 'text-red-400' : 'text-gray-200'}">
                ${ep.title}
              </h5>
              <p class="text-[11px] text-gray-400 line-clamp-1">${ep.overview || ''}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-500 font-semibold">${ep.duration || '45 dk'}</span>
            ${isCurrent ? '<span class="text-xs text-red-500 animate-pulse"><i class="fa-solid fa-volume-high"></i></span>' : ''}
          </div>
        </div>
      `;
    }).join('');

    // Update navigation buttons status
    const totalEps = season.episodes.length;
    this.modalPrevEpBtn.disabled = this.currentEpisodeNumber <= 1;
    this.modalNextEpBtn.disabled = this.currentEpisodeNumber >= totalEps;
    this.modalPrevEpBtn.classList.toggle('opacity-40', this.currentEpisodeNumber <= 1);
    this.modalNextEpBtn.classList.toggle('opacity-40', this.currentEpisodeNumber >= totalEps);
  }

  selectEpisode(epNum) {
    this.currentEpisodeNumber = epNum;
    this.currentSourceIndex = 0;
    this.renderEpisodesList();
    this.renderSeriesSources(0);
    this.updateVideoPlayer();
  }

  navigateEpisode(delta) {
    const season = this.currentMedia.seasons.find(s => s.seasonNumber === this.currentSeasonNumber);
    if (!season) return;

    const newEpNum = this.currentEpisodeNumber + delta;
    if (newEpNum >= 1 && newEpNum <= season.episodes.length) {
      this.selectEpisode(newEpNum);
    }
  }

  switchSource(sourceIndex) {
    this.currentSourceIndex = sourceIndex;
    if (this.currentMedia.type === 'movie') {
      this.renderMovieSources(sourceIndex);
    } else {
      this.renderSeriesSources(sourceIndex);
    }
    this.updateVideoPlayer();
  }

  getCurrentSourceUrl() {
    if (!this.currentMedia) return '';

    if (this.currentMedia.type === 'movie') {
      const src = this.currentMedia.sources[this.currentSourceIndex] || this.currentMedia.sources[0];
      return src ? src.url : '';
    } else {
      const season = this.currentMedia.seasons.find(s => s.seasonNumber === this.currentSeasonNumber);
      if (!season) return '';
      const episode = season.episodes.find(e => e.episodeNumber === this.currentEpisodeNumber);
      if (!episode || !episode.sources) return '';
      const src = episode.sources[this.currentSourceIndex] || episode.sources[0];
      return src ? src.url : '';
    }
  }

  // Embed Player Updater
  updateVideoPlayer() {
    const url = this.getCurrentSourceUrl();
    if (!url) {
      this.modalIframeContainer.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
          <i class="fa-solid fa-triangle-exclamation text-4xl text-yellow-500 mb-2"></i>
          <p class="font-semibold">Bu bölüm için aktif yayın kaynağı bulunamadı.</p>
        </div>
      `;
      return;
    }

    // Check if it's an image placeholder (like The East Palace Ep 1 url)
    const isImage = url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.jpeg') || (this.currentMedia.id === 'the-east-palace' && this.currentEpisodeNumber === 1);

    if (isImage) {
      this.modalIframeContainer.innerHTML = `
        <div class="relative w-full h-full flex flex-col items-center justify-center bg-gray-950 p-6 text-center">
          <img src="${url}" class="max-h-72 object-contain rounded-xl shadow-2xl mb-4 border border-white/10" />
          <h4 class="text-white font-bold text-lg mb-1">Bölüm Tanıtım & Sunucu Bağlantısı</h4>
          <p class="text-xs text-gray-400 max-w-md mb-4">Bu bölümün video kaynağı harici sunucu görsel yönlendirmesi içermektedir. Yayını açmak için aşağıdaki butonu kullanabilirsiniz.</p>
          <a href="${url}" target="_blank" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Kaynağı Yeni Sekmede Aç
          </a>
        </div>
      `;
      return;
    }

    // Standard Iframe Player with robust allow policies
    this.modalIframeContainer.innerHTML = `
      <iframe src="${url}" 
              class="w-full h-full border-0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen 
              loading="lazy">
      </iframe>
    `;

    // Record to watch history
    let activeSrcObj = null;
    if (this.currentMedia.type === 'movie') {
      activeSrcObj = this.currentMedia.sources[this.currentSourceIndex];
    }
    this.addToHistory(this.currentMedia, this.currentSeasonNumber, this.currentEpisodeNumber, activeSrcObj);
  }

  // Interactive Cinema Mode
  toggleCinemaMode() {
    this.cinemaMode = !this.cinemaMode;
    document.body.classList.toggle('cinema-mode', this.cinemaMode);
    
    if (this.cinemaMode) {
      this.modalBtnCinema.innerHTML = '<i class="fa-solid fa-lightbulb text-yellow-400"></i> Işıkları Aç';
      this.showToast('Sinema Modu Aktif: Işıklar kısıldı.', 'info');
    } else {
      this.modalBtnCinema.innerHTML = '<i class="fa-regular fa-lightbulb"></i> Işıkları Kapat';
    }
  }

  // Likes Feature
  toggleLike() {
    if (!this.currentMedia) return;
    const id = this.currentMedia.id;
    const currentCount = this.likes[id] !== undefined ? this.likes[id] : (this.currentMedia.likes || 120);

    const hasLikedKey = `cinestream_has_liked_${id}`;
    const hasLiked = localStorage.getItem(hasLikedKey) === 'true';

    if (hasLiked) {
      this.likes[id] = Math.max(0, currentCount - 1);
      localStorage.setItem(hasLikedKey, 'false');
      this.showToast('Beğeni geri alındı.', 'info');
    } else {
      this.likes[id] = currentCount + 1;
      localStorage.setItem(hasLikedKey, 'true');
      this.showToast('Beğeniniz kaydedildi! Teşekkürler.', 'success');
    }

    localStorage.setItem('cinestream_likes', JSON.stringify(this.likes));
    this.modalStatsLikes.textContent = this.likes[id];
  }

  // Favorite / Bookmark Logic
  toggleFavorite(mediaId) {
    const idx = this.favorites.indexOf(mediaId);
    const media = this.mediaList.find(m => m.id === mediaId);
    const title = media ? media.title : 'İçerik';

    if (idx > -1) {
      this.favorites.splice(idx, 1);
      this.showToast(`"${title}" izleme listenizden çıkarıldı.`, 'info');
    } else {
      this.favorites.push(mediaId);
      this.showToast(`"${title}" izleme listenize eklendi!`, 'success');
    }

    localStorage.setItem('cinestream_favs', JSON.stringify(this.favorites));
    this.renderFavoritesCount();
    this.renderMediaSections();
    if (this.currentHeroIndex !== undefined) {
      this.renderHero(this.currentHeroIndex);
    }
  }

  updateModalFavBtn() {
    if (!this.currentMedia) return;
    const isFav = this.favorites.includes(this.currentMedia.id);
    if (isFav) {
      this.modalBtnFav.innerHTML = '<i class="fa-solid fa-bookmark text-red-500 mr-1.5"></i> Listemde';
      this.modalBtnFav.classList.add('border-red-500/50', 'bg-red-500/10');
    } else {
      this.modalBtnFav.innerHTML = '<i class="fa-regular fa-bookmark mr-1.5"></i> Listeme Ekle';
      this.modalBtnFav.classList.remove('border-red-500/50', 'bg-red-500/10');
    }
  }

  renderFavoritesCount() {
    if (this.favCounterBadge) {
      this.favCounterBadge.textContent = this.favorites.length;
      this.favCounterBadge.classList.toggle('hidden', this.favorites.length === 0);
    }
  }

  shareCurrentMedia() {
    if (!this.currentMedia) return;
    const shareUrl = window.location.href.split('?')[0] + `?watch=${this.currentMedia.id}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showToast('Bağlantı panoya kopyalandı! Arkadaşlarınızla paylaşabilirsiniz.', 'success');
      }).catch(() => {
        this.showToast(`Paylaşım linki: ${shareUrl}`, 'info');
      });
    } else {
      this.showToast(`Paylaşım linki: ${shareUrl}`, 'info');
    }
  }

  // Interactive Comments
  renderComments() {
    if (!this.currentMedia) return;
    const id = this.currentMedia.id;
    const list = this.comments[id] || [];

    if (list.length === 0) {
      this.modalCommentsList.innerHTML = `
        <p class="text-xs text-gray-500 py-4 text-center">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
      `;
      return;
    }

    this.modalCommentsList.innerHTML = list.map(c => `
      <div class="p-3 rounded-xl bg-white/5 border border-white/5 mb-3 flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
          ${c.user.charAt(0).toUpperCase()}
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-gray-200">${c.user}</span>
            <span class="text-[10px] text-gray-500">${c.date}</span>
          </div>
          <p class="text-xs text-gray-300 leading-relaxed">${c.text}</p>
        </div>
      </div>
    `).join('');
  }

  handleCommentSubmit() {
    if (!this.currentMedia) return;
    const nameInput = document.getElementById('comment-author-input');
    const textInput = document.getElementById('comment-text-input');

    const name = nameInput.value.trim() || 'Misafir İzleyici';
    const text = textInput.value.trim();

    if (!text) {
      this.showToast('Lütfen bir yorum yazın.', 'error');
      return;
    }

    const id = this.currentMedia.id;
    if (!this.comments[id]) {
      this.comments[id] = [];
    }

    this.comments[id].unshift({
      user: name,
      text: text,
      date: 'Az önce'
    });

    localStorage.setItem('cinestream_comments', JSON.stringify(this.comments));
    textInput.value = '';
    this.renderComments();
    this.showToast('Yorumunuz başarıyla paylaşıldı!', 'success');
  }

  // Toast Notification System
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = 'fa-circle-info text-cyan-400';
    if (type === 'success') icon = 'fa-circle-check text-green-400';
    if (type === 'error') icon = 'fa-circle-xmark text-red-500';

    toast.innerHTML = `
      <i class="fa-solid ${icon} text-lg"></i>
      <span class="text-xs font-medium text-gray-200">${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Global initialization
let streamApp;
document.addEventListener('DOMContentLoaded', () => {
  streamApp = new StreamApp();

  // Check URL params for direct watch link e.g. ?watch=hellbound
  const urlParams = new URLSearchParams(window.location.search);
  const watchId = urlParams.get('watch');
  if (watchId) {
    streamApp.openPlayer(watchId);
  }
});
