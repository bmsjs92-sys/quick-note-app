const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataPath = path.join(__dirname, 'data', 'coffees.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function readCoffees() {
  const raw = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(raw);
}

async function writeCoffees(coffees) {
  await fs.writeFile(dataPath, JSON.stringify(coffees, null, 2), 'utf8');
}

function getTopBlends(coffees, limit = 3) {
  return [...coffees]
    .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name))
    .slice(0, limit);
}

app.get('/api/coffees', async (req, res) => {
  try {
    const coffees = await readCoffees();
    const search = (req.query.q || '').trim().toLowerCase();
    const roast = (req.query.roast || '').trim().toLowerCase();

    const filtered = coffees.filter((coffee) => {
      const matchesRoast = !roast || roast === 'all' || coffee.roast.toLowerCase() === roast;
      const matchesSearch =
        !search ||
        coffee.name.toLowerCase().includes(search) ||
        coffee.origin.toLowerCase().includes(search) ||
        coffee.notes.toLowerCase().includes(search);

      return matchesRoast && matchesSearch;
    });

    res.json({
      coffees: filtered,
      leaderboard: getTopBlends(coffees)
    });
  } catch (err) {
    res.status(500).json({ error: 'Unable to load coffee blends' });
  }
});

app.post('/api/coffees/:id/vote', async (req, res) => {
  try {
    const coffees = await readCoffees();
    const blend = coffees.find((item) => item.id === req.params.id);

    if (!blend) {
      return res.status(404).json({ error: 'Blend not found' });
    }

    blend.votes += 1;
    await writeCoffees(coffees);

    res.json({
      updatedCoffee: blend,
      leaderboard: getTopBlends(coffees)
    });
  } catch (err) {
    res.status(500).json({ error: 'Unable to record vote' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});