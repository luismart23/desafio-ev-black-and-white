import express from 'express';
import path from 'path';
import { engine } from 'express-handlebars';
import Jimp from 'jimp';
import { nanoid } from 'nanoid';

const app = express();

// Ruta absoluta
const __dirname = import.meta.dirname;

// Configuración de Handlebars como motor de plantillas
app.engine('.hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos (CSS)
app.use('/assets/css', express.static(path.join(__dirname, 'public/assets/css')));

// Middleware para analizar el cuerpo de la solicitud
app.use(express.urlencoded({ extended: true }));

// Ruta raíz para mostrar el formulario
app.get('/', (req, res) => {
    res.render('home');
});

// Ruta para procesar la imagen
app.post('/process', async (req, res) => {
    try {
        // Obtener la URL de la imagen del formulario
        const imageURL = req.body.URL;

        // Validar si se proporcionó una URL en el cuerpo de la solicitud
        if (!imageURL) {
            throw new Error('No se proporcionó una URL de imagen.');
        }

        // Procesar la imagen con Jimp
        const image = await Jimp.read(imageURL);
        const processedImage = await image.resize(350, Jimp.AUTO).greyscale();

        // Generar un ID único para el nombre del archivo
        const filename = `${nanoid()}.jpg`;

        // Guardar la imagen procesada en la carpeta de imágenes públicas
        const imagePath = path.join(__dirname, 'public/images', filename);
        await processedImage.writeAsync(imagePath);

        // Redirigir al usuario a la imagen procesada
        res.redirect(`/images/${filename}`);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

// Ruta para servir las imágenes procesadas
app.get('/images/:filename', (req, res) => {
    const { filename } = req.params;
    res.sendFile(path.join(__dirname, 'public/images', filename));
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

