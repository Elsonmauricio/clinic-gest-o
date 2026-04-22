import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { trpc } from "../../utils/trpc";
import { Card, CardContent } from "../ui/card";

export function AvailabilityCalendar({ 
  doctorId, 
  selectedDate, 
  onSelect 
}: { 
  doctorId: number; 
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}) {
  // Busca dias ocupados ou fora da agenda do médico
  const { data: availability } = trpc.doctors.getAvailabilityCalendar.useQuery(
    { doctorId, month: selectedDate?.getMonth() || new Date().getMonth() },
    { enabled: !!doctorId }
  );

  return (
    <Card className="p-0 border-none shadow-none">
      <CardContent className="p-0">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={onSelect}
          locale={ptBR}
          disabled={[
            { dayOfWeek: [0] }, // Domingo sempre desabilitado
            ...(availability?.disabledDates || []).map(d => new Date(date))
          ]}
          modifiers={{
            available: (availability?.availableDates || []).map(d => new Date(date))
          }}
          modifiersClassNames={{
            available: "bg-primary/10 text-primary font-bold"
          }}
        />
      </CardContent>
    </Card>
  );
}