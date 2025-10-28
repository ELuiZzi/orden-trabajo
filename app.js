const { PDFDocument, rgb, StandardFonts } = PDFLib;

const form = document.getElementById("ordenForm");
const visor = document.getElementById("visorPDF");
const folioInput = document.getElementById("folio");

// Cargar o inicializar el folio
let ultimoFolio = localStorage.getItem("ultimoFolio");
if (ultimoFolio) {
  folioInput.value = parseInt(ultimoFolio) + 1;
} else {
  folioInput.value = 1;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pdfBytes = await fetch("pdf/Orden de Trabajo Computo.pdf").then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;

  const folio = folioInput.value.padStart(4, "0");
  const fecha = document.getElementById("fecha").value;
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

  // Coordenadas aproximadas (ajustables)
  page.drawText(folio, { x: 465, y: height - 112, size: 12, font });
  page.drawText(fecha, { x: 80, y: height - 140, size: fontSize, font });
  page.drawText(nombre, { x: 160, y: height - 140, size: fontSize, font });
  page.drawText(dispositivo, { x: 80, y: height - 160, size: fontSize, font });
  page.drawText(marca, { x: 180, y: height - 160, size: fontSize, font });
  page.drawText(modelo, { x: 300, y: height - 160, size: fontSize, font });
  page.drawText(telefono, { x: 80, y: height - 180, size: fontSize, font });
  page.drawText(contrasena, { x: 160, y: height - 200, size: fontSize, font });
  page.drawText(enciende, { x: 310, y: height - 200, size: fontSize, font });
  page.drawText(signos, { x: 80, y: height - 220, size: fontSize, font });
  page.drawText(valoracion, { x: 80, y: height - 250, size: fontSize, font });
  page.drawText(`$${costo}`, { x: 120, y: height - 270, size: fontSize, font });

  // Guardar nuevo folio
  localStorage.setItem("ultimoFolio", folio);

  const pdfFinal = await pdfDoc.save();
  const blob = new Blob([pdfFinal], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  visor.src = url;

  const nombreArchivo = `OrdenTrabajo_${folio}_${nombre}_${dispositivo}.pdf`;
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.textContent = "Descargar PDF";
  enlace.className = "block text-center bg-green-600 text-white py-2 rounded mt-2 hover:bg-green-700";
  visor.insertAdjacentElement("afterend", enlace);
});
