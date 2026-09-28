// Funciones puras: una sola fase continua, incluso al cambiar de estado.
export function gestoNube(segundos, intensidad = 0) {
    return {
        x: Math.sin(segundos * 0.63) * 1.7 + Math.sin(segundos * 1.31) * 0.45,
        y: Math.sin(segundos * 1.26) * 1.9 + Math.sin(segundos * 2.17) * intensidad * 0.65,
        giro: Math.sin(segundos * 0.79) * 0.48,
        escala: 1 + Math.sin(segundos * 1.26) * 0.006 + intensidad * 0.004
    };
}

export function aperturaNube(segundos) {
    // Pulsos redondeados y de distinta amplitud; breve cierre entre frases.
    const silaba = (1 - Math.cos(segundos * 2 * Math.PI * 3.25)) / 2;
    const acento = 0.52 + 0.23 * Math.sin(segundos * 4.1) + 0.15 * Math.sin(segundos * 1.7);
    const pausa = Math.sin(segundos * 2.35) > 0.93 ? 0.15 : 1;
    return Math.max(0, Math.min(1, Math.pow(silaba, 0.8) * acento * pausa));
}

export function suavizar(actual, objetivo, delta, tiempo = 0.07) {
    return actual + (objetivo - actual) * (1 - Math.exp(-delta / tiempo));
}
