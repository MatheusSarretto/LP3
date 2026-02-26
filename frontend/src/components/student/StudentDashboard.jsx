import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../api/client";
import { Book, FileText } from 'lucide-react';

export default function StudentDashboard({ token }) {
  const [matriculas, setMatriculas] = useState([]);
  const [selectedMatricula, setSelectedMatricula] = useState(null);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatriculas = async () => {
      try {
        const data = await fetchWithAuth('/aluno/matriculas', 'GET', null, token);
        setMatriculas(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadMatriculas();
  }, [token]);

  const handleViewNotas = async (matriculaId) => {
    try {
      const data = await fetchWithAuth(`/aluno/matriculas/${matriculaId}/notas`, 'GET', null, token);
      setNotas(data || []);
      setSelectedMatricula(matriculaId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
         <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Meu Boletim</h2>
         <p className="text-slate-500">Consulte suas notas e frequências</p>
      </div>
      
      {loading ? <div className="p-8 text-center text-slate-500">Carregando boletim...</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUNA ESQUERDA: DISCIPLINAS */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Book className="w-5 h-5 text-blue-600"/> 
                <h3 className="font-bold text-slate-700">Minhas Disciplinas</h3>
             </div>
            
            {matriculas.length === 0 ? <div className="p-6 bg-white rounded-xl shadow-sm text-slate-500">Nenhuma matrícula ativa.</div> : (
              <div className="space-y-3">
                {matriculas.map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => handleViewNotas(m.id)}
                    className={`p-5 rounded-xl cursor-pointer transition-all border-2 relative overflow-hidden ${
                        selectedMatricula === m.id 
                        ? 'bg-blue-50 border-blue-500 shadow-md' 
                        : 'bg-white border-transparent hover:border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start z-10 relative">
                      <div>
                        <h4 className="font-bold text-lg text-slate-800">{m.turma.disciplina.nome}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-1">{m.turma.disciplina.codigoDisciplina} • {m.turma.periodo}</p>
                        <p className="text-sm text-slate-600 mt-2">Prof. {m.turma.professor.nome}</p>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Média</div>
                         <div className={`text-2xl font-bold ${m.mediaFinal >= 6 ? 'text-emerald-600' : m.mediaFinal !== null ? 'text-red-600' : 'text-slate-800'}`}>
                            {m.mediaFinal !== null ? m.mediaFinal : '-'}
                         </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center">
                        <span className="text-xs text-slate-600 font-medium">Freq: {m.frequencia ?? '-'}%</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                            m.status === 'APROVADO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            m.status === 'REPROVADO' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                            {m.status}
                        </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: NOTAS DETALHADAS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600"/> 
                <h3 className="font-bold text-slate-700">Notas Detalhadas</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[300px]">
              {!selectedMatricula ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                  <p>Selecione uma disciplina para ver os detalhes.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Avaliação</th>
                            <th className="px-6 py-4 text-center">Data</th>
                            <th className="px-6 py-4 text-center">Peso</th>
                            <th className="px-6 py-4 text-right">Nota</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {notas.length === 0 ? (
                             <tr><td colSpan="4" className="p-8 text-center text-slate-500">Nenhuma nota lançada.</td></tr>
                        ) : notas.map(n => (
                            <tr key={n.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-700">{n.descricao}</td>
                                <td className="px-6 py-4 text-center text-slate-500">{n.dataAvaliacao || '-'}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200">{n.peso}</span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-800 text-base">
                                    {n.valorNota}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};