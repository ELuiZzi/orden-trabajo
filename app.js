const { PDFDocument, rgb, StandardFonts } = PDFLib;

const form = document.getElementById("ordenForm");
const visor = document.getElementById("visorPDF");
const folioInput = document.getElementById("folio");
const fechaInput = document.getElementById("fecha");

// Fecha automática
const hoy = new Date();
const fechaFormateada = hoy.toISOString().split("T")[0];
fechaInput.value = fechaFormateada;

// Cargar o inicializar folio
let ultimoFolio = localStorage.getItem("ultimoFolio");
folioInput.value = ultimoFolio ? parseInt(ultimoFolio) + 1 : 1;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Crear PDF tamaño carta (612x792)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  // Fuentes
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Imágenes
  const logoBytes = await fetch("img/logo.png").then(r => r.arrayBuffer());
  const logoImg = await pdfDoc.embedPng(logoBytes);
  const whatsappBytes = await fetch("img/whatsapp.png").then(r => r.arrayBuffer());
  const whatsappImg = await pdfDoc.embedPng(whatsappBytes);

  // === CONFIGURACIÓN DE POSICIONES (EDITABLE) ===
  const pos = {
    folio: { x: 465, y: height - 95 },
    dispositivo: { x: 75, y: height - 195 },
    marca: { x: 170, y: height - 195 },
    modelo: { x: 280, y: height - 195 },
    contrasena: { x: 390, y: height - 195 },
    enciende: { x: 510, y: height - 195 },
    total: { x: 465, y: 60 },
  };

  // === DATOS DEL FORMULARIO ===
  const folio = folioInput.value.padStart(4, "0");
  const fecha = fechaInput.value;
  const nombre = document.getElementById("nombre").value.toUpperCase();
  const telefono = document.getElementById("telefono").value.toUpperCase();
  const dispositivo = document.getElementById("dispositivo").value.toUpperCase();
  const marca = document.getElementById("marca").value.toUpperCase();
  const modelo = document.getElementById("modelo").value.toUpperCase();
  const contrasena = document.getElementById("contrasena").value; // no mayúsculas
  const enciende = document.getElementById("enciende").value.toUpperCase();
  const signos = document.getElementById("signos").value.toUpperCase();
  const valoracion = document.getElementById("valoracion").value.toUpperCase();
  const costo = document.getElementById("costo").value;

  // === ENCABEZADO ===
  page.drawImage(logoImg, { x: 40, y: height - 110, width: 90, height: 90 });
  page.drawText("ORDEN DE TRABAJO COMPUTO", { x: 190, y: height - 50, size: 14, font: fontBold });
  page.drawText("RECEPCIÓN DE EQUIPO Y DIAGNÓSTICO", { x: 160, y: height - 70, size: 12, font: fontBold });

  // === FOLIO ===
  page.drawRectangle({ x: pos.folio.x - 15, y: pos.folio.y - 15, width: 110, height: 30, borderColor: rgb(0, 0, 0), borderWidth: 1 });
  page.drawText("FOLIO", { x: pos.folio.x, y: pos.folio.y + 10, size: 10, font: fontBold });
  page.drawText(folio, { x: pos.folio.x + 40, y: pos.folio.y - 2, size: 14, font: fontBold, color: rgb(0, 0.6, 0) });

  // === CAMPOS ===
  let y = height - 130;
  const drawLabel = (label, value, x, offset = 60) => {
    page.drawText(label, { x, y, size: 10, font: fontBold });
    page.drawText(value || "", { x: x + offset, y, size: 10, font });
  };

  drawLabel("FECHA:", fecha, 60);
  drawLabel("NOMBRE:", nombre, 200, 70);
  y -= 20;
  drawLabel("TEL.:", telefono, 60);
  y -= 20;

  page.drawText("DISPOSITIVO:", { x: 60, y: pos.dispositivo.y, size: 10, font: fontBold });
  page.drawText(dispositivo, { x: pos.dispositivo.x, y: pos.dispositivo.y - 10, size: 10, font });

  page.drawText("MARCA:", { x: 160, y: pos.marca.y, size: 10, font: fontBold });
  page.drawText(marca, { x: pos.marca.x, y: pos.marca.y - 10, size: 10, font });

  page.drawText("MODELO:", { x: 260, y: pos.modelo.y, size: 10, font: fontBold });
  page.drawText(modelo, { x: pos.modelo.x, y: pos.modelo.y - 10, size: 10, font });

  page.drawText("CONTRASEÑA:", { x: 360, y: pos.contrasena.y, size: 10, font: fontBold });
  page.drawText(contrasena, { x: pos.contrasena.x, y: pos.contrasena.y - 10, size: 10, font });

  page.drawText("ENCIENDE:", { x: 480, y: pos.enciende.y, size: 10, font: fontBold });
  page.drawText(enciende, { x: pos.enciende.x, y: pos.enciende.y - 10, size: 10, font });

  y -= 50;
  page.drawText("SIGNOS:", { x: 60, y, size: 10, font: fontBold });
  y -= 15;
  page.drawText(signos, { x: 60, y, size: 10, font, maxWidth: 480, lineHeight: 12 });
  y -= 60;

  page.drawText("VALORACIÓN:", { x: 60, y, size: 10, font: fontBold });
  y -= 15;
  page.drawText(valoracion, { x: 60, y, size: 10, font, maxWidth: 480, lineHeight: 12 });
  y -= 60;

  // === FIRMA ===
  page.drawLine({ start: { x: 60, y: y - 10 }, end: { x: 260, y: y - 10 }, thickness: 1 });
  page.drawText("FIRMA DEL CLIENTE", { x: 110, y: y - 25, size: 9, font: fontBold });
  page.drawText(
    "Al firmar este documento acepto que no se realizará la entrega del equipo si no se presenta esta nota",
    { x: 50, y: y - 40, size: 8, font: font, color: rgb(1, 0, 0), maxWidth: 500 }
  );

  // === COSTO ===
  page.drawRectangle({ x: 380, y: 50, width: 160, height: 40, borderColor: rgb(0, 0, 0), borderWidth: 1 });
  page.drawText("COSTO DIAGNÓSTICO: $", { x: 385, y: 70, size: 10, font: fontBold });
  page.drawText(costo, { x: pos.total.x, y: 70, size: 12, font: fontBold, color: rgb(0, 0, 1) });

  // === WHATSAPP ===
  page.drawImage(whatsappImg, { x: 60, y: 60, width: 15, height: 15 });
  page.drawText("777 190 80 24", { x: 80, y: 63, size: 11, font: fontBold, color: rgb(0, 0, 0) });

  // === GUARDAR FOLIO ===
  localStorage.setItem("ultimoFolio", folio);

  // === TERMINOS (segunda página) ===
  try {
    const terminosBytes = await fetch("pdf/terminos.pdf").then(res => res.arrayBuffer());
    const terminosDoc = await PDFDocument.load(terminosBytes);
    const [paginaTerminos] = await pdfDoc.copyPages(terminosDoc, [0]);
    pdfDoc.addPage(paginaTerminos);
  } catch (error) {
    console.warn("No se pudo cargar terminos.pdf:", error);
  }

  // === GENERAR PDF FINAL ===
  const pdfFinal = await pdfDoc.save();
  const blob = new Blob([pdfFinal], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  visor.src = url;

  const nombreArchivo = `OrdenTrabajo_${folio}_${nombre}_${dispositivo}.pdf`;
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.textContent = "Descargar PDF";
  enlace.className =
    "block text-center bg-green-600 text-white py-2 rounded mt-2 hover:bg-green-700";
  visor.insertAdjacentElement("afterend", enlace);
});


