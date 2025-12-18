
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Sparkles, Lightbulb, Bot, Loader2, Percent } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function ExtractionResult({ extractedData, onSave, onReset, setoresDestino, aiSuggestion, isSubmitting }) {
  const [editedData, setEditedData] = useState({
    status: 'Em análise',
    setor_destino: '',
    ...extractedData,
  });

  useEffect(() => {
    if (aiSuggestion) {
        setEditedData(prev => ({ 
            ...prev, 
            setor_destino: aiSuggestion.setor_sugerido,
            cargo_sugerido: aiSuggestion.cargo_sugerido,
            compatibilidade: aiSuggestion.compatibilidade
        }));
    }
  }, [aiSuggestion, setoresDestino]);

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Ao salvar manualmente, o cargo pretendido é o que está no campo.
    const dataToSave = { ...editedData, cargo_pretendido: editedData.cargo_sugerido };
    await onSave(dataToSave);
  };
  
  const handleSaveWithAI = async () => {
    // Ao salvar com IA, tanto o cargo pretendido quanto o sugerido são definidos pela IA.
    const dataToSave = { 
        ...editedData, 
        setor_destino: aiSuggestion.setor_sugerido, 
        cargo_pretendido: aiSuggestion.cargo_sugerido, // Garante que o cargo para filtro seja o da IA
        cargo_sugerido: aiSuggestion.cargo_sugerido,
        compatibilidade: aiSuggestion.compatibilidade
    };
    await onSave(dataToSave); // Corrected from dataToToSave
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Dados Extraídos</CardTitle>
        <p className="text-sm text-muted-foreground">Revise os dados e faça ajustes se necessário.</p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {aiSuggestion?.justificativa && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <Lightbulb className="h-4 w-4 text-blue-700" />
                <AlertTitle className="font-bold">Sugestão da IA</AlertTitle>
                <AlertDescription>
                    {aiSuggestion.justificativa}
                </AlertDescription>
                {aiSuggestion.compatibilidade && (
                    <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold">Compatibilidade</span>
                            <span className="text-xs font-bold">{aiSuggestion.compatibilidade}%</span>
                        </div>
                        <Progress value={aiSuggestion.compatibilidade} className="h-2"/>
                    </div>
                )}
            </Alert>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome_completo">Nome Completo *</Label>
            <Input id="nome_completo" value={editedData.nome_completo || ''} onChange={(e) => handleInputChange('nome_completo', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={editedData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" value={editedData.telefone || ''} onChange={(e) => handleInputChange('telefone', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargo_pretendido">Cargo Pretendido / Sugerido</Label>
            <Input id="cargo_pretendido" value={editedData.cargo_sugerido || ''} onChange={(e) => handleInputChange('cargo_sugerido', e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="setor_destino">Setor Destino (Pasta) *</Label>
          <Select value={editedData.setor_destino || ''} onValueChange={(value) => handleInputChange('setor_destino', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a pasta de destino" />
            </SelectTrigger>
            <SelectContent>
              {setoresDestino.map(setor => (
                <SelectItem key={setor.id} value={setor.nome}>{setor.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea id="observacoes" value={editedData.observacoes || ''} onChange={(e) => handleInputChange('observacoes', e.target.value)} rows={4} />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onReset} disabled={isSubmitting}>
          <XCircle className="w-4 h-4 mr-2" />Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting || !editedData.nome_completo || !editedData.email || !editedData.setor_destino}>
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Salvar Manualmente
        </Button>
        <Button 
          onClick={handleSaveWithAI} 
          disabled={isSubmitting || !aiSuggestion?.setor_sugerido}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
          Salvar com IA
        </Button>
      </CardFooter>
    </Card>
  );
}
