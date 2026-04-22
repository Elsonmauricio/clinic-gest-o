import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { patientRouter } from "./routers/patient";
import { doctorRouter } from "./routers/doctor";
import { specialtyRouter } from "./routers/specialty";
import { appointmentRouter } from "./routers/appointment";
import { medicalRecordsRouter } from "./routers/medicalRecords";

export const appRouter = router({
  auth: authRouter,
  patient: patientRouter,
  doctor: doctorRouter,
  specialty: specialtyRouter,
  appointment: appointmentRouter,
  medicalRecords: medicalRecordsRouter, // Adicionado o router de prontuários médicos
});

export type AppRouter = typeof appRouter;