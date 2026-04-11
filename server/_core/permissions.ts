import { NOT_STAFF_ERR_MSG } from "@shared/const";
import { TRPCError } from "@trpc/server";
import type { User } from "../../drizzle/schema";

export function isStaff(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "user" || user.role === "doctor";
}

export function assertStaff(user: User | null | undefined): asserts user is User {
  if (!isStaff(user)) {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_STAFF_ERR_MSG });
  }
}

export function canAccessPatientData(user: User, patientId: number): boolean {
  if (isStaff(user)) return true;
  return user.role === "patient" && user.linkedPatientId === patientId;
}

/** Médico autenticado só age como o médico ligado ao perfil. */
export function doctorMatches(user: User, doctorId: number): boolean {
  if (user.role !== "doctor") return true;
  return user.linkedDoctorId != null && user.linkedDoctorId === doctorId;
}

/** Paciente autenticado só vê o próprio id. */
export function patientMatches(user: User, patientId: number): boolean {
  if (user.role !== "patient") return true;
  return user.linkedPatientId != null && user.linkedPatientId === patientId;
}
