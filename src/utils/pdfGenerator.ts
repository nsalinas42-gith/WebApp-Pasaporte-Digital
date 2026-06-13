import { jsPDF } from 'jspdf';

export function generateSolanaManual() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // A4 size: 210mm x 297mm
  const margin = 20;
  const contentWidth = 210 - (margin * 2); // 170mm
  let y = 20;

  const addNewPage = () => {
    doc.addPage();
    y = 20;
    // Page border
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(0.2);
    doc.rect(margin - 5, margin - 5, contentWidth + 10, 297 - (margin * 2) + 10);
    // Footer on every page
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('PintaMapas Solana dApp - Manual Oficial de Producción', margin, 285);
    doc.text('Pág. ' + doc.getNumberOfPages(), 210 - margin - 15, 285);
  };

  // Border & header background for page 1
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.2);
  doc.rect(margin - 5, margin - 5, contentWidth + 10, 297 - (margin * 2) + 10);

  // Title section
  doc.setFillColor(11, 12, 21); // Dark primary theme color
  doc.rect(margin - 4.9, margin - 4.9, contentWidth + 9.8, 30, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('MANUAL DE PRODUCCIÓN ON-CHAIN: PINTAMAPAS', margin, y + 10);
  
  doc.setFontSize(10);
  doc.setTextColor(139, 92, 246); // Secondary purple accent
  doc.text('Guía Maestra para el Despliegue de Colecciones y cNFTs en Solana Mainnet', margin, y + 17);

  y += 35;

  const writeHeading = (text: string) => {
    if (y > 240) addNewPage();
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 12, 21);
    doc.text(text, margin, y);
    y += 4;
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y);
    y += 6;
  };

  const writeParagraph = (text: string, spaceBefore = 0, isCode = false) => {
    y += spaceBefore;
    const lines = doc.splitTextToSize(text, contentWidth);
    
    // Check if we need a new page
    const heightNeeded = lines.length * 5;
    if (y + heightNeeded > 265) {
      addNewPage();
    }

    if (isCode) {
      doc.setFont('Courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 70, 90);
      // add subtle background behind code block
      doc.setFillColor(245, 247, 250);
      doc.rect(margin - 2, y - 3, contentWidth + 4, heightNeeded + 2, 'F');
    } else {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(50, 56, 75);
    }

    lines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 5;
    });
    y += 2;
  };

  // Section 1: Intro
  writeHeading('1. ENTENDIENDO EL AMBIENTE DE SIMULACIÓN (SANDBOX VS MAINNET)');
  writeParagraph('Hasta ahora, la emisión de estampas y postales digitales (cNFTs) se ha ejecutado en un entorno de "Sandbox Simulado" (o modo pruebas en Devnet). En dicho entorno, las firmas electrónicas y los identificadores de transacción (hashes de transacción) son generados de manera simulada por la dApp para demostrar visualmente el flujo sin forzar a los usuarios a gastar fondos reales.');
  writeParagraph('Por esta razón, al hacer clic en "Ver en Solscan", el explorador arroja el mensaje "Sorry, we\'re unable to locate this tx hash" y la billetera real no refleja cambios. Es la conducta de desarrollo correcta y segura: evita cargos innecesarios de red al validar la experiencia de usuario y el frontend.');

  // Section 2: Wallet Funding
  writeHeading('2. PASO 1: FINANCIAMIENTO Y CREACIÓN DE CUENTAS');
  writeParagraph('En Solana Mainnet, la dApp opera con dos cuentas cruciales lideradas por ti:');
  writeParagraph('  - Billetera Autoridad de la Colección (Collection Authority): Firma el despliegue del contrato de la colección Metaplex.');
  writeParagraph('  - Billetera Autoridad del Árbol (Tree Authority): Crea, administra y costea el almacenamiento colectivo de los NFTs.');
  writeParagraph('Costo de Almacenamiento (State Compression):');
  writeParagraph('A diferencia de los NFTs convencionales, las estampas se cargan como cNFTs (NFTs Comprimidos), lo que reduce el gasto de almacenamiento en la blockchain en un 99.9%. El almacenamiento del árbol se pre-paga al crear el Concurrent Merkle Tree. Para un árbol estándar de:');
  writeParagraph('  * Profundidad (depth): 14\n  * Buffer de Concurrencia (maxBufferSize): 64\n  * Capacidad máxima: Hasta 16,384 cNFTs para tus usuarios');
  writeParagraph('El costo único para reservar este bloque permanente en Solana es de ~0.15 a 0.28 SOL (aproximadamente de $22 a $40 USD según el precio actual de mercado). Las tarifas de red (gas) individuales al acuñar posteriormente cada postal son de apenas 0.000005 SOL (menos de $0.001 USD), convirtiéndolo en la solución ideal para dApps con miles de usuarios.');

  addNewPage();

  // Section 3: Merkle Tree Setup
  writeHeading('3. PASO 2: CONSTRUCCIÓN DEL CONCURRENT MERKLE TREE ON-CHAIN');
  writeParagraph('Para crear y registrar el Árbol de Merkle Concurrente en Solana, se utiliza el SDK de compresión de estado de Solana o el CLI de Metaplex. Aquí se muestra el script de TypeScript de referencia para realizar esta acción:');
  writeParagraph(`// Inicialización del Árbol en Solana Mainnet
import { createAllocatedBubblegumTree } from '@metaplex-foundation/mpl-bubblegum';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

const umi = createUmi('https://api.mainnet-beta.solana.com');
const treeKeypair = generateSigner(umi);

const tx = await createAllocatedBubblegumTree(umi, {
  tree: treeKeypair,
  activeBitmaskSize: 8,
  depth: 14,             // Soporta hasta 16,384 cNFTs
  maxBufferSize: 64,     // Permite escrituras concurrentes
  public: true           // Permite acuñar desde el frontend
});
await tx.sendAndConfirm(umi);`, 2, true);

  // Section 4: Collection config and assets uploading
  writeHeading('4. PASO 3: CONFIGURACIÓN DE COLECCIÓN Y CARGA DE IMÁGENES');
  writeParagraph('RESPUESTA DIRECTA A TU PREGUNTA: ¿Es necesario tener cargada toda la colección de postales antes, o se puede configurar el Árbol y la Colección de Metaplex primero y luego cargar las postales digitales de forma individual?');
  writeParagraph('**Respuesta Categórica: NO es necesario tener cargadas todas las postales al inicio.**');
  writeParagraph('Puedes crear de manera aislada el Árbol de Merkle y la "Colección Madre" en Metaplex (que actúa como el contenedor principal) configurando los datos generales de PintaMapas. Esto asegura tu infraestructura central en mainnet de inmediato de forma rápida.');
  writeParagraph('A partir de allí, a medida de que los usuarios completen las actividades de ruta y decidan acuñar individualmente su postal, la dApp se encarga de subir dinámicamente la metadata de esa postal específica (su nombre, su descripción, coordenadas de geolocalización, imagen) a un servicio de almacenamiento descentralizado (como Arweave, IPFS, o Shadow Drive de GenesysGo) y emitir el cNFT correspondiente asociándolo a la Colección Madre.');
  writeParagraph('Solo requieres tener el recurso (imagen, archivo JSON de metadata) cargado y accesible en internet en el momento exacto en el que llames al método de acuñación (mint).');

  addNewPage();

  // Section 5: Frontend Integration step
  writeHeading('5. PASO 4: INTEGRACIÓN COMPLETA EN LA dAPP CLIENTE');
  writeParagraph('Para habilitar la versión en vivo que interactúe directamente con tu billetera on-chain, realiza las siguientes modificaciones:');
  writeParagraph('1. Obtener un Endpoint RPC de producción estable (como Helius, QuickNode o Alchemy) y reemplazar la variable de conexión en el Solana Provider para evitar las restricciones de tasa de peticiones públicas de Solana RPC.');
  writeParagraph('2. Vincular el método "confirmSignAndMint" de la dApp con la llamada correspondiente de Metaplex Bubblegum, pasando la firma generada por el Wallet.');
  writeParagraph('Ejemplo de llamado cliente para acuñar tu estampa digital:', 2);
  writeParagraph(`// Lógica de React para enviar la transacción al wallet conectado
import { mintToCollectionV1 } from '@metaplex-foundation/mpl-bubblegum';

const mintAction = async () => {
  const { signature } = await mintToCollectionV1(umi, {
    treeAddress,
    collectionMint: collectionAddress,
    metadata: {
      name: "Postal Digital PintaMapas",
      symbol: "MAPS",
      uri: "https://arweave.net/metadata_individual.json", // Subido dinámicamente
      sellerFeePoints: 0,
      creators: [{ address: authorityPublicKey, verified: true, share: 100 }],
    },
  }).sendAndConfirm(umi);
  return signature;
};`, 2, true);

  writeHeading('SOPORTE Y DOCUMENTACIÓN RECOMENDADA');
  writeParagraph('Para expandir tu conocimiento, consulta estos portales oficiales:');
  writeParagraph('  - Metaplex Developer Docs: https://developers.metaplex.com/');
  writeParagraph('  - Solana Decompression Portal: https://solana.com/developers/guides/state-compression');
  writeParagraph('  - Solscan Scanner: https://solscan.io/');
  writeParagraph('  - Comunidad de Soporte de Helius: https://helius.dev/');

  // Force footer / bottom branding on page 3 manually
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('PintaMapas Solana dApp - Manual Oficial de Producción', margin, 285);
  doc.text('Pág. 3', 210 - margin - 15, 285);

  doc.save('Manual_Produccion_Solana_PintaMapas.pdf');
}
