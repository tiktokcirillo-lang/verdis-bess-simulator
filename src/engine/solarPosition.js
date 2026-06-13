// Motor de posição solar — algoritmo SPA simplificado
// Adaptado do SolarMate para contexto BESS
// Calcula azimute, elevação e irradiância por hora/data/coordenada

/**
 * Calcula a posição solar para uma data/hora e localização específica.
 * @returns {{ azimuth, elevation, x, y, z }}
 */
export function calculateSolarPosition({ latitude, longitude, timezone, date }) {
  const lat = (latitude * Math.PI) / 180
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000))

  // Ângulo fracionário do ano em radianos
  const gamma = (2 * Math.PI * (dayOfYear - 1)) / 365.25

  // Equação do tempo (minutos)
  const eot =
    229.18 * (
      0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma)
    )

  // Declinação solar (radianos)
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002930 * Math.cos(3 * gamma) +
    0.003050 * Math.sin(3 * gamma)

  // Hora solar local
  const localTime = date.getHours() + date.getMinutes() / 60
  const solarTime = localTime - timezone + (longitude / 15) + eot / 60
  const hourAngle = ((solarTime - 12) * 15 * Math.PI) / 180

  // Elevação solar
  const sinElev =
    Math.sin(lat) * Math.sin(decl) +
    Math.cos(lat) * Math.cos(decl) * Math.cos(hourAngle)
  const elevation = Math.asin(Math.max(-1, Math.min(1, sinElev)))

  // Azimute solar
  const cosAzim =
    (Math.sin(decl) - Math.sin(lat) * Math.sin(elevation)) /
    (Math.cos(lat) * Math.cos(elevation))
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAzim)))
  if (hourAngle > 0) azimuth = 2 * Math.PI - azimuth

  const azimuthDeg  = (azimuth  * 180) / Math.PI
  const elevationDeg = (elevation * 180) / Math.PI

  // Coordenadas cartesianas para visualização
  const d = 50
  const eRad = (elevationDeg * Math.PI) / 180
  const aRad = (azimuthDeg  * Math.PI) / 180

  return {
    azimuth:   azimuthDeg,
    elevation: elevationDeg,
    x: d * Math.cos(eRad) * Math.sin(aRad),
    y: d * Math.sin(eRad),
    z: d * Math.cos(eRad) * Math.cos(aRad),
  }
}

/**
 * Calcula irradiância normalizada (0–1) com base na elevação solar.
 */
export function calculateIrradiance(elevationDeg) {
  if (elevationDeg <= 0) return 0
  const eRad    = (elevationDeg * Math.PI) / 180
  const airMass = 1 / Math.cos(((90 - elevationDeg) * Math.PI) / 180)
  const direct  = Math.max(0, 0.7 * Math.pow(Math.max(0, 0.678 - 0.212 * airMass), 0.5))
  const diffuse = Math.max(0, 0.3 * Math.sin(eRad))
  return Math.min(1, direct + diffuse)
}

/**
 * Retorna nascer e pôr do sol para uma data e localização.
 */
export function getSunriseSunset(date, latitude, longitude, timezone) {
  const lat = (latitude * Math.PI) / 180
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000))
  const gamma = (2 * Math.PI * (dayOfYear - 1)) / 365.25

  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002930 * Math.cos(3 * gamma) +
    0.003050 * Math.sin(3 * gamma)

  const cosH  = -Math.tan(lat) * Math.tan(decl)
  const H     = Math.acos(Math.max(-1, Math.min(1, cosH)))
  const hDeg  = (H * 180) / (Math.PI * 15)

  const sunriseH = 12 - hDeg - timezone
  const sunsetH  = 12 + hDeg - timezone

  const sunrise = new Date(date)
  sunrise.setHours(Math.floor(sunriseH), Math.round((sunriseH % 1) * 60), 0, 0)

  const sunset = new Date(date)
  sunset.setHours(Math.floor(sunsetH), Math.round((sunsetH % 1) * 60), 0, 0)

  return { sunrise, sunset }
}

// [CONFIG] UTC offset por estado brasileiro
export const STATE_TIMEZONE = {
  AC: -5, AM: -4, AP: -3, PA: -3, RO: -4, RR: -4, TO: -3,
  AL: -3, BA: -3, CE: -3, MA: -3, PB: -3, PE: -3, PI: -3,
  RN: -3, SE: -3,
  DF: -3, GO: -3, MT: -4, MS: -4,
  ES: -3, MG: -3, RJ: -3, SP: -3,
  PR: -3, RS: -3, SC: -3,
}

// [CONFIG] Coordenadas das capitais — fallback quando cidade não é informada
export const STATE_COORDINATES = {
  AC: { lat: -9.97,  lon: -67.81 },
  AL: { lat: -9.67,  lon: -35.74 },
  AP: { lat:  0.03,  lon: -51.07 },
  AM: { lat: -3.10,  lon: -60.02 },
  BA: { lat: -12.97, lon: -38.50 },
  CE: { lat: -3.72,  lon: -38.54 },
  DF: { lat: -15.78, lon: -47.93 },
  ES: { lat: -20.32, lon: -40.34 },
  GO: { lat: -16.69, lon: -49.25 },
  MA: { lat: -2.53,  lon: -44.30 },
  MT: { lat: -15.60, lon: -56.10 },
  MS: { lat: -20.44, lon: -54.65 },
  MG: { lat: -19.92, lon: -43.94 },
  PA: { lat: -1.46,  lon: -48.50 },
  PB: { lat: -7.12,  lon: -34.86 },
  PR: { lat: -25.43, lon: -49.27 },
  PE: { lat: -8.05,  lon: -34.88 },
  PI: { lat: -5.09,  lon: -42.80 },
  RJ: { lat: -22.91, lon: -43.17 },
  RN: { lat: -5.79,  lon: -35.21 },
  RS: { lat: -30.03, lon: -51.23 },
  RO: { lat: -8.76,  lon: -63.90 },
  RR: { lat:  2.82,  lon: -60.67 },
  SC: { lat: -27.60, lon: -48.55 },
  SE: { lat: -10.91, lon: -37.07 },
  SP: { lat: -23.55, lon: -46.63 },
  TO: { lat: -10.25, lon: -48.32 },
}

/**
 * Gera curva de carga solar horária para um dia representativo de cada mês.
 * Retorna array de 12 meses × 24 horas com irradiância normalizada (0–1).
 */
export function generateAnnualSolarProfile(stateSigla) {
  const coords   = STATE_COORDINATES[stateSigla] || STATE_COORDINATES['SP']
  const timezone = STATE_TIMEZONE[stateSigla]    || -3
  const year     = new Date().getFullYear()

  return Array.from({ length: 12 }, (_, monthIdx) => {
    const date = new Date(year, monthIdx, 15, 12, 0, 0)
    const { sunrise, sunset } = getSunriseSunset(date, coords.lat, coords.lon, timezone)
    const sunriseH = sunrise.getHours() + sunrise.getMinutes() / 60
    const sunsetH  = sunset.getHours()  + sunset.getMinutes()  / 60

    const hourly = Array.from({ length: 24 }, (_, h) => {
      if (h < sunriseH || h > sunsetH) return 0
      const sampleDate = new Date(year, monthIdx, 15, h, 30, 0)
      const pos = calculateSolarPosition({ latitude: coords.lat, longitude: coords.lon, timezone, date: sampleDate })
      return parseFloat(calculateIrradiance(pos.elevation).toFixed(3))
    })

    return {
      month: monthIdx + 1,
      monthName: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][monthIdx],
      sunriseH: parseFloat(sunriseH.toFixed(1)),
      sunsetH:  parseFloat(sunsetH.toFixed(1)),
      daylightH: parseFloat((sunsetH - sunriseH).toFixed(1)),
      hourlyIrradiance: hourly,
      peakIrradiance: Math.max(...hourly),
      avgIrradiance: parseFloat((hourly.reduce((a, b) => a + b, 0) / 24).toFixed(3)),
    }
  })
}
