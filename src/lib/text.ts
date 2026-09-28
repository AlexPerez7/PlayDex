/** "1 juego" / "3 juegos". Para plurales irregulares se pasa la forma plural. */
export function plural(n: number, singular: string, pluralForm = `${singular}s`) {
  return `${n.toLocaleString()} ${n === 1 ? singular : pluralForm}`
}
