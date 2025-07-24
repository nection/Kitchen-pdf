// --- Importem les nostres eines ---
const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const Handlebars = require('handlebars');

// --- Configuració de l'aplicació ---
const app = express();
const port = 3000;
const baseURL = `http://localhost:${port}`;
app.use(express.static('public'));


// --- PLANTILLES HANDLEBARS (TOT EL CODI DINS D'AQUEST FITXER) ---

// 1. Plantilla de la Portada
const templateStringPortada = `
<div class="pagina portada">
  <style>
    .portada { background-color: #ec8674; padding: 40px; text-align: center; justify-content: space-between; }
    .portada .portada-text { margin-top: 50%; }
    .portada .portada-text h1 { font-family: 'Ramillas', serif; font-size: 65px; line-height: 1.3; font-weight: 400; margin: 0; }
    .portada .portada-logo { font-family: 'Fontsspring', sans-serif; font-size: 150px; letter-spacing: -3px; width: 100%; margin-bottom: -40px !important; }
  </style>
  <div class="portada-text"><h1>Tu cocina.<br>Una nueva forma<br>de saber vivir.</h1></div>
  <div class="portada-logo">{{nomEmpresa}}</div>
</div>`;

// 2. Plantilla de l'Índex (VERSIÓ CORREGIDA)
const templateStringIndex = `
<div class="pagina pagina-index">
  <style>
    .pagina-index { padding: 2cm 2cm 1.5cm 2cm; justify-content: flex-start; flex-direction: column; }
    .pagina-index .capcalera-index { display: flex; justify-content: flex-end; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 30px; }
    .pagina-index .capcalera-index h1 { font-size: 11px; font-weight: 600; text-transform: uppercase; margin: 0; letter-spacing: 2px; }
    .pagina-index .contingut-index { display: flex; gap: 40px; font-family: 'Gill Sans', sans-serif; font-size: 10px; line-height: 1.6; flex-grow: 1; }
    .pagina-index .columna-index { flex: 1; }
    .pagina-index .grup-index { margin-bottom: 20px; }
    .pagina-index .grup-index .titol-grup { font-weight: bold; margin-bottom: 10px; }
    .pagina-index .linia-index { display: flex; align-items: baseline; }
    .pagina-index .linia-index .numero-pagina { width: 25px; text-align: right; margin-right: 15px; flex-shrink: 0; }
    .pagina-index .linia-index .titol-entrada { flex-grow: 1; }
    .pagina-index .peu-de-pagina-index { text-align: right; font-size: 12px; margin-top: auto; padding-top: 20px; }
  </style>
  <div class="capcalera-index"><h1>ÍNDICE</h1></div>
  <div class="contingut-index">
    {{#each columnes}}
      <div class="columna-index">
        {{#each this}}
          <div class="grup-index">
            <p class="titol-grup">{{this.titolGrup}}</p>
            {{#each this.entrades}}
              <div class="linia-index">
                <span class="numero-pagina" data-referencia="{{this.idSeccio}}">?</span>
                <span class="titol-entrada">{{{this.titol}}}</span>
              </div>
            {{/each}}
          </div>
        {{/each}}
      </div>
    {{/each}}
  </div>
  <div class="peu-de-pagina-index"><span class="numero-pagina"></span></div>
</div>`;

// 3. Plantilla de Títol de Secció
const templateStringTitolSeccio = `
<div class="pagina pagina-titol-seccio">
  <style>
    .pagina-titol-seccio { display: flex; justify-content: center; align-items: center; background-color: #ffffff; }
    .pagina-titol-seccio h2 { font-family: 'Ramillas', serif; font-size: 50px; color: #dddddd; text-transform: uppercase; letter-spacing: 5px; }
  </style>
  <h2>{{titol}}</h2>
</div>`;

// 4. Plantilla de la Contraportada
const templateStringContraportada = `
<div class="pagina contraportada">
  <style>
     .contraportada { background-color: #F5F1E9; padding: 40px; font-size: 9px; line-height: 1.2; font-family: 'Gill Sans', sans-serif; justify-content: space-between; }
    .contraportada .contraportada-legal { text-transform: uppercase; flex-shrink: 0; }
    .contraportada .contraportada-legal p { margin: 0 0 0.2em 0; }
    .contraportada .contraportada-legal strong { font-weight: bold; }
    .contraportada .contraportada-certificats { display: flex; justify-content: flex-start; align-items: center; gap: 15px; margin-top: 10px; }
    .contraportada .contraportada-certificats img { height: 55px; }
    .contraportada .contraportada-peu { display: flex; align-items: flex-end; padding-top: 20px; font-size: 10px; flex-shrink: 0; }
    .contraportada .peu-esquerra { text-align: left; }
    .contraportada .peu-esquerra .logo-final { width: 120px; margin-bottom: 25px; }
    .contraportada .peu-esquerra p { margin: 5px 0; text-transform: uppercase; line-height: 1.2; }
    .contraportada .peu-esquerra .web { font-weight: bold; margin-top: 25px; margin-bottom: -10px; }
    .contraportada .peu-esquerra .social { display: flex; align-items: center; gap: 15px; text-transform: none; }
    .contraportada .peu-esquerra .social p { margin: 0; font-size: 9px; line-height: 1.2; }
    .contraportada .peu-esquerra .social .social-icons { height: 16px; width: auto; }
    .contraportada .peu-esquerra .social .qr-code { width: 70px; height: 70px; }
    .contraportada .peu-esquerra .social .logo-kbv { height: 40px; }
    .social { display: flex; align-items: center; gap: 20px; }
    .vertical-divider { width: 1px; height: 60px; background-color: #D1C9B9; }
  </style>
  <div class="contraportada-legal">
    <p>® DELTA. RESERVADOS TODOS LOS DERECHOS. <strong>DICIEMBRE {{any}}</strong>.</p>
    <p>SE PROHIBE LA REPRODUCCIÓN DE ESTE CATÁLOGO PARCIAL O TOTALMENTE SIN NUESTRO PERMISO POR ESCRITO.</p>
    <p>EL FABRICANTE SE RESERVA EL DERECHO DE INTRODUCIR LOS CAMBIOS Y MODIFICACIONES QUE CONSIDERE OPORTUNOS PARA LA MEJORA DEL PRODUCTO.</p>
    <p>NO RESPONDEMOS DE POSIBLES ERRATAS U OTROS ERRORES.</p>
    <div class="contraportada-certificats">
      <img src="{{baseURL}}/images/aenor-calidad.png" alt="Aenor Calidad"> <img src="{{baseURL}}/images/aenor-ambiental.png" alt="Aenor Ambiental"> <img src="{{baseURL}}/images/diseno-sostenible.png" alt="Diseño Sostenible"> <img src="{{baseURL}}/images/made-in-spain.png" alt="Made in Spain"> <img src="{{baseURL}}/images/garantia-15.png" alt="Garantía 15 años">
    </div>
  </div>
  <div class="contraportada-peu">
    <div class="peu-esquerra">
      <img src="{{baseURL}}/images/logo-delta-negre.png" alt="Logo Delta" class="logo-final">
      <p>POLÍGONO MARTÍN GRANDE 5<br>26550 RINCÓN DE SOTO · LA RIOJA · SPAIN<br>+34 941 160 669<br>DELTA@DELTACOCINAS.COM</p>
      <p class="web">DELTACOCINAS.COM</p>
      <div class="social">
        <p>síguenos<br>follow us</p> <img src="{{baseURL}}/images/social-icons.png" alt="Social Media" class="social-icons"> <div class="vertical-divider"></div> <img src="{{baseURL}}/images/logo-kbv.png" alt="KBV Logo" class="logo-kbv"> <img src="{{baseURL}}/images/qr-code.png" alt="QR Code" class="qr-code">
      </div>
    </div>
  </div>
</div>`;

// 5. Plantilla de Pàgina en Blanc
const templateStringPaginaEnBlanc = `
<div class="pagina pagina-blanca">
  <style> .pagina-blanca { background-color: #F5F1E9; } </style>
</div>`;

// 6. Plantilla del Separador
const templateStringSeparador = `
<div class="pagina separador">
  <style>
    .separador { background-color: #F5F1E9; justify-content: flex-end; align-items: center; padding: 40px; }
    .separador .separador-logo { font-family: 'Fontsspring', sans-serif; font-size: 130px; letter-spacing: -3px; width: 100%; text-align: center; }
  </style>
  <div class="separador-logo">{{nomEmpresa}}</div>
</div>`;

// 7.Pagina portada de Categoria

const templateStringPortadaCategoria = `
<div class="pagina portada-categoria">
  <style>
    .portada-categoria { background-color: #ec8674; padding: 40px; text-align: center; justify-content: space-between; align-items: center; flex-direction: column; }
    .portada-categoria .icona-armari { margin-top: 20%; width: 100px; height: auto; margin-bottom: 20px; } /* Icona petita a la part superior */
    .portada-categoria .titol-principal { font-family: 'Gill Sans', sans-serif; font-size: 55px; font-weight: 500; margin-bottom: 40px; color: #2C2A29; } /* Títol en minúscules */
    .portada-categoria .llista-subcategories { list-style: none; padding: 0; margin: 0; font-family: 'Gill Sans', sans-serif; font-size: 22px; line-height: 1.3; text-transform: uppercase; color: #2C2A29; }
    .portada-categoria .llista-subcategories li { margin-bottom: 5px; }
    .portada-categoria .portada-logo { font-family: 'Fontsspring', sans-serif; font-size: 150px; letter-spacing: -3px; width: 100%; margin-top: auto; margin-bottom: -40px !important; color: #2C2A29; }
  </style>
  <img src="{{baseURL}}/images/puertasportada.png" class="icona-armari" alt="Icona Armari">
  <h1 class="titol-principal">{{titolPrincipal}}</h1>
  <ul class="llista-subcategories">
    {{#each subcategories}}
      <li>{{this}}</li>
    {{/each}}
  </ul>
  <div class="portada-logo">{{nomEmpresa}}</div>
</div>`;

// 8. Plantilla Base per a Pàgines de Contingut (VERSIÓ CORREGIDA)
const templateStringPaginaBase = `
<div class="pagina pagina-contingut {{classeExtra}}">
  <style>
    .pagina-contingut { background-color: #ffffff; padding: 1.5cm 2cm 1cm 2cm; font-family: 'Gill Sans', sans-serif; font-size: 9px; line-height: 1.4; position: relative; display: flex; flex-direction: column; }
    
    /* --- CORRECCIÓ: ESTILS DE LA PESTANYA PER ASSEMBLAR-SE A LA CAPTURA --- */
    .pestanya-lateral { 
      position: absolute; 
      top: 1.5cm; 
      right: 0; /* Ajustat per mantenir-la dins la pàgina i evitar barres/overflow */
      background-color: #2C2A29; /* Color gris fosc del tema */
      color: #fff; /* Text en blanc */
      padding: 10px 6px; /* Ajustat per a l'aspecte de la captura */
      writing-mode: vertical-rl; 
      text-orientation: mixed; 
      transform: rotate(180deg); 
      font-size: 9px; 
      letter-spacing: 1.5px; /* Una mica més d'espaiat */
      text-transform: uppercase; 
      font-weight: bold;
    }

    .capcalera-pagina { font-family: 'Ramillas', serif; text-transform: uppercase; font-size: 14px; letter-spacing: 2px; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 25px; color: #333; margin-right: 30px; /* Afegit per fer espai a la pestanya i evitar solapaments */ }
    .contingut-principal { flex-grow: 1; display: flex; flex-direction: column; margin-right: 30px; /* Afegit per fer espai a la pestanya i evitar solapaments */ }
    .peu-pagina-contingut { 
      text-align: right; 
      font-size: 12px;
      font-family: 'Gill Sans', sans-serif;
      color: #555; 
      margin-top: auto; 
      padding-top: 20px; 
      margin-right: 30px; /* Afegit per fer espai a la pestanya i evitar solapaments */
    }
  </style>
  <div class="pestanya-lateral">PUERTAS</div>
  <div class="capcalera-pagina">{{capcalera}}</div>
  <div class="contingut-principal">{{{contingut}}}</div>
  <div class="peu-pagina-contingut"><span class="numero-pagina"></span></div>
</div>`;

// 9. Plantilla per a les Fitxes de Models Laminats (VERSIÓ CORREGIDA)
const templateStringFitxaModelLaminat = `
<style>
  .fitxa-model-contenidor { display: flex; flex-direction: column; justify-content: flex-start; flex-grow: 1; } /* Canviat a flex-start per alinear a dalt i deixar espai a sota */
  /* --- CANVI: Assegura que cada grup té la mateixa alçada --- */
  .grup-model { display: flex; flex-direction: column; flex-grow: 0; flex-basis: calc(50% - 10px); max-height: calc(50% - 10px); } /* Afegit max-height per limitar estrictament a 50%, i flex-grow:0 per no expandir */
  .grup-model + .grup-model {
    border-top: 1px solid #ddd;
    margin-top: 10px; /* Reduït de 20px per compactar verticalment */
    padding-top: 10px; /* Reduït de 20px per compactar verticalment */
  }
  .fitxa-model { display: flex; gap: 30px; align-items: stretch; flex-grow: 1; }
  .fitxa-model .columna-imatge { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; }
  .fitxa-model .columna-imatge .imatge-principal { flex-grow: 1; display:flex; align-items: flex-start; justify-content:center; }
  .fitxa-model .columna-imatge .imatge-principal img { max-width: 100%; max-height: 280px; object-fit: contain; } /* Mantenim original 280px, no es fa més petita */
  .fitxa-model .columna-imatge .bloc-detall-sota { padding-top: 10px; } /* Reduït de 15px per compactar */
  .fitxa-model .columna-imatge .bloc-detall-sota img { max-height: 120px; width: auto; } /* Augmentat a 120px per aprofitar més espai */
  .fitxa-model .detalls-model { flex: 1.5; display: flex; flex-direction: column; }
  .titol-model { font-family: 'Ramillas', serif; font-size: 16px; text-transform: uppercase; margin:0 0 10px 0; letter-spacing: 1px; } /* Permet wrapping si el títol és llarg */
  .taula-models, .taula-descripcio { width: 100%; border-collapse: collapse; font-size: 9px; }
  .taula-models { margin-bottom: 0; } /* Eliminat margin fix, per deixar que space-around gestioni la separació dinàmica */
  .taula-models th, .taula-models td { padding: 3px 8px; text-align: left; border-bottom: 1px solid #eee;} /* Reduït padding de 5px a 3px */
  .taula-models th { font-weight: bold; border-bottom: 1px solid #ccc; }
  .taula-descripcio td { padding: 3px 8px; border-bottom: 1px solid #eee; } /* Reduït padding de 4px a 3px */
  .taula-descripcio td:first-child { font-weight: bold; width: 80px; vertical-align: top;}
  .new-tag { font-size: 8px; font-weight: bold; color: #fff; background-color: #ec8674; padding: 2px 6px; border-radius: 3px; margin-left: 10px; vertical-align: middle; }
  .bloc-detall-dreta { display: flex; align-items: center; justify-content: center; gap: 10px; } /* Sense flex-grow per adaptar-se a l'espai disponible */
  .bloc-detall-dreta img { max-width: 60px; max-height: 100%; width: auto; flex-shrink: 0; } /* Mantingut per cabre bé */
  .bloc-detall-dreta span { font-size: 9px; }
  .descripcio-final { } /* Sense margin-top addicional, l'espai ve del justify-content */
  .contingut-detalls { display: flex; flex-direction: column; flex-grow: 1; justify-content: space-around; } /* Space-around per separar dinàmicament */
  .contingut-detalls.amb-detall-dreta { justify-content: space-between; } /* Si hi ha detall dreta, maximitza espai mig */
</style>
<div class="fitxa-model-contenidor">
  {{#each grups}}
    <div class="grup-model">
      <div class="fitxa-model">
        <div class="columna-imatge">
          <div class="imatge-principal">
            {{#if imatge}}<img src="{{../baseURL}}/images/{{imatge}}" alt="Imatge del model {{titol}}">{{/if}}
          </div>
          {{#if imatgeDetallSota}} <!-- Mostra bloc sota només si hi ha imatgeDetallSota -->
            <div class="bloc-detall-sota">
              <img src="{{../baseURL}}/images/{{imatgeDetallSota}}" alt="Detall sota del model {{titol}}">
              {{#if textDetallSota}}<span>{{{textDetallSota}}}</span>{{/if}} <!-- Mostra text només si existeix -->
            </div>
          {{/if}}
        </div>
        <div class="detalls-model">
          <h3 class="titol-model">{{titol}} {{#if nou}}<span class="new-tag">NEW</span>{{/if}}</h3>
          <div class="contingut-detalls {{#if imatgeDetallDreta}}amb-detall-dreta{{/if}}"> <!-- Classe condicional si hi ha detall dreta -->
            <table class="taula-models">
              <thead><tr><th>Modelos</th><th>Códigos</th><th>Tarifas</th></tr></thead>
              <tbody>{{#each models}}<tr><td>{{model}}</td><td>{{codi}}</td><td>{{tarifa}}</td></tr>{{/each}}</tbody>
            </table>
            
            {{#if imatgeDetallDreta}} <!-- Mostra bloc dreta només si hi ha imatgeDetallDreta -->
              <div class="bloc-detall-dreta">
                <img src="{{../baseURL}}/images/{{imatgeDetallDreta}}" alt="Detall dreta del model {{titol}}">
                {{#if textDetallDreta}}<span>{{{textDetallDreta}}}</span>{{/if}} <!-- Mostra text només si existeix -->
              </div>
            {{/if}}
            
            <div class="descripcio-final">
              {{#if descripcio}}
                <strong>Descripción:</strong>
                <table class="taula-descripcio">
                  <tbody>
                    {{#each descripcio}}
                      <tr><td>{{this.clau}}</td><td>{{{this.valor}}}</td></tr>
                    {{/each}}
                  </tbody>
                </table>
              {{/if}}
            </div>
          </div> <!-- Fi del wrapper -->
        </div>
      </div>
    </div>
  {{/each}}
</div>`;


// --- PRE-COMPILACIÓ DE TOTES LES PLANTILLES ---
Handlebars.registerHelper('eq', (a, b) => a === b);
const plantillaPortada = Handlebars.compile(templateStringPortada);
const plantillaIndex = Handlebars.compile(templateStringIndex);
const plantillaTitolSeccio = Handlebars.compile(templateStringTitolSeccio);
const plantillaContraportada = Handlebars.compile(templateStringContraportada);
const plantillaPaginaEnBlanc = Handlebars.compile(templateStringPaginaEnBlanc);
const plantillaSeparador = Handlebars.compile(templateStringSeparador);
const plantillaPaginaBase = Handlebars.compile(templateStringPaginaBase);
const plantillaPortadaCategoria = Handlebars.compile(templateStringPortadaCategoria);
const plantillaFitxaModelLaminat = Handlebars.compile(templateStringFitxaModelLaminat);


// --- RUTA DEL PANELL DE CONTROL ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- RUTA QUE GENERA EL CATÀLEG ---
app.get('/generar-cataleg', async (req, res) => {
    try {
        console.log("Rebuda petició per generar el catàleg amb secció LAMINATS...");
const dadesGenerals = { nomEmpresa: "DELTA", any: new Date().getFullYear(), baseURL: baseURL };

const dadesIndex = {
    columnes: [
        [ // Columna Esquerra
            { titolGrup: "Producto", entrades: [
                { titol: "Presentación de producto", idSeccio: "ancora-presentacio" },
                { titol: "Interiores de muebles", idSeccio: "ancora-placeholder" },
                { titol: "Normas para hacer pedidos", idSeccio: "ancora-placeholder" },
                { titol: "Ejemplo de pedido", idSeccio: "ancora-placeholder" },
                { titol: "Plano de planta", idSeccio: "ancora-placeholder" },
                { titol: "Medidas de fabricación", idSeccio: "ancora-placeholder" },
                { titol: "Medidas de distribución", idSeccio: "ancora-placeholder" },
                { titol: "Medidas de instalación", idSeccio: "ancora-placeholder" },
                { titol: "Columnas en 2 piezas", idSeccio: "ancora-placeholder" },
                { titol: "Suplementos especiales", idSeccio: "ancora-placeholder" },
            ]},
            { titolGrup: "Puertas", entrades: [
                { titol: "Carta general de colores y materiales", idSeccio: "ancora-placeholder" },
                { titol: "Laminados", idSeccio: "ancora-laminats" },
                { titol: "Laminados Lacados", idSeccio: "ancora-laminats-lacados" },
                { titol: "Estratificados", idSeccio: "ancora-estratificados" },
                { titol: "Infinites", idSeccio: "ancora-infinites" },
                { titol: "Lacados", idSeccio: "ancora-lacados" },
                { titol: "Maderas rechapadas", idSeccio: "ancora-maderas-rechapadas" },
             { titol: "Maderas macizas", idSeccio: "ancora-maderas-macizas" },
            ]},
            { titolGrup: "A-Temporal", entrades: [
                { titol: "Presentación", idSeccio: "ancora-placeholder" },
                { titol: "Descripción de Modelos:", idSeccio: "ancora-placeholder" },
                { titol: "Daniela, Daniela 45º,", idSeccio: "ancora-placeholder" },
                { titol: "Valeria, Valeria 45º,", idSeccio: "ancora-placeholder" },
                { titol: "Lucía, Olivia.", idSeccio: "ancora-placeholder" },
            ]},
            { titolGrup: "Vitrinas y cristales", entrades: [
                { titol: "Cristales", idSeccio: "ancora-placeholder" },
                { titol: "Vitrinas de modelo", idSeccio: "ancora-placeholder" },
                { titol: "Vitrinas de aluminio", idSeccio: "ancora-placeholder" },
                { titol: "Vitrinas Elis", idSeccio: "ancora-placeholder" },
            ]},
            { titolGrup: "Muebles", entrades: [
                { titol: "Indice de muebles", idSeccio: "ancora-placeholder" },
                { titol: "Altos 45, 60, 75 y 90", idSeccio: "ancora-placeholder" },
                { titol: "Bajos 63 y 75 fondo", idSeccio: "ancora-placeholder" },
                { titol: "Altura 80 + patas", idSeccio: "ancora-placeholder" },
                { titol: "Columnas 215 + patas", idSeccio: "ancora-placeholder" },
                { titol: "Columnas 230 + patas", idSeccio: "ancora-placeholder" },
                { titol: "Semicolumnas", idSeccio: "ancora-placeholder" },
                { titol: "Sobreencimeras 135 y 150", idSeccio: "ancora-placeholder" },
            ]},
            { titolGrup: "Gola", entrades: [
                { titol: "Sistema y accesorios horizontal superior", idSeccio: "ancora-placeholder" },
                { titol: "Sistema y accesorios horizontal central", idSeccio: "ancora-placeholder" },
                { titol: "Listado bajos y soportes", idSeccio: "ancora-placeholder" },
                { titol: "Sistema vertical", idSeccio: "ancora-placeholder" },
                { titol: "Columnas en vertical", idSeccio: "ancora-placeholder" },
                { titol: "Variantes de programación", idSeccio: "ancora-placeholder" },
                { titol: "Recta sistema y accesorios", idSeccio: "ancora-placeholder" },
                { titol: "Modulación columnas y semicolumnas", idSeccio: "ancora-placeholder" },
            ]},
        ],
        [ // Columna Dreta
            { titolGrup: "Muebles gola", entrades: [
                { titol: "Bajos", idSeccio: "ancora-placeholder" },
                { titol: "Escoberos y despenseros 230", idSeccio: "ancora-placeholder" },
                { titol: "Columnas caceroleros internos 230", idSeccio: "ancora-placeholder" },
                { titol: "Columnas horno 230", idSeccio: "ancora-placeholder" },
                { titol: "Semicolumnas horno", idSeccio: "ancora-placeholder" },
            ]},
            { titolGrup: "Medidas muebles transición", entrades: [
                { titol: "Transición fondo 37", idSeccio: "ancora-placeholder" },
                { titol: "Transición fondo 63", idSeccio: "ancora-placeholder" },
                { titol: "Cambio nivel transición fondo 37 y 63", idSeccio: "ancora-placeholder" },
                { titol: "Verificación ángulos", idSeccio: "ancora-placeholder" },
            ]},
            { titolGrup: "Complementos", entrades: [
                { titol: "Frentes y puertas", idSeccio: "ancora-placeholder" },
                { titol: "Puertas de acero y frentes de campanas", idSeccio: "ancora-placeholder" },
                { titol: "Encimeras estratificado", idSeccio: "ancora-placeholder" },
                { titol: "Elementos lineales", idSeccio: "ancora-placeholder" },
            ]},
            { titolGrup: "Baldas", entrades: [
                { titol: "Baldas laminadas", idSeccio: "ancora-placeholder" },
                { titol: "Enmarques laminados y estratificados", idSeccio: "ancora-placeholder" },
                { titol: "Baldas en estratificado e infinite", idSeccio: "ancora-placeholder" },
                { titol: "Baldas y enmarques laca mate", idSeccio: "ancora-placeholder" },
                { titol: "Baldas y enmarques laca brillo", idSeccio: "ancora-placeholder" },
                { titol: "Baldas y enmarques laca metalizada mate", idSeccio: "ancora-placeholder" },
                { titol: "Baldas y enmarques laca metalizada brillo", idSeccio: "ancora-placeholder" },
                { titol: "Baldas y enmarques laca brillo/mate", idSeccio: "ancora-placeholder" },
            ]},
            { titolGrup: "Baldas madera rechapada", entrades: [
                { titol: "Baldas rechapadas 19 mm", idSeccio: "ancora-placeholder" },
                { titol: "Baldas rechapadas 30 mm", idSeccio: "ancora-placeholder" },
                { titol: "Enmarques rechapados", idSeccio: "ancora-placeholder" },
                { titol: "Regletas rectas", idSeccio: "ancora-placeholder" },
                { titol: "Regleta bisel y pata chaflán", idSeccio: "ancora-placeholder" },
            ]},
            { titolGrup: "Muestrarios", entrades: [
                { titol: "Referencias de módulos expositores", idSeccio: "ancora-placeholder" },
                { titol: "Referencias de módulos expositores y tiradores", idSeccio: "ancora-placeholder" },
                { titol: "Ejemplos de composición", idSeccio: "ancora-placeholder" },
            ]},
            { titolGrup: "Calidad", entrades: [
                { titol: "Certificado sistema de calidad ISO: 9001", idSeccio: "ancora-placeholder" },
                { titol: "Certificado de gestión medioambiental", idSeccio: "ancora-placeholder" },
                { titol: "Certificado de sostenibilidad", idSeccio: "ancora-placeholder" },
                { titol: "Política de calidad y medioambiente", idSeccio: "ancora-placeholder" },
                { titol: "Carta de garantía", idSeccio: "ancora-placeholder" },
            ]},
        ]
    ]
};

// Exemple de dades per la portada de categoria
const dadesPortadaCategoria = {
    titolPrincipal: "modelos de puertas",
    subcategories: ["LAMINADOS", "LAMINADOS LACADOS", "ESTRATIFICADOS", "INFINITES", "LACADOS", "MADERAS RECHAPADAS", "MADERAS MACIZAS"],
    nomEmpresa: "DELTA",
    baseURL: baseURL
};

const dadesLaminats = {
    capcalera: "LAMINADOS/DESCRIPCIÓN DE MODELOS",
    grups: [
        { 
            titol: "RECTAS", imatge: "rectas.png",
            models: [{ model: "NATURA", codi: "BNA02", tarifa: 1 }, { model: "NATURA 2", codi: "BA202", tarifa: 2 }], 
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Cantos', valor: '4 cantos pvc 1 mm.' }, { clau: 'Tiradores', valor: 'consultar catálogo' } ]
        },
        { 
            titol: "TIRADOR LINEAL METÁLICO NEILA NEILA NEILA NEILA", nou: true, imatge: "neila.png", imatgeDetallDreta: "neila-detall.png", textDetallDreta: "Detalle tirador<br>metálico Neila",
            models: [ { model: "NATURA NEILA", codi: "BAN10", tarifa: 2 }, { model: "NATURA NEILA LATERAL", codi: "BAN12", tarifa: 2 }, { model: "NATURA 2 NEILA", codi: "BAN20", tarifa: 3 }, { model: "NATURA 2 NEILA LATERAL", codi: "BAN22", tarifa: 3 } ], 
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Cantos', valor: '4 cantos pvc 1 mm.' }, { clau: 'Tiradores', valor: 'aluminio blanco mate, negro gratado y plata gratado.' }, { clau: 'Medidas', valor: '15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110 y 120 cm.' } ]
        },
        { 
            titol: "TIRADOR LINEAL METÁLICO LAINE", nou: true, imatge: "laine.png", imatgeDetallSota: "laine-detall.png", textDetallSota: "Detalle tirador<br>metálico Laine",
            models: [ { model: "NATURA LAINE", codi: "BAP10", tarifa: 2 }, { model: "NATURA LAINE LATERAL", codi: "BAP12", tarifa: 2 }, { model: "NATURA 2 LAINE", codi: "BAP20", tarifa: 3 }, { model: "NATURA 2 LAINE LATERAL", codi: "BAP22", tarifa: 3 } ], 
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Cantos', valor: '4 cantos pvc 1 mm.' }, { clau: 'Tiradores', valor: 'aluminio blanco mate, negro gratado y plata gratado.' }, { clau: 'Medidas', valor: '15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110 y 120 cm.' } ]
        },
        { 
            titol: "TIRADOR LINEAL METÁLICO YERGA YERGA YERGA YERGA", imatge: "yerga.png", imatgeDetallSota: "yerga-detall.png", textDetallSota: "Detalle tirador<br>metálico Yerga", // Exemple amb detall sota
            models: [ { model: "NATURA YERGA", codi: "BNY02", tarifa: 2 }, { model: "NATURA 2 YERGA", codi: "BDY02", tarifa: 3 } ], 
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Cantos', valor: '4 cantos pvc 1 mm.' }, { clau: 'Tiradores', valor: 'aluminio blanco mate, negro gratado y plata gratado.' }, { clau: 'Medidas', valor: '15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110 y 120 cm.' } ]
        },
        // Exemple amb detalls als dos llocs (per provar combinació)
        { 
            titol: "EXEMPLE AMB DOS DETALLS", nou: true, imatge: "exemple.png", imatgeDetallDreta: "detall-dreta.png", textDetallDreta: "Text dreta", imatgeDetallSota: "detall-sota.png", textDetallSota: "Text sota",
            models: [ { model: "EXEMPLE", codi: "EXM01", tarifa: 1 } ], 
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' } ]
        }
    ]
};

const dadesLaminatsLacados = {
    capcalera: "LAMINADOS LACADOS/DESCRIPCIÓN DE MODELOS",
    grups: [
        { 
            titol: "RECTAS LACADAS", imatge: "rectas.png", // Reutilitzada de laminats
            models: [{ model: "NATURA LACADA", codi: "BNL02", tarifa: 2 }, { model: "NATURA 2 LACADA", codi: "BAL02", tarifa: 3 }],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Cantos', valor: '4 cantos pvc 1 mm.' }, { clau: 'Tiradores', valor: 'consultar catálogo' } ]
        },
        // Exemple amb detall a dreta reutilitzant imatges existents
        { 
            titol: "EXEMPLE LACADOS AMB DETALL DRETA", nou: true, imatge: "neila.png", imatgeDetallDreta: "neila-detall.png", textDetallDreta: "Detalle lacados",
            models: [ { model: "EXEMPLE LACADA", codi: "EXL01", tarifa: 3 } ],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' } ]
        }
    ]
};

// Dades per ESTRATIFICADOS (basat en pàgines 17-21 del PDF)
const dadesEstratificados = {
    capcalera: "ESTRATIFICADOS/DESCRIPCIÓN DE MODELOS",
    grups: [
        { 
            titol: "RECTAS", imatge: "rectas.png", // Reutilitzada
            models: [{ model: "ANDORRA", codi: "FAN1Q", tarifa: 3 }, { model: "MONACO", codi: "FAN12", tarifa: 4 }],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Cantos', valor: '4 cantos pvc 1 mm.' }, { clau: 'Tiradores', valor: 'consultar catálogo' } ]
        },
        { 
            titol: "TIRADOR LINEAL METÁLICO NEILA", nou: true, imatge: "neila.png", imatgeDetallDreta: "neila-detall.png", textDetallDreta: "Detalle tirador<br>metálico Neila",
            models: [ { model: "ANDORRA NEILA", codi: "FAN1Q", tarifa: 4 }, { model: "ANDORRA NEILA LATERAL", codi: "FAN1Q2", tarifa: 4 }, { model: "MONACO NEILA", codi: "FAN12Q", tarifa: 5 }, { model: "MONACO NEILA LATERAL", codi: "FAN12Q2", tarifa: 5 } ],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Cantos', valor: '4 cantos pvc 1 mm.' }, { clau: 'Tiradores', valor: 'aluminio blanco mate, negro gratado y plata gratado.' }, { clau: 'Medidas', valor: '15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110 y 120 cm.' } ]
        },
        { 
            titol: "TIRADOR LINEAL METÁLICO LAINE", nou: true, imatge: "laine.png", imatgeDetallSota: "laine-detall.png", textDetallSota: "Detalle tirador<br>metálico Laine",
            models: [ { model: "ANDORRA LAINE", codi: "FAP1Q", tarifa: 4 }, { model: "ANDORRA LAINE LATERAL", codi: "FAP1Q2", tarifa: 4 }, { model: "MONACO LAINE", codi: "FAP1Q2", tarifa: 5 }, { model: "MONACO LAINE LATERAL", codi: "FAP1Q2", tarifa: 5 } ],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Cantos', valor: '4 cantos pvc 1 mm.' }, { clau: 'Tiradores', valor: 'aluminio blanco mate, negro gratado y plata gratado.' }, { clau: 'Medidas', valor: '15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110 y 120 cm.' } ]
        },
        { 
            titol: "TIRADOR LINEAL METÁLICO YERGA", imatge: "yerga.png", imatgeDetallSota: "yerga-detall.png", textDetallSota: "Detalle tirador<br>metálico Yerga",
            models: [ { model: "ANDORRA YERGA", codi: "FYN1Q", tarifa: 4 }, { model: "MONACO YERGA", codi: "FYN1Q2", tarifa: 5 } ],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Cantos', valor: '4 cantos pvc 1 mm.' }, { clau: 'Tiradores', valor: 'aluminio blanco mate, negro gratado y plata gratado.' }, { clau: 'Medidas', valor: '15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110 y 120 cm.' } ]
        },
        { 
            titol: "TIRADOR LINEAL METÁLICO GLERA", imatge: "neila.png", imatgeDetallDreta: "neila-detall.png", textDetallDreta: "Detalle tirador<br>metálico Glera", // Reutilitzada de neila
            models: [ { model: "ANDORRA GLERA", codi: "FAG1Q", tarifa: 5 }, { model: "ANDORRA GLERA LATERAL", codi: "FAG1Q2", tarifa: 5 }, { model: "MONACO GLERA", codi: "FAG1Q2", tarifa: 5 }, { model: "MONACO GLERA LATERAL", codi: "FAG1L2", tarifa: 5 } ],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Cantos', valor: '4 cantos pvc 1 mm.' }, { clau: 'Tiradores', valor: 'aluminio blanco mate, negro gratado y plata gratado.' }, { clau: 'Medidas', valor: '13, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110 y 120 cm.' } ]
        },
        // Exemple amb detalls als dos llocs reutilitzant imatges
        { 
            titol: "EXEMPLE ESTRAT AMB DOS DETALLS", nou: true, imatge: "yerga.png", imatgeDetallDreta: "yerga-detall.png", textDetallDreta: "Text dreta estrat", imatgeDetallSota: "laine-detall.png", textDetallSota: "Text sota estrat",
            models: [ { model: "EXEMPLE ESTRAT", codi: "EXE01", tarifa: 4 } ], 
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' } ]
        }
    ]
};

// Dades per INFINITES (basat en pàgines 23-25 del PDF, amb característiques generals)
const dadesInfinites = {
    capcalera: "INFINITES/DESCRIPCIÓN DE MODELOS",
    grups: [
        { 
            titol: "RECTAS INFINITE", imatge: "rectas.png", // Reutilitzada
            models: [{ model: "INFINITE", codi: "FIN02", tarifa: 5 }],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Características', valor: 'Innovació 2025, laminats alta qualitat.' }, { clau: 'Tiradores', valor: 'consultar catálogo' } ]
        },
        // Exemple amb detall a sota reutilitzant imatges
        { 
            titol: "EXEMPLE INFINITE AMB DETALL SOTA", nou: true, imatge: "laine.png", imatgeDetallSota: "laine-detall.png", textDetallSota: "Detalle infinite sota",
            models: [ { model: "EXEMPLE INFINITE", codi: "EXI01", tarifa: 5 } ],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' } ]
        }
    ]
};

// Dades per LACADOS (basat en pàgines 27-39 del PDF, amb models com IBIZA, KANSAS, etc.)
const dadesLacados = {
    capcalera: "LACADOS/DESCRIPCIÓN DE MODELOS",
    grups: [
        { 
            titol: "IBIZA", imatge: "rectas.png", // Reutilitzada de laminats
            models: [{ model: "IBIZA LACA MATE", codi: "LIBR05", tarifa: 7 }, { model: "IBIZA LACA BRILLO", codi: "LIBR05", tarifa: 8 }],
            descripcio: [ { clau: 'Grosor', valor: '22 mm.' }, { clau: 'Cantos', valor: 'Calibre MDF.' }, { clau: 'Tiradores', valor: 'metalizado' } ]
        },
        { 
            titol: "KANSAS GARDÁ", imatge: "neila.png", imatgeDetallDreta: "neila-detall.png", textDetallDreta: "Detalle perfil Gardá",
            models: [ { model: "KANSAS LACA MATE GARDÁ", codi: "LK/G03", tarifa: 6 }, { model: "KANSAS LACA BRILLO GARDÁ", codi: "LK/G02", tarifa: 8 } ],
            descripcio: [ { clau: 'Grosor', valor: '22 mm.' }, { clau: 'Borde', valor: 'Calibre MDF, moldura vertical.' }, { clau: 'Tirador', valor: 'antracita, vertical' } ]
        },
        { 
            titol: "MAR", imatge: "yerga.png",
            models: [{ model: "MAR LACA MATE", codi: "LMXIS", tarifa: 7 }, { model: "MAR LACA BRILLO", codi: "LMIXIS", tarifa: 8 }],
            descripcio: [ { clau: 'Grosor', valor: '22 mm.' }, { clau: 'Type', valor: 'MOD 30 mm. HOP' }, { clau: 'Tirador', valor: 'metalizado' } ]
        },
        { 
            titol: "MONTANA 100", imatge: "laine.png",
            models: [{ model: "MONTANA 100 LACA MATE", codi: "LM1003", tarifa: 7 }, { model: "MONTANA 100 LACA BRILLO", codi: "LM1004", tarifa: 8 }, { model: "MONTANA 100 45 LACA MATE", codi: "LM145", tarifa: 7 }, { model: "MONTANA 100 45 LACA BRILLO", codi: "LM142", tarifa: 8 }],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Puerta', valor: 'Tablero MDF lacado.' }, { clau: 'Tiradores', valor: 'consultar catálogo' } ]
        },
        { 
            titol: "MONTANA 25", imatge: "yerga.png",
            models: [{ model: "MONTANA 25 LACA MATE", codi: "LMV33", tarifa: 7 }, { model: "MONTANA 25 LACA BRILLO", codi: "LMV32", tarifa: 8 }, { model: "MONTANA 25 45 LACA MATE", codi: "LM253", tarifa: 7 }, { model: "MONTANA 25 45 LACA BRILLO", codi: "LM252", tarifa: 8 }],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Puerta', valor: 'Tablero MDF lacado.' }, { clau: 'Tiradores', valor: 'consultar catálogo' } ]
        },
        { 
            titol: "MONTANA 12.5", imatge: "rectas.png",
            models: [{ model: "MONTANA 12.5 LACA MATE", codi: "LM103", tarifa: 7 }, { model: "MONTANA 12.5 LACA BRILLO", codi: "LM103", tarifa: 8 }, { model: "MONTANA 12.5 45 LACA MATE", codi: "LMN3", tarifa: 7 }, { model: "MONTANA 12.5 45 LACA BRILLO", codi: "LMN3", tarifa: 8 }],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Puerta', valor: 'Tablero MDF lacado.' }, { clau: 'Tiradores', valor: 'consultar catálogo' } ]
        },
        { 
            titol: "TENNESSEE", imatge: "neila.png", imatgeDetallSota: "neila-detall.png", textDetallSota: "Detalle modelo Tennessee", // Reutilitzada de neila-detall
            models: [{ model: "TENNESSEE LACA MATE", codi: "LTE031", tarifa: 11 }, { model: "TENNESSEE LACA BRILLO", codi: "LTE030", tarifa: 13 }],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Especificaciones', valor: 'Para muebles columna, bisagras en lado moldeado.' }, { clau: 'Combinable', valor: 'Con modelo Vigo.' } ]
        },
        { 
            titol: "VERMONT", imatge: "laine.png",
            models: [{ model: "VERMONT LACA MATE", codi: "LVB04", tarifa: 8 }, { model: "VERMONT LACA BRILLO", codi: "LVB02", tarifa: 9 }],
            descripcio: [ { clau: 'Grosor', valor: '22 mm.' }, { clau: 'Tamaño', valor: '8x8 cm MDF.' }, { clau: 'Tirador', valor: 'consultar catálogo' } ]
        },
        { 
            titol: "VIGO", imatge: "yerga.png",
            models: [{ model: "VIGO LACA MATE", codi: "LVB05", tarifa: 6 }, { model: "VIGO LACA BRILLO", codi: "LVB02", tarifa: 8 }],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Tamaño', valor: 'Tablero MDF.' }, { clau: 'Tiradores', valor: 'consultar catálogo' } ]
        },
        // Exemple amb detalls als dos llocs reutilitzant imatges existents
        { 
            titol: "EXEMPLE LACADOS AMB DOS DETALLS", nou: true, imatge: "rectas.png", imatgeDetallDreta: "neila-detall.png", textDetallDreta: "Text dreta lacados", imatgeDetallSota: "yerga-detall.png", textDetallSota: "Text sota lacados",
            models: [ { model: "EXEMPLE LACADOS", codi: "EXL01", tarifa: 7 } ], 
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' } ]
        }
    ]
};

// Dades per MADERAS RECHAPADAS (basat en pàgines 41-45 del PDF)
const dadesMaderasRechapadas = {
    capcalera: "MADERAS RECHAPADAS/DESCRIPCIÓN DE MODELOS",
    grups: [
        { 
            titol: "RECTAS RECHAPADAS", imatge: "rectas.png",
            models: [{ model: "VALERIA", codi: "VRE02", tarifa: 5 }],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' }, { clau: 'Colores', valor: 'Roble, Nogal.' }, { clau: 'Tiradores', valor: 'consultar catálogo' } ]
        },
        // Exemple amb detall a dreta reutilitzant imatges existents
        { 
            titol: "EXEMPLE RECHAPADAS AMB DETALL DRETA", nou: true, imatge: "neila.png", imatgeDetallDreta: "neila-detall.png", textDetallDreta: "Detalle rechapadas dreta",
            models: [ { model: "EXEMPLE RECHAPADA", codi: "EXR01", tarifa: 5 } ],
            descripcio: [ { clau: 'Grosor', valor: '19 mm.' } ]
        }
    ]
};

// Dades per MADERAS MACIZAS (basat en pàgines 45-48 del PDF, amb models ARGOS)
const dadesMaderasMacizas = {
    capcalera: "MADERAS MACIZAS/DESCRIPCIÓN DE MODELOS",
    grups: [
        { 
            titol: "ARGOS", imatge: "rectas.png",
            models: [{ model: "ARGOS ROBLE", codi: "ARG01", tarifa: 10 }],
            descripcio: [ { clau: 'Grosor', valor: '22 mm.' }, { clau: 'Colores', valor: 'Roble natural.' }, { clau: 'Altura mínima', valor: '130 cm.' } ]
        },
        // Exemple amb detall a sota reutilitzant imatges existents
        { 
            titol: "EXEMPLE MACIZAS AMB DETALL SOTA", nou: true, imatge: "laine.png", imatgeDetallSota: "laine-detall.png", textDetallSota: "Detalle macizas sota",
            models: [ { model: "EXEMPLE MACIZA", codi: "EXM01", tarifa: 10 } ],
            descripcio: [ { clau: 'Grosor', valor: '22 mm.' } ]
        }
    ]
};

let htmlFinal = '';
htmlFinal += plantillaPortada(dadesGenerals);
htmlFinal += plantillaContraportada(dadesGenerals);
htmlFinal += plantillaPaginaEnBlanc({});
htmlFinal += `<div id="ancora-index">` + plantillaIndex(dadesIndex) + `</div>`;
htmlFinal += `<div id="ancora-presentacio">` + plantillaTitolSeccio({ titol: "PRODUCTO" }) + `</div>`;
htmlFinal += plantillaSeparador(dadesGenerals);

// Portada de categoria al principi de les subcategories
htmlFinal += plantillaPortadaCategoria(dadesPortadaCategoria);

// Secció LAMINADOS (ja existent)
htmlFinal += `<div id="ancora-laminats">` + plantillaTitolSeccio({ titol: "MATERIALES/LAMINADOS" }) + `</div>`;
const grupsPerPagina = 2;
for (let i = 0; i < dadesLaminats.grups.length; i += grupsPerPagina) {
    const grupsDeLaPagina = dadesLaminats.grups.slice(i, i + grupsPerPagina);
    const contingutIntern = plantillaFitxaModelLaminat({ grups: grupsDeLaPagina, baseURL: baseURL });
    const dadesPaginaBase = { capcalera: dadesLaminats.capcalera, contingut: contingutIntern, classeExtra: 'fitxa-laminat-page' };
    htmlFinal += plantillaPaginaBase(dadesPaginaBase);
}

// Secció LAMINADOS LACADOS
htmlFinal += `<div id="ancora-laminats-lacados">` + plantillaTitolSeccio({ titol: "LAMINADOS LACADOS" }) + `</div>`;
for (let i = 0; i < dadesLaminatsLacados.grups.length; i += grupsPerPagina) {
    const grupsDeLaPagina = dadesLaminatsLacados.grups.slice(i, i + grupsPerPagina);
    const contingutIntern = plantillaFitxaModelLaminat({ grups: grupsDeLaPagina, baseURL: baseURL });
    const dadesPaginaBase = { capcalera: dadesLaminatsLacados.capcalera, contingut: contingutIntern, classeExtra: 'fitxa-laminat-lacados-page' };
    htmlFinal += plantillaPaginaBase(dadesPaginaBase);
}

// Secció ESTRATIFICADOS
htmlFinal += `<div id="ancora-estratificados">` + plantillaTitolSeccio({ titol: "ESTRATIFICADOS" }) + `</div>`;
for (let i = 0; i < dadesEstratificados.grups.length; i += grupsPerPagina) {
    const grupsDeLaPagina = dadesEstratificados.grups.slice(i, i + grupsPerPagina);
    const contingutIntern = plantillaFitxaModelLaminat({ grups: grupsDeLaPagina, baseURL: baseURL });
    const dadesPaginaBase = { capcalera: dadesEstratificados.capcalera, contingut: contingutIntern, classeExtra: 'fitxa-estratificados-page' };
    htmlFinal += plantillaPaginaBase(dadesPaginaBase);
}

// Secció INFINITES
htmlFinal += `<div id="ancora-infinites">` + plantillaTitolSeccio({ titol: "INFINITES" }) + `</div>`;
for (let i = 0; i < dadesInfinites.grups.length; i += grupsPerPagina) {
    const grupsDeLaPagina = dadesInfinites.grups.slice(i, i + grupsPerPagina);
    const contingutIntern = plantillaFitxaModelLaminat({ grups: grupsDeLaPagina, baseURL: baseURL });
    const dadesPaginaBase = { capcalera: dadesInfinites.capcalera, contingut: contingutIntern, classeExtra: 'fitxa-infinites-page' };
    htmlFinal += plantillaPaginaBase(dadesPaginaBase);
}

// Secció LACADOS
htmlFinal += `<div id="ancora-lacados">` + plantillaTitolSeccio({ titol: "LACADOS" }) + `</div>`;
for (let i = 0; i < dadesLacados.grups.length; i += grupsPerPagina) {
    const grupsDeLaPagina = dadesLacados.grups.slice(i, i + grupsPerPagina);
    const contingutIntern = plantillaFitxaModelLaminat({ grups: grupsDeLaPagina, baseURL: baseURL });
    const dadesPaginaBase = { capcalera: dadesLacados.capcalera, contingut: contingutIntern, classeExtra: 'fitxa-lacados-page' };
    htmlFinal += plantillaPaginaBase(dadesPaginaBase);
}

// Secció MADERAS RECHAPADAS
htmlFinal += `<div id="ancora-maderas-rechapadas">` + plantillaTitolSeccio({ titol: "MADERAS RECHAPADAS" }) + `</div>`;
for (let i = 0; i < dadesMaderasRechapadas.grups.length; i += grupsPerPagina) {
    const grupsDeLaPagina = dadesMaderasRechapadas.grups.slice(i, i + grupsPerPagina);
    const contingutIntern = plantillaFitxaModelLaminat({ grups: grupsDeLaPagina, baseURL: baseURL });
    const dadesPaginaBase = { capcalera: dadesMaderasRechapadas.capcalera, contingut: contingutIntern, classeExtra: 'fitxa-maderas-rechapadas-page' };
    htmlFinal += plantillaPaginaBase(dadesPaginaBase);
}

// Secció MADERAS MACIZAS
htmlFinal += `<div id="ancora-maderas-macizas">` + plantillaTitolSeccio({ titol: "MADERAS MACIZAS" }) + `</div>`;
for (let i = 0; i < dadesMaderasMacizas.grups.length; i += grupsPerPagina) {
    const grupsDeLaPagina = dadesMaderasMacizas.grups.slice(i, i + grupsPerPagina);
    const contingutIntern = plantillaFitxaModelLaminat({ grups: grupsDeLaPagina, baseURL: baseURL });
    const dadesPaginaBase = { capcalera: dadesMaderasMacizas.capcalera, contingut: contingutIntern, classeExtra: 'fitxa-maderas-macizas-page' };
    htmlFinal += plantillaPaginaBase(dadesPaginaBase);
}



const documentCompletHtml = `
    <!DOCTYPE html><html><head><meta charset="utf-8"/><title>Catàleg</title>
    <style>
        @font-face { font-family: 'Ramillas'; src: url('${baseURL}/fonts/TT Ramillas Trial Light-titols.woff2'); }
        @font-face { font-family: 'Gill Sans'; src: url('${baseURL}/fonts/Gill Sans Light-cos.woff2'); }
        @font-face { font-family: 'Fontsspring'; src: url('${baseURL}/fonts/fontsspring.woff2'); }
        
        body { margin: 0; padding: 0; font-family: 'Gill Sans', sans-serif; color: #2C2A29; background-color: transparent; }
        
        .pagina { 
            width: 210mm; 
            height: 297mm; 
            box-sizing: border-box; 
            display: flex; 
            flex-direction: column; 
            page-break-after: always; 
            overflow: hidden; 
            background-color: white; 
            position: relative;
        }
        
        .pagina:last-child { page-break-after: auto; }
    </style></head><body>${htmlFinal}</body></html>`;

const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(documentCompletHtml, { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');

await page.evaluate(() => {
    const totesLesPagines = Array.from(document.querySelectorAll('.pagina'));

    const getPageNumberByElementId = (elementId) => {
        const element = document.getElementById(elementId);
        if (!element) return '?';
        
        let paginaContenidora = element.querySelector('.pagina');
        if (!paginaContenidora) {
            paginaContenidora = element.closest('.pagina');
        }

        if (!paginaContenidora) return '?';

        const pageIndex = totesLesPagines.indexOf(paginaContenidora);
        return pageIndex !== -1 ? pageIndex + 1 : '?';
    };
    
    document.querySelectorAll('.pagina-index .numero-pagina[data-referencia]').forEach(marcador => {
        const idSeccio = marcador.dataset.referencia;
        marcador.textContent = getPageNumberByElementId(idSeccio);
    });
    
    totesLesPagines.forEach((paginaNode, index) => {
        const peuDePagina = paginaNode.querySelector('.peu-de-pagina-index .numero-pagina, .peu-pagina-contingut .numero-pagina');
        if (peuDePagina && !peuDePagina.hasAttribute('data-referencia')) {
            peuDePagina.textContent = index + 1;
        }
    });
});

// --- SOLUCIÓ DEFINITIVA: S'eliminen les marges d'impressió del PDF ---
const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
    }
});

await browser.close();
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'attachment; filename=cataleg-final.pdf');
res.send(pdfBuffer);
    
    } catch (error) {
        console.error('Error general:', error);
        if (!res.headersSent) res.status(500).send('Error generant el PDF.');
    }
});

app.listen(port, () => {
    console.log(`Servidor escoltant a http://localhost:${port}`);
});