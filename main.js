(function () {
    var PER_PAGE = 10;
    var MAX_BUTTONS = 10;
  
    var form = document.getElementById('searchForm');
    var titleInput = document.getElementById('title');
    var typeSelect = document.getElementById('type');
    var message = document.getElementById('message');
    var results = document.getElementById('results');
    var pagination = document.getElementById('pagination');
    var details = document.getElementById('details');
  
    var query = { title: '', type: '' };
  
    function request(params) {
      var url = API_URL + '?apikey=' + API_KEY + '&' + new URLSearchParams(params).toString();
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    }
  
    function showMessage(text, isError) {
      message.textContent = text;
      message.className = 'message' + (isError ? ' error' : '');
    }
  
    function clearAll() {
      results.innerHTML = '';
      pagination.innerHTML = '';
      details.className = 'details';
      details.innerHTML = '';
    }
  
    function search(page) {
      showMessage('Loading...', false);
      request({ s: query.title, type: query.type, page: page })
        .then(function (data) {
          clearAll();
          if (data.Response === 'False') {
            showMessage(data.Error === 'Movie not found!' ? 'Movie not found!' : data.Error, true);
            return;
          }
          showMessage('', false);
          renderResults(data.Search);
          renderPagination(parseInt(data.totalResults, 10), page);
        })
        .catch(function () {
          clearAll();
          showMessage('Request failed. Check your connection or API key.', true);
        });
    }
  
    function renderResults(list) {
      list.forEach(function (m) {
        var card = document.createElement('div');
        card.className = 'movie';
  
        var img = document.createElement('img');
        img.alt = m.Title;
        img.src = m.Poster && m.Poster !== 'N/A' ? m.Poster : '';
  
        var info = document.createElement('div');
        info.className = 'movie-info';
  
        var title = document.createElement('div');
        title.className = 'movie-title';
        title.textContent = m.Title;
  
        var meta = document.createElement('div');
        meta.className = 'movie-meta';
        meta.textContent = m.Year + ' · ' + m.Type;
  
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Details';
        btn.addEventListener('click', function () { loadDetails(m.imdbID); });
  
        info.appendChild(title);
        info.appendChild(meta);
        info.appendChild(btn);
        card.appendChild(img);
        card.appendChild(info);
        results.appendChild(card);
      });
    }
  
    function renderPagination(total, current) {
      var pages = Math.ceil(total / PER_PAGE);
      if (pages <= 1) return;
  
      // вікно з MAX_BUTTONS кнопок навколо поточної сторінки
      var start = Math.max(1, current - Math.floor(MAX_BUTTONS / 2));
      var end = Math.min(pages, start + MAX_BUTTONS - 1);
      start = Math.max(1, end - MAX_BUTTONS + 1);
  
      for (var i = start; i <= end; i++) {
        (function (p) {
          var b = document.createElement('button');
          b.type = 'button';
          b.textContent = p;
          if (p === current) b.className = 'active';
          b.addEventListener('click', function () { search(p); });
          pagination.appendChild(b);
        })(i);
      }
    }
  
    function loadDetails(id) {
      request({ i: id, plot: 'full' })
        .then(function (m) {
          if (m.Response === 'False') {
            details.className = 'details';
            showMessage(m.Error, true);
            return;
          }
          renderDetails(m);
        })
        .catch(function () { showMessage('Request failed.', true); });
    }
  
    function row(label, value) {
      if (!value || value === 'N/A') return null;
      var p = document.createElement('p');
      var b = document.createElement('b');
      b.textContent = label + ': ';
      p.appendChild(b);
      p.appendChild(document.createTextNode(value));
      return p;
    }
  
    function renderDetails(m) {
      details.innerHTML = '';
  
      if (m.Poster && m.Poster !== 'N/A') {
        var img = document.createElement('img');
        img.src = m.Poster;
        img.alt = m.Title;
        details.appendChild(img);
      }
  
      var box = document.createElement('div');
      var h = document.createElement('h2');
      h.textContent = m.Title + ' (' + m.Year + ')';
      box.appendChild(h);
  
      [
        ['Rated', m.Rated], ['Released', m.Released], ['Runtime', m.Runtime],
        ['Genre', m.Genre], ['Director', m.Director], ['Writer', m.Writer],
        ['Actors', m.Actors], ['Plot', m.Plot], ['Language', m.Language],
        ['Country', m.Country], ['Awards', m.Awards],
        ['IMDb rating', m.imdbRating], ['Box office', m.BoxOffice]
      ].forEach(function (r) {
        var el = row(r[0], r[1]);
        if (el) box.appendChild(el);
      });
  
      details.appendChild(box);
      details.className = 'details visible';
      details.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      query.title = titleInput.value.trim();
      query.type = typeSelect.value;
      if (!query.title) return;
      search(1);
    });
  })();