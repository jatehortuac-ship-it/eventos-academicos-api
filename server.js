require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_KEY || '').replace(/\s/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

const origens = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : '*';

app.use(cors({ origin: origens }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API de Eventos Acadêmicos funcionando' });
});

app.get('/eventos', async (req, res) => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error(error.message);
    return res.status(500).json({ erro: 'Erro ao buscar eventos' });
  }

  res.json(data);
});

app.post('/eventos', async (req, res) => {
  const { titulo, descricao, data_evento, local } = req.body;

  if (!titulo || !data_evento || !local) {
    return res.status(400).json({ erro: 'Título, data e local são obrigatórios' });
  }

  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data_evento)) {
    return res.status(400).json({ erro: 'A data deve estar no formato DD/MM/AAAA' });
  }

  const { data, error } = await supabase
    .from('eventos')
    .insert([{ titulo, descricao, data_evento, local }])
    .select();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ erro: 'Erro ao cadastrar evento' });
  }

  res.status(201).json(data[0]);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
