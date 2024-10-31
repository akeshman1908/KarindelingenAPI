// generateCarrierSideView.js

export async function generateCarrierSideView() {
  const { carrierLayout, carrierPackage } = await fetchCarrierLayoutData();

  if (!carrierPackage || !carrierPackage.properties) {
    console.error('Carrier package of zijn properties zijn niet gedefinieerd.');
    return;
  }

  const carrier = carrierPackage;

  // Bereken dimensies
  const dimensions = {
    width: distanceToMm(carrier.properties.dimensions.width),
    height: distanceToMm(carrier.properties.dimensions.height),
  };

  const innerDimensions = {
    width: distanceToMm(carrier.properties.innerDimensions.width),
  };

  const sideWidth = (dimensions.width - innerDimensions.width) / 2;
  const wheelSize = 100;
  const wheelSizeHalf = wheelSize / 2;
  const canvasWidth = dimensions.width;
  const canvasHeight = dimensions.height + wheelSize;

  // Creëer SVG-element
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '400px');
  svg.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  // Voeg transformaties toe
  const transformGroup = document.createElementNS(svgNS, 'g');
  const transformCoordinates = `scale(1, -1) translate(0, ${-canvasHeight})`;
  transformGroup.setAttribute('transform', transformCoordinates);

  // Voeg wielen toe
  addWheels(transformGroup, dimensions, wheelSize, wheelSizeHalf);

  // Creëer carrier groep
  const carrierGroup = document.createElementNS(svgNS, 'g');
  const transformCarrier = `translate(0, ${wheelSize})`;
  carrierGroup.setAttribute('transform', transformCarrier);

  // Teken carrier zijkanten
  drawCarrierSides(carrierGroup, dimensions, sideWidth);

  // Teken lagen en items
  drawLayers(carrierGroup, carrierLayout, sideWidth, carrier.properties.gapDistance);

  // Assembleer SVG
  transformGroup.appendChild(carrierGroup);
  svg.appendChild(transformGroup);

  return svg;
}

// Helperfuncties

function distanceToMm(measurement) {
  return measurement.value; // Aangezien de waarde al in mm is
}

function addWheels(transformGroup, dimensions, wheelSize, wheelSizeHalf) {
  const svgNS = 'http://www.w3.org/2000/svg';

  const wheelLeft = document.createElementNS(svgNS, 'circle');
  wheelLeft.setAttribute('cx', dimensions.width * 0.1);
  wheelLeft.setAttribute('cy', wheelSizeHalf);
  wheelLeft.setAttribute('r', wheelSizeHalf);
  wheelLeft.setAttribute('class', 'wheel');
  transformGroup.appendChild(wheelLeft);

  const wheelRight = document.createElementNS(svgNS, 'circle');
  wheelRight.setAttribute('cx', dimensions.width * 0.9);
  wheelRight.setAttribute('cy', wheelSizeHalf);
  wheelRight.setAttribute('r', wheelSizeHalf);
  wheelRight.setAttribute('class', 'wheel');
  transformGroup.appendChild(wheelRight);
}

function drawCarrierSides(carrierGroup, dimensions, sideWidth) {
  const svgNS = 'http://www.w3.org/2000/svg';

  const leftSide = document.createElementNS(svgNS, 'rect');
  leftSide.setAttribute('x', 0);
  leftSide.setAttribute('y', 0);
  leftSide.setAttribute('width', sideWidth);
  leftSide.setAttribute('height', dimensions.height);
  leftSide.setAttribute('class', 'carrier-side');
  carrierGroup.appendChild(leftSide);

  const rightSide = document.createElementNS(svgNS, 'rect');
  rightSide.setAttribute('x', dimensions.width - sideWidth);
  rightSide.setAttribute('y', 0);
  rightSide.setAttribute('width', sideWidth);
  rightSide.setAttribute('height', dimensions.height);
  rightSide.setAttribute('class', 'carrier-side');
  carrierGroup.appendChild(rightSide);
}

function drawLayers(carrierGroup, carrierLayout, sideWidth, gapDistance) {
  const svgNS = 'http://www.w3.org/2000/svg';

  carrierLayout.layers.forEach((layer) => {
    const layerGroup = document.createElementNS(svgNS, 'g');
    const layerY = layer.gap * gapDistance;
    const layerTransform = `translate(${sideWidth}, ${layerY})`;
    layerGroup.setAttribute('transform', layerTransform);
    layerGroup.setAttribute('class', 'layer');

    drawItems(layerGroup, layer.items);

    carrierGroup.appendChild(layerGroup);
  });
}

function drawItems(layerGroup, items) {
  const svgNS = 'http://www.w3.org/2000/svg';

  items.forEach((item) => {
    const itemGroup = document.createElementNS(svgNS, 'g');
    const itemTransform = `translate(${item.position.x}, ${item.position.z})`;
    itemGroup.setAttribute('transform', itemTransform);
    itemGroup.setAttribute('class', 'item');

    const itemRect = document.createElementNS(svgNS, 'rect');
    itemRect.setAttribute('width', item.dimensions.width);
    itemRect.setAttribute('height', item.dimensions.height);
    itemRect.setAttribute('class', 'carrier-item');
    itemGroup.appendChild(itemRect);

    layerGroup.appendChild(itemGroup);
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
