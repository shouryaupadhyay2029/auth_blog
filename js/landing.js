/**
 * BlogAuth V1 — landing.js
 * Fetches published articles from the backend and populates the landing page grids
 */

(function () {
  'use strict';

  function initLandingPage() {
    // 1. Fetch published articles from database
    window.CustomRequest.request('/articles?status=published&limit=10')
      .then(function (res) {
        if (!res || !res.results || res.results.length === 0) {
          console.log('[Landing] No published articles found in database. Showing mockup stories.');
          return;
        }

        var articles = res.results;
        console.log(`[Landing] Loaded ${articles.length} published articles.`);

        // 2. Populate Hero Featured Card (using the first article)
        populateHeroCard(articles[0]);

        // 3. Populate Featured Stories (using articles index 1 to 4)
        populateFeaturedGrid(articles.slice(1, 5));

        // 4. Populate Latest Articles Section (using articles from index 0 onwards)
        populateLatestSection(articles);
      })
      .catch(function (err) {
        console.warn('[Landing] Failed to fetch articles from backend:', err);
      });
  }

  function populateHeroCard(article) {
    if (!article) return;
    var heroCard = document.querySelector('.hero-right .featured-card');
    if (!heroCard) return;

    heroCard.querySelector('.card-category').textContent = article.category ? article.category.name : 'General';
    heroCard.querySelector('.card-read-time').textContent = (article.readTime || 1) + ' min read';
    heroCard.querySelector('.card-title').textContent = article.title;
    heroCard.querySelector('.card-excerpt').textContent = article.excerpt || article.subtitle || '';
    
    var authorName = heroCard.querySelector('.author-name');
    if (authorName) authorName.textContent = article.author ? article.author.username : 'Anonymous';

    var authorRole = heroCard.querySelector('.author-role');
    if (authorRole) authorRole.textContent = article.author && article.author.role ? article.author.role : 'Writer';

    var cardLink = heroCard.querySelector('.card-link');
    if (cardLink) cardLink.setAttribute('href', 'article.html?id=' + article._id);

    // Make entire card clickable
    heroCard.style.cursor = 'pointer';
    heroCard.onclick = function() {
      window.location.href = 'article.html?id=' + article._id;
    };
  }

  function populateFeaturedGrid(featuredList) {
    if (!featuredList || featuredList.length === 0) return;

    // A. Left large showcase card
    var largeCol = document.querySelector('.featured-large');
    if (largeCol && featuredList[0]) {
      var item = featuredList[0];
      var largeCard = largeCol.querySelector('.featured-large-card');
      if (largeCard) {
        largeCard.querySelector('.card-category').textContent = item.category ? item.category.name : 'General';
        largeCard.querySelector('.card-date').textContent = new Date(item.publishedAt || item.createdAt).toLocaleDateString();
        largeCard.querySelector('.card-title').textContent = item.title;
        largeCard.querySelector('.card-excerpt').textContent = item.excerpt || item.subtitle || '';
        
        var authName = largeCard.querySelector('.card-author .author-name');
        if (authName) authName.textContent = item.author ? item.author.username : 'Anonymous';

        var authRole = largeCard.querySelector('.card-author .author-role');
        if (authRole) authRole.textContent = item.author && item.author.role ? item.author.role : 'Writer';

        var cardLink = largeCard.querySelector('.card-link');
        if (cardLink) cardLink.setAttribute('href', 'article.html?id=' + item._id);

        largeCard.style.cursor = 'pointer';
        largeCard.onclick = function() {
          window.location.href = 'article.html?id=' + item._id;
        };
      }
    }

    // B. Right stack of 3 secondary cards
    var smallStack = document.querySelector('.featured-small-stack');
    if (smallStack && featuredList.length > 1) {
      var items = featuredList.slice(1);
      var cards = smallStack.querySelectorAll('.featured-small-card');
      
      // Update existing elements or clean excess
      cards.forEach(function (card, index) {
        var item = items[index];
        if (item) {
          card.style.display = 'block';
          card.querySelector('.card-category').textContent = item.category ? item.category.name : 'General';
          card.querySelector('.card-date').textContent = new Date(item.publishedAt || item.createdAt).toLocaleDateString();
          card.querySelector('.card-title').textContent = item.title;
          card.querySelector('.card-excerpt').textContent = item.excerpt || item.subtitle || '';
          
          var authName = card.querySelector('.card-author-name');
          if (authName) authName.textContent = item.author ? item.author.username : 'Anonymous';

          var cardLink = card.querySelector('.card-link');
          if (cardLink) cardLink.setAttribute('href', 'article.html?id=' + item._id);

          card.style.cursor = 'pointer';
          card.onclick = function() {
            window.location.href = 'article.html?id=' + item._id;
          };
        } else {
          card.style.display = 'none'; // Hide if we don't have enough articles
        }
      });
    }
  }

  function populateLatestSection(articles) {
    if (!articles || articles.length === 0) return;

    // A. Feature Card
    var featCard = document.getElementById('latest-feature-article');
    if (featCard && articles[0]) {
      var item = articles[0];
      featCard.querySelector('.lfc-category').textContent = item.category ? item.category.name : 'General';
      featCard.querySelector('.lfc-date').textContent = new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      featCard.querySelector('.lfc-title').textContent = item.title;
      featCard.querySelector('.lfc-excerpt').textContent = item.excerpt || item.subtitle || '';
      
      var authName = featCard.querySelector('.lfc-author-name');
      if (authName) authName.textContent = item.author ? item.author.username : 'Anonymous';

      var authRole = featCard.querySelector('.lfc-author-role');
      if (authRole) authRole.textContent = item.author && item.author.role ? item.author.role : 'Writer';

      var cardLink = featCard.querySelector('#latest-feature-read');
      if (cardLink) cardLink.setAttribute('href', 'article.html?id=' + item._id);

      featCard.style.cursor = 'pointer';
      featCard.onclick = function() {
        window.location.href = 'article.html?id=' + item._id;
      };
    }

    // B. Standard cards (2 standard cards on right)
    var standardCards = [
      document.getElementById('latest-standard-1'),
      document.getElementById('latest-standard-2')
    ];
    var stdArticles = articles.slice(1, 3);
    standardCards.forEach(function (card, index) {
      if (!card) return;
      var item = stdArticles[index];
      if (item) {
        card.style.display = 'block';
        card.querySelector('.lsc-category').textContent = item.category ? item.category.name : 'General';
        card.querySelector('.lsc-date').textContent = new Date(item.publishedAt || item.createdAt).toLocaleDateString();
        card.querySelector('.lsc-title').textContent = item.title;
        card.querySelector('.lsc-excerpt').textContent = item.excerpt || item.subtitle || '';
        
        var authName = card.querySelector('.lsc-author-name');
        if (authName) authName.textContent = item.author ? item.author.username : 'Anonymous';

        var cardLink = card.querySelector('.lsc-read-link');
        if (cardLink) cardLink.setAttribute('href', 'article.html?id=' + item._id);

        card.style.cursor = 'pointer';
        card.onclick = function() {
          window.location.href = 'article.html?id=' + item._id;
        };
      } else {
        card.style.display = 'none';
      }
    });

    // C. Compact cards (3 compact cards on bottom row)
    var compactCards = [
      document.getElementById('latest-compact-1'),
      document.getElementById('latest-compact-2'),
      document.getElementById('latest-compact-3')
    ];
    var compArticles = articles.slice(3, 6);
    compactCards.forEach(function (card, index) {
      if (!card) return;
      var item = compArticles[index];
      if (item) {
        card.style.display = 'block';
        card.querySelector('.lcc-category').textContent = item.category ? item.category.name : 'General';
        card.querySelector('.lcc-read-time').textContent = (item.readTime || 1) + ' min';
        card.querySelector('.lcc-title').textContent = item.title;
        
        var authName = card.querySelector('.lcc-author');
        if (authName) authName.textContent = item.author ? item.author.username : 'Anonymous';

        var cardLink = card.querySelector('.lcc-link');
        if (cardLink) cardLink.setAttribute('href', 'article.html?id=' + item._id);

        card.style.cursor = 'pointer';
        card.onclick = function() {
          window.location.href = 'article.html?id=' + item._id;
        };
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Initial trigger
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLandingPage);
  } else {
    initLandingPage();
  }

})();
