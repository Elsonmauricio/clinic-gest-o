import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function MedicalRecords() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const { data: patients, isLoading: isLoadingPatients } =
    trpc.patient.list.useQuery();

  const {
    data: records,
    isLoading: isLoadingRecords,
  } = trpc.medicalRecord.getByPatient.useQuery(
    { patientId: selectedPatientId ?? 0 },
    { enabled: selectedPatientId !== null }
  );

  const selectedPatient = patients?.find(p => p.id === selectedPatientId) ?? null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Prontuários</h1>
          <p className="text-gray-600">
            Visualize o histórico de prontuários por paciente.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selecionar Paciente</CardTitle>
            <CardDescription>
              Escolha um paciente para ver o histórico de prontuários.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingPatients ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : !patients || patients.length === 0 ? (
              <p className="text-gray-500">Nenhum paciente encontrado.</p>
            ) : (
              <Select
                value={selectedPatientId ? String(selectedPatientId) : ""}
                onValueChange={val => setSelectedPatientId(parseInt(val))}
              >
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={String(patient.id)}>
                      {patient.name} — {patient.cpf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Prontuários</CardTitle>
              <CardDescription>
                Paciente: <span className="font-semibold">{selectedPatient.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRecords ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : !records || records.length === 0 ? (
                <p className="text-gray-500">
                  Nenhum prontuário encontrado para este paciente.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Sintomas</TableHead>
                        <TableHead>Diagnóstico</TableHead>
                        <TableHead>Tratamento</TableHead>
                        <TableHead>Próxima Consulta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map(record => (
                        <TableRow key={record.id}>
                          <TableCell>
                            {new Date(record.recordDate).toLocaleDateString(
                              "pt-PT"
                            )}
                          </TableCell>
                          <TableCell>{record.symptoms || "-"}</TableCell>
                          <TableCell>{record.diagnosis || "-"}</TableCell>
                          <TableCell>{record.treatment || "-"}</TableCell>
                          <TableCell>
                            {record.nextAppointmentDate
                              ? new Date(
                                  record.nextAppointmentDate as unknown as string
                                ).toLocaleDateString("pt-PT")
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

