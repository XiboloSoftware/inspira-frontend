const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authInterno } = require("./middleware/authInterno");

// todo backoffice requiere token
router.use(authInterno);

/**
 * BLOQUES (TURNOS)
 * tabla: BloqueHorario
 */

// listar bloques por fecha (YYYY-MM-DD)
router.get("/bloques", async (req, res) => {


  try {
    const { fecha, id_usuario } = req.query;
    if (!fecha) return res.json({ ok: false, msg: "Falta fecha" });

    const where = {
      fecha: new Date(fecha),
      ...(id_usuario ? { id_usuario: Number(id_usuario) } : {}),
    };

    const bloques = await prisma.bloqueHorario.findMany({
      where,
      orderBy: [{ hora_inicio: "asc" }],
      include: {
        usuario: { select: { id_usuario: true, nombre: true, email: true } },
        reserva: true,
        preReservas: true,
      },
    });

    res.json({ ok: true, bloques });
  } catch (e) {
    res.status(500).json({ ok: false, msg: "Error bloques", error: String(e) });
  }
});

// crear bloque
router.post("/bloques", async (req, res) => {
  try {
    const { id_usuario, fecha, hora_inicio, hora_fin, tipo_bloque = "diagnostico" } = req.body;
    if (!id_usuario || !fecha || !hora_inicio || !hora_fin)
      return res.json({ ok: false, msg: "Faltan datos" });

    const bloque = await prisma.bloqueHorario.create({
      data: {
        id_usuario: Number(id_usuario),
        fecha: new Date(fecha),
        hora_inicio,
        hora_fin,
        tipo_bloque,
        estado: "libre",
      },
    });

    res.json({ ok: true, bloque });
  } catch (e) {
    res.status(500).json({ ok: false, msg: "Error crear bloque", error: String(e) });
  }
});

// editar bloque (solo si está libre y sin reserva)
router.put("/bloques/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const b = await prisma.bloqueHorario.findUnique({
      where: { id_bloque: id },
      include: { reserva: true, preReservas: true },
    });

    if (!b) return res.json({ ok: false, msg: "No existe" });
    if (b.reserva || b.estado !== "libre")
      return res.json({ ok: false, msg: "Bloque ocupado, no editable" });

    const { hora_inicio, hora_fin, estado, id_usuario } = req.body;

    const bloque = await prisma.bloqueHorario.update({
      where: { id_bloque: id },
      data: {
        ...(hora_inicio ? { hora_inicio } : {}),
        ...(hora_fin ? { hora_fin } : {}),
        ...(estado ? { estado } : {}),
        ...(id_usuario ? { id_usuario: Number(id_usuario) } : {}),
      },
    });

    res.json({ ok: true, bloque });
  } catch (e) {
    res.status(500).json({ ok: false, msg: "Error editar bloque", error: String(e) });
  }
});

/**
 * RESERVAS PAGADAS DE DIAGNÓSTICO
 * tabla: Reserva + PreReserva + Pago
 */

router.get("/reservas", async (req, res) => {
  try {
    const { fecha } = req.query;

    const where = {
      tipo_reserva: "diagnostico",
      ...(fecha ? { bloque: { fecha: new Date(fecha) } } : {}),
    };

    const reservas = await prisma.reserva.findMany({
      where,
      orderBy: [{ fecha_creacion: "desc" }],
      include: {
        cliente: true,
        bloque: { include: { usuario: true } },
        pago: { include: { metodoPago: true, preReserva: true } },
      },
    });

    // solo pagadas
    const pagadas = reservas.filter(r => r.pago?.estado_pago === "pagado");

    res.json({ ok: true, reservas: pagadas });
  } catch (e) {
    res.status(500).json({ ok: false, msg: "Error reservas", error: String(e) });
  }
});

// actualizar estado/reserva/enlace
router.put("/reservas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { estado, enlace_meet } = req.body;

    const reserva = await prisma.reserva.update({
      where: { id_reserva: id },
      data: {
        ...(estado ? { estado } : {}),
        ...(enlace_meet !== undefined ? { enlace_meet } : {}),
      },
    });

    res.json({ ok: true, reserva });
  } catch (e) {
    res.status(500).json({ ok: false, msg: "Error actualizar reserva", error: String(e) });
  }
});

module.exports = router;
