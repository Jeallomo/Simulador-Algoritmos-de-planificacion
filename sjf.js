//Array con los procesos
var procesos = [];
var procesosParaEjecucion = [];
var contEje = 0;
var cpu =null;
var procesosBloqueados = [];
var procEstadis = [];
var numProc = 0;
var procesosCopia = [];
/*
Estados del procesos
0 = Existencia
1 = Ejecución
2 = Bloqueo
3 = Espera
EL ESTADO QUE ACABA SU TIEMPO ES DESTRUIDO
*/ 


class procesador {
    constructor(){
        this.proceso=null;
        this.uso = 0;
        this.tEncendido=0;
        this.tOcio=0;
        this.count=0;
    }
    //poner un nuevo Proceso
    setProceso(proc){
        this.proceso=proc;
        if(proc.tRespuesta<0){
            proc.tRespuesta = contEje;
        }
        
    }
    //aumenta el contador de encendido de la CPU
    aumentarTEncendido(){
        this.tEncendido++;
        if(this.proceso!=null){
            //aumenta en 1 el tiempo de uso de la CPU
            this.uso++;
            this.count++;
            //disminuye en 1 el tiempo de ejecución del proceso
            this.proceso.tEjecucion--;
            //verifica si ya se acabo su tiempo de ejecución
            if(this.proceso.tEjecucion == 0){
                //termina el proceso, así que se le da el estado correspondiente
                this.proceso.estadoProc = 0;
                this.proceso.tFinal = contEje+1;
                //se añaden a una lista especial de procesos terminados para revisar las estadisticas
                procEstadis.push(this.proceso);
                //quita el proceso de la CPU
                this.proceso=null;
                //NO se devuelve a la cola de procesos
                this.count=0;
            }
            // se verifica si va a estar bloqueado en el proximo instante de tiempo
            //el bloqueo empieza a contar desde que empiza a ejecutar
            // solo se aceptan los que tengan un tiempo de bloqueo mayor a 0
            if(this.proceso!=null){
                if(this.proceso.inicioBloq == this.count&& this.proceso.duraBloq>0){
                    //se le asigna el estado de bloqueado
                    this.proceso.estadoProc = 2;
                    this.procesoBloq();
                    this.count=0;
                }
            }         
        }else{
            this.tOcio++;
        }
    }

    procesoBloq(){
        //pone el proceso al final del array
        procesosBloqueados.push(this.proceso);
        this.proceso=null;
    }
}

//crear CPU
function crearCPU(){
    cpu = new procesador();
}

// cuando son creados se le da el estado de exitencia
function crearProceso(instLleg, tEje, inibloq, duraBloq){
    procesos.push({instLlegada: instLleg, tEjecucion: tEje, tEjecucionAbsoluto: tEje, inicioBloq: inibloq, duraBloq:duraBloq, estadoProc:0, tEspera: 0, idProc: procesos.length, tRespuesta: -1, tFinal: 0});
    procesosCopia.push({instLlegada: instLleg, tEjecucion: tEje, duraBloq:duraBloq , tEspera: 0, idProc: procesos.length, tRespuesta: -1, tFinal: 0});
}

//------------------------------------------------------------------------------------
//organiza los procesos según su tiempo de llegada
function organizarProcesosLlegada(proc){
    proc.sort(function(a, b) {
        if(a.instLlegada!=b.instLlegada){
            return a.instLlegada-b.instLlegada;
        }else{

            if(a.duraBloq>b.duraBloq){
                return  -1;
            }
            if(a.duraBloq == b.duraBloq){
                console.log("entro 1");
                return 1;
            }else{
                console.log("entro 2");
                return 1;
            }
        }
    });
}

function organizarProcesosEjecucionAbsoluta(proc){
    proc.sort(function(a, b) {
        if(a.tEjecucionAbsoluto!=b.tEjecucionAbsoluto){
            return a.tEjecucionAbsoluto-b.tEjecucionAbsoluto;
        }else{

            if(a.duraBloq>b.duraBloq){
                return  -1;
            }
            if(a.duraBloq == b.duraBloq){
                console.log("entro 1");
                return 1;
            }else{
                console.log("entro 2");
                return 1;
            }
        }
    });
}
//--------------------------------------------------------------------------------------
function encendido(){
    numProc = procesos.length;
    //mientras halla procesos en la lista o procesos bloqueados sequira prendida la CPU
    for (let i = 0; i < 36; i++) {
    //while (numProc != procEstadis.length ){      
    verificarProcesosEjecutar();    
    
    
	//toca añadirle al los arreglos tiempos de ejecución inmutables, porque se toma el valor de inicio y no el que se va reduciendo
        if( procesosParaEjecucion.length!=0){
            if ( cpu.proceso == null){
                // cambia su estado a ejecución
                procesosParaEjecucion[0].estadoProc = 1;
                //le pasa el proceso a la cpu
                cpu.setProceso(procesosParaEjecucion[0]);
                // se quita de la lista el proceso que paso a la CPU
                procesosParaEjecucion.shift();
                //verifica si hay otros procesos que cuentan con el mismo tiempo de llegada, para dejarlos en espera y los que ya estan esperando su tiempo de espera aumenta            
                aumentarTiempoEspera();
            }else{
                aumentarTiempoEspera();
            }
        }else{
            // el proceso que está en el procesador se sigue ejecutando
            aumentarTiempoEspera();
        }
        administrarProcesosBloq();
        
        cpu.aumentarTEncendido();
        contEje++;   

 
    }
}

//aumenta la duración de espera de los procesos que ya llegaron para ejecutarse
function aumentarTiempoEspera(){
    //recorre todo las lista de procesos que llegaron antes o igual a este estado de ejecución
    for(let i = 0 ; i< procesosParaEjecucion.length; i++){
        // le aumenta en 1 su tiempo de espera
        procesosParaEjecucion[i].tEspera++;
        //pone su estado en espera
        procesosParaEjecucion[i].estadoProc = 3; 
    }  
}

//revias los procesos que ya llegaron y los ordena según su tiempo de ejecución
function verificarProcesosEjecutar() {
    if (procesos.length!=0){
        let lonProcSinEx=procesos.length;

        for(let i =0; i<lonProcSinEx; i++){
            if(procesos[i].instLlegada<=contEje){
                // su estado de activo
                procesos[i].estadoProc=3;
                //pone el proceso en el inicio de la lista
                procesosParaEjecucion.unshift(procesos[i]);
                //quita el proceso bloqueado de la lista de bloqueados
                procesos.splice(i,1);
                i--;
                lonProcSinEx--;
            }
        }
    }
    organizarProcesosEjecucionAbsoluta(procesosParaEjecucion);
}

function administrarProcesosBloq(){
    //verfica que hallan procesos bloqueados en el arreglo
    if (procesosBloqueados.length!=0){
        let lonProcBloq=procesosBloqueados.length;
        console.log("cantidad de procesos bloqueados "+lonProcBloq);
        for(let i =0; i<lonProcBloq; i++){
            //le resta 1 a la duración de bloqueo
            procesosBloqueados[i].duraBloq--;
            // si el proceso ya no tiene tiempo de bloqueo
            if(procesosBloqueados[i].duraBloq == 0){
                //retorna su estado de activo
                procesosBloqueados[i].estadoProc=3;
                //pone el proceso desbloqueado en el inicio de la lista
                procesosParaEjecucion.unshift(procesosBloqueados[i]);
                //quita el proceso bloqueado de la lista de bloqueados
                procesosBloqueados.splice(i,1);
                i--;
                lonProcBloq--;
            }
        }
    }
}

// funciones administrativas

function iniciar() {
    // se crea la CPU
    crearCPU();

    //crear proceso
    crearProceso(0, 6, 3, 2);
    crearProceso(1, 8, 1, 3);
    crearProceso(2, 7, 5, 1);
    crearProceso(4, 3, 0, 0);
    crearProceso(6, 9, 2, 4);
    crearProceso(6, 2, 0, 0);

    

    ponerProcesos();
    
    //organizar procesos según el tiempo de llegada
    organizarProcesosLlegada(procesos);
    organizarProcesosLlegada(procesosCopia);

    //procesosCopia = procesos.slice(); NO FUNCIONO
    console.log(procesos);
    
    encendido();

    organizarProcesosLlegada(procEstadis);
    

    ponerDatosUso();

    ponerDatosCpu();
}

//----------------------------------------
//Seteo del a info en la página
function ponerProcesos() {
    //se obtiene la tabla por su id
    let tablaProcesos = document.getElementById("tabla-procesos");
    let filaInicio = 2;
    for (let i = 0; i < procesos.length; i++) {     
        //filas
        let filasTablaProcesos = tablaProcesos.insertRow(filaInicio);
        //celda 
        let celdaTablaProcesos = filasTablaProcesos.insertCell(0);
        //setear
        celdaTablaProcesos.textContent = procesos[i].idProc;

        celdaTablaProcesos = filasTablaProcesos.insertCell(1);

        celdaTablaProcesos.textContent = procesos[i].instLlegada;

        celdaTablaProcesos = filasTablaProcesos.insertCell(2);

        celdaTablaProcesos.textContent = procesos[i].tEjecucion;

        celdaTablaProcesos = filasTablaProcesos.insertCell(3);

        celdaTablaProcesos.textContent = procesos[i].inicioBloq;

        celdaTablaProcesos = filasTablaProcesos.insertCell(4);

        celdaTablaProcesos.textContent = procesos[i].duraBloq;

        filaInicio++;
    }
}

function ponerDatosCpu() {
    let tablaCPU = document.getElementById("tabla-datos-cpu");

    let filasTablaCPU = tablaCPU.insertRow(1);
    let celdaTablaCPU = filasTablaCPU.insertCell(0);
    celdaTablaCPU.textContent = "Tiempo encendido";
    celdaTablaCPU = filasTablaCPU.insertCell(1);
    celdaTablaCPU.textContent = cpu.tEncendido;

    filasTablaCPU = tablaCPU.insertRow(2);
    celdaTablaCPU = filasTablaCPU.insertCell(0);
    celdaTablaCPU.textContent = "Tiempo Uso total de CPU";
    celdaTablaCPU = filasTablaCPU.insertCell(1);
    celdaTablaCPU.textContent = cpu.uso;

    filasTablaCPU = tablaCPU.insertRow(3);
    celdaTablaCPU = filasTablaCPU.insertCell(0);
    celdaTablaCPU.textContent = "Tiempo CPU desocupada";
    celdaTablaCPU = filasTablaCPU.insertCell(1);
    celdaTablaCPU.textContent = cpu.tOcio;

    let promRetorno = 0;
    let promEjecucion = 0;
    let promEspera = 0;
    let promPerdido = 0;

    for (let i = 0; i < procesosCopia.length; i++) {
        promRetorno += procesosCopia[i].tRetorno;
        promEjecucion += procesosCopia[i].tEjecucion;
        promEspera += procesosCopia[i].tEspera;
        promPerdido += procesosCopia[i].tPerdido;
    }

    promRetorno =(promRetorno/procesosCopia.length).toFixed(2);
    promEjecucion=(promEjecucion/procesosCopia.length).toFixed(2);
    promEspera=(promEspera/procesosCopia.length).toFixed(2);
    promPerdido=(promPerdido/procesosCopia.length).toFixed(2);

    filasTablaCPU = tablaCPU.insertRow(4);
    celdaTablaCPU = filasTablaCPU.insertCell(0);
    celdaTablaCPU.textContent = "Promedio retorno";
    celdaTablaCPU = filasTablaCPU.insertCell(1);
    celdaTablaCPU.textContent =   promRetorno;

    filasTablaCPU = tablaCPU.insertRow(5);
    celdaTablaCPU = filasTablaCPU.insertCell(0);
    celdaTablaCPU.textContent = "Promedio de ejecución";
    celdaTablaCPU = filasTablaCPU.insertCell(1);
    celdaTablaCPU.textContent = promEjecucion;

    filasTablaCPU = tablaCPU.insertRow(6);
    celdaTablaCPU = filasTablaCPU.insertCell(0);
    celdaTablaCPU.textContent = "Promedio de espera";
    celdaTablaCPU = filasTablaCPU.insertCell(1);
    celdaTablaCPU.textContent =  promEspera;

    filasTablaCPU = tablaCPU.insertRow(7);
    celdaTablaCPU = filasTablaCPU.insertCell(0);
    celdaTablaCPU.textContent = "Promedio de tiempo perdido";
    celdaTablaCPU = filasTablaCPU.insertCell(1);
    celdaTablaCPU.textContent = promPerdido;
}


function ponerDatosUso( ) {
    for (let i = 0; i < procesosCopia.length; i++) {
        procesosCopia[i].tEspera = procEstadis[i].tEspera;  
        procesosCopia[i].tFinal = procEstadis[i].tFinal;  
        Object.defineProperty(procesosCopia[i], 'tRetorno', {
            value: procesosCopia[i].tFinal-procesosCopia[i].instLlegada,
            writable: true,
            configurable: true,
            enumerable: true
        });
        Object.defineProperty(procesosCopia[i], 'tPerdido', {
            value: procesosCopia[i].tRetorno-procesosCopia[i].tEjecucion,
            writable: true,
            configurable: true,
            enumerable: true
        });
        Object.defineProperty(procesosCopia[i], 'penalidad', {
            value: procesosCopia[i].tRetorno/procesosCopia[i].tEjecucion,
            writable: true,
            configurable: true,
            enumerable: true
        });
        Object.defineProperty(procesosCopia[i], 'tRespuesta', {
            value: procEstadis[i].tRespuesta-procesosCopia[i].instLlegada,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }

    
    let datosProcesos = document.getElementById("tabla-datos-procesos");
    let filaInicio = 1;
    for (let i = 0; i < procesosCopia.length; i++) {
        let filasTablaProcesos = datosProcesos.insertRow(filaInicio);
        let celdaTablaProcesos = filasTablaProcesos.insertCell(0);
        celdaTablaProcesos.textContent = i;
        celdaTablaProcesos = filasTablaProcesos.insertCell(1);
        celdaTablaProcesos.textContent = procesosCopia[i].tEjecucion;
        celdaTablaProcesos = filasTablaProcesos.insertCell(2);
        celdaTablaProcesos.textContent = procesosCopia[i].tEspera;
        celdaTablaProcesos = filasTablaProcesos.insertCell(3);
        celdaTablaProcesos.textContent = procesosCopia[i].duraBloq;
        celdaTablaProcesos = filasTablaProcesos.insertCell(4);
        celdaTablaProcesos.textContent = procesosCopia[i].tFinal;
        celdaTablaProcesos = filasTablaProcesos.insertCell(5);
        celdaTablaProcesos.textContent = procesosCopia[i].tRetorno.toFixed(2);
        celdaTablaProcesos = filasTablaProcesos.insertCell(6);
        celdaTablaProcesos.textContent = procesosCopia[i].tPerdido.toFixed(2);
        celdaTablaProcesos = filasTablaProcesos.insertCell(7);
        celdaTablaProcesos.textContent = procesosCopia[i].penalidad.toFixed(2);
        celdaTablaProcesos = filasTablaProcesos.insertCell(8);
        celdaTablaProcesos.textContent = procesosCopia[i].tRespuesta.toFixed(2);
        filaInicio++;
    }
}


iniciar();
