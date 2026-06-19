export function adjustTimeForWeather(minutes:number, weather:string){

  if(weather === "rain") return minutes * 1.3
  if(weather === "storm") return minutes * 1.5
  if(weather === "snow") return minutes * 1.4

  return minutes

}