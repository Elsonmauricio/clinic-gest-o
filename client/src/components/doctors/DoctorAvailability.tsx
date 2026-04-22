import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Clock, Save } from "lucide-react";

const DAYS = [
  { id: "monday", label: "Segunda-feira" },
  { id: "tuesday", label: "Terça-feira" },
  { id: "wednesday", label: "Quarta-feira" },
  { id: "thursday", label: "Quinta-feira" },
  { id: "friday", label: "Sexta-feira" },
  { id: "saturday", label: "Sábado" },
];

export function DoctorAvailability({ doctorId }: { doctorId: number }) {
  const utils = trpc.useUtils();
  const { data: doctor, isLoading } = trpc.doctors.getById.useQuery({ id: doctorId });
  
  // Estado local para gerenciar o formulário de horários
  const [schedule, setSchedule] = useState<any>(doctor?.availability || {});

  const updateAvailability = trpc.doctors.updateAvailability.useMutation({
    onSuccess: () => {
      toast.success("Horários de atendimento atualizados!");
      utils.doctors.getById.invalidate({ id: doctorId });
    },
  });

  if (isLoading) return <div>Carregando horários...</div>;

  const handleToggleDay = (dayId: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      [dayId]: prev[dayId] ? null : { start: "08:00", end: "18:00" }
    }));
  };

  const handleTimeChange = (dayId: string, field: "start" | "end", value: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Horários de Atendimento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map((day) => (
          <div key={day.id} className="flex items-center justify-between p-2 border-b last:border-0">
            <div className="flex items-center gap-3 w-1/3">
              <Checkbox 
                id={day.id} 
                checked={!!schedule[day.id]} 
                onCheckedChange={() => handleToggleDay(day.id)}
              />
              <label htmlFor={day.id} className="text-sm font-medium leading-none">
                {day.label}
              </label>
            </div>

            {schedule[day.id] ? (
              <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                <Input 
                  type="time" 
                  className="w-24 h-8" 
                  value={schedule[day.id].start}
                  onChange={(e) => handleTimeChange(day.id, "start", e.target.value)}
                />
                <span className="text-muted-foreground">até</span>
                <Input 
                  type="time" 
                  className="w-24 h-8" 
                  value={schedule[day.id].end}
                  onChange={(e) => handleTimeChange(day.id, "end", e.target.value)}
                />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Não atende</span>
            )}
          </div>
        ))}

        <Button 
          className="w-full mt-4" 
          onClick={() => updateAvailability.mutate({ id: doctorId, availability: schedule })}
          disabled={updateAvailability.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar Agenda
        </Button>
      </CardContent>
    </Card>
  );
}