import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CheckCircle, XCircle } from "lucide-react";

export default function InterviewForm({ 
  interview, 
  candidatos, 
  preselectedCandidatoId,
  onSubmit, 
  onCancel, 
  isSubmitting 
}) {
  const [formData, setFormData] = useState({
    candidato_id: preselectedCandidatoId || '',
    candidato_nome: '',
    data_hora: '',
    local_tipo: 'presencial',
    local_detalhes: '',
    status: 'agendada',
    notas: '',
    avaliacao: ''
  });

  useEffect(() => {
    if (interview) {
      setFormData({
        candidato_id: interview.candidato_id,
        candidato_nome: interview.candidato_nome,
        data_hora: interview.data_hora.slice(0, 16),
        local_tipo: interview.local_tipo,
        local_detalhes: interview.local_detalhes || '',
        status: interview.status,
        notas: interview.notas || '',
        avaliacao: interview.avaliacao || ''
      });
    } else if (preselectedCandidatoId) {
      const candidato = candidatos.find(c => c.id === preselectedCandidatoId);
      if (candidato) {
        setFormData(prev => ({
          ...prev,
          candidato_id: candidato.id,
          candidato_nome: candidato.nome_completo
        }));
      }
    }
  }, [interview, preselectedCandidatoId, candidatos]);

  const handleCandidatoChange = (candidatoId) => {
    const candidato = candidatos.find(c => c.id === candidatoId);
    setFormData(prev => ({
      ...prev,
      candidato_id: candidatoId,
      candidato_nome: candidato?.nome_completo || ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="candidato_id">Candidato *</Label>
        <Select
          value={formData.candidato_id}
          onValueChange={handleCandidatoChange}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um candidato" />
          </SelectTrigger>
          <SelectContent>
            {candidatos.map((candidato) => (
              <SelectItem key={candidato.id} value={candidato.id}>
                {candidato.nome_completo} - {candidato.setor_profissional}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="data_hora">Data e Hora *</Label>
        <Input
          id="data_hora"
          type="datetime-local"
          value={formData.data_hora}
          onChange={(e) => setFormData(prev => ({ ...prev, data_hora: e.target.value }))}
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="local_tipo">Tipo de Entrevista *</Label>
          <Select
            value={formData.local_tipo}
            onValueChange={(value) => setFormData(prev => ({ ...prev, local_tipo: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="telefone">Telefone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agendada">Agendada</SelectItem>
              <SelectItem value="confirmada">Confirmada</SelectItem>
              <SelectItem value="realizada">Realizada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
              <SelectItem value="remarcada">Remarcada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="local_detalhes">
          {formData.local_tipo === 'presencial' && 'Endereço'}
          {formData.local_tipo === 'online' && 'Link da Reunião'}
          {formData.local_tipo === 'telefone' && 'Telefone para Contato'}
        </Label>
        <Input
          id="local_detalhes"
          value={formData.local_detalhes}
          onChange={(e) => setFormData(prev => ({ ...prev, local_detalhes: e.target.value }))}
          placeholder={
            formData.local_tipo === 'presencial' ? 'Rua, número, bairro, cidade' :
            formData.local_tipo === 'online' ? 'https://meet.google.com/xxx' :
            '(00) 00000-0000'
          }
        />
      </div>

      {interview && (
        <div className="space-y-2">
          <Label htmlFor="avaliacao">Avaliação</Label>
          <Select
            value={formData.avaliacao}
            onValueChange={(value) => setFormData(prev => ({ ...prev, avaliacao: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma avaliação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excelente">Excelente</SelectItem>
              <SelectItem value="bom">Bom</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="ruim">Ruim</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notas">Notas / Observações</Label>
        <Textarea
          id="notas"
          value={formData.notas}
          onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
          placeholder="Adicione observações sobre a entrevista..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !formData.candidato_id || !formData.data_hora}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Salvando...' : interview ? 'Atualizar' : 'Agendar'}
        </Button>
      </div>
    </form>
  );
}