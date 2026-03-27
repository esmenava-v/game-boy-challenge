const DAY_NIGHT_CONFIG = {
  mode: 'night' as 'day' | 'night',
};

function initDayNightMode(): void {
  // Force night mode for now
  DAY_NIGHT_CONFIG.mode = 'night';

  // const now = new Date();
  // const lat = 37.7749;
  // const lng = -122.4194;
  //
  // const start = new Date(now.getFullYear(), 0, 1);
  // const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  //
  // const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
  // const declinationRad = declination * (Math.PI / 180);
  // const latRad = lat * (Math.PI / 180);
  //
  // const cosHourAngle = -(Math.tan(latRad) * Math.tan(declinationRad));
  // const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHourAngle)));
  // const hourAngleDeg = hourAngle * (180 / Math.PI);
  //
  // // sunriseMinutes/sunsetMinutes are in UTC minutes from midnight
  // const solarNoonMinutes = 720 - (lng * 4);
  // const sunriseMinutes = solarNoonMinutes - (hourAngleDeg * 4);
  // const sunsetMinutes = solarNoonMinutes + (hourAngleDeg * 4);
  //
  // // Convert current time to UTC minutes and compare in SF local time
  // const currentMinutesUTC = now.getUTCHours() * 60 + now.getUTCMinutes();
  //
  // // SF is UTC-7 (PDT) or UTC-8 (PST) — use PDT as approximate
  // const sfOffsetMinutes = -7 * 60;
  // const sfMinutes = ((currentMinutesUTC + sfOffsetMinutes) % 1440 + 1440) % 1440;
  // const sfSunrise = sunriseMinutes + sfOffsetMinutes;
  // const sfSunset = sunsetMinutes + sfOffsetMinutes;
  //
  // DAY_NIGHT_CONFIG.mode = (sfMinutes >= sfSunrise && sfMinutes < sfSunset) ? 'day' : 'night';
}

export { DAY_NIGHT_CONFIG, initDayNightMode };
