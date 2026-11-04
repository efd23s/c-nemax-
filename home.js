// CineStream+ Home Controller
// Clean Vertical Poster Cards with Hover-Only Synopsis

class HomeController {
  constructor() {
    this.mediaList = MEDIA_DATABASE;
    this.currentHeroIndex = 0;
    this.heroInterval = null;

    this.init();
  }

  init() {
    renderNavbar('home');
    this.renderHero(0);
    this.startHeroCarousel();
    this.renderContinueWatching();
    this.renderUnifiedContentGrid();
  }

  renderHero(index) {
    const container = document.getElementById('hero-section');
    const media = this.mediaList[index % this.mediaList.length];
    if (!container || !media) return;

    this.currentHeroIndex = index;
    const favs = JSON.parse(localStorage.getItem('cinestream_favs') || '[]');
    const isFav = favs.includes(media.id);

    const badgesHtml = media.genres.map(g => `
      <span class="px-2.5 py-1 text-xs rounded-full bg-black/50 border border-white/20 text-gray-200 backdrop-blur-md">${g}</span>
    `).join(' ');

    container.innerHTML = `
      <div class="relative w-full h-[520px] lg:h-[620px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <img src="${media.backdrop || media.poster}" 
             alt="${media.title}" 
             class="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition duration-1000 ease-out" />
        
        <div class="absolute inset-0 hero-gradient"></div>

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

          <p class="text-gray-300 text-xs md:text-sm line-clamp-3 mb-6 max-w-2xl leading-relaxed">
            ${media.synopsis}
          </p>

          <div class="flex flex-wrap items-center gap-3 md:gap-4">
            <a href="watch.html?id=${media.id}" 
               class="btn-primary-glow flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-white font-bold text-xs md:text-sm cursor-pointer shadow-lg">
              <i class="fa-solid fa-play text-base"></i> Hemen İzle
            </a>
            
            ${media.trailerUrl ? `
              <a href="watch.html?id=${media.id}&source=${media.type === 'movie' ? 2 : 0}" 
                 class="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-xs md:text-sm backdrop-blur-md transition cursor-pointer">
                <i class="fa-solid fa-film"></i> Fragman
              </a>
            ` : ''}

            <button onclick="window.toggleFavorite('${media.id}')" 
                    class="p-3.5 rounded-xl bg-black/50 hover:bg-black/70 border border-white/20 text-white transition cursor-pointer"
                    title="${isFav ? 'Listemden Çıkar' : 'Listeme Ekle'}">
              <i class="${isFav ? 'fa-solid text-red-500' : 'fa-regular'} fa-bookmark text-lg"></i>
            </button>
          </div>
        </div>

        <div class="absolute bottom-6 right-6 md:right-12 z-20 flex items-center gap-2">
          ${this.mediaList.map((m, i) => `
            <button onclick="homeCtrl.renderHero(${i}); homeCtrl.resetHeroTimer();" 
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

  renderContinueWatching() {
    const section = document.getElementById('continue-watching-section');
    const grid = document.getElementById('continue-watching-grid');
    if (!section || !grid) return;

    const history = JSON.parse(localStorage.getItem('cinestream_history') || '[]');
    if (history.length === 0) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    grid.innerHTML = history.slice(0, 4).map(item => {
      const media = this.mediaList.find(m => m.id === item.id);
      if (!media) return '';
      const watchUrl = `watch.html?id=${media.id}&season=${item.seasonNumber || 1}&episode=${item.episodeNumber || 1}&source=${item.sourceType || 0}`;

      return `
        <div class="glass-card rounded-xl overflow-hidden flex items-center gap-3 p-2.5 border border-white/10 group cursor-pointer hover:border-red-500/50"
             onclick="window.location.href='${watchUrl}'">
          <div class="w-16 h-20 rounded-lg overflow-hidden relative flex-shrink-0 bg-gray-900">
            <img src="${media.poster}" class="w-full h-full object-cover group-hover:scale-105 transition" />
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <i class="fa-solid fa-play text-xs text-white"></i>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-white truncate">${media.title}</h4>
            <p class="text-[11px] text-red-400 truncate">${item.detailText || 'İzleniyor'}</p>
            <p class="text-[9px] text-gray-500">${item.watchedAt || 'Az önce'}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // Renders the clean vertical poster cards (Synopsis only on hover)
  renderUnifiedContentGrid() {
    const gridSeries = document.getElementById('home-vertical-series-grid');
    const gridMovies = document.getElementById('home-vertical-movies-grid');

    const series = this.mediaList.filter(m => m.type === 'series');
    const movies = this.mediaList.filter(m => m.type === 'movie');

    if (gridSeries) {
      gridSeries.innerHTML = series.map(item => this.createVerticalPosterCard(item)).join('');
    }

    if (gridMovies) {
      gridMovies.innerHTML = movies.map(item => this.createVerticalPosterCard(item)).join('');
    }
  }

  createVerticalPosterCard(item) {
    const favs = JSON.parse(localStorage.getItem('cinestream_favs') || '[]');
    const isFav = favs.includes(item.id);

    return `
      <div class="vertical-media-card group cursor-pointer" onclick="window.location.href='watch.html?id=${item.id}'">
        <!-- Vertical Poster Box (2:3 Ratio) -->
        <div class="poster-container">
          <img src="${item.poster}" 
               alt="${item.title}" 
               class="poster-img" 
               loading="lazy" 
               onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400'" />

          <!-- Minimal Top Badges -->
          <div class="absolute top-2.5 left-2.5 z-10">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'movie' ? 'bg-amber-600' : 'bg-red-600'} text-white uppercase shadow-md">
              ${item.type === 'movie' ? 'FİLM' : `${item.seasons ? item.seasons.length : 1} SEZON`}
            </span>
          </div>

          <div class="absolute top-2.5 right-2.5 z-10">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 border border-yellow-500/30 text-yellow-400">
              ★ ${item.rating}
            </span>
          </div>

          <!-- Hover-Only Overlay with Synopsis -->
          <div class="hover-overlay">
            <div class="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-2 shadow-lg shadow-red-600/50 transform scale-90 group-hover:scale-100 transition duration-300">
              <i class="fa-solid fa-play text-base ml-0.5"></i>
            </div>
            
            <h4 class="text-xs font-bold text-white text-center mb-1 truncate">${item.title}</h4>
            
            <!-- Synopsis shown only when hovered -->
            <p class="text-[11px] text-gray-300 line-clamp-3 leading-relaxed mb-3 text-center">
              ${item.synopsis}
            </p>

            <div class="flex items-center justify-between pt-2 border-t border-white/15 text-[11px] text-gray-300">
              <span>${item.year}</span>
              <span class="text-red-400 font-bold flex items-center gap-1">İzle <i class="fa-solid fa-chevron-right text-[9px]"></i></span>
            </div>
          </div>
        </div>

        <!-- ONLY Title below the vertical poster! (No synopsis, clean minimalist look) -->
        <div class="mt-2.5 px-0.5 flex items-center justify-between">
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-bold text-white group-hover:text-red-400 transition truncate heading-font">
              ${item.title}
            </h3>
            ${item.turkishTitle ? `
              <p class="text-[11px] text-gray-400 font-medium truncate">${item.turkishTitle}</p>
            ` : ''}
          </div>

          <button onclick="event.stopPropagation(); window.toggleFavorite('${item.id}'); homeCtrl.renderUnifiedContentGrid();" 
                  class="ml-2 text-gray-400 hover:text-red-500 p-1 text-xs" 
                  title="${isFav ? 'Listeden Kaldır' : 'Listeye Ekle'}">
            <i class="${isFav ? 'fa-solid text-red-500' : 'fa-regular'} fa-bookmark"></i>
          </button>
        </div>
      </div>
    `;
  }
}

let homeCtrl;
document.addEventListener('DOMContentLoaded', () => {
  homeCtrl = new HomeController();
});
