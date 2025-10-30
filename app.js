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

  // Crear PDF nuevo
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  // Fuentes
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Imágenes
  const logoBytes = await fetch("img/logo.png").then(r => r.arrayBuffer());
  const logoImg = await pdfDoc.embedPng(logoBytes);
  const whatsappBytes = await fetch("img/whatsapp.png").then(r => r.arrayBuffer());
  const whatsappImg = await pdfDoc.embedPng(whatsappBytes);

  const folio = folioInput.value.padStart(4, "0");
  const fecha = fechaInput.value;
  const nombre = document.getElementById("nombre").value;
  const telefono = document.getElementById("telefono").value;
  const dispositivo = document.getElementById("dispositivo").value;
  const marca = document.getElementById("marca").value;
  const modelo = document.getElementById("modelo").value;
  const contrasena = document.getElementById("contrasena").value;
  const enciende = document.getElementById("enciende").value;
  const signos = document.getElementById("signos").value;
  const valoracion = document.getElementById("valoracion").value;
  const costo = document.getElementById("costo").value;

  // Logo
  page.drawImage(logoImg, { x: 40, y: height - 120, width: 90, height: 90 });

  // Encabezado
  page.drawText("ORDEN DE TRABAJO COMPUTO", { x: 180, y: height - 60, size: 14, font: fontBold });
  page.drawText("RECEPCIÓN DE EQUIPO Y DIAGNÓSTICO", { x: 180, y: height - 80, size: 12, font: fontBold });

  // Folio
  page.drawRectangle({ x: 450, y: height - 105, width: 100, height: 30, borderColor: rgb(0, 0, 0), borderWidth: 1 });
  page.drawText("FOLIO", { x: 455, y: height - 90, size: 10, font: fontBold });
  page.drawText(folio, { x: 495, y: height - 95, size: 15, font: fontBold, color: rgb(1, 0, 0) });

  // Campos
  let y = height - 150;
  const drawLabel = (label, value, x, offset = 80) => {
    page.drawText(label, { x, y, size: 10, font: fontBold });
    page.drawText(value || "", { x: x + offset, y, size: 10, font });
  };

  drawLabel("FECHA:", fecha, 60);
  drawLabel("NOMBRE:", nombre, 200, 70);
  y -= 20;
  drawLabel("TEL.:", telefono, 60);
  y -= 20;

  drawLabel("DISPOSITIVO:", dispositivo, 60);
  drawLabel("MARCA:", marca, 180);
  drawLabel("MODELO:", modelo, 290);
  drawLabel("CONTRASEÑA:", contrasena, 400);
  drawLabel("ENCIENDE:", enciende, 510);
  y -= 30;

  page.drawText("SIGNOS:", { x: 60, y, size: 10, font: fontBold });
  y -= 15;
  page.drawText(signos, { x: 60, y, size: 10, font, maxWidth: 470, lineHeight: 12 });
  y -= 50;

  page.drawText("VALORACIÓN:", { x: 60, y, size: 10, font: fontBold });
  y -= 15;
  page.drawText(valoracion, { x: 60, y, size: 10, font, maxWidth: 470, lineHeight: 12 });
  y -= 60;

  // Firma
  page.drawLine({ start: { x: 60, y: y - 10 }, end: { x: 260, y: y - 10 }, thickness: 1 });
  page.drawText("FIRMA DEL CLIENTE", { x: 110, y: y - 25, size: 9, font: fontBold });
  page.drawText("Al firmar este documento acepto que no se realizará la entrega del equipo si no se presenta esta nota",
    { x: 50, y: y - 40, size: 8, font: font, color: rgb(1, 0, 0), maxWidth: 500 });

  // Costo diagnóstico
  page.drawRectangle({ x: 370, y: 60, width: 160, height: 40, borderColor: rgb(0, 0, 0), borderWidth: 1 });
  page.drawText("COSTO DIAGNÓSTICO: $", { x: 375, y: 80, size: 10, font: fontBold });
  page.drawText(costo, { x: 520, y: 80, size: 12, font: fontBold, color: rgb(0, 0, 1) });

  // WhatsApp
  page.drawImage(whatsappImg, { x: 60, y: 70, width: 15, height: 15 });
  page.drawText("777 190 80 24", { x: 80, y: 75, size: 11, font: fontBold, color: rgb(0, 0, 0) });

  // Guardar folio
  localStorage.setItem("ultimoFolio", folio);

  // Adjuntar PDF de términos
  try {
    const terminosBytes = await fetch("pdf/terminos.pdf").then(res => res.arrayBuffer());
    const terminosDoc = await PDFDocument.load(terminosBytes);
    const [paginaTerminos] = await pdfDoc.copyPages(terminosDoc, [0]);
    pdfDoc.addPage(paginaTerminos);
  } catch (error) {
    console.warn("No se pudo cargar terminos.pdf:", error);
  }

  // Exportar PDF final
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



