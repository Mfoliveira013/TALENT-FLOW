import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Edit, Trash2, MapPin, Video, Phone } from "lucide-react";

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

export default function InterviewList({ entrevistas, isLoading, onEdit, onDelete }) {
  const upcomingInterviews = entrevistas
    .filter(e => new Date(e.data_hora) >= new Date() && e.status !== 'cancelada')
    .slice(0, 10);

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Próximas Entrevistas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : upcomingInterviews.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhuma entrevista próxima</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingInterviews.map((entrevista) => {
              const TipoIcon = tipoIcons[entrevista.local_tipo];
              return (
                <div
                  key={entrevista.id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <TipoIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">
                        {entrevista.candidato_nome}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {format(new Date(entrevista.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <Badge className={`${statusColors[entrevista.status]} mt-2`}>
                        {entrevista.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(entrevista)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(entrevista.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}