package com.juniorworks.pensandote;

/**
 * Detecta una posible caida a partir del acelerometro.
 *
 * COMO FUNCIONA
 *
 * Una caida dura deja una firma de tres tiempos:
 *
 *   1) CAIDA LIBRE. Mientras el cuerpo cae, el telefono deja de sentir
 *      la gravedad y la magnitud del acelerometro se desploma cerca de
 *      cero. Dura poco: entre 100 y 400 ms para una caida de pie.
 *   2) GOLPE. Al tocar el piso la magnitud salta muy por encima de 1g.
 *   3) QUIETUD. Despues del golpe la persona queda inmovil, y el
 *      telefono queda en una orientacion distinta a la que tenia.
 *
 * Exigimos las tres cosas EN ORDEN. Pedir solo el golpe convierte en
 * caida cualquier telefono que se cae de la mano; pedir solo la
 * quietud convierte en caida dejarlo sobre la mesa.
 *
 * QUE NO DETECTA — y conviene tenerlo escrito
 *
 * El desvanecimiento lento, que en gente mayor es frecuente: la
 * persona se desliza por la pared y se sienta en el piso. No hay caida
 * libre ni golpe. Esto no lo va a ver. Ningun acelerometro de bolsillo
 * lo ve.
 *
 * LOS NUMEROS SON PROVISORIOS
 *
 * Los umbrales de abajo son el punto de partida de la literatura, no
 * la verdad. Por eso existe la fase de calibracion: el servicio guarda
 * cada candidato con sus valores medidos y SIN avisarle a nadie,
 * durante semanas, con el telefono real en el bolsillo real. Recien
 * con esos datos se mueven estos numeros.
 */
final class DetectorCaida {

    // --- Umbrales. Ver el comentario de arriba antes de tocarlos. ---

    /** Por debajo de esto consideramos que esta cayendo (en g). */
    static final float G_CAIDA_LIBRE = 0.42f;

    /** Por encima de esto consideramos que golpeo (en g). */
    static final float G_GOLPE = 2.6f;

    /** Ventana de caida libre valida (ms). Mas corto es un tropiezo;
     *  mas largo es el telefono tirado desde una altura. */
    static final long CAIDA_LIBRE_MIN_MS = 80;
    static final long CAIDA_LIBRE_MAX_MS = 600;

    /** Cuanto puede tardar el golpe despues de la caida libre (ms). */
    static final long GOLPE_MAX_MS = 500;

    /** Cuanto tiene que quedarse quieto para contar como caida (ms). */
    static final long QUIETUD_MS = 1800;

    /** Margen alrededor de 1g dentro del cual lo damos por quieto. */
    static final float G_QUIETUD_MARGEN = 0.22f;

    /** Giro minimo entre antes y despues para creerle (grados). */
    static final float GIRO_MIN_GRADOS = 28f;

    private enum Fase { ESPERANDO, CAYENDO, GOLPEO }

    /** Lo que medimos cuando creemos que hubo una caida. */
    static final class Candidato {
        final float picoG;
        final long  caidaLibreMs;
        final long  quietudMs;
        final float giroGrados;
        Candidato(float picoG, long caidaLibreMs, long quietudMs, float giroGrados) {
            this.picoG = picoG;
            this.caidaLibreMs = caidaLibreMs;
            this.quietudMs = quietudMs;
            this.giroGrados = giroGrados;
        }
    }

    private Fase  fase = Fase.ESPERANDO;
    private long  inicioCaidaMs;
    private long  golpeMs;
    private long  inicioQuietudMs;
    private float picoG;
    private long  duracionCaidaMs;

    // Vector de gravedad antes de caer y despues de golpear, para medir
    // el giro. Lo filtramos con un pasabajos para quedarnos con la
    // gravedad y descartar el movimiento.
    private final float[] gravedadPrevia = new float[3];
    private boolean hayGravedadPrevia = false;
    private final float[] gravedad = new float[3];

    private static final float ALFA = 0.8f;      // pasabajos
    private static final float G = 9.80665f;

    /**
     * Alimenta una lectura del acelerometro.
     *
     * @return el candidato si esta lectura cerro una secuencia de
     *         caida, o null en cualquier otro caso.
     */
    Candidato alimentar(float x, float y, float z, long ahoraMs) {
        final float magnitudG = (float) Math.sqrt(x * x + y * y + z * z) / G;

        gravedad[0] = ALFA * gravedad[0] + (1 - ALFA) * x;
        gravedad[1] = ALFA * gravedad[1] + (1 - ALFA) * y;
        gravedad[2] = ALFA * gravedad[2] + (1 - ALFA) * z;

        switch (fase) {
            case ESPERANDO:
                if (magnitudG < G_CAIDA_LIBRE) {
                    // Guardamos como estaba orientado ANTES de caer.
                    System.arraycopy(gravedad, 0, gravedadPrevia, 0, 3);
                    hayGravedadPrevia = true;
                    inicioCaidaMs = ahoraMs;
                    picoG = magnitudG;
                    fase = Fase.CAYENDO;
                } else if (Math.abs(magnitudG - 1f) < G_QUIETUD_MARGEN) {
                    // Quieto y de pie: esta es la orientacion de referencia.
                    System.arraycopy(gravedad, 0, gravedadPrevia, 0, 3);
                    hayGravedadPrevia = true;
                }
                break;

            case CAYENDO: {
                final long cayendoHace = ahoraMs - inicioCaidaMs;
                if (magnitudG > G_GOLPE) {
                    duracionCaidaMs = cayendoHace;
                    if (duracionCaidaMs < CAIDA_LIBRE_MIN_MS) {
                        // Demasiado corto: un sacudon, no una caida.
                        reiniciar();
                        break;
                    }
                    picoG = magnitudG;
                    golpeMs = ahoraMs;
                    inicioQuietudMs = 0;
                    fase = Fase.GOLPEO;
                } else if (cayendoHace > CAIDA_LIBRE_MAX_MS) {
                    // Estuvo en "caida libre" demasiado tiempo: lo mas
                    // probable es que el telefono este en el aire (en una
                    // mano que se mueve, en el bolso de alguien que corre).
                    reiniciar();
                }
                break;
            }

            case GOLPEO: {
                if (magnitudG > picoG) picoG = magnitudG;

                if (ahoraMs - golpeMs > GOLPE_MAX_MS + QUIETUD_MS + 1500) {
                    // Pasó el tiempo y nunca se quedó quieto: si despues
                    // del golpe sigue moviendose, se levanto o nunca cayo.
                    reiniciar();
                    break;
                }
                final boolean quieto = Math.abs(magnitudG - 1f) < G_QUIETUD_MARGEN;
                if (!quieto) { inicioQuietudMs = 0; break; }

                if (inicioQuietudMs == 0) { inicioQuietudMs = ahoraMs; break; }

                final long quietoHace = ahoraMs - inicioQuietudMs;
                if (quietoHace < QUIETUD_MS) break;

                final float giro = hayGravedadPrevia ? giroGrados(gravedadPrevia, gravedad) : 0f;
                if (giro < GIRO_MIN_GRADOS) {
                    // Golpeo y quedo quieto pero en la MISMA posicion: es
                    // el telefono apoyado de golpe sobre una mesa.
                    reiniciar();
                    break;
                }

                final Candidato c = new Candidato(picoG, duracionCaidaMs, quietoHace, giro);
                reiniciar();
                return c;
            }
        }
        return null;
    }

    private void reiniciar() {
        fase = Fase.ESPERANDO;
        inicioQuietudMs = 0;
        picoG = 0;
        duracionCaidaMs = 0;
    }

    /** Angulo entre dos vectores de gravedad, en grados. */
    private static float giroGrados(float[] a, float[] b) {
        final double na = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
        final double nb = Math.sqrt(b[0]*b[0] + b[1]*b[1] + b[2]*b[2]);
        if (na < 1e-3 || nb < 1e-3) return 0f;
        double cos = (a[0]*b[0] + a[1]*b[1] + a[2]*b[2]) / (na * nb);
        cos = Math.max(-1.0, Math.min(1.0, cos));
        return (float) Math.toDegrees(Math.acos(cos));
    }
}
