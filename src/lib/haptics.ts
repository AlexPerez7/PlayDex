/**
 * Vibración corta como confirmación táctil (Android; iOS Safari no expone la
 * API y la llamada simplemente no hace nada).
 */
export function haptic(pattern: number | number[] = 10) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* sin soporte */
  }
}
