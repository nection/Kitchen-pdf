// --- Importem les nostres eines ---
const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// --- Configuració de l'aplicació ---
const app = express();
const port = 3000;
const baseURL = `http://localhost:${port}`;
app.use(express.static('public'));

// --- PRE-COMPILACIÓ DE TOTES LES PLANTILLES ---
const compileTemplate = (templateName) => {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    return Handlebars.compile(fs.readFileSync(templatePath, 'utf8'));
};

const plantillaPortada = compileTemplate('portada');
const plantillaIndex = compileTemplate('index_continguts');
const plantillaTitolSeccio = compileTemplate('pagina_titol_seccio');
const plantillaContraportada = compileTemplate('contraportada');
const plantillaPaginaEnBlanc = compileTemplate('pagina_en_blanc');

// --- RUTA DEL PANELL DE CONTROL ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- RUTA QUE GENERA EL CATÀLEG ---
app.get('/generar-cataleg', async (req, res) => {
    try {
        console.log("Rebuda petició per generar el catàleg amb índex automàtic...");

        // --- DADES DE PROVA ---
        const dadesGenerals = { nomEmpresa: "DELTA", any: new Date().getFullYear(), baseURL: baseURL };
        const dadesIndex = {
            columnes: [
                [ { titolGrup: "Producto", entrades: [{ titol: "Presentación", idSeccio: "ancora-presentacio" }]},
                  { titolGrup: "Puertas", entrades: [{ titol: "Laminados", idSeccio: "ancora-laminats" }] } ],
                [ { titolGrup: "Muebles gola", entrades: [{ titol: "Bajos", idSeccio: "ancora-gola-baixos" }]},
                  { titolGrup: "Baldas", entrades: [{ titol: "Baldas laminadas", idSeccio: "ancora-baldes-laminades" }] } ]
            ]
        };
        const contingutDocument = [
            { id: "ancora-presentacio", plantilla: plantillaTitolSeccio, dades: { titol: "PRODUCTO" } },
            { id: "ancora-laminats", plantilla: plantillaTitolSeccio, dades: { titol: "PUERTAS" } },
            { id: "ancora-gola-baixos", plantilla: plantillaTitolSeccio, dades: { titol: "MUEBLES GOLA" } },
            { id: "ancora-baldes-laminades", plantilla: plantillaTitolSeccio, dades: { titol: "BALDAS" } },
        ];
        
        // --- CONSTRUCCIÓ DE L'HTML ---
        const htmlPortada = plantillaPortada(dadesGenerals);
        const htmlContraportada = plantillaContraportada(dadesGenerals);
        const htmlPaginaEnBlanc = plantillaPaginaEnBlanc({});
        const htmlIndex = `<div id="ancora-index">` + plantillaIndex(dadesIndex) + `</div>`;
        let htmlContingut = '';
        for (const pagina of contingutDocument) {
            htmlContingut += `<div id="${pagina.id}">` + pagina.plantilla(pagina.dades) + `</div>`;
        }
        
        const contingutComplet = htmlPortada + htmlContraportada + htmlPaginaEnBlanc + htmlIndex + htmlContingut;
        
        const documentCompletHtml = `
            <!DOCTYPE html><html><head><meta charset="utf-8"/><title>Catàleg</title>
            <style>
                @font-face { font-family: 'Ramillas'; src: url('${baseURL}/fonts/TT Ramillas Trial Light-titols.woff2'); }
                @font-face { font-family: 'Gill Sans'; src: url('${baseURL}/fonts/Gill Sans Light-cos.woff2'); }
                @font-face { font-family: 'Fontsspring'; src: url('${baseURL}/fonts/fontsspring.woff2'); }
                body { margin: 0; padding: 0; font-family: 'Gill Sans', sans-serif; color: #2C2A29; }
                .pagina { width: 210mm; height: 297mm; box-sizing: border-box; display: flex; flex-direction: column; }
                .pagina:not(:first-child) { page-break-before: always; }
            </style></head><body>${contingutComplet}</body></html>
        `;

        // --- GENERACIÓ DEL PDF ---
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(documentCompletHtml, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        
        // --- CÀLCUL FINAL DE L'ÍNDEX ---
        await page.evaluate(() => {
            const alcadaPagina = document.querySelector('.pagina')?.offsetHeight || 1123;
            const getPageNumber = (elementId) => {
              const ancora = document.getElementById(elementId);
              return ancora ? Math.floor(ancora.offsetTop / alcadaPagina) + 1 : '?';
            };

            const numPaginaIndex = getPageNumber('ancora-index');
            document.querySelectorAll('.pagina-index .numero-pagina').forEach(marcador => {
                const idSeccio = marcador.dataset.referencia;
                if (idSeccio) marcador.textContent = getPageNumber(idSeccio);
            });
            const peuIndex = document.querySelector('.peu-de-pagina-index .numero-pagina');
            if (peuIndex) peuIndex.textContent = numPaginaIndex;
        });

        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cataleg-final-final.pdf');
        res.send(pdfBuffer);
    
    } catch (error) {
        console.error('Error general:', error);
        if (!res.headersSent) res.status(500).send('Error generant el PDF.');
    }
});

app.listen(port, () => {
    console.log(`Servidor escoltant a http://localhost:${port}`);
});