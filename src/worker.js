const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // GET /api/week/:weekKey
    if (request.method === 'GET' && path.startsWith('/api/week/')) {
      const weekKey = decodeURIComponent(path.split('/api/week/')[1]);
      if (!weekKey) return err('Missing weekKey');
      const week = await env.DB.prepare('SELECT * FROM weeks WHERE week_key = ?').bind(weekKey).first();
      const tasks = await env.DB.prepare('SELECT * FROM tasks WHERE week_key = ? ORDER BY category, position ASC').bind(weekKey).all();
      return json({ week: week || null, tasks: tasks.results || [] });
    }

    // POST /api/week/:weekKey
    if (request.method === 'POST' && path.startsWith('/api/week/')) {
      const weekKey = decodeURIComponent(path.split('/api/week/')[1]);
      if (!weekKey) return err('Missing weekKey');
      const body = await request.json().catch(() => null);
      if (!body) return err('Invalid JSON body');
      const { weekNum, dateFrom, dateTo, notes, tasks } = body;
      await env.DB.prepare(`
        INSERT INTO weeks (week_key, week_num, date_from, date_to, notes, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(week_key) DO UPDATE SET
          week_num = excluded.week_num,
          date_from = excluded.date_from,
          date_to = excluded.date_to,
          notes = excluded.notes,
          updated_at = datetime('now')
      `).bind(weekKey, weekNum || null, dateFrom || '', dateTo || '', notes || '').run();
      await env.DB.prepare('DELETE FROM tasks WHERE week_key = ?').bind(weekKey).run();
      if (tasks && tasks.length > 0) {
        const stmt = env.DB.prepare(`INSERT INTO tasks (id, week_key, category, text, done, position, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`);
        const batch = tasks.map((t, i) => stmt.bind(t.id, weekKey, t.category, t.text || '', t.done ? 1 : 0, i));
        await env.DB.batch(batch);
      }
      return json({ ok: true, weekKey });
    }

    // GET /api/weeks
    if (request.method === 'GET' && path === '/api/weeks') {
      const rows = await env.DB.prepare('SELECT week_key, week_num, date_from, date_to, updated_at FROM weeks ORDER BY week_key DESC').all();
      return json({ weeks: rows.results || [] });
    }

    // DELETE /api/week/:weekKey
    if (request.method === 'DELETE' && path.startsWith('/api/week/')) {
      const weekKey = decodeURIComponent(path.split('/api/week/')[1]);
      await env.DB.prepare('DELETE FROM tasks WHERE week_key = ?').bind(weekKey).run();
      await env.DB.prepare('DELETE FROM weeks WHERE week_key = ?').bind(weekKey).run();
      return json({ ok: true });
    }

    return err('Not found', 404);
  },
};
