var datosProcesos = [];

function enviarDatos() {

    var arraytLlegada = document.getElementsByClassName("classTLlegada");
    var arraytEjecucion = document.getElementsByClassName("idTEjecucion");
    var arraytInicio = document.getElementsByClassName("idblocInicio");
    var arraytFin = document.getElementsByClassName("idbloqFinal");

    
    var prueba = [];
    let llegada, ejecucion, inicio, fin;
    for (let i = 0; i < arraytFin.length; i++) {

        llegada = arraytLlegada[i].value;
        ejecucion = arraytEjecucion[i].value;
        inicio = arraytInicio[i].value;
        fin = arraytFin[i].value;
        prueba.push(parseInt(llegada));
        prueba.push(parseInt(ejecucion));
        prueba.push(parseInt(inicio));
        prueba.push(parseInt(fin));

        datosProcesos.push(prueba);  
        prueba = []; 
    }

    console.log(datosProcesos);
    var lista = document.getElementById("lista-algoritmos")
    console.log(lista.value);
    switch (lista.value) {
        case "0":
            location.href = "index.html";

            break;
        case "1":
            location.href = "index.html";
            break;
        case "2":
            location.href = "index.html";
            break;
        case "3":
            location.href = "index.html";
            break;
        default:
            break;
    }

    
}

