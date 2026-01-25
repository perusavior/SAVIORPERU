'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation, DollarSign } from 'lucide-react'
import { FaRegTrashAlt } from 'react-icons/fa'

interface Position {
  lat: number
  lng: number
}

interface RouteInfo {
  distance: number
  duration: number
  coordinates: [number, number][]
}

interface InteractiveMapProps {
  setDeliveryCost: (cost: number) => void
  setGetlocation: (position: Position) => void
  locationToSend: Position | null
}

export default function InteractiveMap({
  setDeliveryCost,
  setGetlocation,
  locationToSend
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [userPosition, setUserPosition] = useState<Position | null>({
    lat: -12.0892609,
    lng: -77.0248411
  })
  const [destinationPosition, setDestinationPosition] =
    useState<Position | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Cargar CSS de Leaflet
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        // Cargar JavaScript de Leaflet
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          setMapLoaded(true)
        }
        document.head.appendChild(script)
      } catch (error) {
        setError('Error cargando el mapa')
      }
    }

    loadLeaflet()
  }, [])

  const getLocationDevice = () => {
    if (navigator.geolocation) {
      let verification
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          // setUserPosition({
          //   lat: -11.993006368779662,
          //   lng: -77.04907178878786
          // })
          verification = true
        },
        (error) => {
          setError(
            'No se pudo obtener la ubicación. Usando ubicación por defecto.'
          )
          // Ubicación por defecto (Ciudad Lima)
          setUserPosition({
            lat: -12.0892609,
            lng: -77.0248411
          })
          verification = false
        }
      )
      return verification
    } else {
      setError('Geolocalización no soportada por el navegador')
      setUserPosition({
        lat: -12.0892609,
        lng: -77.0248411
      })
      return false
    }
  }

  // Obtener ubicación del usuario
  useEffect(() => {
    getLocationDevice()
  }, [])

  useEffect(() => {
    // Si la prop tiene coordenadas válidas
    if (
      mapInstanceRef.current &&
      locationToSend &&
      (locationToSend.lat !== 0 || locationToSend.lng !== 0)
    ) {
      const { map, endIcon } = mapInstanceRef.current
      const L = (window as any).L

      // Prevenir bucle si la prop ya es igual al estado interno
      if (
        destinationPosition &&
        destinationPosition.lat === locationToSend.lat &&
        destinationPosition.lng === locationToSend.lng
      ) {
        return // La ubicación ya está establecida
      }

      // A) Actualizar el estado interno, disparando el useEffect de cálculo de ruta
      setDestinationPosition(locationToSend)

      // B) Remover marcador de destino anterior si existe
      if (mapInstanceRef.current.destinationMarker) {
        map.removeLayer(mapInstanceRef.current.destinationMarker)
      }

      // C) Agregar nuevo marcador de destino (visualización inmediata)
      const destinationMarker = L.marker(
        [locationToSend.lat, locationToSend.lng],
        { icon: endIcon }
      )
        .addTo(map)
        .bindPopup(
          '<div style="text-align: center;"><strong>Destino</strong><br><small>Punto de llegada</small></div>'
        )
        .openPopup()

      mapInstanceRef.current.destinationMarker = destinationMarker

      // D) Centrar el mapa en el pin
      map.setView([locationToSend.lat, locationToSend.lng], 13)
    } else if (mapInstanceRef.current && destinationPosition) {
      // Si la prop está vacía/reseteada, limpiar el pin visual
      if (mapInstanceRef.current.destinationMarker) {
        mapInstanceRef.current.map.removeLayer(
          mapInstanceRef.current.destinationMarker
        )
        mapInstanceRef.current.destinationMarker = null
        setDestinationPosition(null)
        setDeliveryCost(0)
      }
    }
  }, [mapInstanceRef.current, locationToSend, destinationPosition])

  // Inicializar mapa cuando Leaflet esté cargado y tengamos la posición del usuario
  useEffect(() => {
    if (
      mapLoaded &&
      userPosition &&
      mapRef.current &&
      !mapInstanceRef.current
    ) {
      const L = (window as any).L

      // Crear el mapa
      const map = L.map(mapRef.current).setView(
        [userPosition.lat, userPosition.lng],
        13
      )

      // Agregar capa de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      // Crear iconos personalizados
      const startIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })

      const endIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })

      // Agregar marcador de posición del usuario
      // const userMarker = L.marker([userPosition.lat, userPosition.lng], {
      //   icon: startIcon
      // })
      //   .addTo(map)
      //   .bindPopup(
      //     '<div style="text-align: center;"><strong>Tu ubicación</strong><br><small>Punto de inicio</small></div>'
      //   )

      // Manejar clicks en el mapa
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        // setDestinationPosition({ lat, lng })
        setGetlocation({ lat, lng })
      })

      let initialDestinationMarker = null
      let initialViewPosition = [userPosition.lat, userPosition.lng]

      if (
        locationToSend &&
        (locationToSend.lat !== 0 || locationToSend.lng !== 0)
      ) {
        // Inicializar el estado interno de destino con la ubicación del localStorage
        setDestinationPosition(locationToSend)

        // Crear el marcador
        initialDestinationMarker = L.marker(
          [locationToSend.lat, locationToSend.lng],
          { icon: endIcon }
        )
          .addTo(map)
          .bindPopup(
            '<div style="text-align: center;"><strong>Destino</strong><br><small>Punto de llegada</small></div>'
          )
          .openPopup()

        // Ajustar el centro inicial del mapa para incluir el pin de destino
        initialViewPosition = [locationToSend.lat, locationToSend.lng]
        map.setView(initialViewPosition, 13)
      }

      // 3. Guardar instancias en la ref
      mapInstanceRef.current = {
        map,
        startIcon,
        endIcon,
        // Guardar el marcador inicial
        destinationMarker: initialDestinationMarker
      }
    }
  }, [mapLoaded, userPosition])

  // Manejar cambios en la posición de destino
  useEffect(() => {
    if (mapInstanceRef.current && destinationPosition) {
      const { map, endIcon } = mapInstanceRef.current
      const L = (window as any).L

      // Remover marcador de destino anterior si existe
      if (mapInstanceRef.current.destinationMarker) {
        map.removeLayer(mapInstanceRef.current.destinationMarker)
      }

      // Agregar nuevo marcador de destino
      const destinationMarker = L.marker(
        [destinationPosition.lat, destinationPosition.lng],
        { icon: endIcon }
      )
        .addTo(map)
        .bindPopup(
          '<div style="text-align: center;"><strong>Destino</strong><br><small>Punto de llegada</small></div>'
        )

      mapInstanceRef.current.destinationMarker = destinationMarker

      // Calcular ruta
      if (userPosition) {
        calculateRoute()
      }
    }
  }, [destinationPosition, userPosition])

  // Calcular ruta usando OpenRouteService
  const calculateRoute = async () => {
    if (!destinationPosition) return
    // ;-11.993006368779662 - 77.04907178878786

    const userPosition = {
      lat: -11.993006368779662,
      lng: -77.04907178878786
    }

    setLoading(true)
    setError(null)

    try {
      // Intentar primero con OpenRouteService
      const routeData = await getRouteFromORS(userPosition, destinationPosition)

      if (routeData) {
        displayRoute(routeData)
      } else {
        // Fallback a cálculo directo si falla el servicio
        const fallbackRoute = calculateFallbackRoute(
          userPosition,
          destinationPosition
        )
        displayRoute(fallbackRoute)
      }
    } catch (error) {
      console.error('Error calculando ruta:', error)
      // Usar fallback en caso de error
      const fallbackRoute = calculateFallbackRoute(
        userPosition,
        destinationPosition
      )
      displayRoute(fallbackRoute)
    }

    setLoading(false)
  }

  // Obtener ruta de OpenRouteService
  const getRouteFromORS = async (start: Position, end: Position) => {
    try {
      // Usando la API pública de OpenRouteService (limitada pero funcional)
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf62487d47185c1a574927a757648458453cc2&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`,
        {
          headers: {
            Accept:
              'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
          }
        }
      )

      if (!response.ok) {
        alert(
          'No se pudo calcular la ruta desde tu ubicación actual. Verifica que estés en una zona con acceso a calles o intenta mover el marcador a una vía cercana.'
        )
      }

      const data = await response.json()

      if (data.features && data.features[0]) {
        const route = data.features[0]
        const coordinates = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        ) // Intercambiar lat/lng
        const distance = route.properties.segments[0].distance / 1000 // Convertir a km
        const duration = route.properties.segments[0].duration / 60 // Convertir a minutos

        return {
          distance,
          duration,
          coordinates
        }
      }

      return null
    } catch (error) {
      console.error('Error con OpenRouteService:', error)
      return null
    }
  }

  // Usar Nominatim + OSRM como alternativa
  const getRouteFromOSRM = async (start: Position, end: Position) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.routes && data.routes[0]) {
        const route = data.routes[0]
        const coordinates = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        ) // Intercambiar lat/lng
        const distance = route.distance / 1000 // Convertir a km
        const duration = route.duration / 60 // Convertir a minutos

        return {
          distance,
          duration,
          coordinates
        }
      }

      return null
    } catch (error) {
      console.error('Error con OSRM:', error)
      // Intentar con GraphHopper como última opción
      return await getRouteFromGraphHopper(start, end)
    }
  }

  // GraphHopper como alternativa adicional
  const getRouteFromGraphHopper = async (start: Position, end: Position) => {
    try {
      const response = await fetch(
        `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&vehicle=car&locale=es&calc_points=true&key=YOUR_API_KEY`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.paths && data.paths[0]) {
        const path = data.paths[0]
        // Decodificar coordenadas (GraphHopper usa encoded polyline)
        const coordinates = decodePolyline(path.points)
        const distance = path.distance / 1000 // Convertir a km
        const duration = path.time / 60000 // Convertir a minutos

        return {
          distance,
          duration,
          coordinates
        }
      }

      return null
    } catch (error) {
      console.error('Error con GraphHopper:', error)
      return null
    }
  }

  // Decodificar polyline (para GraphHopper)
  const decodePolyline = (encoded: string): [number, number][] => {
    const coordinates: [number, number][] = []
    let index = 0
    let lat = 0
    let lng = 0

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const dlat = result & 1 ? ~(result >> 1) : result >> 1
      lat += dlat

      shift = 0
      result = 0
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const dlng = result & 1 ? ~(result >> 1) : result >> 1
      lng += dlng

      coordinates.push([lat / 1e5, lng / 1e5])
    }

    return coordinates
  }

  // Ruta de fallback mejorada
  const calculateFallbackRoute = (start: Position, end: Position) => {
    const distance = calculateStraightLineDistance(start, end)

    // Crear una ruta simple que siga una aproximación de calles
    // Esto es una aproximación básica, en una app real deberías usar siempre APIs de routing
    const coordinates: [number, number][] = []

    // Punto de inicio
    coordinates.push([start.lat, start.lng])

    // Crear algunos puntos intermedios para simular seguir calles
    const latDiff = end.lat - start.lat
    const lngDiff = end.lng - start.lng

    // Agregar puntos intermedios con pequeñas variaciones para simular calles
    for (let i = 1; i < 4; i++) {
      const ratio = i / 4
      const intermediateLat =
        start.lat + latDiff * ratio + (Math.random() - 0.5) * 0.001
      const intermediateLng =
        start.lng + lngDiff * ratio + (Math.random() - 0.5) * 0.001
      coordinates.push([intermediateLat, intermediateLng])
    }

    // Punto final
    coordinates.push([end.lat, end.lng])

    return {
      distance: distance * 1.3, // Multiplicar por 1.3 para simular que las calles no van en línea recta
      duration: distance * 1.3 * 2, // Estimación: 2 minutos por km
      coordinates
    }
  }

  // Mostrar la ruta en el mapa
  const displayRoute = (routeData: RouteInfo) => {
    const L = (window as any).L
    const { map } = mapInstanceRef.current

    // Remover ruta anterior si existe
    if (mapInstanceRef.current.routeLine) {
      map.removeLayer(mapInstanceRef.current.routeLine)
    }

    // Agregar nueva línea de ruta
    // const routeLine = L.polyline(routeData.coordinates, {
    //   color: '#2563eb',
    //   weight: 4,
    //   opacity: 0.8
    // }).addTo(map)

    // mapInstanceRef.current.routeLine = routeLine

    // Calcular costo de delivery
    const costDelivery = Math.ceil(routeData.distance * 10) / 10
    setDeliveryCost(Math.ceil(costDelivery * 1.2))

    // Ajustar vista para mostrar la ruta completa
    if (
      mapInstanceRef.current.userMarker &&
      mapInstanceRef.current.destinationMarker
    ) {
      const group = L.featureGroup([
        // mapInstanceRef.current.userMarker,
        mapInstanceRef.current.destinationMarker
        // routeLine
      ])
      map.fitBounds(group.getBounds().pad(0.1))
    }

    setRouteInfo(routeData)
  }

  // Calcular distancia en línea recta
  const calculateStraightLineDistance = (
    pos1: Position,
    pos2: Position
  ): number => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180
    const dLng = ((pos2.lng - pos1.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pos1.lat * Math.PI) / 180) *
        Math.cos((pos2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance
  }

  const resetRoute = () => {
    if (mapInstanceRef.current) {
      const { map } = mapInstanceRef.current

      // Remover marcador de destino
      if (mapInstanceRef.current.destinationMarker) {
        map.removeLayer(mapInstanceRef.current.destinationMarker)
        mapInstanceRef.current.destinationMarker = null
        setDeliveryCost(0)
      }

      // Remover línea de ruta
      if (mapInstanceRef.current.routeLine) {
        map.removeLayer(mapInstanceRef.current.routeLine)
        mapInstanceRef.current.routeLine = null
        setDeliveryCost(0)
      }
    }

    setDestinationPosition(null)
    setRouteInfo(null)
  }

  if (!mapLoaded || !userPosition) {
    return (
      <div className='w-full h-full flex items-center justify-center min-h-64'>
        <Card className='w-96'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Navigation className='h-5 w-5' />
              {!mapLoaded ? 'Cargando mapa...' : 'Obteniendo ubicación...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className='text-red-500 text-sm'>{error}</p>}
            <p className='text-muted-foreground'>
              {!mapLoaded
                ? 'Cargando componentes del mapa...'
                : 'Por favor, permite el acceso a tu ubicación para continuar.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='relative w-full h-full min-h-64'>
      <div ref={mapRef} className='w-full h-full' />

      {/* Panel de información */}
      <div className='absolute bottom-4 right-4 z-[1000]'>
        <Card className='w-auto'>
          {/* <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <Navigation className='h-5 w-5' />
              Información del Delivery
            </CardTitle>
          </CardHeader> */}
          <CardContent className='space-y-3 p-0 m-0'>
            {!destinationPosition ? (
              <>
                {userPosition.lat === -12.0892609 &&
                userPosition.lng === -77.0248411 ? (
                  <button
                    type='button'
                    className='text-muted-foreground text-sm'
                    onClick={(e) => {
                      e.preventDefault()
                      getLocationDevice()
                    }}
                  >
                    Permitir acceso a la ubicacion
                  </button>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    Haz click en el mapa para seleccionar el destino
                  </p>
                )}
              </>
            ) : loading ? (
              <p className='text-muted-foreground text-sm'>
                Calculando ruta óptima...
              </p>
            ) : routeInfo ? (
              <>
                {/* <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm font-medium'>Distancia</p>
                    <p className='text-lg font-semibold'>
                      {routeInfo.distance.toFixed(1)} km
                    </p>
                  </div>
                  <div>
                    <p className='text-sm font-medium'>Tiempo est.</p>
                    <p className='text-lg font-semibold'>
                      {Math.round(routeInfo.duration)} min
                    </p>
                  </div>
                </div>

                <div className='border-t pt-3'>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium flex items-center gap-1'>
                      <DollarSign className='h-4 w-4' />
                      Costo de delivery:
                    </span>
                    <span className='text-lg font-bold text-green-600'>
                      S/ {(routeInfo.distance * 1.2).toFixed(2)}
                    </span>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Tarifa base: S/ 1.20 por kilómetro
                  </p>
                </div> */}

                <Button
                  onClick={resetRoute}
                  variant='outline'
                  className='w-10'
                  size='sm'
                >
                  <FaRegTrashAlt className='' />
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Instrucciones */}
      {/* <div className='absolute top-4 left-4 z-[1000]'>
        <Card className='w-72'>
          <CardContent className='pt-4'>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                <span>Ubicación actual (origen)</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                <span>Destino (click en el mapa)</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-0.5 bg-blue-600'></div>
                <span>Ruta optimizada por calles</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  )
}
