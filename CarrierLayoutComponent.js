import { generateCarrierSideView } from './components/generateCarrierSideView.js';
import { generateCarrierTopView } from './components/generateCarrierTopView.js';

class CarrierLayoutComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    // Voeg CSS toe aan het component
    const style = document.createElement('style');
    style.textContent = `
      svg {
        border: 1px solid #ccc;
        margin: 10px 0;
      }
      .carrier-side {
        fill: #e0e0e0;
        stroke: #000;
        stroke-width: 2px;
      }
      .wheel {
        fill: #606060;
        stroke: #000;
        stroke-width: 2px;
      }
      .carrier-item {
        fill: #90caf9;
        stroke: #1e88e5;
        stroke-width: 1px;
      }
    `;
    this.shadowRoot.appendChild(style);

    // Genereer de views
    const sideView = await generateCarrierSideView();
    const topView = await generateCarrierTopView();

    // Voeg de SVG's toe aan de Shadow DOM
    if (sideView) this.shadowRoot.appendChild(sideView);
    if (topView) this.shadowRoot.appendChild(topView);
  }
}

customElements.define('carrier-layout-component', CarrierLayoutComponent);