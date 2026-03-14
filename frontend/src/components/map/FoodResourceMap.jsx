import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'

const typeStyles = {
  snap_center: { color: '#264653', fillColor: '#264653', radius: 8 },
  farmers_market: { color: '#2D6A4F', fillColor: '#40916C', radius: 5 },
}

export default function FoodResourceMap({ locations, height = '400px' }) {
  if (!locations || locations.length === 0) {
    return (
      <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50 flex items-center justify-center" style={{ height }}>
        <p className="text-lt-text-secondary text-sm">No location data available</p>
      </div>
    )
  }

  return (
    <div className="bg-lt-bg-secondary rounded-lg border border-lt-border/50 overflow-hidden" style={{ height }}>
      <MapContainer center={[40.7128, -74.006]} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {locations.map((loc, i) => {
          const style = typeStyles[loc.type] || typeStyles.farmers_market
          return (
            <CircleMarker
              key={i}
              center={[loc.latitude, loc.longitude]}
              radius={loc.accepts_ebt ? style.radius + 2 : style.radius}
              fillColor={style.fillColor}
              color={style.color}
              weight={1}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{loc.name}</strong>
                  <br />
                  <span className="text-gray-600">{loc.type === 'snap_center' ? 'SNAP Center' : 'Farmers Market'}</span>
                  <br />
                  {loc.address}
                  <br />
                  {loc.hours && <><span className="text-gray-500">{loc.hours}</span><br /></>}
                  {loc.accepts_ebt && <span className="text-green-700 font-medium">Accepts EBT</span>}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
