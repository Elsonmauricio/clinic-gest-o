import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function Appointments() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: appointments, isLoading, refetch } = trpc.appointment.list.useQuery();
  const { data: patients } = trpc.patient.list.useQuery();
  const { data: doctors } = trpc.doctor.list.useQuery();

  const createMutation = trpc.appointment.create.useMutation({
    onSuccess: () => {
      toast.success("Consulta agendada com sucesso");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelMutation = trpc.appointment.cancel.useMutation({
    onSuccess: () => {
      toast.success("Consulta cancelada com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredAppointments = appointments?.filter(a => {
    if (filterStatus === "all") return true;
    return a.status === filterStatus;
  }) || [];

  const isAdmin = user?.role === "admin";

  const patientMap = useMemo(
    () =>
      new Map(
        (patients ?? []).map(p => [p.id as number, p.name as string])
      ),
    [patients]
  );

  const doctorMap = useMemo(
    () =>
      new Map(
        (doctors ?? []).map(d => [d.id as number, d.name as string])
      ),
    [doctors]
  );

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      "no-show": "bg-yellow-100 text-yellow-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: "Agendada",
      completed: "Realizada",
      cancelled: "Cancelada",
      "no-show": "Não compareceu",
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultas</h1>
            <p className="text-gray-600 mt-2">Gerenciar agendamento de consultas</p>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Agendar Consulta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Agendar Nova Consulta</DialogTitle>
                  <DialogDescription>
                    Preencha as informações da consulta
                  </DialogDescription>
                </DialogHeader>
                <AppointmentForm
                  patients={patients || []}
                  doctors={doctors || []}
                  onSubmit={(data) => {
                    createMutation.mutate(data);
                  }}
                  isLoading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as consultas</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
                <SelectItem value="completed">Realizadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
                <SelectItem value="no-show">Não compareceu</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Consultas</CardTitle>
            <CardDescription>
              Total de {filteredAppointments.length} consulta(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma consulta encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {patientMap.get(appointment.patientId) ??
                            `Paciente #${appointment.patientId}`}
                        </TableCell>
                        <TableCell>
                          {doctorMap.get(appointment.doctorId) ??
                            `Médico #${appointment.doctorId}`}
                        </TableCell>
                        <TableCell>
                          {new Date(appointment.appointmentDate).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell>{appointment.appointmentTime}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {isAdmin && appointment.status === "scheduled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Tem certeza que deseja cancelar esta consulta?")) {
                                  cancelMutation.mutate({ id: appointment.id });
                                }
                              }}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function AppointmentForm({
  patients,
  doctors,
  onSubmit,
  isLoading,
}: {
  patients: any[];
  doctors: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    patientId: 0,
    doctorId: 0,
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId) {
      toast.error("Selecione paciente e médico");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select value={String(formData.patientId)} onValueChange={(val) => setFormData({ ...formData, patientId: parseInt(val) })}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o paciente" />
        </SelectTrigger>
        <SelectContent>
          {patients.map((patient) => (
            <SelectItem key={patient.id} value={String(patient.id)}>
              {patient.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(formData.doctorId)} onValueChange={(val) => setFormData({ ...formData, doctorId: parseInt(val) })}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o médico" />
        </SelectTrigger>
        <SelectContent>
          {doctors.map((doctor) => (
            <SelectItem key={doctor.id} value={String(doctor.id)}>
              {doctor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          value={formData.appointmentDate}
          onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
          required
        />
        <Input
          type="time"
          value={formData.appointmentTime}
          onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
          required
        />
      </div>

      <Input
        placeholder="Notas (opcional)"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Agendar Consulta
        </Button>
      </div>
    </form>
  );
}
