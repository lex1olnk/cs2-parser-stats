export const getRatingColor = (rating: number, left: number, right: number) => {
  // Нормализуем рейтинг в диапазон 0-1 между left и right
  const normalized = Math.min(Math.max((rating - left) / (right - left), 0), 1);

  // Красный канал уменьшается от 255 до 0
  const red = Math.floor(255 * (1 - normalized));
  // Зеленый канал увеличивается от 0 до 255
  const green = Math.floor(255 * normalized);

  return `rgb(${red}, ${green}, 0)`; // Синий канал всегда 0
};
