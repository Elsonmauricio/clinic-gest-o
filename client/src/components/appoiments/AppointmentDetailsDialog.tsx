import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, User, UserRound, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export function AppointmentDetailsDialog({ 
  appointmentId, 
  open, 
  onOpenChange 
}: { 
  appointmentId: number; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const utils = trpc.useUtils();
  const { data: appt, isLoading } = trpc.appointments.getById.useQuery({ id: appointmentId });

  const updateStatus = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.appointments.list.invalidate();
    }
  });

  if (isLoading || !appt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Consulta</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> 
                {format(new Date(appt.appointmentDate), "PPP", { locale: ptBR })}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {format(new Date(appt.appointmentDate), "HH:mm")}h
              </p>
            </div>
            <Badge variant={appt.status === "scheduled" ? "default" : "secondary"}>
              {appt.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid gap-4 border-t pt-4">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Paciente</p>
                <p className="text-sm text-muted-foreground">{appt.patientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Médico</p>
                <p className="text-sm text-muted-foreground">{appt.doctorName} ({appt.specialty})</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Fechar</Button>
          {appt.status === "scheduled" && (
            <Button className="flex-1" onClick={() => updateStatus.mutate({ id: appt.id, status: "completed" })}>
              Marcar como Realizada
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}