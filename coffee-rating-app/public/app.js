const coffeeGrid = document.getElementById('coffee-grid');
const leaderboardList = document.getElementById('leaderboard-list');
const searchInput = document.getElementById('search-input');
const roastFilter = document.getElementById('roast-filter');

async function fetchCoffees() {
  const params = new URLSearchParams();
  const query = searchInput.value.trim();
  const roast = roastFilter.value;

  if (query) params.set('q', query);
  if (roast && roast !== 'all') params.set('roast', roast);

  const response = await fetch(`/api/coffees?${params.toString()}`);
  const data = await response.json();

  renderCoffees(data.coffees || []);
  renderLeaderboard(data.leaderboard || []);
}

function renderCoffees(coffees) {
  if (!coffees.length) {
    coffeeGrid.innerHTML = '<p class="empty-state">No coffee blends match your filter.</p>';
    return;
  }

  coffeeGrid.innerHTML = coffees
    .map(
      (coffee) => `
        <article class="coffee-card">
          <div>
            <div class="card-header">
              <span class="origin">${coffee.origin}</span>
              <span class="roast-badge">${coffee.roast}</span>
            </div>
            <h3>${coffee.name}</h3>
            <p class="notes">${coffee.notes}</p>
          </div>
          <div class="card-footer">
            <span class="vote-count" data-vote-id="${coffee.id}">${coffee.votes} votes</span>
            <button class="vote-btn" data-id="${coffee.id}">Vote</button>
          </div>
        </article>
      `
    )
    .join('');
}

function renderLeaderboard(items) {
  leaderboardList.innerHTML = items
    .map(
      (item, index) => `
        <li class="leaderboard-item">
          <div class="rank-info">
            <span class="rank-number">${index + 1}</span>
            <span>${item.name}</span>
          </div>
          <span class="rank-votes">${item.votes}</span>
        </li>
      `
    )
    .join('');
}

async function submitVote(id, button) {
  button.disabled = true;
  try {
    const response = await fetch(`/api/coffees/${encodeURIComponent(id)}/vote`, {
      method: 'POST'
    });

    if (!response.ok) return;

    const { updatedCoffee, leaderboard } = await response.json();
    const counter = document.querySelector(`[data-vote-id="${updatedCoffee.id}"]`);

    if (counter) {
      counter.textContent = `${updatedCoffee.votes} votes`;
    }

    renderLeaderboard(leaderboard);
  } finally {
    button.disabled = false;
  }
}

coffeeGrid.addEventListener('click', (event) => {
  const button = event.target.closest('.vote-btn');
  if (!button) return;
  submitVote(button.dataset.id, button);
});

searchInput.addEventListener('input', fetchCoffees);
roastFilter.addEventListener('change', fetchCoffees);

fetchCoffees();