import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, MapPin, Video, Phone } from "lucide-react";

const tipoIcons = {
  presencial: MapPin,
  online: Video,
  telefone: Phone
};

const statusColors = {
  agendada: "bg-blue-100 text-blue-800",
  confirmada: "bg-green-100 text-green-800",
  realizada: "bg-slate-100 text-slate-800",
  cancelada: "bg-red-100 text-red-800",
  remarcada: "bg-amber-100 text-amber-800"
};

export default function CalendarView({ entrevistas, isLoading, onSelectInterview }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const entrevistasNoDia = entrevistas.filter(e => 
    isSameDay(new Date(e.data_hora), selectedDate)
  ).sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Calendário
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <div className="space-y-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-lg border"
              modifiers={{
                hasInterview: entrevistas.map(e => new Date(e.data_hora))
              }}
              modifiersStyles={{
                hasInterview: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  color: '#2563eb'
                }
              }}
            />

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">
                Entrevistas em {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
              </h3>
              
              {entrevistasNoDia.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  Nenhuma entrevista agendada para este dia
                </p>
              ) : (
                <div className="space-y-2">
                  {entrevistasNoDia.map((entrevista) => {
                    const TipoIcon = tipoIcons[entrevista.local_tipo];
                    return (
                      <div
                        key={entrevista.id}
                        onClick={() => onSelectInterview(entrevista)}
                        className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <TipoIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold text-slate-900">
                                {entrevista.candidato_nome}
                              </h4>
                              <Badge className={statusColors[entrevista.status]}>
                                {entrevista.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              {format(new Date(entrevista.data_hora), "HH:mm", { locale: ptBR })}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 truncate">
                              {entrevista.local_detalhes}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}