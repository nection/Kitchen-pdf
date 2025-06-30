// Importem les eines que farem servir
const express = require('express');
const puppeteer = require('puppeteer');

// Creem l'aplicació i definim el port
const app = express();
const port = 3000;

// --- LES NOSTRES RUTES (ELS ENDPOINTS) ---

// 1. Ruta principal d'informació
app.get('/', (req, res) => {
  res.send('<h1>API per a generar PDFs de CatalogPlayer</h1><p>Aquest servei està funcionant.</p>');
});

// 2. Ruta per generar el PDF de prova
app.get('/generar-pdf-test', async (req, res) => {
  console.log('Petició de prova rebuda. Generant PDF de test...');
  
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const contingutHtml = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; margin: 2cm; }
            h1 { color: #3498db; }
            p { font-size: 14px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <h1>PDF de Prova</h1>
          <p>Si veus això, vol dir que <strong>Puppeteer</strong> funciona correctament!</p>
        </body>
      </html>
    `;

    await page.setContent(contingutHtml);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // Enviem el PDF creat
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=test-cataleg.pdf');
    res.send(pdfBuffer);

    console.log('PDF de test generat i enviat.');

  } catch (error) {
    console.error('Error durant la generació del PDF de test:', error);
    res.status(500).send('Error intern generant el PDF.');
  }
});


// --- ARRENCADA DEL SERVIDOR ---

app.listen(port, () => {
  console.log(`Servidor 'catalog-pdf' escoltant a http://localhost:${port}`);
});