function circleIcon({ fill = '#fff', stroke = '#000', strokeWidth = 2,
                      text = '', textColor = '#000', radius = 14, fillOpacity = 1 } = {}) {
  const width = radius * 2;
  const pointHeight = radius * 1.2;
  const height = width + pointHeight;
  const cx = radius;
  const cy = radius;

  return L.divIcon({
    html: `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
             <!-- Stroke-only pin line -->
             <line
              x1="${cx}" y1="${cy + radius - strokeWidth}"
              x2="${cx}" y2="${height - strokeWidth}"
              stroke="${stroke}" stroke-width="${strokeWidth}"/>
             <!-- Filled circle on top -->
             <circle
               cx="${cx}" cy="${cy}" r="${radius - strokeWidth}"
               fill="${fill}" fill-opacity="${fillOpacity}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
             <!-- Text -->
             <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
                   fill="${textColor}" font-size="${radius * 0.9}" font-family="sans-serif" font-weight="bold">
               ${text}
             </text>
           </svg>`,
    className: '',
    iconSize: [width, height],
    iconAnchor: [cx, height],
    popupAnchor: [0, -height]
  });
}

const landmarkIcons = {
  orgLocation: circleIcon({ fill: '#fff9c4', text: 'O' }),
  static: circleIcon({ fill: '#fff9c4', text: 'S' }),
  mobile: circleIcon({ fill: '#ed8b00', text: 'M' }),
  default: circleIcon({ fill: '#fff',    text: '' }),
};

const mapOptions = {
  attributionControl: false,
  scrollWheelZoom: false
};

const map = L.map('app-map', {
  maxZoom: 15
});
