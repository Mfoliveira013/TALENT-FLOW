import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Briefcase, Eye, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  "Em análise": "bg-amber-100 text-amber-800 border-amber-200",
  "Pendente de Entrevista": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Entrevista Agendada": "bg-purple-100 text-purple-800 border-purple-200",
  "Entrevistado": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Aprovado": "bg-green-100 text-green-800 border-green-200",
  "Reprovado": "bg-red-100 text-red-800 border-red-200",
  "Contratado": "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export default function CandidateCard({ candidato, onViewDetails }) {
  const statusColorClass = statusColors[candidato.status] || "bg-slate-100 text-slate-800";

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                {candidato.nome_completo}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge className={`${statusColorClass} border text-xs`}>
                  {candidato.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {candidato.setor_destino}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{candidato.email}</span>
            </div>
            {candidato.telefone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{candidato.telefone}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {format(new Date(candidato.created_date), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            <div className="flex gap-2">
              {candidato.curriculo_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(candidato.curriculo_url, '_blank');
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Ver Currículo
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(candidato)}
                className="text-slate-600 hover:text-slate-900"
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver mais
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}