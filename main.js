const simulacionesAnterioresGuardadas = localStorage.getItem( "simulacionesAnteriores");
const simulacionesAnteriores = simulacionesAnterioresGuardadas ? JSON.parse(simulacionesAnterioresGuardadas): [];
let mostrarNotificaciones = false;

const prestamosSimulados = [];
const output = document.getElementById("output");

// Objeto para representar un préstamo
class Prestamo {
    constructor(monto, tasaInteresAnual, plazoMeses, cuotaMensual) {
        this.monto = monto;
        this.tasaInteresAnual = tasaInteresAnual;
        this.plazoMeses = plazoMeses;
        this.cuotaMensual = cuotaMensual;
    }
}

// Función para calcular la cuota mensual
function calcularCuotaMensual(monto, tasaInteresAnual, plazoMeses) {
    const tasaMensual = tasaInteresAnual / 100 / 12;
    const factor = calcularFactor(plazoMeses, tasaMensual);
    const cuota = (monto * tasaMensual * factor) / (factor - 1);
    return cuota.toFixed(2);
}

// Función para calcular el factor
function calcularFactor(plazoMeses, tasaMensual) {
    let factor = 1;
    for (let i = 0; i < plazoMeses; i++) {
        factor *= 1 + tasaMensual;
    }
    return factor;
}

function aprobarPrestamo(tasaInteresAnual, montoPrestamo) {
    const tasaAprobacion = 15; // Tasa de interés máxima para aprobación
    const montoAprobacion = 2000000; // Monto máximo para aprobación

    if (tasaInteresAnual <= tasaAprobacion && montoPrestamo <= montoAprobacion) {
        return "El préstamo es Aprobado";
    } else {
        // Mostrar un SweetAlert para informar que el préstamo es rechazado
        Swal.fire({
            title: "Préstamo Rechazado",
            text: "Lo siento, no cumplis con los requisitos para este préstamo.",
            icon: "error",
        });

        return "El préstamo es Rechazado";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const simulateBtn = document.getElementById("simulateBtn");
    const viewBtn = document.getElementById("viewBtn");
    const clearBtn = document.getElementById("clearBtn");
    const montoInput = document.getElementById("monto");
    const tasaInteresInput = document.getElementById("tasaInteres");
    const plazoInput = document.getElementById("plazo");

    // Array para almacenar las simulaciones cargadas desde el archivo JSON
    const prestamosSimulados = [];

    // Función para cargar datos desde un archivo JSON
    function cargarSimulacionesDesdeJSON() {
        fetch("./prestamos.json")
            .then((response) => response.json())
            .then((data) => {
                prestamosSimulados.push(...data);
            });
    }

    cargarSimulacionesDesdeJSON();


    function mostrarPrestamo(prestamo, index) {
        const prestamoInfo = document.createElement("div");
        prestamoInfo.className = "prestamo-info";

        prestamoInfo.innerHTML = 
        "<strong>Simulación " + (index ? index : "") + ":</strong><br>" +
        "Monto del préstamo: $" + prestamo.monto +"<br>" +
        "Tasa de interés anual: " + prestamo.tasaInteresAnual + "%<br>" +
        "Plazo en meses: " + prestamo.plazoMeses + "<br>" +
        "Cuota mensual: $" + prestamo.cuotaMensual + "<br>" +
            aprobarPrestamo(prestamo.tasaInteresAnual, prestamo.monto);

        // Verifica si la simulación ya existe en el array antes de agregarla
        if (!simulacionesAnteriores.includes(prestamo)) {
            // Si no existe, agregar al array y guardarla en localStorage
            simulacionesAnteriores.push(prestamo);
            localStorage.setItem("simulacionesAnteriores", JSON.stringify(simulacionesAnteriores));
        }

        // Si el préstamo está aprobado, mostrar un SweetAlert
        if (
            aprobarPrestamo(prestamo.tasaInteresAnual, prestamo.monto) === "El préstamo es Aprobado" && mostrarNotificaciones) {
            Swal.fire({
                title: "Préstamo Aprobado",
                text: "¡Felicidades! Tu préstamo ha sido aprobado.",
                icon: "success",
            });
        }

        output.appendChild(prestamoInfo);

        // Mostrar notificación a través de Toastify
        if (mostrarNotificaciones) {
            Toastify({
                text: "Nueva simulación guardada",
                duration: 2000,
                close: true,
                gravity: "end",
                position: "left",
            }).showToast();
        }
    }

    simulateBtn.addEventListener("click", () => {
        output.innerHTML = ""; // Limpiar el contenido anterior

        const montoPrestamo = parseFloat(montoInput.value);
        const tasaInteresAnual = parseFloat(tasaInteresInput.value);
        const plazoMeses = parseInt(plazoInput.value);

        if (
            isNaN(montoPrestamo) || isNaN(tasaInteresAnual) || isNaN(plazoMeses) || plazoMeses <= 0) {
            output.textContent = "Por favor, ingresar un valor numérico correcto.";
        } else {
            const cuotaMensual = calcularCuotaMensual(
                montoPrestamo,
                tasaInteresAnual,
                plazoMeses
            );

            const nuevoPrestamo = {
                ...{
                    monto: montoPrestamo,
                    tasaInteresAnual: tasaInteresAnual,
                    plazoMeses: plazoMeses,
                    cuotaMensual: cuotaMensual,
                },
            };
            prestamosSimulados.push(nuevoPrestamo);

            mostrarPrestamo(nuevoPrestamo);
        }
    });

    viewBtn.addEventListener("click", () => {
        output.innerHTML = ""; // Limpiar el contenido anterior

        if (simulacionesAnteriores.length === 0) {
            output.textContent = "No hay simulaciones anteriores.";
        } else {
            mostrarNotificaciones = false;
            simulacionesAnteriores.forEach((prestamo, index) => {
                mostrarPrestamo(prestamo, index + 1);
            });
            mostrarNotificaciones = true;
        }
    });

    clearBtn.addEventListener("click", () => {
        // Mostrar un SweetAlert para confirmar la limpieza
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará todos los resultados simulados. ¿Deseas continuar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, borrar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                // Si el usuario confirma, borrar los resultados y los campos de entrada
                output.innerHTML = "";
                montoInput.value = "";
                tasaInteresInput.value = "";
                plazoInput.value = "";
            }
        });
    });
});
