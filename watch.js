// CineStream+ Dedicated Watch Page Logic

class WatchController {
  constructor() {
    this.mediaList = MEDIA_DATABASE;
    this.currentMedia = null;
    this.currentSeasonNum = 1;
    this.currentEpisodeNum = 1;
    this.currentSourceIdx = 0;
    this.cinemaMode = false;

    this.likes = JSON.parse(localStorage.getItem('cinestream_likes') || '{}');
    this.comments = JSON.parse(localStorage.getItem('cinestream_comments') || '{}');

    this.init();
  }

  init() {
    renderNavbar(null); // Active nav is none of the main tabs or custom

    const params = new URLSearchParams(window.location.search);
    const mediaId = params.get('id') || 'hellbound';
    this.currentSeasonNum = parseInt(params.get('season')) || 1;
    this.currentEpisodeNum = parseInt(params.get('episode')) || 1;
    this.currentSourceIdx = parseInt(params.get('source')) || 0;

    this.currentMedia = this.mediaList.find(m => m.id === mediaId) || this.mediaList[0];

    // Page title
    document.title = `${this.currentMedia.title} İzle | CineStream+ Pro`;

    this.bindEvents();
    this.renderPage();
  }

  bindEvents() {
    // Cinema mode
    const btnCinema = document.getElementById('btn-cinema-mode');
    btnCinema.addEventListener('click', () => this.toggleCinemaMode());

    // External tab
    const btnExternal = document.getElementById('btn-external-tab');
    btnExternal.addEventListener('click', () => {
      const url = this.getCurrentSourceUrl();
      if (url) window.open(url, '_blank');
    });

    // Like button
    const btnLike = document.getElementById('btn-like-media');
    btnLike.addEventListener('click', () => this.toggleLike());

    // Favorite button
    const btnFav = document.getElementById('btn-fav-media');
    btnFav.addEventListener('click', () => {
      window.toggleFavorite(this.currentMedia.id);
      this.updateFavBtn();
    });

    // Share button
    const btnShare = document.getElementById('btn-share-media');
    btnShare.addEventListener('click', () => this.shareCurrentMedia());

    // Prev / Next Episode buttons
    const btnPrev = document.getElementById('btn-prev-ep');
    const btnNext = document.getElementById('btn-next-ep');
    btnPrev.addEventListener('click', () => this.navigateEpisode(-1));
    btnNext.addEventListener('click', () => this.navigateEpisode(1));

    // Comment form
    const commentForm = document.getElementById('watch-comment-form');
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCommentSubmit();
    });

    // Listen to browser back/forward buttons
    window.addEventListener('popstate', () => {
      const params = new URLSearchParams(window.location.search);
      const mediaId = params.get('id') || this.currentMedia.id;
      this.currentSeasonNum = parseInt(params.get('season')) || 1;
      this.currentEpisodeNum = parseInt(params.get('episode')) || 1;
      this.currentSourceIdx = parseInt(params.get('source')) || 0;
      this.currentMedia = this.mediaList.find(m => m.id === mediaId) || this.currentMedia;
      this.renderPage(false);
    });
  }

  renderPage(updateUrl = false) {
    if (updateUrl) {
      const newUrl = `watch.html?id=${this.currentMedia.id}&season=${this.currentSeasonNum}&episode=${this.currentEpisodeNum}&source=${this.currentSourceIdx}`;
      window.history.pushState(null, '', newUrl);
    }

    // Breadcrumbs
    const bcLink = document.getElementById('bc-category-link');
    const bcTitle = document.getElementById('bc-title');
    if (this.currentMedia.type === 'movie') {
      bcLink.textContent = 'Filmler';
      bcLink.href = 'movies.html';
      bcTitle.textContent = this.currentMedia.title;
    } else {
      bcLink.textContent = 'Diziler';
      bcLink.href = 'series.html';
      bcTitle.textContent = `${this.currentMedia.title} (S${this.currentSeasonNum} B${this.currentEpisodeNum})`;
    }

    // Metadata
    document.getElementById('badge-type').textContent = this.currentMedia.type === 'movie' ? 'FİLM' : 'DİZİ';
    document.getElementById('badge-year').textContent = this.currentMedia.year;
    document.getElementById('badge-quality').textContent = this.currentMedia.quality;
    document.getElementById('badge-age').textContent = this.currentMedia.ageRating;
    document.getElementById('badge-rating').textContent = this.currentMedia.rating;

    document.getElementById('watch-media-title').textContent = this.currentMedia.title;
    document.getElementById('watch-media-sub').textContent = this.currentMedia.turkishTitle || this.currentMedia.originalTitle || '';
    document.getElementById('watch-synopsis').textContent = this.currentMedia.synopsis;

    document.getElementById('meta-director').textContent = this.currentMedia.director || 'Belirtilmedi';
    document.getElementById('meta-writers').textContent = this.currentMedia.writers ? this.currentMedia.writers.join(', ') : 'Belirtilmedi';
    document.getElementById('meta-cast').textContent = this.currentMedia.cast ? this.currentMedia.cast.join(', ') : 'Kadro bilgisi mevcut';
    document.getElementById('meta-country').textContent = this.currentMedia.country || 'Belirtilmedi';
    document.getElementById('meta-duration').textContent = this.currentMedia.type === 'movie' ? this.currentMedia.duration : `${this.currentMedia.seasons.length} Sezon`;

    document.getElementById('meta-genres').innerHTML = this.currentMedia.genres.map(g => `
      <a href="categories.html?genre=${encodeURIComponent(g)}" class="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-medium border border-white/10 transition">
        ${g}
      </a>
    `).join('');

    // Views & Likes
    const currentLikes = this.likes[this.currentMedia.id] !== undefined ? this.likes[this.currentMedia.id] : (this.currentMedia.likes || 120);
    document.getElementById('views-count').textContent = this.currentMedia.views || '12.450';
    document.getElementById('likes-count').textContent = currentLikes;

    this.updateFavBtn();

    // Render Sources & Episodes Drawer
    if (this.currentMedia.type === 'movie') {
      document.getElementById('series-episodes-section').classList.add('hidden');
      document.getElementById('watch-ep-nav').classList.add('hidden');
      this.renderMovieSources();
    } else {
      document.getElementById('series-episodes-section').classList.remove('hidden');
      document.getElementById('watch-ep-nav').classList.remove('hidden');
      this.renderSeriesSources();
      this.renderSeasonTabs();
      this.renderEpisodesGrid();
    }

    // Video Iframe Player
    this.renderVideoPlayer();

    // Comments & Related
    this.renderComments();
    this.renderRelatedMedia();

    // Record to watch history
    this.saveHistory();
  }

  renderMovieSources() {
    const sources = this.currentMedia.sources || [];
    const container = document.getElementById('watch-source-selector');

    container.innerHTML = `
      <span class="text-xs text-gray-400 font-bold mr-2"><i class="fa-solid fa-sliders text-red-500 mr-1"></i> Ses & Altyazı:</span>
      ${sources.map((src, idx) => `
        <button onclick="watchCtrl.selectSource(${idx})" 
                class="source-pill px-4 py-2 rounded-xl text-xs font-bold border border-white/10 cursor-pointer ${idx === this.currentSourceIdx ? 'active' : 'bg-white/5 hover:bg-white/15 text-gray-300'}">
          <i class="fa-solid ${src.type === 'dublaj' ? 'fa-microphone' : src.type === 'altyazi' ? 'fa-closed-captioning' : 'fa-film'} mr-1.5"></i>
          ${src.name}
        </button>
      `).join('')}
    `;
  }

  renderSeriesSources() {
    const season = this.currentMedia.seasons.find(s => s.seasonNumber === this.currentSeasonNum);
    const episode = season ? season.episodes.find(e => e.episodeNumber === this.currentEpisodeNum) : null;
    const container = document.getElementById('watch-source-selector');

    if (!episode || !episode.sources || episode.sources.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <span class="text-xs text-gray-400 font-bold mr-2"><i class="fa-solid fa-server text-cyan-400 mr-1"></i> Yayın Sunucusu:</span>
      ${episode.sources.map((src, idx) => `
        <button onclick="watchCtrl.selectSource(${idx})" 
                class="source-pill px-4 py-2 rounded-xl text-xs font-bold border border-white/10 cursor-pointer ${idx === this.currentSourceIdx ? 'active' : 'bg-white/5 hover:bg-white/15 text-gray-300'}">
          <i class="fa-solid fa-play-circle mr-1.5"></i> ${src.name}
        </button>
      `).join('')}
    `;
  }

  renderSeasonTabs() {
    const tabsContainer = document.getElementById('watch-season-tabs');
    const seasons = this.currentMedia.seasons || [];

    tabsContainer.innerHTML = seasons.map(s => `
      <button onclick="watchCtrl.selectSeason(${s.seasonNumber})" 
              class="tab-btn px-4 py-2 rounded-xl text-xs font-bold border border-white/10 cursor-pointer ${s.seasonNumber === this.currentSeasonNum ? 'active' : 'bg-white/5 hover:bg-white/10 text-gray-300'}">
        <i class="fa-solid fa-layer-group mr-1.5"></i> ${s.title}
      </button>
    `).join('');
  }

  renderEpisodesGrid() {
    const grid = document.getElementById('watch-episodes-grid');
    const season = this.currentMedia.seasons.find(s => s.seasonNumber === this.currentSeasonNum);
    if (!season) return;

    document.getElementById('season-episode-count-badge').textContent = `${season.episodes.length} Bölüm`;

    grid.innerHTML = season.episodes.map(ep => {
      const isCurrent = ep.episodeNumber === this.currentEpisodeNum;
      return `
        <div onclick="watchCtrl.selectEpisode(${ep.episodeNumber})" 
             class="episode-card p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3 cursor-pointer transition ${isCurrent ? 'active' : ''}">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${isCurrent ? 'bg-red-600 text-white shadow-lg shadow-red-600/40' : 'bg-white/10 text-gray-300'}">
            ${ep.episodeNumber}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-0.5">
              <h5 class="text-xs font-bold truncate ${isCurrent ? 'text-red-400' : 'text-gray-200'}">
                ${ep.title}
              </h5>
              <span class="text-[10px] text-gray-500 font-semibold ml-2">${ep.duration || '50 dk'}</span>
            </div>
            <p class="text-[11px] text-gray-400 line-clamp-2">${ep.overview || ''}</p>
          </div>
        </div>
      `;
    }).join('');

    // Update navigation buttons status
    const totalEps = season.episodes.length;
    const btnPrev = document.getElementById('btn-prev-ep');
    const btnNext = document.getElementById('btn-next-ep');
    btnPrev.disabled = this.currentEpisodeNum <= 1;
    btnNext.disabled = this.currentEpisodeNum >= totalEps;
    btnPrev.classList.toggle('opacity-40', this.currentEpisodeNum <= 1);
    btnNext.classList.toggle('opacity-40', this.currentEpisodeNum >= totalEps);
  }

  selectSeason(seasonNum) {
    this.currentSeasonNum = seasonNum;
    this.currentEpisodeNum = 1;
    this.currentSourceIdx = 0;
    this.renderPage(true);
  }

  selectEpisode(epNum) {
    this.currentEpisodeNum = epNum;
    this.currentSourceIdx = 0;
    this.renderPage(true);
  }

  selectSource(sourceIdx) {
    this.currentSourceIdx = sourceIdx;
    this.renderPage(true);
  }

  navigateEpisode(delta) {
    const season = this.currentMedia.seasons.find(s => s.seasonNumber === this.currentSeasonNum);
    if (!season) return;

    const newEp = this.currentEpisodeNum + delta;
    if (newEp >= 1 && newEp <= season.episodes.length) {
      this.selectEpisode(newEp);
    }
  }

  getCurrentSourceUrl() {
    if (!this.currentMedia) return '';
    if (this.currentMedia.type === 'movie') {
      const src = this.currentMedia.sources[this.currentSourceIdx] || this.currentMedia.sources[0];
      return src ? src.url : '';
    } else {
      const season = this.currentMedia.seasons.find(s => s.seasonNumber === this.currentSeasonNum);
      if (!season) return '';
      const episode = season.episodes.find(e => e.episodeNumber === this.currentEpisodeNum);
      if (!episode || !episode.sources) return '';
      const src = episode.sources[this.currentSourceIdx] || episode.sources[0];
      return src ? src.url : '';
    }
  }

  renderVideoPlayer() {
    const container = document.getElementById('watch-player-iframe-box');
    const url = this.getCurrentSourceUrl();

    if (!url) {
      container.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
          <i class="fa-solid fa-triangle-exclamation text-5xl text-yellow-500 mb-3"></i>
          <p class="font-bold text-lg text-white">Yayın Kaynağı Bulunamadı</p>
          <p class="text-xs text-gray-400 mt-1">Lütfen alternatif bir kaynak veya bölüm seçin.</p>
        </div>
      `;
      return;
    }

    const isImage = url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.jpeg') || (this.currentMedia.id === 'the-east-palace' && this.currentEpisodeNum === 1);

    if (isImage) {
      container.innerHTML = `
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

    container.innerHTML = `
      <iframe src="${url}" 
              class="w-full h-full border-0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen 
              loading="lazy">
      </iframe>
    `;
  }

  toggleCinemaMode() {
    this.cinemaMode = !this.cinemaMode;
    document.body.classList.toggle('cinema-mode', this.cinemaMode);

    const btn = document.getElementById('btn-cinema-mode');
    if (this.cinemaMode) {
      btn.innerHTML = '<i class="fa-solid fa-lightbulb text-yellow-400"></i> <span class="hidden sm:inline">Işıkları Aç</span>';
      window.streamToast('Sinema Modu Aktif: Işıklar kısıldı.', 'info');
    } else {
      btn.innerHTML = '<i class="fa-regular fa-lightbulb"></i> <span class="hidden sm:inline">Işıkları Kapat</span>';
    }
  }

  toggleLike() {
    const id = this.currentMedia.id;
    const currentCount = this.likes[id] !== undefined ? this.likes[id] : (this.currentMedia.likes || 120);

    const hasLikedKey = `cinestream_has_liked_${id}`;
    const hasLiked = localStorage.getItem(hasLikedKey) === 'true';

    if (hasLiked) {
      this.likes[id] = Math.max(0, currentCount - 1);
      localStorage.setItem(hasLikedKey, 'false');
      window.streamToast('Beğeni geri alındı.', 'info');
    } else {
      this.likes[id] = currentCount + 1;
      localStorage.setItem(hasLikedKey, 'true');
      window.streamToast('Beğeniniz kaydedildi! Teşekkürler.', 'success');
    }

    localStorage.setItem('cinestream_likes', JSON.stringify(this.likes));
    document.getElementById('likes-count').textContent = this.likes[id];
  }

  updateFavBtn() {
    const favs = JSON.parse(localStorage.getItem('cinestream_favs') || '[]');
    const isFav = favs.includes(this.currentMedia.id);
    const btn = document.getElementById('btn-fav-media');

    if (isFav) {
      btn.innerHTML = '<i class="fa-solid fa-bookmark text-red-500 mr-1.5"></i> Listemde';
      btn.classList.add('border-red-500/50', 'bg-red-500/10');
    } else {
      btn.innerHTML = '<i class="fa-regular fa-bookmark mr-1.5"></i> Listeme Ekle';
      btn.classList.remove('border-red-500/50', 'bg-red-500/10');
    }
  }

  shareCurrentMedia() {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        window.streamToast('Bağlantı panoya kopyalandı! Arkadaşlarınızla paylaşabilirsiniz.', 'success');
      });
    } else {
      window.streamToast(`Paylaşım linki: ${shareUrl}`, 'info');
    }
  }

  saveHistory() {
    let history = JSON.parse(localStorage.getItem('cinestream_history') || '[]');
    history = history.filter(h => h.id !== this.currentMedia.id);

    let detailText = '';
    if (this.currentMedia.type === 'movie') {
      const src = this.currentMedia.sources[this.currentSourceIdx];
      detailText = src ? src.name : 'Film';
    } else {
      detailText = `${this.currentSeasonNum}. Sezon ${this.currentEpisodeNum}. Bölüm`;
    }

    history.unshift({
      id: this.currentMedia.id,
      seasonNumber: this.currentSeasonNum,
      episodeNumber: this.currentEpisodeNum,
      sourceType: this.currentSourceIdx,
      detailText: detailText,
      watchedAt: 'Az önce'
    });

    if (history.length > 8) history.pop();
    localStorage.setItem('cinestream_history', JSON.stringify(history));
  }

  renderComments() {
    const list = this.comments[this.currentMedia.id] || [];
    const container = document.getElementById('watch-comments-list');

    if (list.length === 0) {
      container.innerHTML = `<p class="text-xs text-gray-500 py-3 text-center">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>`;
      return;
    }

    container.innerHTML = list.map(c => `
      <div class="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3 glass">
        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
          ${c.user.charAt(0).toUpperCase()}
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-white">${c.user}</span>
            <span class="text-[10px] text-gray-500">${c.date}</span>
          </div>
          <p class="text-xs text-gray-300 leading-relaxed">${c.text}</p>
        </div>
      </div>
    `).join('');
  }

  handleCommentSubmit() {
    const user = streamAuth.getUser();
    const nameInput = document.getElementById('input-comment-name');
    const textInput = document.getElementById('input-comment-text');

    const name = nameInput.value.trim() || user.name || 'Misafir İzleyici';
    const text = textInput.value.trim();

    if (!text) {
      window.streamToast('Lütfen bir yorum yazın.', 'error');
      return;
    }

    if (!this.comments[this.currentMedia.id]) {
      this.comments[this.currentMedia.id] = [];
    }

    this.comments[this.currentMedia.id].unshift({
      user: name,
      text: text,
      date: 'Az önce'
    });

    localStorage.setItem('cinestream_comments', JSON.stringify(this.comments));
    textInput.value = '';
    this.renderComments();
    window.streamToast('Yorumunuz başarıyla paylaşıldı!', 'success');
  }

  renderRelatedMedia() {
    const grid = document.getElementById('related-media-grid');
    const related = this.mediaList.filter(m => m.id !== this.currentMedia.id);

    grid.innerHTML = related.map(item => `
      <a href="watch.html?id=${item.id}" class="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between border border-white/5 relative block">
        <div class="relative aspect-[2/3] overflow-hidden bg-gray-900">
          <img src="${item.poster}" class="w-full h-full object-cover group-hover:scale-108 transition duration-500 ease-out" />
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
            <div class="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
              <i class="fa-solid fa-play text-lg ml-0.5"></i>
            </div>
          </div>
          <div class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'movie' ? 'bg-amber-600' : 'bg-red-600'} text-white">
            ${item.type === 'movie' ? 'FİLM' : 'DİZİ'}
          </div>
          <div class="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-yellow-400">
            ★ ${item.rating}
          </div>
        </div>
        <div class="p-3">
          <h4 class="text-xs font-bold text-white group-hover:text-red-400 transition truncate">${item.title}</h4>
          <p class="text-[10px] text-gray-400 truncate mt-0.5">${item.turkishTitle || item.genres[0]}</p>
        </div>
      </a>
    `).join('');
  }
}

let watchCtrl;
document.addEventListener('DOMContentLoaded', () => {
  watchCtrl = new WatchController();
});
