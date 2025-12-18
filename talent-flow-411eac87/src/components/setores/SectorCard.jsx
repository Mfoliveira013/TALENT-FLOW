import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import DynamicIcon from '../shared/DynamicIcon';
import { createPageUrl } from '@/utils';

const SectorCard = ({ setor, curriculumCount, linkPath }) => {
  const finalLink = linkPath ? createPageUrl(linkPath) : createPageUrl(`Candidatos?setor_destino=${setor.nome}`);

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm group flex flex-col">
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
          <DynamicIcon name={setor.icone} className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl font-bold text-slate-800">{setor.nome}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
         <div className="text-sm text-slate-600 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>{curriculumCount} currículos</span>
        </div>
      </CardContent>
      <CardFooter>
        {curriculumCount > 0 ? (
          <Button asChild variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Link to={finalLink}>
              Acessar Pasta
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" className="w-full text-slate-400 cursor-not-allowed" disabled>
            Sem Candidatos
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SectorCard;