/* eslint no-underscore-dangle: 0 */
const TOOLTIP_CONTAINER_SELECTOR = '#c-444-tooltip';

function appendTooltipContainer() {
  if (!document.querySelector(TOOLTIP_CONTAINER_SELECTOR)) {
    const container = document.createElement('div');
    container.id = 'c-444-tooltip';
    container.style.overflow = 'hidden';
    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    container.style.left = '0px';
    container.style.top = '0px';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = 1020;
    document.body.appendChild(container);
  }
}

function destroyTooltipContainer() {
  const elm = document.querySelector(TOOLTIP_CONTAINER_SELECTOR);
  if (elm && elm.parentElement && elm.childElementCount < 1) {
    elm.parentElement.removeChild(elm);
  }
}

/**
 * Base tooltip definition
 */
export default function tooltip({ key = 'tooltip', rtl, fontFamily, filter, content }) {
  return {
    show: true,
    key,
    type: 'tooltip',
    layout: {
      displayOrder: 3,
    },
    beforeMount() {
      appendTooltipContainer();
    },
    beforeUpdate() {
      appendTooltipContainer();
    },
    destroyed() {
      destroyTooltipContainer();
    },
    settings: {
      appendTo: () => document.querySelector(TOOLTIP_CONTAINER_SELECTOR),
      content,
      filter,
      extract: (context) => context.node,
      direction: rtl ? 'rtl' : 'ltr',
      placement: 'bounds',
    },
    style: {
      arrow: {
        color: '#404040',
      },
      content: {
        display: 'table',
        'border-spacing': '4px',
        background: 'rgba(64, 64, 64, 0.9)',
        opacity: '1',
        fontSize: '13px',
        fontFamily,
        'empty-cells': 'show',
      },
      cell: {
        'max-width': '180px',
        'word-break': 'break-word',
        'word-wrap': 'break-word',
        'overflow-wrap': 'break-word',
        hyphens: 'auto',
      },
    },
  };
}
