// =====================================================
// MARRANA KEEPALIVE
// Pinguea proyectos Supabase para evitar la pausa automática.
// Se ejecuta TODOS LOS DÍAS vía GitHub Actions.
//
// Cada ping consulta la base de datos real del proyecto:
//   - Si se conoce una tabla (ej: 'miembros'), consulta esa tabla.
//   - Si no, consulta la raíz REST (/rest/v1/), que también obliga a
//     PostgREST a leer el esquema de la base → cuenta como actividad real.
// Ya NO se usa la tabla ficticia 'public_health_check' (daba 404).
// =====================================================

const PROYECTOS = [
    {
        nombre: 'salud-marrana',
        cuenta: 'directivasaintlouis',
        url: 'https://froqeqpwpdekolktbjlr.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyb3FlcXB3cGRla29sa3RiamxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODA4MjgsImV4cCI6MjA5MzY1NjgyOH0.RJ6Laff1O_xJzJfKonqLRvDpmymIBqi6x-DlVa0vbZU',
        tabla: 'miembros'
    },
    {
        nombre: 'paes-lab',
        cuenta: 'directivasaintlouis',
        url: 'https://cjpmainjspaygmrnnckk.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcG1haW5qc3BheWdtcm5uY2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjgwNjEsImV4cCI6MjA5MzE0NDA2MX0.4Cbb9nL_l9yoAEDS-1Otk4hYoxlbpHCY7Y51DITv1Sc',
        tabla: null
    },
    {
        nombre: 'naty-bienestar',
        cuenta: 'nhernandezcifuentes',
        url: 'https://ugwlyjcwppicdquexotv.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd2x5amN3cHBpY2RxdWV4b3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzY2NjUsImV4cCI6MjA5MTc1MjY2NX0.NL0jneL8E3N8HhRk77hSkriCSvjCvvjHhBXdwPJbV1A',
        tabla: null
    },
    {
        nombre: 'racuna-lgtms',
        cuenta: 'nhernandezcifuentes',
        url: 'https://cayvrsqyjljqnrtsagwq.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNheXZyc3F5amxqcW5ydHNhZ3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDc3OTQsImV4cCI6MjA5MTQyMzc5NH0.aHWv_v1U1EQ52zQmfGteOR4keqmxqOKkECYR178FN3E',
        tabla: null
    },
    {
        nombre: 'hackea-calculadora',
        cuenta: 'natalia@hackea.pro',
        url: 'https://uiqktoskdpnvpysibgqm.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpcWt0b3NrZHBudnB5c2liZ3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODc3MTQsImV4cCI6MjA5MzA2MzcxNH0.57fXlTos-fU9gAU6jtDI3UJhIb-Da9BoJvxD8PQ-9O4',
        tabla: null
    },
    {
        nombre: 'disc-hackea',
        cuenta: 'natalia@hackea.pro',
        url: 'https://btsdnrzmyshzfoybqpar.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0c2RucnpteXNoemZveWJxcGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNTA3ODMsImV4cCI6MjA5MjgyNjc4M30.W449tsl57_83EPhLRTDjn13pLf5EU5q9EWF1ddnCg-s',
        tabla: null
    }
];

/**
 * Pinguea un proyecto haciendo una consulta REST real a su base de datos.
 * Si se conoce una tabla, consulta esa; si no, consulta la raíz REST.
 */
async function pinguearProyecto(proyecto) {
    const inicio = Date.now();

    // Con tabla conocida: consulta esa tabla (lectura real de datos).
    // Sin tabla: consulta la raíz REST, que obliga a leer el esquema.
    const url = proyecto.tabla
        ? `${proyecto.url}/rest/v1/${proyecto.tabla}?limit=1`
        : `${proyecto.url}/rest/v1/`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': proyecto.anonKey,
                'Authorization': `Bearer ${proyecto.anonKey}`,
                'Accept': 'application/json'
            }
        });

        const duracion = Date.now() - inicio;

        // 200 = OK. 401/403 = vivo pero protegido (también cuenta como actividad).
        // 500+ (incluye 503 de proyecto pausado) = problema → se marca como fallo.
        if (response.status >= 200 && response.status < 500) {
            console.log(`✅ ${proyecto.nombre.padEnd(25)} [${response.status}] ${duracion}ms`);
            return { ok: true, status: response.status, duracion };
        } else {
            console.log(`⚠️  ${proyecto.nombre.padEnd(25)} [${response.status}] ${duracion}ms`);
            return { ok: false, status: response.status, duracion };
        }
    } catch (err) {
        const duracion = Date.now() - inicio;
        console.log(`❌ ${proyecto.nombre.padEnd(25)} ERROR: ${err.message} (${duracion}ms)`);
        return { ok: false, error: err.message, duracion };
    }
}

async function main() {
    console.log('===========================================');
    console.log('🐷 MARRANA KEEPALIVE');
    console.log(`📅 ${new Date().toISOString()}`);
    console.log(`📦 Pingueando ${PROYECTOS.length} proyectos`);
    console.log('===========================================\n');

    const resultados = [];
    for (const proyecto of PROYECTOS) {
        const resultado = await pinguearProyecto(proyecto);
        resultados.push({ proyecto: proyecto.nombre, ...resultado });
    }

    const exitos = resultados.filter(r => r.ok).length;
    const fallos = resultados.filter(r => !r.ok).length;

    console.log('\n===========================================');
    console.log(`📊 RESUMEN: ${exitos} exitosos · ${fallos} con error`);
    console.log('===========================================');

    // Si hubo fallos (ej: un proyecto pausado devolviendo 503), salir con error
    // para que GitHub Actions lo marque en rojo y te avise por correo.
    if (fallos > 0) {
        console.error('\n⚠️  Algunos proyectos tuvieron problemas. Revisa los logs.');
        process.exit(1);
    }

    console.log('\n✨ Todos los proyectos están vivos y pateando.');
}

main().catch(err => {
    console.error('💥 Error fatal:', err);
    process.exit(1);
});
