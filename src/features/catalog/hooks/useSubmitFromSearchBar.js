import { useNavigate } from "react-router-dom";

export const useSubmitFromSearchBar = () => {
  const navigate = useNavigate();

  const goHotels = ({ location, checkIn, checkOut, adults = 1, rooms = 1, page = 0, size = 10 }) => {
    const params = new URLSearchParams({
      ...(location ? { location } : {}),
      ...(checkIn ? { checkIn } : {}),
      ...(checkOut ? { checkOut } : {}),
      adults: String(adults),
      rooms: String(rooms),
      page: String(page),
      size: String(size),
    });
    navigate(`/search/hotels?${params.toString()}`);
  };

  const goRestaurants = ({ location, cuisineSlugs = [], page = 0, size = 10 }) => {
    const params = new URLSearchParams({
      ...(location ? { location } : {}),
      ...(Array.isArray(cuisineSlugs) && cuisineSlugs.length
        ? { cuisineSlugs: cuisineSlugs.join(",") }
        : {}),
      page: String(page),
      size: String(size),
    });
    navigate(`/search/restaurants?${params.toString()}`);
  };

  const goPlaces = ({ q, page = 0, size = 10 }) => {
    const params = new URLSearchParams({
      ...(q ? { q } : {}),
      page: String(page),
      size: String(size),
    });
    navigate(`/search/places?${params.toString()}`);
  };

  return { goHotels, goRestaurants, goPlaces };
};