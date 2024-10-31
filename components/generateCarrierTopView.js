
export async function generateCarrierTopView() {
  const { carrierLayout, carrierPackage } = await fetchCarrierLayoutData();

  if (!carrierPackage || !carrierPackage.properties) {
    console.error('Carrier package of zijn properties zijn niet gedefinieerd.');
    return;
  }

  const carrier = carrierPackage;

  const dimensions = {
    width: distanceToMm(carrier.properties.dimensions.width),
    depth: distanceToMm(carrier.properties.dimensions.depth),
  };

  const innerDimensions = {
    width: distanceToMm(carrier.properties.innerDimensions.width),
    depth: distanceToMm(carrier.properties.innerDimensions.depth),
  };

  const canvasWidth = dimensions.width;
  const canvasHeight = dimensions.depth;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '400px');
  svg.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const transformGroup = document.createElementNS(svgNS, 'g');
  const transformCoordinates = `scale(1, -1) translate(0, ${-canvasHeight})`;
  transformGroup.setAttribute('transform', transformCoordinates);

  drawBackground(transformGroup, canvasWidth, canvasHeight);

  const trayGroup = document.createElementNS(svgNS, 'g');
  const xOffset = (dimensions.width - innerDimensions.width) / 2;
  const yOffset = (dimensions.depth - innerDimensions.depth) / 2;
  const transformTray = `translate(${xOffset}, ${yOffset})`;
  trayGroup.setAttribute('transform', transformTray);

  const selectedLayer = carrierLayout.layers[0]; 
  if (selectedLayer) {
    drawTopItems(trayGroup, selectedLayer.items);
  }

  transformGroup.appendChild(trayGroup);
  svg.appendChild(transformGroup);

  return svg;
}

// Helperfuncties

function distanceToMm(measurement) {
  return measurement.value; 
}

function drawBackground(transformGroup, width, height) {
  const svgNS = 'http://www.w3.org/2000/svg';

  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('x', 0);
  rect.setAttribute('y', 0);
  rect.setAttribute('width', width);
  rect.setAttribute('height', height);
  rect.setAttribute('fill', '#f0f0f0');
  transformGroup.appendChild(rect);
}

function drawTopItems(trayGroup, items) {
  const svgNS = 'http://www.w3.org/2000/svg';

  items.forEach((item) => {
    // Bereken positie en afmetingen
    const x = item.position.x;
    const y = item.position.y || 0;
    const width = item.dimensions.width;
    const depth = item.dimensions.depth;

    // Creëer rechthoek voor item
    const itemRect = document.createElementNS(svgNS, 'rect');
    itemRect.setAttribute('x', x);
    itemRect.setAttribute('y', y);
    itemRect.setAttribute('width', width);
    itemRect.setAttribute('height', depth);
    itemRect.setAttribute('class', 'carrier-item');
    trayGroup.appendChild(itemRect);
  });
}

async function fetchCarrierLayoutData() {
  const response = await fetch('data/carrierLayoutData.json');
  const data = await response.json();
  const carrierLayout = data.data[0];

  const packages = data.meta.related.packages;
  const carrierPackageId = carrierLayout.package;
  const carrierPackage = packages.find(pkg => pkg.id === carrierPackageId);

  return { carrierLayout, carrierPackage };
}
