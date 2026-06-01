// chatbotControlador.js - asistente IA con RAG
// RAG = busca datos reales en la BD y se los pasa a Ollama
// para que responda solo con informacion verdadera, sin inventar

const axios = require('axios');
const pool = require('../configuracion/HalalconnectDB');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODELO = 'llama3.2';

// busca en la BD los datos relevantes segun lo que pregunta el usuario
// esto es la parte "Retrieval" del RAG
async function buscarContexto(pregunta) {
    const texto = pregunta.toLowerCase();
    let contexto = '';

    try {
        // siempre traemos algunos productos disponibles
        const productos = await pool.query(`
            SELECT p.nombre, p.marca, p.precio, c.nombre AS categoria, cl.nombre_empresa
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN clientes cl ON p.cliente_id = cl.id
            LIMIT 20
        `);

        if (productos.rows.length > 0) {
            contexto += 'PRODUCTOS DISPONIBLES EN LA PLATAFORMA:\n';
            productos.rows.forEach(p => {
                contexto += `- ${p.nombre}`;
                if (p.marca) contexto += ` (marca ${p.marca})`;
                if (p.categoria) contexto += `, categoria: ${p.categoria}`;
                if (p.precio && p.precio > 0) contexto += `, precio: ${p.precio} euros`;
                if (p.nombre_empresa) contexto += `, vendido por ${p.nombre_empresa}`;
                contexto += '\n';
            });
        }

        // si pregunta por tiendas, ubicaciones o ciudades, traemos establecimientos
        if (texto.includes('tienda') || texto.includes('donde') || texto.includes('cerca') ||
            texto.includes('ciudad') || texto.includes('restaurante') || texto.includes('comprar')) {
            const tiendas = await pool.query(`
                SELECT e.nombre, e.tipo, e.direccion, ci.nombre AS ciudad
                FROM establecimientos e
                LEFT JOIN ciudades ci ON e.ciudad_id = ci.id
                LIMIT 15
            `);
            if (tiendas.rows.length > 0) {
                contexto += '\nTIENDAS Y ESTABLECIMIENTOS HALAL:\n';
                tiendas.rows.forEach(t => {
                    contexto += `- ${t.nombre} (${t.tipo || 'establecimiento'})`;
                    if (t.ciudad) contexto += ` en ${t.ciudad}`;
                    if (t.direccion) contexto += `, direccion: ${t.direccion}`;
                    contexto += '\n';
                });
            }
        }

    } catch (error) {
        console.log('Error al buscar contexto:', error.message);
    }

    return contexto;
}

// recibe la pregunta del usuario, busca contexto y pregunta a Ollama
const preguntar = async (req, res) => {
    try {
        const { pregunta } = req.body;
        if (!pregunta) return res.status(400).json({ error: 'Falta la pregunta' });

        // PASO 1 (Retrieval): buscamos datos reales en la BD
        const contexto = await buscarContexto(pregunta);

        // PASO 2 (Augmented): construimos el prompt con los datos reales
        const prompt = `Eres el asistente virtual de HalalConnect, una plataforma de productos Halal en España. 
Responde de forma amable, breve y SOLO usando la informacion que te doy a continuacion. 
Si no tienes el dato, di que no lo tienes y sugiere buscar en la plataforma. 
NO inventes productos ni precios que no esten en la lista.

INFORMACION REAL DE LA PLATAFORMA:
${contexto}

PREGUNTA DEL USUARIO: ${pregunta}

RESPUESTA (en español, breve y util):`;

        // PASO 3 (Generation): Ollama genera la respuesta
        const respuesta = await axios.post(OLLAMA_URL, {
            model: MODELO,
            prompt: prompt,
            stream: false
        });

        res.json({ respuesta: respuesta.data.response });

    } catch (error) {
        console.log('Error en el chatbot:', error.message);
        res.status(500).json({ error: 'El asistente no esta disponible en este momento' });
    }
};

module.exports = { preguntar };