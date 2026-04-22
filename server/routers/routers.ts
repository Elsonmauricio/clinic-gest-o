import { router } from "../_core/trpc";
import { authRouter } from "./auth";
import { patientRouter } from "./patient"; // Verifique se moveu os ficheiros para esta pasta
import { doctorRouter } from "./doctor";   // Verifique se moveu os ficheiros para esta pasta
import { specialtyRouter } from "./specialty";
import { appointmentRouter } from "./appointment";
import { medicalRecordsRouter } from "./medicalRecords";

export const appRouter = router({
  auth: authRouter,
  patient: patientRouter,
  doctor: doctorRouter,
  specialty: specialtyRouter,
  appointment: appointmentRouter,
  medicalRecords: medicalRecordsRouter, // Adicionado o router de prontuários médicos
});

export type AppRouter = typeof appRouter;