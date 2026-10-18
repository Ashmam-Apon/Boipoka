<script>
  // Dynamic User Session & Real-Time State Management using store wrapper
  function getSession() {
    return store.get('bc_user', null);
  }

  function setSession(userObj) {
    store.set('bc_user', userObj);
    updateAuthUI();
  }

  function updateAuthUI() {
    const user = getSession();
    const loggedOutDiv = document.getElementById('logged-out-view');
    const loggedInDiv = document.getElementById('logged-in-view');
    if (!loggedOutDiv || !loggedInDiv) return;

    if (user) {
      loggedOutDiv.classList.add('hidden');
      loggedInDiv.classList.remove('hidden');
      document.getElementById('profile-name').innerText = user.name;
      document.getElementById('profile-email').innerText = user.email;
      const initials = user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
      document.getElementById('profile-avatar').innerText = initials;
    } else {
      loggedOutDiv.classList.remove('hidden');
      loggedInDiv.classList.add('hidden');
    }
  }

  function openAuthModal(mode) {
    const name = mode === 'signup' ? prompt("Enter your full name:") : "Nazmul Hossain";
    if (mode === 'signup' && !name) return;
    const email = prompt("Enter your email address:", "reader@example.com");
    if (!email) return;

    const user = { name: name || "Book Reader", email: email };
    setSession(user);
    alert("Successfully " + (mode === 'signup' ? "signed up" : "signed in") + "!");
  }

  function handleSignOut() {
    store.set('bc_user', null);
    updateAuthUI();
    alert("Signed out successfully.");
  }

  // Enhanced Open Library API Book Search with Real-Time Fetch
  async function searchBooksRealtime() {
    const query = document.getElementById('book-search-input').value.trim();
    if (!query) return;
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<div class="col-span-full text-center py-8 text-primary font-semibold">Searching Open Library books...</div>';

    try {
      const res = await fetch('https://openlibrary.org/search.json?q=' + encodeURIComponent(query) + '&limit=4');
      const data = await res.json();
      
      if (!data.docs || data.docs.length === 0) {
        resultsContainer.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">No books found. Try another title.</div>';
        return;
      }

      resultsContainer.innerHTML = '';
      data.docs.forEach(book => {
        const title = book.title || 'Unknown Title';
        const author = book.author_name ? book.author_name.join(', ') : 'Unknown Author';
        const coverId = book.cover_i;
        const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'https://images.pexels.com/photos/36150701/pexels-photo-36150701.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

        const card = document.createElement('div');
        card.className = 'panel-box bg-white p-6 border border-gray-100 flex flex-col justify-between hover:-translate-y-1 transition duration-200';
        card.innerHTML = `
          <div>
            <div class="h-48 bg-emerald-100 rounded-xl overflow-hidden mb-4 relative">
              <img data-bc-template src="${coverUrl}" alt="${title}" class="w-full h-full object-cover">
            </div>
            <span class="bg-secondary/20 text-ink text-xs font-bold px-2.5 py-1 rounded-full">Fetched Book</span>
            <h3 class="font-bold text-lg mt-3 font-heading line-clamp-1">${title}</h3>
            <p class="text-sm text-gray-600 mt-1 line-clamp-1">${author}</p>
          </div>
          <button onclick="addToMyList('${title.replace(/'/g, "\\'")}', '${author.replace(/'/g, "\\'")}', 'Want to Read')" class="mt-6 w-full bg-primary text-on-primary py-2.5 pill-btn text-sm font-semibold hover:opacity-90 transition">
            + Add to Reading List
          </button>
        `;
        resultsContainer.appendChild(card);
      });
    } catch (err) {
      resultsContainer.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Failed to fetch books. Please check connection.</div>';
    }
  }

  // Hook up search button event listener on load
  window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    const searchBtn = document.getElementById('book-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', searchBooksRealtime);
    }
    const searchInput = document.getElementById('book-search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBooksRealtime();
      });
    }
  });
</script>