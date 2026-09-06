// La biblioteca se carga una sola vez a nivel de app (ver GamesProvider
// en contexts/GamesContext.tsx) y se comparte entre todas las pantallas,
// para no volver a pedirla cada vez que se cambia de pestaña.
export { useGames } from '../contexts/GamesContext'
