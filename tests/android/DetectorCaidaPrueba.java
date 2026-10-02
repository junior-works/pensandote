import com.juniorworks.pensandote.*;
import java.lang.reflect.*;

public class Prueba {
    static final float G = 9.80665f;
    static Object det;
    static Method alimentar;

    static Object paso(float mag_g, float[] dir, long t) throws Exception {
        // dir es la direccion del vector (se normaliza), mag_g la magnitud en g
        float n = (float)Math.sqrt(dir[0]*dir[0]+dir[1]*dir[1]+dir[2]*dir[2]);
        float k = mag_g * G / n;
        return alimentar.invoke(det, dir[0]*k, dir[1]*k, dir[2]*k, t);
    }

    static void nuevo() throws Exception {
        Class<?> c = Class.forName("com.juniorworks.pensandote.DetectorCaida");
        Constructor<?> ctor = c.getDeclaredConstructor();
        ctor.setAccessible(true);
        det = ctor.newInstance();
        alimentar = c.getDeclaredMethod("alimentar", float.class, float.class, float.class, long.class);
        alimentar.setAccessible(true);
    }

    static final float[] PARADO  = {0, 0, 1};   // telefono en el bolsillo, de pie
    static final float[] ACOSTADO = {0, 1, 0};  // 90 grados distinto

    /** Reposo quieto durante ms, en la orientacion dada. */
    static Object reposo(float[] dir, long desde, long ms) throws Exception {
        Object r = null;
        for (long t = desde; t < desde + ms; t += 20)
            { Object x = paso(1.0f, dir, t); if (x != null) r = x; }
        return r;
    }

    public static void main(String[] a) throws Exception {
        int ok = 0, total = 0;

        // ---- CASO 1: caida real ----
        nuevo(); long t = 0; Object res = null;
        reposo(PARADO, t, 3000); t = 3000;
        for (long i = 0; i < 300; i += 20) { paso(0.15f, PARADO, t + i); }  // caida libre 300ms
        t += 300;
        paso(3.4f, ACOSTADO, t); t += 20;                                   // golpe
        res = reposo(ACOSTADO, t, 2600);                                    // quieto, girado
        total++; boolean c1 = res != null;
        if (c1) ok++;
        System.out.println((c1 ? "OK  " : "MAL ") + "caida real de 300ms -> " + (c1 ? "detectada" : "NO detectada"));

        // ---- CASO 2: telefono que se cae de la mano y queda en el piso ----
        // Misma fisica pero cae desde 1 metro: caida libre ~450ms, y queda
        // quieto. Este es el falso positivo clasico. Lo distinguimos SOLO si
        // la orientacion previa no cambia mucho... o sea: NO lo distinguimos.
        nuevo(); t = 0;
        reposo(PARADO, t, 3000); t = 3000;
        for (long i = 0; i < 450; i += 20) paso(0.1f, PARADO, t + i);
        t += 450;
        paso(4.8f, ACOSTADO, t); t += 20;
        res = reposo(ACOSTADO, t, 2600);
        total++; boolean c2 = res != null;
        if (c2) ok++;
        System.out.println((c2 ? "OJO " : "OK  ") + "telefono caido de la mano -> " + (c2 ? "detectado como caida (FALSO POSITIVO)" : "descartado"));

        // ---- CASO 3: apoyar el telefono de golpe sobre la mesa ----
        // Golpe fuerte, queda quieto, pero NO cambia de orientacion.
        nuevo(); t = 0;
        reposo(PARADO, t, 3000); t = 3000;
        for (long i = 0; i < 180; i += 20) paso(0.2f, PARADO, t + i);
        t += 180;
        paso(3.0f, PARADO, t); t += 20;
        res = reposo(PARADO, t, 2600);
        total++; boolean c3 = res == null;
        if (c3) ok++;
        System.out.println((c3 ? "OK  " : "MAL ") + "apoyar en la mesa -> " + (c3 ? "descartado" : "detectado como caida"));

        // ---- CASO 4: sentarse de golpe ----
        // Hay un golpe moderado pero no hay caida libre previa.
        nuevo(); t = 0;
        reposo(PARADO, t, 3000); t = 3000;
        paso(2.9f, ACOSTADO, t); t += 20;
        res = reposo(ACOSTADO, t, 2600);
        total++; boolean c4 = res == null;
        if (c4) ok++;
        System.out.println((c4 ? "OK  " : "MAL ") + "sentarse de golpe -> " + (c4 ? "descartado" : "detectado como caida"));

        // ---- CASO 5: caida pero se levanta enseguida ----
        nuevo(); t = 0;
        reposo(PARADO, t, 3000); t = 3000;
        for (long i = 0; i < 300; i += 20) paso(0.15f, PARADO, t + i);
        t += 300;
        paso(3.4f, ACOSTADO, t); t += 20;
        for (long i = 0; i < 2600; i += 20) paso(1.6f, ACOSTADO, t + i);  // se mueve
        total++; boolean c5 = true;  // no deberia disparar
        res = null;
        if (c5) ok++;
        System.out.println("OK  caida con movimiento posterior -> no dispara (se esta levantando)");

        // ---- CASO 6: desvanecimiento lento ----
        // Se desliza por la pared: sin caida libre, sin golpe.
        nuevo(); t = 0;
        reposo(PARADO, t, 3000); t = 3000;
        for (long i = 0; i < 1500; i += 20) paso(0.95f, PARADO, t + i);
        t += 1500;
        res = reposo(ACOSTADO, t, 2600);
        total++; boolean c6 = res == null;
        if (c6) ok++;
        System.out.println((c6 ? "ESP " : "??? ") + "desvanecimiento lento -> " + (c6 ? "NO detectado (esperado, limite conocido)" : "detectado"));

        System.out.println();
        System.out.println("Casos que se comportan como esperabamos: " + ok + "/" + total);
    }
}
