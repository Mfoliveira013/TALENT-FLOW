import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import UploadZone from "../components/upload/UploadZone";
import ExtractionResult from "../components/upload/ExtractionResult";

const setoresCargos = {
  "M.I.S": ["Analista de Sistemas", "Desenvolvedor de Software", "Suporte Técnico"],
  "ControlDesk": ["Analista de Controle", "Assistente de Monitoramento", "Operador de Sistema"],
  "Administrativo": ["Auxiliar Administrativo", "Assistente Administrativo", "Recepcionista", "Assistente Financeiro", "Assistente de RH", "Estagiário Administrativo"],
  "Jurídico": ["Advogado Bacharel", "Assistente Jurídico", "Advogado OAB", "Advogado Júnior", "Advogado Pleno", "Advogado Sênior"],
  "Negociação": ["Negociador", "Estágio Nível Médio", "Estágio Nível Superior", "Líder de Equipe"]
};

export default function Upload() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [processingMessage, setProcessingMessage] = useState("Analisando o currículo...");

  const { data: setoresDestino = [] } = useQuery({
    queryKey: ['setores'],
    queryFn: () => base44.entities.Setor.list(),
  });

  const { data: allCandidatos = [] } = useQuery({
    queryKey: ['candidatos'],
    queryFn: () => base44.entities.Candidato.list()
  });

  const createCandidateMutation = useMutation({
    mutationFn: (candidatoData) => {
      const existingCandidate = allCandidatos.find(c => c.email.toLowerCase() === candidatoData.email.toLowerCase());
      if (existingCandidate) {
        throw new Error(`Candidato duplicado. Este e-mail já foi cadastrado no setor: ${existingCandidate.setor_destino}.`);
      }
      return base44.entities.Candidato.create(candidatoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
      queryClient.invalidateQueries({ queryKey: ['setores'] });
      navigate(createPageUrl("Setores"));
    },
    onError: (err) => {
      if (err.response?.status === 429) {
        setError("Muitas requisições sendo processadas. Por favor, aguarde e tente novamente.");
      } else {
        setError(err.message || "Erro ao salvar candidato. Tente novamente.");
      }
    }
  });

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setExtractedData(null);
    setAiSuggestion(null);
    setProcessing(true);
    setProgress(10);
    setProcessingMessage("Enviando arquivo...");

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      setProgress(25);
      setProcessingMessage("Extraindo informações do currículo...");
      
      const extractionSchema = {
        type: "object",
        properties: {
          nome_completo: { type: "string" }, email: { type: "string" }, telefone: { type: "string" },
          observacoes: { type: "string", description: "Resumo completo do currículo, incluindo experiências, formação e habilidades." }
        }
      };
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: extractionSchema });
      
      if (result.status !== "success" || !result.output) throw new Error(result.details || "Erro ao extrair dados.");
      
      setExtractedData({ ...result.output, curriculo_url: file_url });
      setProgress(60);
      setProcessingMessage("Analisando perfil com IA...");
      
      if (result.output.observacoes) {
        const prompt = `Analise o resumo do currículo e sugira o setor e o cargo mais compatível, com base na estrutura a seguir: ${JSON.stringify(setoresCargos)}. O setor "Negociação" também pode ser chamado de "Cobrança". Retorne um JSON com "setor_sugerido", "cargo_sugerido", "compatibilidade" (de 0 a 100), e "justificativa" (frase curta). Currículo: "${result.output.observacoes}"`;
        
        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object", properties: {
                    setor_sugerido: { type: "string" }, cargo_sugerido: { type: "string" },
                    compatibilidade: { type: "number" }, justificativa: { type: "string" }
                }
            }
        });
        setAiSuggestion(llmResponse);
      }
      setProgress(100);
    } catch (err) {
      if (err.response?.status === 429) setError("Sistema sobrecarregado. Aguarde um momento e tente novamente.");
      else setError(err.message || "Erro ao processar o arquivo.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = (candidatoData) => {
    createCandidateMutation.mutate(candidatoData);
  };

  const handleReset = () => {
    setFile(null);
    setExtractedData(null);
    setError(null);
    setAiSuggestion(null);
    setProgress(0);
    setProcessingMessage("Analisando o currículo...");
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload de Currículos</h1>
          <p className="text-muted-foreground mt-1">Envie currículos para análise e classificação automática.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!extractedData ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UploadIcon className="w-5 h-5" />Selecione um Arquivo</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadZone onFileSelect={handleFileSelect} disabled={processing} />
              {processing && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Processando...</span>
                    <span className="font-semibold text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{processingMessage}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <ExtractionResult
            extractedData={extractedData}
            onSave={handleSave}
            onReset={handleReset}
            setoresDestino={setoresDestino}
            aiSuggestion={aiSuggestion}
            isSubmitting={createCandidateMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}