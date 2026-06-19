type Place = {
  name: string;
  rating?: number;
  types?: string[];
};

type DayPlan = {
  morning: Place[];
  lunch: Place[];
  evening: Place[];
};

export function generateAIItinerary(
  places: Place[],
  restaurants: Place[],
  days: number
) {

  const itinerary: Record<number, DayPlan> = {};

  const shuffledPlaces = [...places].sort(() => 0.5 - Math.random());
  const shuffledFood = [...restaurants].sort(() => 0.5 - Math.random());

  let placeIndex = 0;
  let foodIndex = 0;

  for (let day = 1; day <= days; day++) {

    itinerary[day] = {

      morning: shuffledPlaces.slice(placeIndex, placeIndex + 3),

      lunch: shuffledFood.slice(foodIndex, foodIndex + 3),

      evening: shuffledPlaces.slice(placeIndex + 3, placeIndex + 6)

    };

    placeIndex += 6;
    foodIndex += 3;

  }

  return itinerary;

}